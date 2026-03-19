"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardMetrics } from "@/types/admin";
import { getMetrics } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

const COLORS = ["#3B82F6", "#F59E0B", "#EF4444"];

export default function AnalyticsSection() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then((data) => setMetrics(data))
      .catch((err) => {
        if (err.status !== 404) {
          console.error("Failed to fetch analytics:", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardHeader>
              <Skeleton className="w-48 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-64" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            No Analytics Data
          </h3>
          <p className="text-muted-foreground">
            Unable to load analytics. Please ensure the backend API is running.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Priority distribution data
  const priorityData = [
    { name: "Low", value: metrics.ticketsByPriority.low, fill: "#6B7280" },
    { name: "Medium", value: metrics.ticketsByPriority.medium, fill: "#F59E0B" },
    { name: "High", value: metrics.ticketsByPriority.high, fill: "#EF4444" },
  ];

  // Daily tickets data
  const dailyData = metrics.dailyTickets.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    tickets: item.count,
  }));

  // Channel distribution data
  const channelData = [
    { name: "WhatsApp", value: metrics.ticketsByChannel.whatsapp },
    { name: "Gmail", value: metrics.ticketsByChannel.gmail },
    { name: "Web Form", value: metrics.ticketsByChannel.webform },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* First Row: Priority + Daily Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                Priority Distribution
              </CardTitle>
              <CardDescription>
                Tickets by priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priorityData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No priority data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Tickets Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                Daily Tickets Trend
              </CardTitle>
              <CardDescription>
                Last 7 days ticket volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyData.length > 0 && dailyData.some(d => d.tickets > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No daily ticket data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row: Channel Distribution + Response Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                Channel Distribution
              </CardTitle>
              <CardDescription>
                Tickets by communication channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {channelData.length > 0 && channelData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {channelData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No channel data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                Key Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 h-full">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metrics.avgResponseTime.toFixed(1)}s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Response Time
                  </div>
                  {metrics.avgResponseTime < 3 ? (
                    <div className="flex items-center justify-center gap-1 text-green-500 mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">Optimal</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mt-2">
                      <TrendingDown className="w-3 h-3" />
                      <span className="text-xs font-medium">Needs Attention</span>
                    </div>
                  )}
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {Math.round(metrics.sentimentScore * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Customer Satisfaction
                  </div>
                  <div className="flex items-center justify-center gap-1 text-green-500 mt-2">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {metrics.sentimentLabel}
                    </span>
                  </div>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metrics.resolvedTickets}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Resolved Today
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {metrics.totalTickets > 0 
                      ? `${Math.round((metrics.resolvedTickets / metrics.totalTickets) * 100)}% resolution rate`
                      : "No data"}
                  </div>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metrics.openTickets}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Open Tickets
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Currently active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
