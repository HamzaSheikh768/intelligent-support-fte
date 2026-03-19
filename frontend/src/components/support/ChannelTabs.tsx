"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { MessageCircle, Mail, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHANNEL_CONFIGS, ChannelType } from "@/types/support";

interface ChannelTabsProps {
  activeChannel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
  onWhatsAppClick?: () => void;
  onGmailClick?: () => void;
}

const tabVariants = {
  inactive: { scale: 1, opacity: 0.7, transition: { duration: 0.3 } },
  active: { scale: 1.05, opacity: 1, transition: { duration: 0.3, type: "spring" as const, stiffness: 200 } },
  hover: { scale: 1.08, opacity: 0.9, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, type: "spring" as const, stiffness: 200, damping: 20 } },
  exit: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.3 } },
};

export default function ChannelTabs({
  activeChannel,
  onChannelChange,
  onWhatsAppClick,
  onGmailClick,
}: ChannelTabsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const channels: ChannelType[] = ["whatsapp", "gmail", "webform"];

  const handleWhatsAppClick = () => {
    onWhatsAppClick?.();
    // Twilio WhatsApp Sandbox number (free for testing)
    // Users need to send "join <keyword>" to this number first
    const phoneNumber = "14155238886"; // Twilio sandbox number without "whatsapp:" prefix
    const message = encodeURIComponent("Hi, I need help with [product] — my ticket reference is...");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleGmailClick = () => {
    onGmailClick?.();
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
    const subject = encodeURIComponent("Support Request");
    const body = encodeURIComponent("Hi Support Team,\n\nI need help with...\n\nBest regards");
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${subject}&body=${body}`, "_blank");
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row gap-2">
        {channels.map((channelId, index) => {
          const channel = CHANNEL_CONFIGS[channelId];
          const Icon = channelId === "whatsapp" ? MessageCircle : channelId === "gmail" ? Mail : FileText;
          const isActive = activeChannel === channelId;

          return (
            <motion.button
              key={channelId}
              onClick={() => onChannelChange(channelId)}
              variants={tabVariants}
              initial="inactive"
              animate={isActive ? "active" : "inactive"}
              whileHover="hover"
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                isActive ? `bg-gradient-to-r ${channel.gradient} text-white shadow-lg` : "bg-card/50 border border-border/50 text-foreground hover:bg-accent/50"
              }`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{channel.label}</span>
              <span className="sm:hidden">{channelId === "whatsapp" ? "WhatsApp" : channelId === "gmail" ? "Email" : "Form"}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeChannel === "whatsapp" && (
          <motion.div key="whatsapp" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="text-2xl font-bold font-heading text-foreground mb-2">Chat on WhatsApp</h3>
                    <p className="text-muted-foreground mb-6">Get instant responses via WhatsApp. Our AI FTE typically replies within seconds.</p>
                    
                    {/* Sandbox Instructions */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-400 mb-4">
                      <p className="font-semibold mb-2">📱 Step 1: Activate Sandbox (Free Chating)</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open WhatsApp on your phone</li>
                        <li>Message: <code className="bg-blue-500/20 px-2 py-0.5 rounded text-xs">+1 415-523-8886</code></li>
                        <li>Send: <code className="bg-blue-500/20 px-2 py-0.5 rounded text-xs">join friendly</code></li>
                        <li>Wait for confirmation (valid for 72 hours)</li>
                      </ol>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm text-green-400">
                      <p className="font-semibold mb-2">✅ Step 2: Send Your Message</p>
                      <p>After joining, click the button below to start chatting with our AI FTE.</p>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {[{ label: "Response Time", value: "< 30 seconds" }, { label: "Availability", value: "24/7" }, { label: "Format", value: "Chat" }].map((feature) => (
                      <div key={feature.label} className="bg-muted/50 rounded-lg p-3">
                        <div className="text-muted-foreground mb-1">{feature.label}</div>
                        <div className="font-semibold text-foreground">{feature.value}</div>
                      </div>
                    ))}
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Button onClick={handleWhatsAppClick} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300">
                      <ExternalLink className="mr-2 w-5 h-5" />
                      Open WhatsApp Chat
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeChannel === "gmail" && (
          <motion.div key="gmail" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                    <Mail className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="text-2xl font-bold font-heading text-foreground mb-2">Email Us</h3>
                    <p className="text-muted-foreground mb-6">Send us a detailed email. Perfect for complex issues that require screenshots or attachments.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {[{ label: "Response Time", value: "< 5 minutes" }, { label: "Availability", value: "24/7" }, { label: "Attachments", value: "Up to 3 files" }].map((feature) => (
                      <div key={feature.label} className="bg-muted/50 rounded-lg p-3">
                        <div className="text-muted-foreground mb-1">{feature.label}</div>
                        <div className="font-semibold text-foreground">{feature.value}</div>
                      </div>
                    ))}
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Button onClick={handleGmailClick} className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300">
                      <ExternalLink className="mr-2 w-5 h-5" />
                      Email Us Directly
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeChannel === "webform" && (
          <motion.div key="webform" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30 mb-4">
                    <FileText className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold font-heading text-foreground">Submit Support Form</h3>
                  <p className="text-muted-foreground">Fill out the form below for comprehensive support</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
