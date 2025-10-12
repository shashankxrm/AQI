import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Optional: API key authentication
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== process.env.ESP32_API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized - Invalid API key" }, { status: 401 })
    }

    // Validate required fields
    const { temperature, humidity, aqi, gasConcentration } = body
    if (
      temperature === undefined ||
      humidity === undefined ||
      aqi === undefined ||
      gasConcentration === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: temperature, humidity, aqi, gasConcentration",
        },
        { status: 400 },
      )
    }

    // Validate data types and ranges
    const temp = parseFloat(temperature)
    const humid = parseFloat(humidity)
    const aqiValue = parseFloat(aqi)
    const gas = parseFloat(gasConcentration)

    if (isNaN(temp) || isNaN(humid) || isNaN(aqiValue) || isNaN(gas)) {
      return NextResponse.json({ success: false, error: "Invalid data types - all values must be numbers" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("aqi_monitoring")
    const collection = db.collection("sensor_readings")

    // Insert sensor reading
    const reading = {
      timestamp: new Date(),
      temperature: temp,
      humidity: humid,
      aqi: aqiValue,
      gasConcentration: gas,
      status: "online",
      deviceId: body.deviceId || "ESP32_001",
      metadata: {
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "ESP32",
      },
    }

    const result = await collection.insertOne(reading)

    return NextResponse.json({
      success: true,
      message: "Sensor data stored successfully",
      id: result.insertedId.toString(),
      timestamp: reading.timestamp,
    })
  } catch (error) {
    console.error("Ingestion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to store data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
