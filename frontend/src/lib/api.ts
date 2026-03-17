/**
 * API client for Customer Success FTE backend
 * 
 * Provides typed API methods for interacting with the support form backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SupportFormSubmission {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority?: string;
  message: string;
  attachments?: Array<{
    filename: string;
    size: number;
    type: string;
    data: string;
  }>;
}

export interface SupportFormResponse {
  ticket_id: string;
  message: string;
  estimated_response_time: string;
}

export interface TicketStatus {
  ticket_id: string;
  status: string;
  created_at: string;
  last_updated: string | null;
  messages: Array<{
    channel: string;
    direction: string;
    role: string;
    content: string;
    created_at: string;
  }> | null;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

/**
 * Submit support form to backend API
 * 
 * @param data - Form submission data
 * @returns Promise with ticket ID and confirmation message
 * @throws ApiError if submission fails
 */
export async function submitSupportForm(
  data: SupportFormSubmission
): Promise<SupportFormResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/support/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        detail: errorData.detail || 'Failed to submit support request',
        status_code: response.status,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    if ((error as ApiError).detail) {
      throw error;
    }
    // Network error or other exception
    throw {
      detail: 'Network error. Please check your connection and try again.',
    } as ApiError;
  }
}

/**
 * Get ticket status by ID
 * 
 * @param ticketId - Ticket UUID
 * @returns Promise with ticket status and messages
 * @throws ApiError if ticket not found or request fails
 */
export async function getTicketStatus(ticketId: string): Promise<TicketStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/support/ticket/${ticketId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        detail: errorData.detail || 'Failed to get ticket status',
        status_code: response.status,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    if ((error as ApiError).detail) {
      throw error;
    }
    throw {
      detail: 'Network error. Please check your connection and try again.',
    } as ApiError;
  }
}

/**
 * Health check endpoint
 * 
 * @returns Promise with health status
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw {
        detail: 'Health check failed',
        status_code: response.status,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    throw {
      detail: 'Backend API is not reachable',
    } as ApiError;
  }
}
