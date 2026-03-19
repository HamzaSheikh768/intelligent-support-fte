"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Ticket, Clock, Smile, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardMetrics } from "@/types/admin";
import { getMetrics, createPolling } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface MetricsCardsProps {
  initialData?: DashboardMetrics;
}

// Counter animation component
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

export default function MetricsCards({ initialData }: MetricsCardsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  // Fetch initial data
  useEffect(() => {
    if (!initialData) {
      getMetrics()
        .then((data) => setMetrics(data))
        .catch((err) => {
          // Suppress 404 errors (backend not ready)
          if (err.status !== 404) {
            console.error("Failed to fetch metrics:", err);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [initialData]);

  // Set up polling for real-time updates (every 10 seconds)
  useEffect(() => {
    const polling = createPolling<DashboardMetrics>(
      getMetrics,
      10000, // 10 seconds
      (data) => setMetrics(data),
      (err) => {
        // Only show error if we had data before and now lost connection
        if (metrics && err instanceof Error) {
          toast.error("Lost connection to backend - waiting for reconnection...");
        }
      }
    );

    polling.start();
    return () => polling.stop();
  }, [metrics]);

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton className="w-24 h-8 mb-2" />
              <Skeleton className="w-32 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Tickets",
      value: metrics.totalTickets,
      icon: Ticket,
      gradient: "from-blue-500 to-cyan-500",
      description: "All time tickets",
    },
    {
      title: "Open Tickets",
      value: metrics.openTickets,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      description: "Awaiting response",
    },
    {
      title: "Avg Response Time",
      value: metrics.avgResponseTime,
      suffix: "s",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      description: "Target: < 3 seconds",
      target: 3,
    },
    {
      title: "Sentiment Score",
      value: Math.round(metrics.sentimentScore * 100),
      suffix: "%",
      icon: Smile,
      gradient: "from-purple-500 to-pink-500",
      description: `Overall ${metrics.sentimentLabel}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isTargetMet = card.target ? card.value <= card.target : true;

        return (
          <motion.div
            key={card.title}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover="hover"
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Value */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl font-bold font-heading text-foreground mb-1">
                    <AnimatedCounter end={card.value} />
                    {card.suffix && (
                      <span className="text-lg text-muted-foreground ml-1">
                        {card.suffix}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                    {card.target && (
                      <motion.div
                        animate={{
                          scale: isTargetMet ? 1 : [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: isTargetMet ? 0 : Infinity,
                        }}
                        className={`w-2 h-2 rounded-full ${
                          isTargetMet ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                    )}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
