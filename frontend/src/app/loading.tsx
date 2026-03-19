"use client";

import { motion } from "framer-motion";
import { Loader2, Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <h2 className="text-xl font-bold font-heading text-foreground">
            Loading...
          </h2>
        </div>
        
        <p className="text-muted-foreground">
          Preparing your dashboard
        </p>
      </motion.div>
    </div>
  );
}
