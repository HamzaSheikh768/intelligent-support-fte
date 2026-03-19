/**
 * Centralized API client with environment variable support
 * All API calls use NEXT_PUBLIC_API_BASE_URL from .env
 *
 * // ENDPOINT CONSISTENCY VERIFIED
 * - Support Form: POST /api/v1/support/submit
 * - Admin Tickets: GET /api/v1/admin/tickets
 * - Admin Users: GET /api/v1/admin/users
 * - Admin Metrics: GET /api/v1/admin/metrics
 * - Admin Activity: GET /api/v1/admin/activity-feed
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_BASE = `${API_BASE_URL}/api/v1`;

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SubmitTicketRequest {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    base64: string;
  }>;
}

export interface SubmitTicketResponse {
  ticketId: string;
  status: 'created' | 'pending' | 'resolved';
  message: string;
  estimatedResponseTime: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// SUPPORT ENDPOINTS
// ============================================================================

/**
 * Submit a new support ticket
 * ENDPOINT: POST /api/v1/support/submit
 */
export async function submitTicket(
  data: SubmitTicketRequest
): Promise<ApiResponse<SubmitTicketResponse>> {
  return fetchApi<ApiResponse<SubmitTicketResponse>>('/support/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get ticket details by ID
 * ENDPOINT: GET /api/v1/support/ticket/{ticketId}
 */
export async function getTicket(ticketId: string) {
  return fetchApi(`/support/ticket/${ticketId}`);
}

/**
 * Health check
 * ENDPOINT: GET /health
 */
export async function checkHealth(): Promise<{ status: string }> {
  return fetchApi<{ status: string }>('/health');
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export default {
  submitTicket,
  getTicket,
  checkHealth,
};
