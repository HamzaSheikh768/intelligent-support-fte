"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Ticket, Clock, CheckCircle2, AlertCircle, Mail, MessageCircle, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Ticket Tracking Page
 * ENDPOINT CONSISTENCY VERIFIED: GET /api/v1/support/ticket/{ticketId}
 */

interface TicketStatus {
  ticket_id: string;
  status: "open" | "in_progress" | "resolved" | "escalated";
  subject?: string;
  message?: string;
  customerName?: string;
  customerEmail?: string;
  channel?: "whatsapp" | "gmail" | "webform";
  priority?: "low" | "medium" | "high";
  created_at: string;
  last_updated?: string;
  resolved_at?: string;
  messages: Array<{
    id: string;
    sender: "customer" | "ai" | "human";
    content: string;
    timestamp: string;
  }>;
}

export default function TrackTicketPage() {
  const [ticketId, setTicketId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [ticket, setTicket] = useState<TicketStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check URL for ticket_id parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("ticket_id");
    if (id) {
      setTicketId(id);
      setSearchId(id);
      trackTicket(id);
    }
  }, []);

  const trackTicket = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter a ticket ID");
      return;
    }

    setLoading(true);
    setError("");
    const loadingToast = toast.loading("Searching for ticket...");

    try {
      // ENDPOINT: GET /api/v1/support/ticket/{ticketId}
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/support/ticket/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Ticket not found. Please check the ID and try again.");
        }
        throw new Error("Failed to fetch ticket status");
      }

      const data = await response.json();
      setTicket(data);
      toast.dismiss(loadingToast);
      toast.success("Ticket found!");
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMessage = err instanceof Error ? err.message : "Failed to track ticket";
      setError(errorMessage);
      setTicket(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackTicket(searchId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "in_progress": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "resolved": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "escalated": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="w-5 h-5" />;
      case "in_progress": return <AlertCircle className="w-5 h-5" />;
      case "resolved": return <CheckCircle2 className="w-5 h-5" />;
      case "escalated": return <AlertCircle className="w-5 h-5" />;
      default: return <Ticket className="w-5 h-5" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp": return <MessageCircle className="w-4 h-4 text-green-500" />;
      case "gmail": return <Mail className="w-4 h-4 text-red-500" />;
      case "webform": return <Globe className="w-4 h-4 text-purple-500" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <Navbar />
      
      <main className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground mb-4">
              Track Your Ticket
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your ticket ID to check the status and updates
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter ticket ID (e.g., TK-2026-123456)"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                      className="bg-background/50 border-border/50 font-mono"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                  >
                    {loading ? (
                      <>
                        <Search className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Track Ticket
                      </>
                    )}
                  </Button>
                </form>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm mt-3 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ticket Details */}
          {ticket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-heading">
                          {ticket.ticket_id}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {ticket.subject || "Support Request"}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium text-foreground">{ticket.customerName || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{ticket.customerEmail || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Channel</p>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(ticket.channel || "webform")}
                        <span className="font-medium text-foreground capitalize">{ticket.channel || "webform"}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <span className={`font-medium ${
                        ticket.priority === "high" ? "text-red-500" :
                        ticket.priority === "medium" ? "text-yellow-500" :
                        "text-green-500"
                      }`}>
                        {ticket.priority?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium text-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-border/50 pt-4">
                    <h3 className="font-semibold text-foreground mb-4">Activity Timeline</h3>
                    <div className="space-y-4">
                      {/* Created */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <div className="w-0.5 h-full bg-blue-500/20 mt-2" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-foreground">Ticket Created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      {ticket.messages.map((msg, index) => (
                        <div key={msg.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              msg.sender === "customer" ? "bg-purple-500" :
                              msg.sender === "ai" ? "bg-green-500" :
                              "bg-blue-500"
                            }`} />
                            {index < ticket.messages.length - 1 && (
                              <div className="w-0.5 h-full bg-blue-500/20 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                msg.sender === "customer" ? "bg-purple-500/10 text-purple-500" :
                                msg.sender === "ai" ? "bg-green-500/10 text-green-500" :
                                "bg-blue-500/10 text-blue-500"
                              }`}>
                                {msg.sender === "customer" ? "Customer" :
                                 msg.sender === "ai" ? "AI Assistant" :
                                 "Human Agent"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{msg.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Resolved */}
                      {ticket.resolved_at && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">Ticket Resolved</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(ticket.resolved_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Card className="flex-1 bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have questions about your ticket? Contact our support team.
                    </p>
                    <Link href="/support">
                      <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                        Contact Support
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="flex-1 bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">New Issue?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Need to submit a new support request?
                    </p>
                    <Link href="/support">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Create New Ticket
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!ticket && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Ticket Selected
              </h3>
              <p className="text-muted-foreground mb-6">
                Enter your ticket ID above to track its status
              </p>
              <Link href="/support">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Submit New Ticket
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
