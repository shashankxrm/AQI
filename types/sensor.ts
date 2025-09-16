// Type definitions for sensor data
export interface SensorReading {
  timestamp: string
  temperature: number
  humidity: number
  aqi: number
  gasConcentration: number
  status: "online" | "offline"
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message: string
}

export interface SensorConfig {
  temperatureUnit: "celsius" | "fahrenheit"
  updateInterval: number // in milliseconds
  alertThresholds: {
    temperature: { min: number; max: number }
    humidity: { min: number; max: number }
    aqi: { max: number }
    gasConcentration: { max: number }
  }
}

// AQI Categories for classification
export const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 50, label: "Good", color: "green" },
  MODERATE: { min: 51, max: 100, label: "Moderate", color: "yellow" },
  UNHEALTHY_SENSITIVE: { min: 101, max: 150, label: "Unhealthy for Sensitive Groups", color: "orange" },
  UNHEALTHY: { min: 151, max: 200, label: "Unhealthy", color: "red" },
  VERY_UNHEALTHY: { min: 201, max: 300, label: "Very Unhealthy", color: "purple" },
  HAZARDOUS: { min: 301, max: 500, label: "Hazardous", color: "maroon" },
} as const

export type AQICategory = keyof typeof AQI_CATEGORIES

export interface TrendDataPoint {
  time: string
  timestamp: string
  temperature: number
  humidity: number
  aqi: number
  gasConcentration: number
}

export interface HourlyDataPoint {
  hour: string
  avgTemperature: number
  avgHumidity: number
  avgAQI: number
  avgGasConcentration: number
}

export interface SensorData extends SensorReading {
  // Extending the base reading with additional computed fields
  aqiCategory?: AQICategory
  trend?: "up" | "down" | "stable"
}

export interface SensorDocument {
  _id?: string
  deviceId: string
  location: {
    name: string
    coordinates: [number, number] // [longitude, latitude]
  }
  readings: SensorReading[]
  metadata: {
    deviceModel: string
    firmwareVersion: string
    calibrationDate: string
    batteryLevel?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseConfig {
  connectionString: string
  databaseName: string
  collectionName: string
  retentionDays: number
}
