"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mail, Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeedItem, getChannelColor } from "@/types/admin";
import { getActivityFeed, createPolling } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

export default function ActivityFeed() {
  const [activity, setActivity] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    getActivityFeed(20)
      .then((data) => setActivity(data))
      .catch((err) => {
        // Suppress 404 errors (backend not ready)
        if (err.status !== 404) {
          console.error("Failed to fetch activity feed:", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Set up polling for real-time updates (every 8 seconds)
  useEffect(() => {
    const polling = createPolling<ActivityFeedItem[]>(
      () => getActivityFeed(20),
      8000, // 8 seconds
      (data) => {
        // Only update if there are new items
        if (data.length > 0 && data[0].id !== activity[0]?.id) {
          setActivity(data);
          // Show toast for new activity
          const newItem = data[0];
          toast.info(`New activity: ${newItem.customerName}`, {
            description: newItem.messageSnippet,
          });
        }
      },
      () => {
        // Silently ignore polling errors (backend not ready)
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

  const getTypeColor = (type: ActivityFeedItem["type"]) => {
    switch (type) {
      case "new_ticket":
        return "border-l-blue-500 bg-blue-500/5";
      case "new_message":
        return "border-l-purple-500 bg-purple-500/5";
      case "ai_response":
        return "border-l-green-500 bg-green-500/5";
      case "status_change":
        return "border-l-yellow-500 bg-yellow-500/5";
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-heading">
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
          <CardTitle className="text-lg font-heading">
            Live Activity Feed
          </CardTitle>
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time customer interactions
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin"
        >
          <AnimatePresence initial={false}>
            {activity.map((item, index) => {
              const Icon = channelIcons[item.channel];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-4 rounded-lg border-l-2 
                    ${getTypeColor(item.type)}
                    hover:bg-accent/50 transition-colors
                  `}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getChannelColor(item.channel)} bg-opacity-10`}
                      >
                        <Icon className="w-4 h-4" />
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
                      <span className="text-lg">
                        {sentimentEmojis[item.sentiment]}
                      </span>
                      {getSentimentIcon(item.sentimentScore)}
                    </div>
                  </div>

                  {/* Message Snippet */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.messageSnippet}
                  </p>

                  {/* Type Badge */}
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.type.replace("_", " ")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {activity.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
