"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Users, BarChart3, Activity, MessageSquare, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketType, ChannelType, TicketStatus, TicketPriority, DashboardMetrics } from "@/types/admin";
import Sidebar from "@/components/admin/Sidebar";
import TicketsTable from "@/components/admin/TicketsTable";
import TicketModal from "@/components/admin/TicketModal";
import FilterBar from "@/components/admin/FilterBar";
import LiveActivityFeed from "@/components/admin/LiveActivityFeed";
import RealMetricsCards from "@/components/admin/RealMetricsCards";
import UsersTable from "@/components/admin/UsersTable";
import AnalyticsSection from "@/components/admin/AnalyticsSection";
import { getMetrics, getActivityFeed } from "@/lib/api/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Admin Dashboard - Real-Time 4-Tab Interface
 * ENDPOINT CONSISTENCY VERIFIED:
 * - GET /api/admin/tickets
 * - GET /api/admin/users
 * - GET /api/admin/metrics
 * - GET /api/admin/activity-feed
 */

// Tab configuration
const tabs = [
  {
    id: "tickets",
    label: "All Tickets",
    icon: Ticket,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    id: "activity",
    label: "Live Activity",
    icon: Activity,
  },
];

export default function AdminPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    channel?: ChannelType;
    status?: TicketStatus;
    priority?: TicketPriority;
    search?: string;
  }>({});
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("tickets");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connected, setConnected] = useState(true);

  // Fetch initial metrics and set up polling
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();
        setMetrics(data);
        setLastUpdated(new Date());
        setConnected(true);
      } catch (err) {
        if ((err as any)?.status !== 404) {
          console.error("Failed to fetch dashboard metrics:", err);
          setConnected(false);
        }
      }
    };

    fetchMetrics();

    // Poll every 5 seconds for real-time updates
    const intervalId = setInterval(fetchMetrics, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch activity feed and set up polling
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getActivityFeed(50);
        setActivityFeed(data);
        setLastUpdated(new Date());
        setConnected(true);
      } catch (err) {
        if ((err as any)?.status !== 404) {
          console.error("Failed to fetch activity feed:", err);
          setConnected(false);
        }
      }
    };

    fetchActivity();

    // Poll every 5 seconds for real-time updates
    const intervalId = setInterval(fetchActivity, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle ticket click
  const handleTicketClick = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  // Handle filters
  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  // Handle modal update
  const handleUpdate = () => {
    getMetrics().then((data) => setMetrics(data));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50"
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time AI Customer Success monitoring
                </p>
              </div>
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
                <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {/* Last Updated */}
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Support Button */}
              <Link href="/support">
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Support
                </Button>
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Real-time Metrics */}
          <RealMetricsCards initialData={metrics || undefined} />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border/50 backdrop-blur-sm p-1 rounded-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-lg"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </motion.div>

            {/* Tab 1: All Tickets */}
            <TabsContent value="tickets" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <FilterBar
                  onApplyFilters={handleApplyFilters}
                  onReset={handleResetFilters}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TicketsTable
                      filters={filters}
                      onTicketClick={handleTicketClick}
                    />
                  </div>
                  <div>
                    <LiveActivityFeed activities={activityFeed} />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Tab 2: Users */}
            <TabsContent value="users" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <UsersTable onUserClick={handleTicketClick} />
              </motion.div>
            </TabsContent>

            {/* Tab 3: Analytics */}
            <TabsContent value="analytics" className="mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <AnalyticsSection />
              </motion.div>
            </TabsContent>

            {/* Tab 4: Live Activity Feed */}
            <TabsContent value="activity" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <LiveActivityFeed activities={activityFeed} fullScreen />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        ticket={selectedTicket}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdate={handleUpdate}
      />
    </motion.div>
  );
}
