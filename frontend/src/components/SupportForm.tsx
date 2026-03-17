"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Upload, File, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================================================
// Zod Schema - Validation Rules
// ============================================================================

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing Inquiry" },
  { value: "feedback", label: "Feedback" },
  { value: "bug_report", label: "Bug Report" },
] as const;

const PRIORITIES = [
  { value: "low", label: "Low - Not urgent" },
  { value: "medium", label: "Medium - Need help soon" },
  { value: "high", label: "High - Urgent issue" },
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
];

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Please enter your name (at least 2 characters)" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s\-']+$/, {
      message: "Name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address (e.g., john@example.com)" }),
  subject: z
    .string()
    .min(5, { message: "Please enter a subject (at least 5 characters)" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  category: z.enum(
    ["general", "technical", "billing", "feedback", "bug_report"] as const,
    { message: "Please select a category" }
  ),
  priority: z.enum(["low", "medium", "high"] as const).default("medium"),
  message: z
    .string()
    .min(10, { message: "Please describe your issue in more detail (minimum 10 characters)" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileType: z.string(),
        preview: z.string().optional(),
      })
    )
    .max(MAX_FILES, { message: `Maximum ${MAX_FILES} files allowed` })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// Types
// ============================================================================

interface Attachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  preview?: string;
}

interface SupportFormProps {
  apiUrl?: string;
  position?: "bottom-right" | "bottom-left" | "inline";
  accentColor?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onSubmit?: (ticketId: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "support_form_draft";
const STORAGE_EXPIRY_DAYS = 7;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert file to base64 for preview
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

/**
 * Save form draft to localStorage
 */
const saveDraft = (data: Partial<FormValues>) => {
  try {
    const draft = {
      formData: data,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    };
    // Don't save files to localStorage (too large)
    const { attachments, ...dataWithoutFiles } = draft.formData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, formData: dataWithoutFiles }));
  } catch (error) {
    console.warn("Failed to save draft:", error);
  }
};

/**
 * Load form draft from localStorage
 */
const loadDraft = (): Partial<FormValues> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const draft = JSON.parse(stored);
    const expiresAt = new Date(draft.expiresAt);

    if (expiresAt < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return draft.formData;
  } catch (error) {
    console.warn("Failed to load draft:", error);
    return null;
  }
};

/**
 * Clear form draft from localStorage
 */
const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ============================================================================
// Main Component
// ============================================================================

export function SupportForm({
  apiUrl = "/api",
  position = "bottom-right",
  accentColor = "#2563eb",
  onOpen,
  onClose,
  onSubmit,
}: SupportFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Initialize form with React Hook Form + Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      category: "general",
      priority: "medium",
      message: "",
      attachments: [],
    },
    mode: "onBlur", // Real-time validation on blur
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setHasDraft(true);
      form.reset({
        ...form.formState.defaultValues,
        ...draft,
        attachments: [], // Don't restore file attachments
      });
    }
  }, [form]);

  // Auto-save draft on form changes (debounced)
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        saveDraft(value as Partial<FormValues>);
        setHasDraft(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle opening the form
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  // Handle closing the form
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsSuccess(false);
    setTicketId(null);
    onClose?.();
  }, [onClose]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      if (attachments.length + files.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      const newAttachments: Attachment[] = [];

      for (const file of files) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File "${file.name}" exceeds the 5MB limit`);
          continue;
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          toast.error(
            `File type "${file.type}" not allowed. Allowed: images, PDFs, text files`
          );
          continue;
        }

        // Generate preview for images
        let preview: string | undefined;
        if (file.type.startsWith("image/")) {
          try {
            preview = await fileToBase64(file);
          } catch (error) {
            console.warn("Failed to generate preview:", error);
          }
        }

        // Store file metadata instead of File object
        newAttachments.push({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          preview,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
      form.setValue("attachments", [...attachments, ...newAttachments]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [attachments, form]
  );

  // Handle file removal
  const handleRemoveFile = useCallback(
    (index: number) => {
      setAttachments((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        form.setValue("attachments", updated as any);
        return updated;
      });
    },
    [form]
  );

  // Handle form submission
  const onSubmitForm = useCallback(
    async (data: FormValues) => {
      if (isSubmitting) return; // Prevent double submission

      setIsSubmitting(true);

      try {
        // Prepare submission data
        const submissionData = {
          name: data.name,
          email: data.email,
          subject: data.subject,
          category: data.category,
          priority: data.priority,
          message: data.message,
          attachments: attachments.map((att) => ({
            fileName: att.fileName,
            size: att.fileSize,
            type: att.fileType,
            preview: att.preview,
          })),
        };

        // Mock API call (replace with actual fetch in production)
        // const response = await fetch(`${apiUrl}/v1/support/submit`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(submissionData),
        // });
        // const result = await response.json();

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock successful response
        const mockTicketId = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setTicketId(mockTicketId);
        setIsSuccess(true);
        clearDraft();

        toast.success("Support request submitted successfully!");
        onSubmit?.(mockTicketId);

        // Reset form
        form.reset(form.formState.defaultValues);
        setAttachments([]);
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(
          "We couldn't submit your request. Please check your connection and try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, attachments, apiUrl, form, onSubmit]
  );

  // Handle dialog close (only if not submitting)
  const handleDialogOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      setIsOpen(open);
      if (!open) {
        handleClose();
      }
    }
  };

  return (
    <>
      {/* Inline Form - Always Visible */}
      {position === "inline" ? (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {isSuccess && ticketId ? (
            /* Success State for Inline Form */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-3">Thank You!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your support request has been submitted successfully. Our AI assistant will respond
                to your email within 5 minutes.
              </p>

              <div className="bg-muted rounded-lg p-5 mb-6 max-w-sm mx-auto">
                <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
                <p className="text-2xl font-mono font-bold text-primary">{ticketId}</p>
              </div>

              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                For urgent issues, responses are prioritized automatically. You can reference your
                ticket ID in future communications.
              </p>

              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setTicketId(null);
                  form.reset(form.formState.defaultValues);
                  setAttachments([]);
                }}
                className="h-12 px-8"
                variant="outline"
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            /* Form for Inline Mode */
            <div className="w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Contact Support</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and our AI-powered support team will get back to you
                  shortly.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-5">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isSubmitting}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={isSubmitting}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Field */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your issue"
                        {...field}
                        disabled={isSubmitting}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Field */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isSubmitting}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority Field */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isSubmitting}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map((pri) => (
                            <SelectItem key={pri.value} value={pri.value}>
                              {pri.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Message Field */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How can we help? *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Please describe your issue or question in detail..."
                          rows={6}
                          {...field}
                          disabled={isSubmitting}
                          className="pr-16"
                          aria-required="true"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                          <span
                            className={
                              field.value.length > 900
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }
                          >
                            {field.value.length}/1000
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments Field */}
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachments (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {/* Upload Area */}
                        <div
                          className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20"
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              fileInputRef.current?.click();
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label="Upload files"
                        >
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Images, PDFs, or text files (max 3 files, 5MB each)
                          </p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ALLOWED_FILE_TYPES.join(",")}
                          onChange={handleFileSelect}
                          className="hidden"
                          aria-hidden="true"
                        />

                        {/* File Previews */}
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((att, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                              >
                                {att.preview ? (
                                  <img
                                    src={att.preview}
                                    alt={att.fileName}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <File className="w-12 h-12 text-muted-foreground" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {att.fileName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(att.fileSize)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveFile(index)}
                                  disabled={isSubmitting}
                                  aria-label={`Remove ${att.fileName}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
                style={{ backgroundColor: accentColor }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit Support Request"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By submitting, you agree to our{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </form>
          </Form>
            </div>
          )}
        </div>
      ) : (
        /* Floating Button + Modal - Original Behavior */
        <>
          <Button
            className={`fixed bottom-6 ${position === "bottom-right" ? "right-6" : "left-6"} z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}
            style={{ backgroundColor: accentColor }}
            onClick={handleOpen}
            aria-label="Open support form"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Button>

          <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogContent
              className={`sm:max-w-[600px]`}
              aria-describedby="support-form-description"
            >
              {!isSuccess && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Contact Support</DialogTitle>
                    <DialogDescription id="support-form-description">
                      Fill out the form below and our AI-powered support team will get back to you
                      shortly.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-5">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            disabled={isSubmitting}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            disabled={isSubmitting}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject Field */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of your issue"
                            {...field}
                            disabled={isSubmitting}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category and Priority Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Field */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger disabled={isSubmitting}>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority Field */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger disabled={isSubmitting}>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIORITIES.map((pri) => (
                                <SelectItem key={pri.value} value={pri.value}>
                                  {pri.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Message Field */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How can we help? *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Please describe your issue or question in detail..."
                              rows={6}
                              {...field}
                              disabled={isSubmitting}
                              className="pr-16"
                              aria-required="true"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                              <span
                                className={
                                  field.value.length > 900
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }
                              >
                                {field.value.length}/1000
                              </span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Attachments Field */}
                  <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attachments (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {/* Upload Area */}
                            <div
                              className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20"
                              onClick={() => fileInputRef.current?.click()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  fileInputRef.current?.click();
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label="Upload files"
                            >
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Images, PDFs, or text files (max 3 files, 5MB each)
                              </p>
                            </div>

                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept={ALLOWED_FILE_TYPES.join(",")}
                              onChange={handleFileSelect}
                              className="hidden"
                              aria-hidden="true"
                            />

                            {/* File Previews */}
                            {attachments.length > 0 && (
                              <div className="space-y-2">
                                {attachments.map((att, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                                  >
                                    {att.preview ? (
                                      <img
                                        src={att.preview}
                                        alt={att.file.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <File className="w-12 h-12 text-muted-foreground" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {att.file.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(att.file.size)}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveFile(index)}
                                      disabled={isSubmitting}
                                      aria-label={`Remove ${att.file.name}`}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isSubmitting}
                    style={{ backgroundColor: accentColor }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Support Request"
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, you agree to our{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </Form>
                </>
              )}

              {/* Success State in Modal */}
              {isSuccess && ticketId && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>

                  <h2 className="text-3xl font-bold text-foreground mb-3">Thank You!</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your support request has been submitted successfully. Our AI assistant will respond
                    to your email within 5 minutes.
                  </p>

                  <div className="bg-muted rounded-lg p-5 mb-6 max-w-sm mx-auto">
                    <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
                    <p className="text-2xl font-mono font-bold text-primary">{ticketId}</p>
                  </div>

                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                    For urgent issues, responses are prioritized automatically. You can reference your
                    ticket ID in future communications.
                  </p>

                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setTicketId(null);
                      handleClose();
                    }}
                    className="h-12 px-8"
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
          </>
        )}
    </>
  );
}

export default SupportForm;
