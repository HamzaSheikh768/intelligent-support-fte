/**
 * Form validation schemas using Zod
 */

import { z } from 'zod';

export const CATEGORIES = [
  { value: 'general', label: 'General Question' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Inquiry' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug_report', label: 'Bug Report' },
] as const;

export const PRIORITIES = [
  { value: 'low', label: 'Low - Not urgent' },
  { value: 'medium', label: 'Medium - Need help soon' },
  { value: 'high', label: 'High - Urgent issue' },
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES = 3;

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
];

/**
 * Support form validation schema
 */
export const supportFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Please enter your name (at least 2 characters)' })
    .max(100, { message: 'Name must be less than 100 characters' })
    .regex(/^[a-zA-Z\s\-']+$/, {
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address (e.g., john@example.com)' }),
  subject: z
    .string()
    .min(5, { message: 'Please enter a subject (at least 5 characters)' })
    .max(200, { message: 'Subject must be less than 200 characters' }),
  category: z.enum(
    ['general', 'technical', 'billing', 'feedback', 'bug_report'] as const,
    { message: 'Please select a category' }
  ),
  priority: z.enum(['low', 'medium', 'high'] as const).default('medium'),
  message: z
    .string()
    .min(10, { message: 'Please describe your issue in more detail (minimum 10 characters)' })
    .max(1000, { message: 'Message must be less than 1000 characters' }),
  attachments: z
    .array(
      z.object({
        file: z.instanceof(File),
        preview: z.string().optional(),
      })
    )
    .max(MAX_FILES, { message: `Maximum ${MAX_FILES} files allowed` })
    .optional(),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;

/**
 * Custom error messages for Zod validation
 */
export const errorMessages: Record<string, string> = {
  name_min: 'Please enter your name (at least 2 characters)',
  name_max: 'Name must be less than 100 characters',
  name_pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  email_invalid: 'Please enter a valid email address (e.g., john@example.com)',
  subject_min: 'Please enter a subject (at least 5 characters)',
  subject_max: 'Subject must be less than 200 characters',
  category_required: 'Please select a category',
  message_min: 'Please describe your issue in more detail (minimum 10 characters)',
  message_max: 'Message must be less than 1000 characters',
  files_max: `Maximum ${MAX_FILES} files allowed`,
  file_size: 'File exceeds 5MB limit',
  file_type: 'File type not allowed. Allowed: images, PDFs, text files',
};
