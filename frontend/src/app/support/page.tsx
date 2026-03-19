"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChannelType } from "@/types/support";
import ChannelTabs from "@/components/support/ChannelTabs";
import SupportForm from "@/components/support/SupportForm";
import { FloatingParticles, AnimatedGrid } from "@/components/support/BackgroundEffects";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

export default function SupportPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelType>("webform");

  const handleWhatsAppClick = () => {
    toast.info("Opening WhatsApp chat...", {
      description: "Connecting to support agent",
    });
  };

  const handleGmailClick = () => {
    toast.info("Opening email client...", {
      description: "Pre-filling support email",
    });
  };

  const handleFormSuccess = (ticketId: string) => {
    toast.success("Ticket created successfully!", {
      description: `Ticket ID: ${ticketId}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background relative overflow-hidden"
    >
      <Navbar />
      
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0A1428 0%, #000000 100%)' }} />
      <AnimatedGrid />
      <FloatingParticles />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-white mb-6">
            Get{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Instant Support
            </span>{" "}
            24/7
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your preferred channel — Our AI Customer Success FTE is always online
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Channel Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <ChannelTabs
              activeChannel={activeChannel}
              onChannelChange={setActiveChannel}
              onWhatsAppClick={handleWhatsAppClick}
              onGmailClick={handleGmailClick}
            />
          </motion.div>

          {/* Right: Form Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {activeChannel === "webform" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <SupportForm onSuccess={handleFormSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
