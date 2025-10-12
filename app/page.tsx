"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { AQIThermometer } from "@/components/aqi-thermometer"
import { EnvironmentalOverview } from "@/components/environmental-overview"
import { HourlyChart } from "@/components/hourly-chart"
import { AlertBanner } from "@/components/alert-banner"
import { DataExport } from "@/components/data-export"
import { Leaf, Activity, Database, Wifi } from "lucide-react"
import type { SensorReading } from "@/types/sensor"

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [hourlyData, setHourlyData] = useState<
    Array<{
      hour: string
      avgTemperature: number
      avgHumidity: number
      avgAQI: number
    }>
  >([])
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [isOnline, setIsOnline] = useState(true)

  const fetchSensorData = async () => {
    try {
      // Fetch current sensor reading from MongoDB
      const response = await fetch("/api/sensor-data/current")
      const result = await response.json()

      if (result.success && result.data) {
        const newReading: SensorReading = {
          id: result.data.id,
          timestamp: result.data.timestamp,
          temperature: result.data.temperature,
          humidity: result.data.humidity,
          aqi: result.data.aqi,
          gasConcentration: result.data.gasConcentration,
          status: result.data.status || "online",
        }

        setSensorData((prev) => {
          // Only add if it's a new reading (different timestamp)
          const lastReading = prev[prev.length - 1]
          if (!lastReading || lastReading.timestamp !== newReading.timestamp) {
            return [...prev.slice(-49), newReading]
          }
          return prev
        })
        setLastUpdate(new Date().toLocaleTimeString())
        setIsOnline(true)

        // Fetch historical data for hourly chart
        const histResponse = await fetch("/api/sensor-data/historical?hours=12")
        const histResult = await histResponse.json()
        
        if (histResult.success && histResult.data.length > 0) {
          // Process historical data into hourly averages
          const hourlyAverages = processHistoricalData(histResult.data)
          setHourlyData(hourlyAverages)
        }
      } else {
        console.log("No sensor data available yet")
        setIsOnline(false)
      }
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
      setIsOnline(false)
    }
  }

  // Helper function to process historical data into hourly averages
  const processHistoricalData = (data: any[]) => {
    if (data.length === 0) return []
    
    // Group data by hour
    const hourlyGroups: { [key: string]: any[] } = {}
    
    data.forEach(reading => {
      const date = new Date(reading.timestamp)
      const hour = date.getHours().toString().padStart(2, "0") + ":00"
      
      if (!hourlyGroups[hour]) {
        hourlyGroups[hour] = []
      }
      hourlyGroups[hour].push(reading)
    })

    // Calculate averages for each hour
    return Object.entries(hourlyGroups).map(([hour, readings]) => ({
      hour,
      avgTemperature: Math.round((readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length) * 10) / 10,
      avgHumidity: Math.round(readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length),
      avgAQI: Math.round(readings.reduce((sum, r) => sum + r.aqi, 0) / readings.length),
    })).sort((a, b) => a.hour.localeCompare(b.hour))
  }

  useEffect(() => {
    fetchSensorData()
    const interval = setInterval(fetchSensorData, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentData = sensorData[sensorData.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Leaf className="h-8 w-8 text-primary animate-pulse" />
              Air Quality Monitoring System
            </h1>
            <p className="text-muted-foreground">Real-time environmental data from ESP32 sensors</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-80">
              <DataExport data={sensorData} />
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            <div
              className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isOnline ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            {isOnline ? "System Online" : "System Offline"} - Last Update: {lastUpdate}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Database className="h-3 w-3 mr-1" />
            {sensorData.length} readings stored
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Wifi className="h-3 w-3 mr-1" />
            Real Data Mode
          </Badge>
        </div>

        {currentData && currentData.aqi > 100 && <AlertBanner aqi={currentData.aqi} />}

        {sensorData.length > 0 && <EnvironmentalOverview data={sensorData} />}

        {currentData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <AQIThermometer value={currentData.aqi} />
            </div>

            <div className="lg:col-span-3">{hourlyData.length > 0 && <HourlyChart data={hourlyData} />}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Hardware Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ESP32 Module:</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">BME680 Sensor:</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MQ135 Sensor:</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Update Rate:</span>
                <span className="text-sm font-medium">5 seconds</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4">Data Accuracy</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Temperature:</span>
                <span className="text-sm font-medium">±0.5°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Humidity:</span>
                <span className="text-sm font-medium">±3% RH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AQI Range:</span>
                <span className="text-sm font-medium">0-500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gas Detection:</span>
                <span className="text-sm font-medium">10-1000 ppm</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4">System Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <span className="text-sm font-medium">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data Source:</span>
                <span className="text-sm font-medium text-green-600">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Storage:</span>
                <span className="text-sm font-medium text-green-600">Cloud Database</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ESP32 Ready:</span>
                <span className="text-sm font-medium text-blue-600">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
