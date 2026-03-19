"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetrics, DailyTicket } from "@/types/admin";
import { getMetrics } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const COLORS = ["#3B82F6", "#25D366", "#EA4335", "#8B5CF6", "#F59E0B"];

export default function ChartSection() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then((data) => setMetrics(data))
      .catch((err) => {
        // Suppress 404 errors (backend not ready)
        if (err.status !== 404) {
          console.error("Failed to fetch metrics for charts:", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <Skeleton className="w-48 h-6" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-64" />
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <Skeleton className="w-48 h-6" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  // Prepare daily tickets data
  const dailyData = metrics.dailyTickets.map((item: DailyTicket) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    tickets: item.count,
  }));

  // Prepare channel distribution data
  const channelData = [
    { name: "WhatsApp", value: metrics.ticketsByChannel.whatsapp },
    { name: "Gmail", value: metrics.ticketsByChannel.gmail },
    { name: "Web Form", value: metrics.ticketsByChannel.webform },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Tickets Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-card/50 border-border/50 h-full">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Daily Tickets Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 7 days ticket volume
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Channel Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card/50 border-border/50 h-full">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Channel Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tickets by communication channel
            </p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
