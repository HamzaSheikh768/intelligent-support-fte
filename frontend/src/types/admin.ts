import { z } from "zod";

// ============================================================================
// TICKET STATUS & PRIORITY ENUMS
// ============================================================================

export type TicketStatus = "open" | "resolved" | "escalated";
export type TicketPriority = "low" | "medium" | "high";
export type ChannelType = "whatsapp" | "gmail" | "webform";
export type SentimentScore = "positive" | "neutral" | "negative";

// ============================================================================
// TICKET INTERFACE
// ============================================================================

export interface Ticket {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  channel: ChannelType;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: SentimentScore;
  sentimentScore: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  tags: string[];
  messages: Message[];
}

// ============================================================================
// MESSAGE INTERFACE
// ============================================================================

export interface Message {
  id: string;
  ticketId: string;
  sender: "customer" | "ai" | "human";
  content: string;
  timestamp: string;
  channel: ChannelType;
}

// ============================================================================
// ACTIVITY FEED ITEM
// ============================================================================

export interface ActivityFeedItem {
  id: string;
  ticketId: string;
  customerName: string;
  channel: ChannelType;
  messageSnippet: string;
  sentiment: SentimentScore;
  sentimentScore: number;
  timestamp: string;
  type: "new_ticket" | "new_message" | "ai_response" | "status_change";
}

// ============================================================================
// METRICS INTERFACE
// ============================================================================

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  avgResponseTime: number; // in seconds
  avgResolutionTime: number; // in minutes
  sentimentScore: number; // 0-1
  sentimentLabel: "positive" | "neutral" | "negative";
  ticketsByChannel: {
    whatsapp: number;
    gmail: number;
    webform: number;
  };
  ticketsByStatus: {
    open: number;
    resolved: number;
    escalated: number;
  };
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  dailyTickets: DailyTicket[];
}

export interface DailyTicket {
  date: string;
  count: number;
}

// ============================================================================
// USER INTERFACE
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
  avatar?: string;
  createdAt: string;
}

// ============================================================================
// FILTER STATE
// ============================================================================

export interface FilterState {
  userId?: string;
  channel?: ChannelType;
  status?: TicketStatus;
  priority?: TicketPriority;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const ticketFilterSchema = z.object({
  userId: z.string().optional(),
  channel: z.enum(["whatsapp", "gmail", "webform"]).optional(),
  status: z.enum(["open", "resolved", "escalated"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["open", "resolved", "escalated"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().optional(),
  internalNote: z.string().optional(),
});

export type TicketFilterValues = z.infer<typeof ticketFilterSchema>;
export type UpdateTicketValues = z.infer<typeof updateTicketSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getStatusColor = (status: TicketStatus): string => {
  switch (status) {
    case "open":
      return "bg-blue-500";
    case "resolved":
      return "bg-green-500";
    case "escalated":
      return "bg-red-500";
  }
};

export const getPriorityColor = (priority: TicketPriority): string => {
  switch (priority) {
    case "low":
      return "bg-gray-500";
    case "medium":
      return "bg-yellow-500";
    case "high":
      return "bg-red-500";
  }
};

export const getSentimentColor = (sentiment: SentimentScore): string => {
  switch (sentiment) {
    case "positive":
      return "text-green-500";
    case "neutral":
      return "text-yellow-500";
    case "negative":
      return "text-red-500";
  }
};

export const getChannelColor = (channel: ChannelType): string => {
  switch (channel) {
    case "whatsapp":
      return "text-green-500";
    case "gmail":
      return "text-red-500";
    case "webform":
      return "text-purple-500";
  }
};
