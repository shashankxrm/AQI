import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24')
    const limit = parseInt(searchParams.get('limit') || '1000')

    const client = await clientPromise
    const db = client.db('aqi_monitoring')
    const collection = db.collection('sensor_readings')

    // Calculate time range
    const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000)

    // Fetch readings within time range
    const readings = await collection
      .find({ timestamp: { $gte: timeAgo } })
      .sort({ timestamp: 1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      data: readings.map(r => ({
        id: r._id.toString(),
        timestamp: r.timestamp,
        temperature: r.temperature,
        humidity: r.humidity,
        aqi: r.aqi,
        gasConcentration: r.gasConcentration,
        status: r.status || 'online',
        deviceId: r.deviceId || 'unknown'
      })),
      meta: {
        count: readings.length,
        hours: hours,
        startTime: timeAgo,
        endTime: new Date()
      },
      message: `Retrieved ${readings.length} sensor readings from the last ${hours} hours`
    })
  } catch (error) {
    console.error('Historical fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch historical data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
