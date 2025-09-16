"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Thermometer, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface AQIThermometerProps {
  value: number
  className?: string
}

export function AQIThermometer({ value, className }: AQIThermometerProps) {
  const getAQILevel = (aqi: number) => {
    if (aqi <= 50)
      return {
        level: "Good",
        color: "#059669", // emerald-600 - darker for better contrast
        bgColor: "bg-emerald-50 dark:bg-emerald-950",
        textColor: "text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle,
        description: "Air quality is satisfactory",
      }
    if (aqi <= 100)
      return {
        level: "Moderate",
        color: "#d97706", // amber-600 - darker for better contrast
        bgColor: "bg-amber-50 dark:bg-amber-950",
        textColor: "text-amber-700 dark:text-amber-300",
        icon: AlertTriangle,
        description: "Air quality is acceptable",
      }
    if (aqi <= 150)
      return {
        level: "Unhealthy for Sensitive",
        color: "#ea580c", // orange-600 - darker for better contrast
        bgColor: "bg-orange-50 dark:bg-orange-950",
        textColor: "text-orange-700 dark:text-orange-300",
        icon: AlertTriangle,
        description: "Sensitive groups may be affected",
      }
    if (aqi <= 200)
      return {
        level: "Unhealthy",
        color: "#dc2626", // red-600 - darker for better contrast
        bgColor: "bg-red-50 dark:bg-red-950",
        textColor: "text-red-700 dark:text-red-300",
        icon: XCircle,
        description: "Everyone may be affected",
      }
    if (aqi <= 300)
      return {
        level: "Very Unhealthy",
        color: "#9333ea", // purple-600 - darker for better contrast
        bgColor: "bg-purple-50 dark:bg-purple-950",
        textColor: "text-purple-700 dark:text-purple-300",
        icon: XCircle,
        description: "Health warnings of emergency conditions",
      }
    return {
      level: "Hazardous",
      color: "#991b1b", // red-800 - much darker for better contrast
      bgColor: "bg-red-50 dark:bg-red-950",
      textColor: "text-red-800 dark:text-red-200",
      icon: XCircle,
      description: "Health alert: everyone may be affected",
    }
  }

  const aqiInfo = getAQILevel(value)
  const percentage = Math.min((value / 300) * 100, 100)
  const Icon = aqiInfo.icon

  const segments = [
    { min: 0, max: 50, color: "#059669", label: "Good" },
    { min: 51, max: 100, color: "#d97706", label: "Moderate" },
    { min: 101, max: 150, color: "#ea580c", label: "Unhealthy for Sensitive" },
    { min: 151, max: 200, color: "#dc2626", label: "Unhealthy" },
    { min: 201, max: 300, color: "#9333ea", label: "Very Unhealthy" },
  ]

  return (
    <Card className={`${className} ${aqiInfo.bgColor}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Thermometer className={`h-5 w-5 ${aqiInfo.textColor}`} />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-8 h-64 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="absolute w-full opacity-30"
                  style={{
                    backgroundColor: segment.color,
                    height: `${((segment.max - segment.min) / 300) * 100}%`,
                    bottom: `${(segment.min / 300) * 100}%`,
                  }}
                />
              ))}

              <motion.div
                className="absolute bottom-0 w-full rounded-full"
                style={{ backgroundColor: aqiInfo.color }}
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>

            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white dark:border-gray-800"
              style={{ backgroundColor: aqiInfo.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            />
          </div>

          <div className="h-64 flex flex-col justify-between text-xs text-muted-foreground">
            <span>300</span>
            <span>200</span>
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
        </div>

        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2">
            <motion.span
              className={`text-4xl font-bold ${aqiInfo.textColor}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 4 }}
            >
              {value}
            </motion.span>
            <span className="text-lg text-muted-foreground">AQI</span>
          </div>

          <Badge variant="outline" className={`${aqiInfo.textColor} border-current px-3 py-1`}>
            <Icon className="h-3 w-3 mr-1" />
            {aqiInfo.level}
          </Badge>

          <p className="text-sm text-muted-foreground max-w-48 text-center">{aqiInfo.description}</p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
