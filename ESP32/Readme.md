# AegisSpace FLARE Module - ESP32 Firmware

Hardware interface module for the AegisSpace AI telemetry platform.

## Hardware

| Component | Interface | Purpose |
| --- | --- | --- |
| ESP32 DevKit v1 | - | Main MCU + WiFi |
| MPU6050 | I2C (SDA=21, SCL=22) | Gyroscope / accelerometer |
| INA219 | I2C (SDA=21, SCL=22) | Voltage + current |
| LED | GPIO 2 | Status indicator |

Both I2C devices share the same bus (address MPU6050=0x68, INA219=0x40).

## Wiring

```text
ESP32          MPU6050       INA219
3.3V  -------- VCC           VCC
GND   -------- GND           GND
GPIO21 (SDA) - SDA           SDA
GPIO22 (SCL) - SCL           SCL
```

## Setup

1. Install Arduino IDE 2.x and the `esp32 by Espressif` board package.
2. Install libraries via Library Manager:
   - `Adafruit MPU6050`
   - `Adafruit INA219`
   - `Adafruit Unified Sensor`
   - `ArduinoJson` (7.x)
3. Copy `secrets_template.h` -> `secrets.h` and fill in credentials including `WEBHOOK_API_KEY`.
4. Add `secrets.h` to `.gitignore`.
5. Generate a strong API key: `openssl rand -hex 32`
6. Set the same key as `AEGIS_WEBHOOK_API_KEY` in your n8n environment variables.
7. Open `flare_telemetry.ino` in Arduino IDE.
8. Select board: `ESP32 Dev Module` (or your specific variant).
9. Upload.

## Authentication

Every POST to n8n includes an `X-API-Key` header with the shared secret defined in `secrets.h`:

```cpp
#define WEBHOOK_API_KEY "your-generated-secret"
```

n8n validates this key before processing any payload. Requests without the correct key are rejected. This prevents unauthorized devices from injecting fake telemetry data.

## LED Status Codes

| Pattern | Meaning |
| --- | --- |
| 3 slow blinks at boot | Device started |
| 1 short blink | Telemetry POST succeeded |
| 3 medium blinks | HTTP POST failed |
| 5 fast blinks | WiFi offline |

## Data Flow

```text
ESP32 sensors -> JSON -> HTTP POST -> n8n webhook -> Supabase REST API
```

## Anomaly Thresholds

Defaults in `flare_telemetry.ino` - tune per mission:

| Sensor | Warning | Critical |
| --- | --- | --- |
| Temperature | >= 70 C | >= 85 C |
| Voltage | < 3.0 V or > 5.5 V | - |
| Current | > 2.0 A | - |
| Angular rate | > 250 deg/s (magnitude) | - |

## Serial Monitor

Set baud rate to `115200`. Each reading prints:

```text
[DATA] T=28.45C V=3.700V I=0.4500A Gx=0.02 Gy=-0.01 Gz=0.00 anomaly=none
[HTTP] POST OK (201)
```
