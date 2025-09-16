import type { SensorData, TrendDataPoint } from "@/types/sensor"

export class DataService {
  private static instance: DataService
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NODE_ENV === "development" ? "/api/mock-sensor" : "/api/sensor-data"
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  async getCurrentData(): Promise<SensorData | null> {
    try {
      const response = await fetch(this.baseUrl)
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
      return null
    }
  }

  async getHistoricalData(hours = 24): Promise<TrendDataPoint[]> {
    try {
      const response = await fetch(`${this.baseUrl}/historical?hours=${hours}`)
      if (response.ok) {
        const result = await response.json()
        return result.data || []
      }
      // Fallback to mock data for now
      return this.generateMockTrendData(hours)
    } catch (error) {
      return this.generateMockTrendData(hours)
    }
  }

  private generateMockTrendData(hours: number): TrendDataPoint[] {
    return Array.from({ length: hours }, (_, i) => {
      const time = new Date(Date.now() - (hours - i) * 60 * 60 * 1000)
      return {
        time: time.toLocaleTimeString(),
        timestamp: time.toISOString(),
        temperature: Math.round((Math.random() * 20 + 15) * 10) / 10,
        humidity: Math.round(Math.random() * 50 + 30),
        aqi: Math.round(Math.random() * 150 + 10),
        gasConcentration: Math.round(Math.random() * 200 + 50),
      }
    })
  }

  async exportData(format: "csv" | "pdf", data: any[]): Promise<void> {
    if (format === "csv") {
      this.exportToCSV(data)
    } else {
      this.exportToPDF(data)
    }
  }

  private exportToCSV(data: any[]): void {
    const headers = Object.keys(data[0] || {})
    const csvContent = [headers.join(","), ...data.map((row) => headers.map((header) => row[header]).join(","))].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sensor-data-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  private exportToPDF(data: any[]): void {
    console.log("PDF export would be implemented here with jsPDF")
    alert("PDF export feature coming soon!")
  }
}
