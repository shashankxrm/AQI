"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HourlyChartProps {
  data: Array<{
    hour: string
    avgTemperature: number
    avgHumidity: number
    avgAQI: number
  }>
  className?: string
}

export function HourlyChart({ data, className }: HourlyChartProps) {
  const getAverage = (key: keyof (typeof data)[0]) => {
    const values = data.map((d) => d[key] as number).filter((v) => typeof v === "number")
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  const avgTemp = getAverage("avgTemperature")
  const avgHumidity = getAverage("avgHumidity")
  const avgAQI = getAverage("avgAQI")

  const getTrendIcon = (current: number, average: number) => {
    if (current > average * 1.05) return <TrendingUp className="h-3 w-3 text-red-500" />
    if (current < average * 0.95) return <TrendingDown className="h-3 w-3 text-green-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Hourly Environmental Averages
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Last {data.length} hours
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Temperature</div>
            <div className="text-lg font-semibold text-orange-600">{avgTemp.toFixed(1)}°C</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Humidity</div>
            <div className="text-lg font-semibold text-blue-600">{avgHumidity.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg AQI</div>
            <div
              className={`text-lg font-semibold ${avgAQI > 100 ? "text-red-600" : avgAQI > 50 ? "text-yellow-600" : "text-green-600"}`}
            >
              {avgAQI.toFixed(0)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            avgTemperature: {
              label: "Temperature (°C)",
              color: "#f97316", // Using distinct orange color for temperature
            },
            avgHumidity: {
              label: "Humidity (%)",
              color: "#3b82f6", // Using distinct blue color for humidity
            },
            avgAQI: {
              label: "Air Quality Index",
              color: "#10b981", // Using distinct green color for AQI (will be red if unhealthy)
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickLine={{ stroke: "currentColor" }} />
              <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: "currentColor" }} />
              <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(label) => `Hour: ${label}`} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar dataKey="avgTemperature" fill="#f97316" name="Temperature (°C)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="avgHumidity" fill="#3b82f6" name="Humidity (%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="avgAQI" fill="#10b981" name="AQI" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Reading the Chart:</strong> Each bar shows the hourly average for the past {data.length} hours.
            Temperature is measured in Celsius, humidity as percentage, and AQI on a 0-500 scale where lower values
            indicate better air quality.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
