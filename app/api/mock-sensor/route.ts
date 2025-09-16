import { NextResponse } from "next/server"

// Define the sensor data interface
interface SensorData {
  timestamp: string
  temperature: number
  humidity: number
  aqi: number
  gasConcentration: number
  status: "online" | "offline"
}

// Helper function to generate realistic sensor values
function generateMockSensorData(): SensorData {
  // Generate realistic temperature (15-35°C)
  const temperature = Math.round((Math.random() * 20 + 15) * 10) / 10

  // Generate realistic humidity (30-80%)
  const humidity = Math.round(Math.random() * 50 + 30)

  // Generate AQI (0-500, but typically 0-200 for normal conditions)
  const aqi = Math.round(Math.random() * 150 + 10)

  // Generate gas concentration in ppm (0-1000 ppm for MQ135)
  const gasConcentration = Math.round(Math.random() * 200 + 50)

  return {
    timestamp: new Date().toISOString(),
    temperature,
    humidity,
    aqi,
    gasConcentration,
    status: "online",
  }
}

// GET endpoint for fetching current sensor data
export async function GET() {
  try {
    const sensorData = generateMockSensorData()

    return NextResponse.json({
      success: true,
      data: sensorData,
      message: "Mock sensor data retrieved successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sensor data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST endpoint for simulating sensor data updates (for testing)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In a real implementation, this would update the database
    // For now, we'll just return the received data with a timestamp
    const updatedData = {
      ...body,
      timestamp: new Date().toISOString(),
      status: "online",
    }

    return NextResponse.json({
      success: true,
      data: updatedData,
      message: "Sensor data updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update sensor data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
