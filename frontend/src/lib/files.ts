/**
 * File upload helper functions
 */

import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './validations';

/**
 * Convert File to Base64 string
 * 
 * @param file - File to convert
 * @returns Promise with Base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file for upload
 * 
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the 5MB limit`,
    };
  }
  
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" not allowed. Allowed: images, PDFs, text files`,
    };
  }
  
  return { valid: true };
}

/**
 * Check if file is an image
 * 
 * @param file - File to check
 * @returns True if file is an image
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get file icon based on type
 * 
 * @param fileType - MIME type of file
 * @returns Icon name or component
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType === 'application/pdf') {
    return 'file-text';
  } else {
    return 'file';
  }
}
