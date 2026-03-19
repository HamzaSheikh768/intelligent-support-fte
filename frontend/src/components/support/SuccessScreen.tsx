"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Copy, Ticket, Clock, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface SuccessScreenProps {
  ticketId: string;
  onReset: () => void;
  onTrack: () => void;
}

export default function SuccessScreen({
  ticketId,
  onReset,
  onTrack,
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ["#8B5CF6", "#3B82F6", "#25D366", "#EA4335"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      requestAnimationFrame(frame);
    };

    frame();

    // Additional burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });
    }, 300);
  }, []);

  // Copy ticket ID
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      toast.success("Ticket ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[60vh] flex items-center justify-center py-12"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2,
        }}
        className="w-full max-w-lg"
      >
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Success Icon Animation */}
            <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 py-12 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3,
                }}
                className="relative"
              >
                {/* Ripple Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-500/30"
                  animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold font-heading text-foreground mb-2">
                  Ticket Created Successfully!
                </h2>
                <p className="text-muted-foreground">
                  Your ticket has been created. AI will reply within 5 minutes.
                </p>
              </motion.div>

              {/* Ticket ID */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Ticket ID
                        </p>
                        <p className="text-2xl font-mono font-bold text-primary">
                          {ticketId}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Copy
                        className={`w-5 h-5 ${
                          copied ? "text-green-500" : "text-muted-foreground"
                        }`}
                      />
                    </motion.button>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Estimated response: 5 minutes</span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                {/* Track Ticket Button with Link */}
                <Link href={`/track?ticket_id=${ticketId}`}>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    <Ticket className="mr-2 w-5 h-5" />
                    Track Ticket Status
                  </Button>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={onReset}
                    variant="outline"
                    className="border-border/50 text-foreground py-6 rounded-xl hover:bg-accent/50 transition-all duration-300"
                  >
                    <Send className="mr-2 w-5 h-5" />
                    Submit Another
                  </Button>

                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="border-border/50 text-foreground py-6 rounded-xl hover:bg-accent/50 transition-all duration-300"
                  >
                    <Copy className="mr-2 w-5 h-5" />
                    {copied ? "Copied!" : "Copy ID"}
                  </Button>
                </div>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation to your email with all the
                  details.
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
