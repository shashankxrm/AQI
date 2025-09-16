"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PremiumSensorCardProps {
  title: string
  value: number | string
  unit: string
  icon: LucideIcon
  description: string
  trend?: "up" | "down" | "stable"
  trendValue?: number
  colorScheme?: "blue" | "green" | "orange" | "red" | "purple"
  isOnline?: boolean
}

export function PremiumSensorCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend = "stable",
  trendValue,
  colorScheme = "blue",
  isOnline = true,
}: PremiumSensorCardProps) {
  const getColorClasses = (scheme: string) => {
    const schemes = {
      blue: {
        bg: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
        icon: "text-blue-600 dark:text-blue-400",
        value: "text-blue-900 dark:text-blue-100",
        accent: "bg-blue-500",
      },
      green: {
        bg: "from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900",
        icon: "text-emerald-600 dark:text-emerald-400",
        value: "text-emerald-900 dark:text-emerald-100",
        accent: "bg-emerald-500",
      },
      orange: {
        bg: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
        icon: "text-orange-600 dark:text-orange-400",
        value: "text-orange-900 dark:text-orange-100",
        accent: "bg-orange-500",
      },
      red: {
        bg: "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
        icon: "text-red-600 dark:text-red-400",
        value: "text-red-900 dark:text-red-100",
        accent: "bg-red-500",
      },
      purple: {
        bg: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
        icon: "text-purple-600 dark:text-purple-400",
        value: "text-purple-900 dark:text-purple-100",
        accent: "bg-purple-500",
      },
    }
    return schemes[scheme as keyof typeof schemes] || schemes.blue
  }

  const colors = getColorClasses(colorScheme)

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return TrendingUp
      case "down":
        return TrendingDown
      default:
        return Minus
    }
  }

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

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <motion.div
          className={`absolute top-0 left-0 h-1 ${colors.accent}`}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 ${colors.icon}`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground/70">{description}</p>
              </div>
            </div>

            <motion.div
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
              animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <motion.span
                className={`text-3xl font-bold ${colors.value}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                {typeof value === "number" ? value.toFixed(1) : value}
              </motion.span>
              <span className="text-sm text-muted-foreground font-medium">{unit}</span>
            </div>

            {trendValue !== undefined && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <TrendIcon className={`h-3 w-3 ${getTrendColor()}`} />
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {Math.abs(trendValue).toFixed(1)}% from last hour
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
