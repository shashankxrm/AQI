import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('aqi_monitoring')
    const collection = db.collection('sensor_readings')

    // Get most recent reading
    const reading = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray()

    if (reading.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data available',
        message: 'No sensor readings found in database'
      }, { status: 404 })
    }

    const data = reading[0]

    return NextResponse.json({
      success: true,
      data: {
        id: data._id.toString(),
        timestamp: data.timestamp,
        temperature: data.temperature,
        humidity: data.humidity,
        aqi: data.aqi,
        gasConcentration: data.gasConcentration,
        status: data.status || 'online',
        deviceId: data.deviceId || 'unknown'
      },
      message: 'Latest sensor data retrieved successfully'
    })
  } catch (error) {
    console.error('Fetch current data error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
