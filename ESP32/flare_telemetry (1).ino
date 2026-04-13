/**
 * AegisSpace FLARE Module — ESP32 Telemetry Firmware
 * ====================================================
 * Reads sensors and POSTs JSON to Supabase telemetry_readings table.
 *
 * Real DB schema columns (telemetry_readings):
 *   device_id, temperature1, temperature2, voltage, current,
 *   vibration, rf_signal, motion_detected, rf_interference,
 *   status, anomaly_score, sabotage_probability
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
#include "secrets.h"   // WIFI_SSID, WIFI_PASSWORD, DEVICE_ID, SUPABASE_URL, SUPABASE_ANON_KEY

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
// Sensor reading — matches real telemetry_readings schema
// ---------------------------------------------------------------------------
struct Reading {
  float  temperature1;       // °C  primary (INA219 die / ESP32 internal)
  float  temperature2;       // °C  secondary (MPU die)
  float  voltage;            // V
  float  current;            // A
  float  vibration;          // m/s² accel magnitude (gravity-subtracted)
  float  rf_signal;          // dBm (WiFi RSSI)
  bool   motion_detected;
  bool   rf_interference;
  String status;             // "normal" | "warning" | "critical"
  float  anomaly_score;      // 0.0–1.0
  float  sabotage_probability; // 0.0–1.0
};

Reading readSensors() {
  Reading r{};
  r.temperature1        = (float)temperatureRead(); // ESP32 internal
  r.temperature2        = r.temperature1;
  r.voltage             = 3.7f;
  r.current             = 0.0f;
  r.vibration           = 0.0f;
  r.rf_signal           = (float)WiFi.RSSI();
  r.motion_detected     = false;
  r.rf_interference     = false;
  r.status              = "normal";
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

  (void)reasons; // logged to Serial below
  return r;
}

// ---------------------------------------------------------------------------
// HTTP POST — directly to Supabase REST API
// ---------------------------------------------------------------------------
bool postReading(const Reading& r) {
  WiFiClientSecure client;
  client.setInsecure(); // swap for CA cert in production
  HTTPClient http;

  String url = String(SUPABASE_URL) + "/rest/v1/telemetry_readings";
  http.begin(client, url);
  http.addHeader("Content-Type",  "application/json");
  http.addHeader("apikey",        SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
  http.addHeader("Prefer",        "return=minimal");

  JsonDocument doc;
  doc["device_id"]              = DEVICE_ID;
  doc["temperature1"]           = serialized(String(r.temperature1, 2));
  doc["temperature2"]           = serialized(String(r.temperature2, 2));
  doc["voltage"]                = serialized(String(r.voltage, 3));
  doc["current"]                = serialized(String(r.current, 4));
  doc["vibration"]              = serialized(String(r.vibration, 4));
  doc["rf_signal"]              = serialized(String(r.rf_signal, 1));
  doc["motion_detected"]        = r.motion_detected;
  doc["rf_interference"]        = r.rf_interference;
  doc["status"]                 = r.status;
  doc["anomaly_score"]          = serialized(String(r.anomaly_score, 3));
  doc["sabotage_probability"]   = serialized(String(r.sabotage_probability, 3));

  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);
  http.end();

  if (code == 201 || code == 200) {
    Serial.printf("[HTTP] POST OK (%d)\n", code);
    return true;
  }
  Serial.printf("[HTTP] POST failed: %d\n", code);
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
  }

  Serial.println("[FLARE] Ready.\n");
}

void loop() {
  static unsigned long lastPost = 0;
  if (millis() - lastPost < POST_INTERVAL_MS) { delay(100); return; }
  lastPost = millis();

  if (!wifiConnect()) {
    Serial.println("[WiFi] Offline — skipping");
    ledBlink(5, 50);
    return;
  }

  Reading r = readSensors();

  Serial.printf(
    "[DATA] T1=%.2f T2=%.2f V=%.3f I=%.4f Vib=%.3f RF=%.1fdBm "
    "motion=%d rfint=%d status=%s score=%.2f sab=%.2f\n",
    r.temperature1, r.temperature2, r.voltage, r.current,
    r.vibration, r.rf_signal, r.motion_detected, r.rf_interference,
    r.status.c_str(), r.anomaly_score, r.sabotage_probability
  );

  bool ok = postReading(r);
  ledBlink(ok ? 1 : 3, ok ? 50 : 100);
}
