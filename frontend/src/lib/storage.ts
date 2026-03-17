/**
 * LocalStorage helper functions for form draft management
 */

const STORAGE_KEY = 'support_form_draft';
const STORAGE_EXPIRY_DAYS = 7;

export interface DraftData {
  formData: Partial<{
    name: string;
    email: string;
    subject: string;
    category: string;
    priority: string;
    message: string;
  }>;
  savedAt: string;
  expiresAt: string;
}

/**
 * Save form draft to localStorage
 * 
 * @param data - Partial form data to save
 */
export function saveDraft(data: Partial<DraftData['formData']>): void {
  try {
    const draft: DraftData = {
      formData: data,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
    
    // Don't save files to localStorage (too large)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn('Failed to save draft:', error);
  }
}

/**
 * Load form draft from localStorage
 * 
 * @returns Draft data or null if not found/expired
 */
export function loadDraft(): DraftData['formData'] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const draft: DraftData = JSON.parse(stored);
    const expiresAt = new Date(draft.expiresAt);

    // Check if draft has expired
    if (expiresAt < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return draft.formData;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear form draft from localStorage
 */
export function clearDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if draft exists and is valid
 * 
 * @returns True if draft exists and is not expired
 */
export function hasValidDraft(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const draft: DraftData = JSON.parse(stored);
    const expiresAt = new Date(draft.expiresAt);

    return expiresAt > new Date();
  } catch (error) {
    return false;
  }
}

/**
 * Get draft save time for display
 * 
 * @returns Formatted save time or null
 */
export function getDraftSaveTime(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const draft: DraftData = JSON.parse(stored);
    const savedAt = new Date(draft.savedAt);

    return savedAt.toLocaleString();
  } catch (error) {
    return null;
  }
}
