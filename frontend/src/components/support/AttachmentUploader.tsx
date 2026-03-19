"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, File, Image, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Attachment } from "@/types/support";

interface AttachmentUploaderProps {
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function AttachmentUploader({
  onAttachmentsChange,
  maxFiles = 3,
  maxSizeMB = 5,
}: AttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return Image;
    } else if (type.startsWith("text/") || type.includes("pdf")) {
      return FileText;
    }
    return File;
  };

  // Handle file validation and conversion
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - attachments.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    const newAttachments: Attachment[] = [];

    for (const file of filesToProcess) {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const attachment: Attachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          base64,
          preview: file.type.startsWith("image/") ? base64 : undefined,
        };
        newAttachments.push(attachment);
      } catch (error) {
        console.error("Error converting file:", error);
      }
    }

    if (newAttachments.length > 0) {
      const updated = [...attachments, ...newAttachments];
      setAttachments(updated);
      onAttachmentsChange(updated);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFiles(e.dataTransfer.files);
      }
    },
    [attachments]
  );

  // Handle file input change
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
    }
    // Reset input value to allow same file selection
    e.target.value = "";
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    onAttachmentsChange(updated);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center w-full h-48
            border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
            ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-accent/5"
            }
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            disabled={attachments.length >= maxFiles}
          />

          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
            >
              <Upload className="w-6 h-6 text-primary" />
            </motion.div>
            <p className="mb-2 text-sm text-foreground font-medium">
              <span className="font-semibold">Click to upload</span> or drag
              and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {maxFiles} files max (max {maxSizeMB}MB each)
            </p>
          </div>
        </label>
      </motion.div>

      {/* Attachment Previews */}
      <AnimatePresence mode="popLayout">
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Attachments
              </label>
              <span className="text-xs text-muted-foreground">
                {attachments.length}/{maxFiles} files
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((attachment, index) => {
                const Icon = getFileIcon(attachment.type);

                return (
                  <motion.div
                    key={`${attachment.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative group"
                  >
                    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                      {/* Preview or Icon */}
                      {attachment.preview ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={attachment.preview}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
