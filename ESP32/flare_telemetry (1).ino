/**
 * AegisSpace FLARE Module — ESP32 Telemetry Firmware
 * ====================================================
 * Reads sensors and POSTs JSON to n8n webhook.
 *
 * n8n expected payload (written to Supabase telemetry_data):
 *   device_id, temperature, voltage, current,
 *   gyro_x, gyro_y, gyro_z, is_anomaly, anomaly_reason
 *
 * Hardware:
 *   - ESP32 DevKit v1
 *   - MPU6050  (I2C 0x68) — vibration via accel magnitude
 *   - INA219   (I2C 0x40) — voltage + current
 *   - Optional second temp sensor on GPIO4 (OneWire DS18B20)
 *   - PIR motion sensor on GPIO 34 (digital)
 *   - RF RSSI read from WiFi (proxy for rf_signal)
 *
 * Libraries (Arduino Library Manager):
 *   Adafruit MPU6050, Adafruit INA219, Adafruit Unified Sensor,
 *   ArduinoJson 7.x
 *
 * Setup:
 *   1. Copy secrets_template.h → secrets.h and fill credentials.
 *   2. Add secrets.h to .gitignore.
 *   3. Flash with Arduino IDE (board: ESP32 Dev Module).
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_INA219.h>
#include <Adafruit_Sensor.h>
#include "secrets.h"   // WIFI_SSID, WIFI_PASSWORD, DEVICE_ID, N8N_WEBHOOK_URL

// Temporary test endpoint override for current n8n workflow debugging.
#define ACTIVE_N8N_WEBHOOK_URL "https://aryan3929.app.n8n.cloud/webhook-test/aegis-telemetry"

// ---------------------------------------------------------------------------
// Hardware pins
// ---------------------------------------------------------------------------
#define PIR_PIN         34    // PIR motion sensor (digital input)
#define RF_THRESHOLD   -80    // dBm — below this = rf_interference = true
#define LED_PIN          2    // Onboard LED

// ---------------------------------------------------------------------------
// Anomaly thresholds (tune per mission profile)
// ---------------------------------------------------------------------------
#define TEMP1_WARN      70.0f
#define TEMP1_CRIT      85.0f
#define VOLT_LOW         3.0f
#define VOLT_HIGH        5.5f
#define CURRENT_HIGH     2.0f
#define VIB_WARN         1.5f   // m/s² accel magnitude above gravity baseline
#define RF_SIGNAL_LOW  -75.0f   // dBm — below = warning

// Post interval
#define POST_INTERVAL_MS 5000UL

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------
Adafruit_MPU6050 mpu;
Adafruit_INA219  ina219;
bool mpuOk = false;
bool inaOk = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
void ledBlink(int n, int ms = 100) {
  for (int i = 0; i < n; i++) {
    digitalWrite(LED_PIN, HIGH); delay(ms);
    digitalWrite(LED_PIN, LOW);  delay(ms);
  }
}

bool wifiConnect() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - t > 30000) { Serial.println(" timeout"); return false; }
    Serial.print("."); delay(500);
  }
  Serial.printf(" OK — IP: %s\n", WiFi.localIP().toString().c_str());
  return true;
}

// ---------------------------------------------------------------------------
// Sensor reading and normalization for n8n telemetry payload
// ---------------------------------------------------------------------------
struct Reading {
  float  temperature1;       // °C  primary (INA219 die / ESP32 internal)
  float  temperature2;       // °C  secondary (MPU die)
  float  voltage;            // V
  float  current;            // A
  float  gyro_x;             // deg/s (MPU6050)
  float  gyro_y;             // deg/s (MPU6050)
  float  gyro_z;             // deg/s (MPU6050)
  float  vibration;          // m/s² accel magnitude (gravity-subtracted)
  float  rf_signal;          // dBm (WiFi RSSI)
  bool   motion_detected;
  bool   rf_interference;
  String status;             // "normal" | "warning" | "critical"
  bool   is_anomaly;
  String anomaly_reason;
  float  anomaly_score;      // 0.0–1.0
  float  sabotage_probability; // 0.0–1.0
};

Reading readSensors() {
  Reading r{};
  r.temperature1        = (float)temperatureRead(); // ESP32 internal
  r.temperature2        = r.temperature1;
  r.voltage             = 3.7f;
  r.current             = 0.0f;
  r.gyro_x              = 0.0f;
  r.gyro_y              = 0.0f;
  r.gyro_z              = 0.0f;
  r.vibration           = 0.0f;
  r.rf_signal           = (float)WiFi.RSSI();
  r.motion_detected     = false;
  r.rf_interference     = false;
  r.status              = "normal";
  r.is_anomaly          = false;
  r.anomaly_reason      = "";
  r.anomaly_score       = 0.0f;
  r.sabotage_probability = 0.0f;

  // INA219: voltage + current
  if (inaOk) {
    r.voltage = ina219.getBusVoltage_V();
    r.current = ina219.getCurrent_mA() / 1000.0f;
  }

  // MPU6050: vibration (accel magnitude - 9.81) + die temp
  if (mpuOk) {
    sensors_event_t accel, gyro, temp;
    mpu.getEvent(&accel, &gyro, &temp);
    float ax = accel.acceleration.x;
    float ay = accel.acceleration.y;
    float az = accel.acceleration.z;
    float mag = sqrt(ax*ax + ay*ay + az*az);
    r.vibration    = fabsf(mag - 9.81f);
    r.temperature2 = temp.temperature;
    // Adafruit reports rad/s; convert to deg/s for n8n anomaly thresholds.
    r.gyro_x       = gyro.gyro.x * 57.2958f;
    r.gyro_y       = gyro.gyro.y * 57.2958f;
    r.gyro_z       = gyro.gyro.z * 57.2958f;
  }

  // PIR motion
  r.motion_detected = (digitalRead(PIR_PIN) == HIGH);

  // RF interference = RSSI too low
  r.rf_interference = (r.rf_signal < (float)RF_THRESHOLD);

  // --- Anomaly scoring ---
  float score = 0.0f;
  int   flags = 0;
  String reasons = "";

  if (r.temperature1 >= TEMP1_CRIT) {
    score += 0.4f; flags++;
    reasons += "critical_temp1;";
  } else if (r.temperature1 >= TEMP1_WARN) {
    score += 0.2f; flags++;
    reasons += "high_temp1;";
  }
  if (r.voltage < VOLT_LOW || r.voltage > VOLT_HIGH) {
    score += 0.25f; flags++;
    reasons += (r.voltage < VOLT_LOW) ? "low_voltage;" : "overvoltage;";
  }
  if (r.current > CURRENT_HIGH) {
    score += 0.2f; flags++;
    reasons += "overcurrent;";
  }
  if (r.vibration > VIB_WARN) {
    score += 0.15f; flags++;
    reasons += "high_vibration;";
  }
  if (r.rf_signal < RF_SIGNAL_LOW) {
    score += 0.1f; flags++;
    reasons += "weak_rf;";
  }
  if (r.rf_interference) {
    score += 0.1f; flags++;
    reasons += "rf_interference;";
  }
  if (r.motion_detected) {
    // Motion alone = possible sabotage signal; weight depends on context
    score += 0.05f;
    reasons += "motion_detected;";
  }

  r.anomaly_score = min(score, 1.0f);

  // Sabotage probability: motion + rf interference together is suspicious
  if (r.motion_detected && r.rf_interference) {
    r.sabotage_probability = min(r.anomaly_score + 0.3f, 1.0f);
  } else {
    r.sabotage_probability = r.anomaly_score * 0.2f; // low baseline
  }

  if (r.anomaly_score >= 0.5f)      r.status = "critical";
  else if (r.anomaly_score >= 0.2f) r.status = "warning";
  else                              r.status = "normal";

  r.is_anomaly = (r.anomaly_score >= 0.2f);
  r.anomaly_reason = reasons;

  return r;
}

// ---------------------------------------------------------------------------
// HTTP POST — to n8n webhook
// ---------------------------------------------------------------------------
bool postReading(const Reading& r, unsigned long heartbeatSeq) {
  WiFiClientSecure client;
  client.setInsecure(); // swap for CA cert pinning in production
  HTTPClient http;

  String url = String(ACTIVE_N8N_WEBHOOK_URL);
  http.begin(client, url);
  http.addHeader("Content-Type",  "application/json");

  JsonDocument doc;
  doc["device_id"]              = DEVICE_ID;
  doc["temperature"]            = serialized(String(r.temperature1, 2));
  doc["voltage"]                = serialized(String(r.voltage, 3));
  doc["current"]                = serialized(String(r.current, 4));
  doc["gyro_x"]                 = serialized(String(r.gyro_x, 4));
  doc["gyro_y"]                 = serialized(String(r.gyro_y, 4));
  doc["gyro_z"]                 = serialized(String(r.gyro_z, 4));
  doc["is_anomaly"]             = r.is_anomaly;
  doc["anomaly_reason"]         = r.is_anomaly ? r.anomaly_reason : nullptr;
  doc["heartbeat_seq"]          = heartbeatSeq;
  doc["uptime_ms"]              = millis();

  String payload;
  serializeJson(doc, payload);

  Serial.printf("[HTTP] POST %s\n", url.c_str());
  Serial.printf("[HTTP] Payload: %s\n", payload.c_str());

  int code = http.POST(payload);

  String responseBody = "";
  if (code > 0) {
    responseBody = http.getString();
  }
  http.end();

  if (code == 201 || code == 200) {
    Serial.printf("[HTTP] POST OK (%d)\n", code);
    if (responseBody.length() > 0) {
      Serial.printf("[HTTP] Response: %s\n", responseBody.c_str());
    }
    return true;
  }
  Serial.printf("[HTTP] POST failed: %d\n", code);
  if (code < 0) {
    Serial.printf("[HTTP] Error: %s\n", http.errorToString(code).c_str());
  }
  if (responseBody.length() > 0) {
    Serial.printf("[HTTP] Response: %s\n", responseBody.c_str());
  }
  return false;
}

// ---------------------------------------------------------------------------
// Arduino lifecycle
// ---------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== AegisSpace FLARE Module ===");
  Serial.printf("Device ID: %s\n", DEVICE_ID);
  Serial.printf("Webhook URL: %s\n", ACTIVE_N8N_WEBHOOK_URL);
  Serial.printf("Post interval: %lums\n", POST_INTERVAL_MS);

  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  ledBlink(3, 200);

  Wire.begin(); // SDA=21, SCL=22

  if (mpu.begin()) {
    mpuOk = true;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("[MPU6050] OK");
  } else {
    Serial.println("[MPU6050] NOT FOUND — vibration=0, temp2=temp1");
  }

  if (ina219.begin()) {
    inaOk = true;
    Serial.println("[INA219]  OK");
  } else {
    Serial.println("[INA219]  NOT FOUND — voltage/current use defaults");
  }

  if (!wifiConnect()) {
    Serial.println("[WiFi] Boot connect failed — will retry in loop");
  } else {
    Serial.printf("[WiFi] RSSI: %d dBm\n", WiFi.RSSI());
  }

  Serial.println("[FLARE] Ready.\n");
}

void loop() {
  static unsigned long lastPost = 0;
  static unsigned long heartbeatSeq = 0;
  if (millis() - lastPost < POST_INTERVAL_MS) { delay(100); return; }
  lastPost = millis();
  heartbeatSeq++;

  if (!wifiConnect()) {
    Serial.println("[WiFi] Offline — skipping");
    ledBlink(5, 50);
    return;
  }

  Reading r = readSensors();

  Serial.printf(
    "[DATA] seq=%lu T=%.2f V=%.3f I=%.4f Gx=%.3f Gy=%.3f Gz=%.3f "
    "status=%s anomaly=%d score=%.2f\n",
    heartbeatSeq, r.temperature1, r.voltage, r.current,
    r.gyro_x, r.gyro_y, r.gyro_z,
    r.status.c_str(), r.is_anomaly, r.anomaly_score
  );

  bool ok = postReading(r, heartbeatSeq);
  ledBlink(ok ? 1 : 3, ok ? 50 : 100);
}
