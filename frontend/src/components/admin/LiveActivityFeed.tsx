"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mail, Globe, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeedItem } from "@/types/admin";
import { getActivityFeed, createPolling } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/**
 * Live Activity Feed Component
 * ENDPOINT CONSISTENCY VERIFIED: GET /api/admin/activity-feed
 * Real-time polling every 7 seconds
 */

const channelIcons: Record<string, any> = {
  whatsapp: MessageCircle,
  gmail: Mail,
  webform: Globe,
};

const sentimentEmojis: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😠",
};

const typeColors: Record<string, string> = {
  new_ticket: "border-l-blue-500 bg-blue-500/5",
  new_message: "border-l-purple-500 bg-purple-500/5",
  ai_response: "border-l-green-500 bg-green-500/5",
  status_change: "border-l-yellow-500 bg-yellow-500/5",
  escalation: "border-l-red-500 bg-red-500/5",
  resolved: "border-l-emerald-500 bg-emerald-500/5",
};

const typeIcons: Record<string, any> = {
  new_ticket: Clock,
  new_message: MessageCircle,
  ai_response: CheckCircle2,
  status_change: AlertCircle,
  escalation: AlertCircle,
  resolved: CheckCircle2,
};

interface LiveActivityFeedProps {
  activities: ActivityFeedItem[];
  fullScreen?: boolean;
}

export default function LiveActivityFeed({ activities, fullScreen = false }: LiveActivityFeedProps) {
  const [activity, setActivity] = useState<ActivityFeedItem[]>(activities || []);
  const [loading, setLoading] = useState(!activities);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    if (!activities) {
      getActivityFeed(50)
        .then((data) => setActivity(data))
        .catch((err) => {
          if (err.status !== 404) {
            console.error("Failed to fetch activity feed:", err);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [activities]);

  // Set up polling for real-time updates (every 7 seconds)
  useEffect(() => {
    const polling = createPolling<ActivityFeedItem[]>(
      () => getActivityFeed(50),
      7000, // 7 seconds for real-time feel
      (data) => {
        if (data.length > 0) {
          // Check for new items
          const lastId = activity[0]?.id;
          const hasNewActivity = !lastId || data[0].id !== lastId;
          
          if (hasNewActivity) {
            const newItems = data.filter(item => item.id !== lastId);
            setNewActivityCount(prev => prev + newItems.length);
            
            // Show toast for new activity
            newItems.forEach(item => {
              toast.info(`New activity: ${item.customerName}`, {
                description: item.messageSnippet,
                duration: 3000,
              });
            });
          }
          
          setActivity(data);
        }
      },
      (err) => {
        console.warn("Activity feed polling error:", err);
      }
    );

    polling.start();
    return () => polling.stop();
  }, [activity]);

  const getSentimentIcon = (score: number) => {
    if (score > 0.6) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (score < 0.4) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const clearNewActivityCount = () => {
    setNewActivityCount(0);
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50 h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-heading">Live Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">Live Activity Feed</CardTitle>
          <div className="flex items-center gap-2">
            {newActivityCount > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={clearNewActivityCount}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded-full"
              >
                {newActivityCount} new
              </motion.button>
            )}
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time customer interactions
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className={`space-y-3 ${fullScreen ? 'max-h-[70vh]' : 'max-h-[600px]'} overflow-y-auto pr-2 scrollbar-thin`}
        >
          <AnimatePresence initial={false}>
            {activity.length > 0 ? (
              activity.map((item, index) => {
                const Icon = channelIcons[item.channel] || MessageCircle;
                const TypeIcon = typeIcons[item.type] || AlertCircle;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      relative p-4 rounded-lg border-l-2 
                      ${typeColors[item.type] || "border-l-gray-500 bg-gray-500/5"}
                      hover:bg-accent/50 transition-colors cursor-pointer
                    `}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.channel === 'whatsapp' ? 'bg-green-500/10' : item.channel === 'gmail' ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                          <Icon className={`w-4 h-4 ${item.channel === 'whatsapp' ? 'text-green-500' : item.channel === 'gmail' ? 'text-red-500' : 'text-purple-500'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">
                            {item.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{sentimentEmojis[item.sentiment]}</span>
                        {getSentimentIcon(item.sentimentScore)}
                      </div>
                    </div>

                    {/* Message Snippet */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.messageSnippet}
                    </p>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.type.replace("_", " ")}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Waiting for real-time updates...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
