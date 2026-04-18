/**
 * AegisSpace FLARE Module — FIXED Firmware for Demo
 * Fixes applied:
 *   1. Switched WiFiClientSecure -> WiFiClient (removes TLS failure)
 *   2. Fixed voltage condition operator precedence bug
 *   3. Raised temperature threshold from 32C to 38C (prevents false alarm at room temp)
 *   4. Added is_anomaly + anomaly_reason + seq to JSON payload
 *   5. Added Serial debug prints so you can watch data flow in Serial Monitor
 *   6. Added WiFi reconnect guard in loop()
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>          // FIXED: plain HTTP, not HTTPS
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ---------------------------------------------------------------------------
// Network & Cloud Config
// ---------------------------------------------------------------------------
#define WIFI_SSID        "Infinix NOTE 40X 5G"
#define WIFI_PASSWORD    "ARYANSAHU7002"
#define DEVICE_ID        "esp32-001"

// FIXED: use http:// not https:// to avoid TLS handshake failure
#define N8N_WEBHOOK_URL  "http://aryan3929.app.n8n.cloud/webhook/aegis-telemetry"
#define WEBHOOK_API_KEY  "1a705912ba7a6414a3bc4c84b54aad9daf39ffcd3b89255dd80632f896910cb8"

// ---------------------------------------------------------------------------
// Hardware Pins  (matching your documented circuit exactly)
// ---------------------------------------------------------------------------
#define I2C_SDA       21
#define I2C_SCL       22
#define ONE_WIRE_BUS   4
#define GREEN_LED     14
#define RED_LED       27
#define BUZZER_PIN    13

const int MPU_ADDR = 0x68;

// ---------------------------------------------------------------------------
// Anomaly Thresholds — tuned for demo room conditions
// ---------------------------------------------------------------------------
#define TEMP_THRESHOLD_C     38.0f   // FIXED: was 32 — too low for room temp
#define VIBRATION_THRESHOLD   1.5f
#define CURRENT_THRESHOLD   100.0f
#define VOLTAGE_MIN           3.0f
#define VOLTAGE_MAX           5.5f

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------
Adafruit_INA219   ina219;
OneWire           oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

bool mpuOk = false;
bool inaOk = false;
bool ds18Ok = false;

struct Reading {
  float  voltage;
  float  current;
  float  temperature;
  float  vibration;
  float  accel_x;
  float  accel_y;
  float  accel_z;
  String status;
  bool   is_anomaly;
  String anomaly_reason;
};

// ---------------------------------------------------------------------------
// SETUP
// ---------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== AegisSpace FLARE Booting ===");

  pinMode(GREEN_LED,  OUTPUT);
  pinMode(RED_LED,    OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Boot self-test: all ON for 1 second
  digitalWrite(GREEN_LED,  HIGH);
  digitalWrite(RED_LED,    HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(1000);
  digitalWrite(GREEN_LED,  LOW);
  digitalWrite(RED_LED,    LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Power bank stabilisation
  Serial.println("Stabilising power...");
  delay(2000);

  // Initialise sensors
  Wire.begin(I2C_SDA, I2C_SCL);

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  mpuOk = (Wire.endTransmission(true) == 0);
  Serial.printf("MPU6050: %s\n", mpuOk ? "OK" : "FAIL");

  inaOk = ina219.begin();
  Serial.printf("INA219:  %s\n", inaOk ? "OK" : "FAIL");

  tempSensor.begin();
  ds18Ok = (tempSensor.getDeviceCount() > 0);
  Serial.printf("DS18B20: %s\n", ds18Ok ? "OK" : "FAIL");

  // Connect to WiFi
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    digitalWrite(GREEN_LED, HIGH); delay(250);
    digitalWrite(GREEN_LED, LOW);  delay(250);
    attempts++;
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("WiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED,   LOW);
  } else {
    Serial.println("WiFi FAILED — running in offline mode");
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED,   HIGH);
  }

  Serial.println("=== Boot Complete ===\n");
}

// ---------------------------------------------------------------------------
// Read all sensors and compute anomaly score
// ---------------------------------------------------------------------------
Reading readSensors() {
  Reading r{};
  r.anomaly_reason = "";
  float score = 0.0f;

  // INA219 — power monitoring
  if (inaOk) {
    r.voltage = ina219.getBusVoltage_V();
    r.current = ina219.getCurrent_mA();
  }

  // DS18B20 — temperature
  if (ds18Ok) {
    tempSensor.requestTemperatures();
    float t = tempSensor.getTempCByIndex(0);
    r.temperature = (t != DEVICE_DISCONNECTED_C) ? t : 0.0f;
  }

  // MPU6050 — vibration magnitude + individual axes
  r.vibration = 0.0f;
  r.accel_x = 0.0f;
  r.accel_y = 0.0f;
  r.accel_z = 0.0f;
  if (mpuOk) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom((uint16_t)MPU_ADDR, (uint8_t)6, true);
    int16_t AcX = Wire.read() << 8 | Wire.read();
    int16_t AcY = Wire.read() << 8 | Wire.read();
    int16_t AcZ = Wire.read() << 8 | Wire.read();
    r.accel_x   = (AcX / 16384.0f) * 9.81f;
    r.accel_y   = (AcY / 16384.0f) * 9.81f;
    r.accel_z   = (AcZ / 16384.0f) * 9.81f;
    r.vibration = fabsf(sqrtf(r.accel_x*r.accel_x + r.accel_y*r.accel_y + r.accel_z*r.accel_z) - 9.81f);
  }

  // --- Scoring (FIXED operator precedence on voltage check) ---
  if (inaOk && (r.voltage < VOLTAGE_MIN || r.voltage > VOLTAGE_MAX)) {
    score += 0.3f;
    r.anomaly_reason += "Volt;";
  }
  if (inaOk && r.current > CURRENT_THRESHOLD) {
    score += 0.3f;
    r.anomaly_reason += "Curr;";
  }
  if (mpuOk && r.vibration > VIBRATION_THRESHOLD) {
    score += 0.3f;
    r.anomaly_reason += "Vib;";
  }
  if (ds18Ok && r.temperature > TEMP_THRESHOLD_C) {
    score += 0.3f;
    r.anomaly_reason += "Temp;";
  }

  r.status     = (score >= 0.6f) ? "CRITICAL" : (score >= 0.3f) ? "WARNING" : "NORMAL";
  r.is_anomaly = (score >= 0.3f);

  return r;
}

// ---------------------------------------------------------------------------
// Update LEDs and buzzer based on alert state
// ---------------------------------------------------------------------------
void updateLocalAlarms(const Reading& r) {
  if (r.status == "NORMAL") {
    digitalWrite(GREEN_LED,  HIGH);
    digitalWrite(RED_LED,    LOW);
    digitalWrite(BUZZER_PIN, LOW);
  } else if (r.status == "WARNING") {
    digitalWrite(GREEN_LED,  LOW);
    digitalWrite(RED_LED,    HIGH);
    digitalWrite(BUZZER_PIN, HIGH); delay(50); digitalWrite(BUZZER_PIN, LOW);
  } else {  // CRITICAL
    digitalWrite(GREEN_LED,  LOW);
    digitalWrite(RED_LED,    HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
  }
}

// ---------------------------------------------------------------------------
// POST telemetry to n8n dashboard
// ---------------------------------------------------------------------------
void postToCloud(const Reading& r, unsigned long seq) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("POST skipped — WiFi not connected");
    return;
  }

  WiFiClient   client;   // FIXED: plain WiFiClient, not WiFiClientSecure
  HTTPClient   http;

  http.begin(client, N8N_WEBHOOK_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key",    WEBHOOK_API_KEY);
  http.setTimeout(8000);   // 8 second timeout

  // FIXED: payload now includes is_anomaly, anomaly_reason, and seq
  JsonDocument doc;
  doc["device_id"]      = DEVICE_ID;
  doc["seq"]            = seq;
  doc["status"]         = r.status;
  doc["is_anomaly"]     = r.is_anomaly;
  doc["anomaly_reason"] = r.anomaly_reason;
  doc["voltage"]        = serialized(String(r.voltage,     2));
  doc["temperature_c"]  = serialized(String(r.temperature, 1));
  doc["vibration"]      = serialized(String(r.vibration,   3));
  doc["current_ma"]     = serialized(String(r.current,     1));
  doc["accel_x"]        = serialized(String(r.accel_x,     3));
  doc["accel_y"]        = serialized(String(r.accel_y,     3));
  doc["accel_z"]        = serialized(String(r.accel_z,     3));

  String payload;
  serializeJson(doc, payload);

  Serial.printf("POST -> %s\nPayload: %s\n", N8N_WEBHOOK_URL, payload.c_str());

  int httpCode = http.POST(payload);
  Serial.printf("HTTP response: %d\n\n", httpCode);

  http.end();
}

// ---------------------------------------------------------------------------
// MAIN LOOP
// ---------------------------------------------------------------------------
unsigned long lastLocalUpdate = 0;
unsigned long lastCloudPost   = 0;
unsigned long seq             = 0;

void loop() {
  unsigned long now = millis();
  Reading r = readSensors();

  // Local LEDs + buzzer — every 500ms
  if (now - lastLocalUpdate >= 500) {
    lastLocalUpdate = now;
    updateLocalAlarms(r);

    // Debug print to Serial Monitor so you can confirm live readings
    Serial.printf("[%lu] TEMP:%.1fC  VOLT:%.2fV  CURR:%.0fmA  VIB:%.3f  X:%.3f  Y:%.3f  Z:%.3f  -> %s\n",
                  now/1000, r.temperature, r.voltage, r.current, r.vibration,
                  r.accel_x, r.accel_y, r.accel_z, r.status.c_str());
  }

  // Cloud POST — every 5 seconds
  if (now - lastCloudPost >= 5000) {
    lastCloudPost = now;
    seq++;

    // Auto-reconnect if WiFi dropped
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi lost — reconnecting...");
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      delay(3000);
    }

    postToCloud(r, seq);
  }
}
