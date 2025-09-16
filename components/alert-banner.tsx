"use client"

import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AlertBannerProps {
  aqi: number
  className?: string
}

export function AlertBanner({ aqi, className }: AlertBannerProps) {
  const getAlertInfo = (aqi: number) => {
    if (aqi <= 50) {
      return {
        variant: "default" as const,
        icon: CheckCircle,
        title: "Air Quality: Good",
        message: "Air quality is satisfactory and poses little or no risk.",
        bgColor: "bg-green-50 dark:bg-green-950",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-800 dark:text-green-200",
      }
    }
    if (aqi <= 100) {
      return {
        variant: "default" as const,
        icon: Info,
        title: "Air Quality: Moderate",
        message: "Air quality is acceptable for most people.",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        textColor: "text-yellow-800 dark:text-yellow-200",
      }
    }
    return {
      variant: "destructive" as const,
      icon: AlertTriangle,
      title: "Air Quality Alert: Unhealthy",
      message: "Air quality is unhealthy. Sensitive individuals should limit outdoor activities.",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-200",
    }
  }

  const alertInfo = getAlertInfo(aqi)
  const Icon = alertInfo.icon

  return (
    <Alert className={`${className} ${alertInfo.bgColor} ${alertInfo.borderColor}`}>
      <Icon className={`h-4 w-4 ${alertInfo.textColor}`} />
      <AlertDescription className={alertInfo.textColor}>
        <strong>{alertInfo.title}</strong> - {alertInfo.message}
      </AlertDescription>
    </Alert>
  )
}
