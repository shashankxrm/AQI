"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Thermometer, Droplets, Wind, Leaf } from "lucide-react"
import type { SensorReading } from "@/types/sensor"

interface EnvironmentalOverviewProps {
  data: SensorReading[]
  className?: string
}

export function EnvironmentalOverview({ data, className }: EnvironmentalOverviewProps) {
  const latest = data[data.length - 1]
  const previous = data[data.length - 2]

  const getTrend = (current: number, prev: number) => {
    if (!prev) return "stable"
    const diff = ((current - prev) / prev) * 100
    if (diff > 2) return "up"
    if (diff < -2) return "down"
    return "stable"
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600 dark:text-red-400"
      case "down":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      default:
        return "→"
    }
  }

  const metrics = [
    {
      label: "Temperature",
      value: latest?.temperature || 0,
      unit: "°C",
      icon: Thermometer,
      color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      trend: getTrend(latest?.temperature || 0, previous?.temperature || 0),
      description: "Current ambient temperature",
    },
    {
      label: "Humidity",
      value: latest?.humidity || 0,
      unit: "%",
      icon: Droplets,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      trend: getTrend(latest?.humidity || 0, previous?.humidity || 0),
      description: "Relative humidity level",
    },
    {
      label: "Gas Level",
      value: latest?.gasConcentration || 0,
      unit: "ppm",
      icon: Wind,
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      trend: getTrend(latest?.gasConcentration || 0, previous?.gasConcentration || 0),
      description: "Gas concentration detected",
    },
    {
      label: "Air Quality",
      value: latest?.aqi || 0,
      unit: "AQI",
      icon: Leaf,
      color:
        latest?.aqi > 100
          ? "text-red-700 dark:text-red-300"
          : latest?.aqi > 50
            ? "text-amber-700 dark:text-amber-300"
            : "text-green-700 dark:text-green-300",
      bgColor:
        latest?.aqi > 100
          ? "bg-red-50 dark:bg-red-950"
          : latest?.aqi > 50
            ? "bg-amber-50 dark:bg-amber-950"
            : "bg-green-50 dark:bg-green-950",
      trend: getTrend(latest?.aqi || 0, previous?.aqi || 0),
      description: "Overall air quality index",
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
          Environmental Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const trendColor = getTrendColor(metric.trend)
            const trendIcon = getTrendIcon(metric.trend)

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`p-4 rounded-lg border ${metric.bgColor} hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <Badge variant="outline" className={`${trendColor} border-current`}>
                    {trendIcon}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <motion.span
                    className={`text-2xl font-bold ${metric.color}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                  >
                    {metric.value.toFixed(1)}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>

                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
