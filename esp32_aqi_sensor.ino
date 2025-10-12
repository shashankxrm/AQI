#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ===================== CONFIGURATION =====================
// WiFi credentials - YOUR VALUES
const char* ssid = "107108109";        // Try 2.4GHz network (remove -5G)
const char* password = "107-108-109";

// API Configuration  
const char* serverUrl = "https://aqi-one.vercel.app/api/sensor-data/ingest";
const char* localServerUrl = "http://192.168.0.147:3000/api/sensor-data/ingest";
const char* apiKey = "esp32-secret-key-2025-aqi-sensor-secure";

// Server configuration
const char* prodHost = "aqi-one.vercel.app";
const int httpsPort = 443;
const int httpPort = 3000;

// Try production first, then local development server
bool useProduction = true;

// Hardware Configuration - ESP8266 NodeMCU pins
#define DHTPIN D2                   // DHT11 data pin (NodeMCU D2 = GPIO4)
#define DHTTYPE DHT11               // DHT11 sensor type
const int MQ6PIN = A0;              // MQ6 analog pin (NodeMCU A0)
const int STATUS_LED = LED_BUILTIN; // Built-in LED (NodeMCU D0/GPIO16)

// Timing Configuration
const unsigned long SEND_INTERVAL = 10000;    // Send data every 10 seconds
const unsigned long SENSOR_WARMUP = 5000;     // 5 second warmup for MQ6
const unsigned long WIFI_TIMEOUT = 10000;     // 10 second WiFi connection timeout

// ===================== GLOBAL VARIABLES =====================
DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSendTime = 0;
unsigned long lastWiFiCheck = 0;
unsigned long sensorStartTime = 0;
bool sensorsReady = false;
int consecutiveFailures = 0;
const int MAX_FAILURES = 5;

// Sensor readings structure
struct SensorData {
  float temperature;
  float humidity; 
  int gasValue;           // Raw analog value from MQ6
  int gasConcentration;   // Calculated gas concentration
  float aqi;
  bool valid;
};

// Function declarations
bool sendDataRequest(HTTPClient &http, SensorData data, String serverType);

// ===================== SETUP FUNCTION =====================
void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n========================================");
  Serial.println("  ESP8266 NodeMCU Air Quality Monitor");
  Serial.println("    DHT11 + MQ6 Configuration");
  Serial.println("    Production: aqi-one.vercel.app");
  Serial.println("========================================\n");

  // Initialize pins
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  // Initialize DHT11 sensor
  Serial.print("Initializing DHT11 sensor... ");
  dht.begin();
  Serial.println("✅ SUCCESS");
  Serial.println("DHT11 sensor initialized on pin D2 (GPIO4)");

  // Initialize MQ6
  Serial.print("Initializing MQ6 sensor on pin A0... ");
  pinMode(MQ6PIN, INPUT);
  Serial.println("✅ SUCCESS");
  
  // Start sensor warmup
  sensorStartTime = millis();
  Serial.println("🔥 Warming up sensors (5 seconds)...");

  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("\n🚀 Setup complete! Starting main loop...\n");
}

// ===================== MAIN LOOP =====================
void loop() {
  unsigned long currentTime = millis();
  
  // Check if sensors are warmed up
  if (!sensorsReady && (currentTime - sensorStartTime >= SENSOR_WARMUP)) {
    sensorsReady = true;
    Serial.println("🌡️ DHT11 + MQ6 sensors warmed up and ready!");
    digitalWrite(STATUS_LED, HIGH);
  }
  
  // Check WiFi connection every 30 seconds
  if (currentTime - lastWiFiCheck >= 30000) {
    checkWiFiConnection();
    lastWiFiCheck = currentTime;
  }
  
  // Send sensor data at regular intervals
  if (sensorsReady && (currentTime - lastSendTime >= SEND_INTERVAL)) {
    lastSendTime = currentTime;
    
    SensorData data = readSensors();
    
    if (data.valid) {
      printSensorData(data);
      
      if (WiFi.status() == WL_CONNECTED) {
        sendDataToServer(data);
      } else {
        Serial.println("⚠️ WiFi disconnected, attempting reconnection...");
        connectToWiFi();
      }
    } else {
      Serial.println("❌ Sensor reading failed, skipping transmission");
      consecutiveFailures++;
      
      if (consecutiveFailures >= MAX_FAILURES) {
        Serial.println("🔄 Too many failures, restarting ESP8266...");
        ESP.restart();
      }
    }
  }
  
  // Blink status LED
  if (sensorsReady && WiFi.status() == WL_CONNECTED) {
    blinkStatusLED();
  }
  
  delay(100); // Small delay to prevent watchdog issues
}

// ===================== SENSOR FUNCTIONS =====================
SensorData readSensors() {
  SensorData data;
  data.valid = false;
  
  // Read DHT11 sensor
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  // Check if DHT11 readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Failed to read from DHT11! Check wiring.");
    return data;
  }
  
  data.temperature = temperature;
  data.humidity = humidity;
  
  // Read MQ6 sensor (multiple samples for accuracy)
  long mq6Sum = 0;
  const int samples = 10;
  
  for (int i = 0; i < samples; i++) {
    mq6Sum += analogRead(MQ6PIN);
    delay(10);
  }
  
  int mq6Average = mq6Sum / samples;
  data.gasValue = mq6Average;
  
  // Convert analog reading to gas concentration 
  // MQ6 is for LPG/propane - adjust mapping as needed
  data.gasConcentration = map(mq6Average, 0, 1023, 100, 1000);
  
  // Calculate AQI based on gas readings
  data.aqi = calculateAQI(data.gasConcentration);
  
  // Validate readings
  if (data.temperature > -40 && data.temperature < 85 &&
      data.humidity >= 0 && data.humidity <= 100 &&
      data.gasValue >= 0) {
    data.valid = true;
    consecutiveFailures = 0; // Reset failure counter
  }
  
  return data;
}

float calculateAQI(int gasConcentration) {
  float aqi = 0;
  
  // Simple AQI calculation for MQ6 (LPG/propane sensor)
  // Adjust these thresholds based on your sensor and environment
  if (gasConcentration <= 150) {
    aqi = map(gasConcentration, 100, 150, 0, 50);        // Good
  } else if (gasConcentration <= 250) {
    aqi = map(gasConcentration, 151, 250, 51, 100);      // Moderate
  } else if (gasConcentration <= 400) {
    aqi = map(gasConcentration, 251, 400, 101, 150);     // Unhealthy for Sensitive
  } else if (gasConcentration <= 600) {
    aqi = map(gasConcentration, 401, 600, 151, 200);     // Unhealthy
  } else if (gasConcentration <= 800) {
    aqi = map(gasConcentration, 601, 800, 201, 300);     // Very Unhealthy
  } else {
    aqi = 300 + (gasConcentration - 800) * 0.25;         // Hazardous
  }
  
  // Ensure AQI stays within 0-500 range
  return constrain(aqi, 0, 500);
}

void printSensorData(SensorData data) {
  Serial.println("\n📊 ===== SENSOR READINGS =====");
  Serial.printf("🌡️  Temperature: %.2f°C\n", data.temperature);
  Serial.printf("💧  Humidity: %.2f%%\n", data.humidity);
  Serial.printf("🔥  MQ6 Raw Value: %d\n", data.gasValue);
  Serial.printf("💨  Gas Concentration: %d ppm\n", data.gasConcentration);
  Serial.printf("🍃  Air Quality Index: %.1f\n", data.aqi);
  
  // Air quality status
  String aqiStatus = getAQIStatus(data.aqi);
  Serial.printf("📈  Air Quality: %s\n", aqiStatus.c_str());
  Serial.println("=============================\n");
}

String getAQIStatus(float aqi) {
  if (aqi <= 50) return "Good 😊";
  else if (aqi <= 100) return "Moderate 😐";
  else if (aqi <= 150) return "Unhealthy for Sensitive 😷";
  else if (aqi <= 200) return "Unhealthy 😨";
  else if (aqi <= 300) return "Very Unhealthy 🤢";
  else return "Hazardous ☠️";
}

// ===================== WIFI FUNCTIONS =====================
void connectToWiFi() {
  Serial.println("🔍 Scanning for WiFi networks...");
  int n = WiFi.scanNetworks();
  Serial.println("Networks found: " + String(n));
  for (int i = 0; i < n; ++i) {
    Serial.println("  " + String(i + 1) + ": " + WiFi.SSID(i) + " (" + String(WiFi.RSSI(i)) + " dBm)");
  }
  Serial.println();
  
  Serial.print("📡 Connecting to WiFi: " + String(ssid) + " ");
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED)); // Blink during connection
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✅ CONNECTED!");
    Serial.println("📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("📶 Signal Strength: " + String(WiFi.RSSI()) + " dBm");
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.println(" ❌ FAILED!");
    Serial.println("⚠️ WiFi Status Code: " + String(WiFi.status()));
    Serial.println("⚠️ Check WiFi credentials and signal strength");
    Serial.println("💡 Make sure you're using 2.4GHz network (ESP8266 doesn't support 5GHz)");
    digitalWrite(STATUS_LED, LOW);
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi connection lost. Reconnecting...");
    connectToWiFi();
  }
}

// ===================== DATA TRANSMISSION =====================
void sendDataToServer(SensorData data) {
  // Network diagnostics
  Serial.println("🔍 Network Diagnostics:");
  Serial.println("ESP8266 IP: " + WiFi.localIP().toString());
  Serial.println("Gateway: " + WiFi.gatewayIP().toString());
  
  HTTPClient http;
  bool success = false;
  
  // Try production server first (HTTPS)
  if (useProduction) {
    Serial.println("🌐 Trying Production: " + String(serverUrl));
    WiFiClientSecure secureClient;
    secureClient.setInsecure(); // Skip SSL certificate verification for simplicity
    
    if (http.begin(secureClient, serverUrl)) {
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-api-key", apiKey);
      http.setTimeout(15000); // 15 second timeout for HTTPS
      
      success = sendDataRequest(http, data, "Production HTTPS");
      http.end();
      
      if (success) return; // Success! Exit function
      
      Serial.println("⚠️ Production server failed, trying local development server...");
      useProduction = false; // Switch to local for next attempts
    }
  }
  
  // Fallback to local development server (HTTP)
  if (!success) {
    Serial.println("🏠 Trying Local: " + String(localServerUrl));
    WiFiClient client;
    
    if (http.begin(client, localServerUrl)) {
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-api-key", apiKey);
      http.setTimeout(10000); // 10 second timeout for HTTP
      
      success = sendDataRequest(http, data, "Local HTTP");
      http.end();
      
      if (success) {
        useProduction = true; // Reset for next time
        return;
      }
    }
  }
  
  if (!success) {
    Serial.println("❌ All servers failed!");
    consecutiveFailures++;
  }
}

bool sendDataRequest(HTTPClient &http, SensorData data, String serverType) {
  Serial.print("📤 Sending to " + serverType + "... ");
  
  // Create JSON payload
  StaticJsonDocument<300> doc;
  doc["temperature"] = round(data.temperature * 100) / 100.0; // 2 decimal places
  doc["humidity"] = round(data.humidity * 100) / 100.0;
  doc["aqi"] = round(data.aqi * 10) / 10.0; // 1 decimal place
  doc["gasConcentration"] = data.gasConcentration;
  doc["deviceId"] = "ESP8266_DHT11_MQ6";
  doc["metadata"]["gasRawValue"] = data.gasValue;
  doc["metadata"]["sensorType"] = "DHT11+MQ6";
  doc["metadata"]["board"] = "NodeMCU_v1.0";
  doc["metadata"]["rssi"] = WiFi.RSSI();
  doc["metadata"]["freeHeap"] = ESP.getFreeHeap();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n🔍 Debug Info:");
  Serial.println("JSON Payload: " + jsonString);
  Serial.println("Content-Length: " + String(jsonString.length()));
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    if (httpResponseCode == 200) {
      Serial.println("✅ SUCCESS");
      Serial.println("📥 Server Response: " + response);
      blinkSuccess();
      consecutiveFailures = 0; // Reset failure counter
      return true;
    } else {
      Serial.println("⚠️ HTTP " + String(httpResponseCode));
      Serial.println("📥 Response: " + response);
      return false;
    }
  } else {
    Serial.println("❌ FAILED");
    Serial.println("💥 Error: " + String(httpResponseCode));
    return false;
  }
}

// ===================== LED FUNCTIONS =====================
void blinkStatusLED() {
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink > 2000) { // Blink every 2 seconds when running normally
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    lastBlink = millis();
  }
}

void blinkSuccess() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(STATUS_LED, LOW);
    delay(100);
    digitalWrite(STATUS_LED, HIGH);
    delay(100);
  }
}

void blinkError() {
  while (true) {
    digitalWrite(STATUS_LED, HIGH);
    delay(200);
    digitalWrite(STATUS_LED, LOW);
    delay(200);
  }
}

// ===================== UTILITY FUNCTIONS =====================
float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

void printSystemInfo() {
  Serial.println("\n🖥️ ===== SYSTEM INFORMATION =====");
  Serial.println("💾 Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
  Serial.println("🔄 Uptime: " + String(millis() / 1000) + " seconds");
  Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("🌐 IP Address: " + WiFi.localIP().toString());
  Serial.println("================================\n");
}