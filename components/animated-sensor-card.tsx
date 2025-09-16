"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface AnimatedSensorCardProps {
  title: string
  value: string | number
  unit: string
  icon: LucideIcon
  description: string
  trend?: "up" | "down" | "stable"
  className?: string
}

export function AnimatedSensorCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend = "stable",
  className,
}: AnimatedSensorCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-red-500"
      case "down":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      default:
        return "→"
    }
  }

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold animate-in fade-in duration-500">{value}</div>
          <div className="text-sm text-muted-foreground">{unit}</div>
          <div className={`text-sm ${getTrendColor()}`}>{getTrendIcon()}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
