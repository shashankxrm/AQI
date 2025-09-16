import { AQI_CATEGORIES, type AQICategory } from "@/types/sensor"

// Utility function to get AQI category based on value
export function getAQICategory(aqi: number): { category: AQICategory; info: (typeof AQI_CATEGORIES)[AQICategory] } {
  for (const [category, info] of Object.entries(AQI_CATEGORIES)) {
    if (aqi >= info.min && aqi <= info.max) {
      return { category: category as AQICategory, info }
    }
  }
  // Default to hazardous if above all ranges
  return { category: "HAZARDOUS", info: AQI_CATEGORIES.HAZARDOUS }
}

// Convert Celsius to Fahrenheit
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10
}

// Format timestamp for display
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

// Check if sensor reading is within normal ranges
export function isReadingNormal(reading: {
  temperature: number
  humidity: number
  aqi: number
  gasConcentration: number
}): boolean {
  return (
    reading.temperature >= 15 &&
    reading.temperature <= 35 &&
    reading.humidity >= 30 &&
    reading.humidity <= 70 &&
    reading.aqi <= 100 &&
    reading.gasConcentration <= 300
  )
}

// Generate alert message based on sensor readings
export function generateAlerts(reading: {
  temperature: number
  humidity: number
  aqi: number
  gasConcentration: number
}): string[] {
  const alerts: string[] = []

  if (reading.temperature > 35) {
    alerts.push("High temperature detected")
  } else if (reading.temperature < 15) {
    alerts.push("Low temperature detected")
  }

  if (reading.humidity > 70) {
    alerts.push("High humidity levels")
  } else if (reading.humidity < 30) {
    alerts.push("Low humidity levels")
  }

  if (reading.aqi > 150) {
    alerts.push("Unhealthy air quality")
  } else if (reading.aqi > 100) {
    alerts.push("Air quality concern for sensitive groups")
  }

  if (reading.gasConcentration > 300) {
    alerts.push("High gas concentration detected")
  }

  return alerts
}
