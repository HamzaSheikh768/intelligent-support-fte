import { z } from "zod";

// ============================================================================
// ZOD SCHEMAS FOR FORM VALIDATION
// ============================================================================

export const supportFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  category: z
    .enum(["general", "technical", "billing", "feedback", "bug_report"], {
      message: "Please select a valid category",
    }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
  priority: z
    .enum(["low", "medium", "high"], {
      message: "Please select a valid priority",
    })
    .default("medium"),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        base64: z.string(),
      })
    )
    .max(3, { message: "Maximum 3 attachments allowed" })
    .optional(),
});

export type SupportFormData = z.infer<typeof supportFormSchema>;

// ============================================================================
// ATTACHMENT TYPE
// ============================================================================

export interface Attachment {
  name: string;
  size: number;
  type: string;
  base64: string;
  preview?: string;
}

// ============================================================================
// TICKET RESPONSE TYPE
// ============================================================================

export interface TicketResponse {
  ticketId: string;
  status: "created" | "pending" | "resolved";
  message: string;
  estimatedResponseTime: string;
}

// ============================================================================
// CHANNEL TYPES
// ============================================================================

export type ChannelType = "whatsapp" | "gmail" | "webform";

export interface ChannelConfig {
  id: ChannelType;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
}

export const CHANNEL_CONFIGS: Record<ChannelType, ChannelConfig> = {
  whatsapp: {
    id: "whatsapp",
    label: "Chat on WhatsApp",
    icon: "MessageCircle",
    color: "#25D366",
    gradient: "from-green-500 to-emerald-600",
    description: "Get instant responses via WhatsApp",
  },
  gmail: {
    id: "gmail",
    label: "Email Us",
    icon: "Mail",
    color: "#EA4335",
    gradient: "from-red-500 to-rose-600",
    description: "Send us a detailed email",
  },
  webform: {
    id: "webform",
    label: "Submit Support Form",
    icon: "FileText",
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-600",
    description: "Fill out our comprehensive support form",
  },
};

// ============================================================================
// CATEGORY OPTIONS
// ============================================================================

export const CATEGORY_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Payments" },
  { value: "feedback", label: "Feature Request / Feedback" },
  { value: "bug_report", label: "Bug Report" },
];

// ============================================================================
// PRIORITY OPTIONS
// ============================================================================

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
