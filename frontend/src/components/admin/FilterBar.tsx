"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TicketStatus, TicketPriority, ChannelType } from "@/types/admin";

interface FilterBarProps {
  onApplyFilters: (filters: {
    channel?: ChannelType;
    status?: TicketStatus;
    priority?: TicketPriority;
    search?: string;
  }) => void;
  onReset: () => void;
}

export default function FilterBar({
  onApplyFilters,
  onReset,
}: FilterBarProps) {
  const [channel, setChannel] = useState<ChannelType | "all">("all");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleApply = () => {
    onApplyFilters({
      channel: channel !== "all" ? channel : undefined,
      status: status !== "all" ? status : undefined,
      priority: priority !== "all" ? priority : undefined,
      search: search || undefined,
    });
  };

  const handleReset = () => {
    setChannel("all");
    setStatus("all");
    setPriority("all");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    onReset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-16 z-30"
    >
      <Card className="bg-card/80 border-border/50 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Channel Filter */}
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="w-[150px] bg-background/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="webform">Web Form</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[130px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-[130px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10 w-[150px] bg-background/50 border-border/50"
                    placeholder="From"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10 w-[150px] bg-background/50 border-border/50"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Apply Filters
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-border/50"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
