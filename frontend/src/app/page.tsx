"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, Globe, Zap, Clock, DollarSign, TrendingUp, CheckCircle2, ArrowRight, Play, Github, Twitter, Linkedin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0A1428 0%, #000000 100%)' }} />
          
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading text-white leading-tight">
                Meet Your{" "}
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  24/7 AI
                </span>{" "}
                Customer Success Employee
              </h1>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-light max-w-4xl mx-auto leading-relaxed mt-6">
                The Digital FTE that works non-stop — handles Gmail, WhatsApp & Web inquiries, 
                tracks tickets, escalates intelligently, and costs less than{" "}
                <span className="text-primary font-medium">$1,000/year</span>.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <p className="text-base sm:text-lg text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed mt-6">
                Built for growing SaaS companies. Never sleeps. Never takes a day off. 
                Delivers enterprise-grade customer success 24/7 across every channel while 
                your human team focuses on high-value work.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/support">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                >
                  Get Support Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="border-border/50 text-foreground px-8 py-6 text-lg rounded-xl hover:bg-accent/50 transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch 45-Second Demo
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-foreground mb-6">
                AI That{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Never Sleeps
                </span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, value: "99.9%", label: "Uptime", gradient: "from-yellow-400 to-orange-500" },
                { icon: Clock, value: "24/7", label: "Availability", gradient: "from-blue-400 to-cyan-500" },
                { icon: DollarSign, value: "$1,000", label: "Annual Cost", gradient: "from-green-400 to-emerald-500" },
                { icon: TrendingUp, value: "10×", label: "Faster Responses", gradient: "from-purple-400 to-pink-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-4xl font-bold font-heading mb-2 text-foreground">{stat.value}</div>
                      <div className="text-muted-foreground font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card/30 border-t border-border/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg font-heading text-foreground">TechCorp</span>
                </Link>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Enterprise-grade AI customer success that works 24/7.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                  <li><Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                  <li><Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">Admin</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Built For</h4>
                <p className="text-muted-foreground text-sm">Panaversity Agent Factory Hackathon 5</p>
              </div>
            </div>
            <div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechCorp. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </motion.div>
  );
}
