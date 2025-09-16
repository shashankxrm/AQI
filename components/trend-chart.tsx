"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TrendChartProps {
  data: Array<{
    time: string
    temperature: number
    humidity: number
    aqi: number
  }>
  className?: string
}

export function TrendChart({ data, className }: TrendChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Environmental Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            temperature: {
              label: "Temperature (°C)",
              color: "hsl(var(--chart-1))",
            },
            humidity: {
              label: "Humidity (%)",
              color: "hsl(var(--chart-2))",
            },
            aqi: {
              label: "AQI",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line type="monotone" dataKey="humidity" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="aqi" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
