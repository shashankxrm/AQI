"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Table, Clock } from "lucide-react"
import { DataService } from "@/lib/data-service"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface DataExportProps {
  data: any[]
  className?: string
}

export function DataExport({ data, className }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [lastExportUpdate, setLastExportUpdate] = useState<string>("")
  const dataService = DataService.getInstance()

  useEffect(() => {
    const updateExportData = () => {
      setLastExportUpdate(new Date().toLocaleTimeString())
    }

    updateExportData() // Initial update
    const interval = setInterval(updateExportData, 60000) // Update every 1 minute
    return () => clearInterval(interval)
  }, [])

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true)
    try {
      await dataService.exportData(format, data)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className={`bg-card border hover:shadow-md transition-all duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Download className="h-5 w-5 text-primary" />
          Data Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Available Records</span>
            <Badge variant="outline" className="w-fit mt-1">
              {data.length}
            </Badge>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Last Updated</span>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">{lastExportUpdate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="default"
              className="w-full h-12 bg-transparent hover:bg-primary/5 border-primary/20"
              onClick={() => handleExport("csv")}
              disabled={isExporting || data.length === 0}
            >
              <Table className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="default"
              className="w-full h-12 bg-transparent hover:bg-primary/5 border-primary/20"
              onClick={() => handleExport("pdf")}
              disabled={isExporting || data.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </motion.div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">Export data updates every minute</div>
      </CardContent>
    </Card>
  )
}
