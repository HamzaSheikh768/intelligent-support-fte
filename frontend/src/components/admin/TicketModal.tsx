"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Ticket,
  Mail,
  MessageCircle,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import {
  Ticket as TicketType,
  Message,
  getStatusColor,
  getPriorityColor,
  getChannelColor,
  getSentimentColor,
  ChannelType,
  TicketStatus,
} from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  resolveTicket,
  escalateTicket,
  updateTicketPriority,
  addInternalNote,
} from "@/lib/api/admin";

interface TicketModalProps {
  ticket: TicketType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const channelIcons: Record<ChannelType, any> = {
  whatsapp: MessageCircle,
  gmail: Mail,
  webform: Globe,
};

const sentimentEmojis: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😠",
};

export default function TicketModal({
  ticket,
  open,
  onOpenChange,
  onUpdate,
}: TicketModalProps) {
  const [internalNote, setInternalNote] = useState("");
  const [newPriority, setNewPriority] = useState<TicketType["priority"]>();
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (!ticket) return null;

  const ChannelIcon = channelIcons[ticket.channel];

  // Handle resolve
  const handleResolve = async () => {
    setIsActionLoading(true);
    try {
      await resolveTicket(ticket.id);
      toast.success("Ticket resolved successfully");
      onUpdate();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to resolve ticket");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle escalate
  const handleEscalate = async () => {
    setIsActionLoading(true);
    try {
      await escalateTicket(ticket.id);
      toast.success("Ticket escalated to human agent");
      onUpdate();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to escalate ticket");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle priority change
  const handlePriorityChange = async () => {
    if (!newPriority) return;
    setIsActionLoading(true);
    try {
      await updateTicketPriority(ticket.id, newPriority);
      toast.success("Priority updated successfully");
      onUpdate();
    } catch (err) {
      toast.error("Failed to update priority");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!internalNote.trim()) return;
    setIsActionLoading(true);
    try {
      await addInternalNote(ticket.id, internalNote);
      toast.success("Internal note added");
      setInternalNote("");
      onUpdate();
    } catch (err) {
      toast.error("Failed to add note");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <Ticket className="w-6 h-6 text-primary" />
                <span className="font-mono">{ticket.ticketId}</span>
              </DialogTitle>
              <p className="text-muted-foreground mt-1">{ticket.subject}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(ticket.status)} bg-opacity-10`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}
                />
                <span className="capitalize">{ticket.status}</span>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)} bg-opacity-10`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}
                />
                <span className="capitalize">{ticket.priority} priority</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted">
                <ChannelIcon className={`w-4 h-4 ${getChannelColor(ticket.channel)}`} />
                <span className="capitalize">{ticket.channel}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm">
                <span className="text-xl">
                  {sentimentEmojis[ticket.sentiment]}
                </span>
                <span className={getSentimentColor(ticket.sentiment)}>
                  {ticket.sentiment}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Customer Information</span>
              </div>
              <div className="text-foreground">
                <div className="font-medium">{ticket.customerName}</div>
                <div className="text-sm text-muted-foreground">
                  {ticket.customerEmail}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Created {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Original Message */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Original Message
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap">
                {ticket.message}
              </p>
            </div>

            {/* Messages Timeline */}
            {ticket.messages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Conversation History
                  </span>
                </div>
                <div className="space-y-3">
                  {ticket.messages.map((message, index) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="space-y-4">
            {/* Admin Actions */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Admin Actions</h4>

              <Button
                onClick={handleResolve}
                disabled={isActionLoading || ticket.status === "resolved"}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Resolve Ticket
              </Button>

              <Button
                onClick={handleEscalate}
                disabled={isActionLoading || ticket.status === "escalated"}
                variant="outline"
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Escalate to Human
              </Button>

              <div className="pt-2 border-t border-border">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Change Priority
                </label>
                <Select
                  onValueChange={(value: any) => setNewPriority(value)}
                  defaultValue={ticket.priority}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handlePriorityChange}
                  disabled={isActionLoading || !newPriority}
                  variant="secondary"
                  className="w-full mt-2"
                  size="sm"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Update Priority
                </Button>
              </div>
            </div>

            {/* Add Internal Note */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Internal Note</h4>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add an internal note..."
                rows={4}
                className="resize-none"
              />
              <Button
                onClick={handleAddNote}
                disabled={isActionLoading || !internalNote.trim()}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isCustomer = message.sender === "customer";
  const isAI = message.sender === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isCustomer
            ? "bg-muted text-foreground"
            : isAI
            ? "bg-primary/10 text-foreground border border-primary/20"
            : "bg-purple-500/10 text-foreground border border-purple-500/20"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              isCustomer
                ? "bg-blue-500 text-white"
                : isAI
                ? "bg-green-500 text-white"
                : "bg-purple-500 text-white"
            }`}
          >
            {isCustomer ? "C" : isAI ? "AI" : "H"}
          </div>
          <span className="text-xs font-medium">
            {isCustomer ? "Customer" : isAI ? "AI Assistant" : "Human Agent"}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}
