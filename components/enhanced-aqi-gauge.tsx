"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AQI_CATEGORIES, type AQICategory } from "@/types/sensor"
import { motion } from "framer-motion"
import { Leaf, AlertTriangle, Skull } from "lucide-react"

interface EnhancedAQIGaugeProps {
  value: number
  className?: string
  showDetails?: boolean
}

export function EnhancedAQIGauge({ value, className, showDetails = true }: EnhancedAQIGaugeProps) {
  const getAQIInfo = (aqi: number) => {
    for (const [key, category] of Object.entries(AQI_CATEGORIES)) {
      if (aqi >= category.min && aqi <= category.max) {
        return {
          category: key as AQICategory,
          ...category,
          colorClass: getColorClass(category.color),
          bgColorClass: getBgColorClass(category.color),
          icon: getIcon(category.color),
        }
      }
    }
    return {
      category: "HAZARDOUS" as AQICategory,
      ...AQI_CATEGORIES.HAZARDOUS,
      colorClass: "text-red-900",
      bgColorClass: "bg-red-900",
      icon: Skull,
    }
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      green: "text-emerald-600",
      yellow: "text-amber-500",
      orange: "text-orange-500",
      red: "text-red-500",
      purple: "text-purple-600",
      maroon: "text-red-900",
    }
    return colorMap[color] || "text-gray-500"
  }

  const getBgColorClass = (color: string) => {
    const bgColorMap: Record<string, string> = {
      green: "bg-emerald-500",
      yellow: "bg-amber-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      purple: "bg-purple-600",
      maroon: "bg-red-900",
    }
    return bgColorMap[color] || "bg-gray-500"
  }

  const getIcon = (color: string) => {
    if (color === "green") return Leaf
    if (color === "yellow" || color === "orange") return AlertTriangle
    return Skull
  }

  const aqiInfo = getAQIInfo(value)
  const percentage = Math.min((value / 500) * 100, 100)
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const Icon = aqiInfo.icon

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`h-4 w-4 ${aqiInfo.colorClass}`} />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted opacity-20"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={aqiInfo.colorClass}
              style={{
                strokeDasharray,
                strokeDashoffset,
              }}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.div
              className={`text-3xl font-bold ${aqiInfo.colorClass}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
            >
              {value}
            </motion.div>
            <div className="text-xs text-muted-foreground text-center">AQI</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Badge variant="outline" className={`${aqiInfo.bgColorClass} text-white border-0 px-3 py-1`}>
            {aqiInfo.label}
          </Badge>
        </motion.div>

        {showDetails && (
          <motion.div
            className="text-center space-y-2 w-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Range:</span>
              <span>
                {aqiInfo.min} - {aqiInfo.max}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div
                className={`h-1.5 rounded-full ${aqiInfo.bgColorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${(value / 500) * 100}%` }}
                transition={{ delay: 2, duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
