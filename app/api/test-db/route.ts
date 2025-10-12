import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('aqi_monitoring')
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      database: 'aqi_monitoring',
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to MongoDB',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
