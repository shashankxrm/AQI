"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AQIGaugeProps {
  value: number
  className?: string
}

export function AQIGauge({ value, className }: AQIGaugeProps) {
  // AQI color coding
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return { color: "#10b981", label: "Good" }
    if (aqi <= 100) return { color: "#f59e0b", label: "Moderate" }
    if (aqi <= 150) return { color: "#ef4444", label: "Unhealthy for Sensitive" }
    if (aqi <= 200) return { color: "#dc2626", label: "Unhealthy" }
    if (aqi <= 300) return { color: "#7c2d12", label: "Very Unhealthy" }
    return { color: "#7f1d1d", label: "Hazardous" }
  }

  const { color, label } = getAQIColor(value)
  const percentage = Math.min((value / 300) * 100, 100)
  const rotation = (percentage / 100) * 180 - 90

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-16 overflow-hidden">
          {/* Background arc */}
          <svg className="w-32 h-32 -mt-16" viewBox="0 0 128 128">
            <path
              d="M 16 64 A 48 48 0 0 1 112 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted opacity-20"
            />
            <path
              d="M 16 64 A 48 48 0 0 1 112 64"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={`${(percentage / 100) * 150.8} 150.8`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Needle */}
          <div
            className="absolute top-12 left-1/2 w-0.5 h-12 bg-foreground origin-bottom transition-transform duration-1000 ease-out"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
          {/* Center dot */}
          <div className="absolute top-12 left-1/2 w-2 h-2 bg-foreground rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color }}>
            {value}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}
