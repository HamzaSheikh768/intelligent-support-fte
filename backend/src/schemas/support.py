"""
Support form schemas - Request/Response models
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================================================
# Support Form Schemas
# ============================================================================

class SupportFormSubmission(BaseModel):
    """Support form submission request schema."""

    name: str = Field(..., min_length=2, max_length=100, description="Customer name")
    email: EmailStr = Field(..., description="Customer email address")
    subject: str = Field(..., min_length=5, max_length=200, description="Subject")
    category: str = Field(..., description="Category: general, technical, billing, feedback, bug_report")
    priority: str = Field(default="medium", description="Priority: low, medium, high")
    message: str = Field(..., min_length=10, max_length=1000, description="Message content")
    attachments: Optional[List[dict]] = Field(default=None, description="File attachments (Base64)")

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is one of allowed values."""
        valid_categories = ['general', 'technical', 'billing', 'feedback', 'bug_report']
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {valid_categories}')
        return v

    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        """Validate priority is one of allowed values."""
        valid_priorities = ['low', 'medium', 'high']
        if v not in valid_priorities:
            raise ValueError(f'Priority must be one of: {valid_priorities}')
        return v

    @field_validator('attachments')
    @classmethod
    def validate_attachments(cls, v):
        """Validate attachments - max 3 files, max 5MB each."""
        if v is None:
            return v
        if len(v) > 3:
            raise ValueError('Maximum 3 files allowed')
        for att in v:
            if att.get('size', 0) > 5 * 1024 * 1024:  # 5MB
                raise ValueError('File exceeds 5MB limit')
        return v


class SupportFormResponse(BaseModel):
    """Support form submission response schema."""

    ticket_id: str = Field(..., description="Created ticket ID")
    message: str = Field(..., description="Confirmation message")
    estimated_response_time: str = Field(default="Usually within 5 minutes", description="Expected response time")


class TicketStatus(BaseModel):
    """Ticket status response schema."""

    ticket_id: str
    status: str
    created_at: datetime
    last_updated: Optional[datetime] = None
    messages: Optional[List[dict]] = None


# ============================================================================
# Customer Schemas
# ============================================================================

class CustomerCreate(BaseModel):
    """Customer creation schema."""

    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None


class CustomerResponse(BaseModel):
    """Customer response schema."""

    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    created_at: datetime
    conversations: Optional[List[dict]] = None


# ============================================================================
# Ticket Schemas
# ============================================================================

class TicketCreate(BaseModel):
    """Ticket creation schema."""

    customer_id: str
    issue: str
    priority: str = "medium"
    category: Optional[str] = None
    channel: str  # email, whatsapp, web_form


class TicketResponse(BaseModel):
    """Ticket response schema."""

    id: str
    customer_id: str
    conversation_id: Optional[str] = None
    source_channel: str
    category: Optional[str] = None
    priority: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None


class TicketUpdate(BaseModel):
    """Ticket update schema."""

    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None


# ============================================================================
# Conversation Schemas
# ============================================================================

class ConversationCreate(BaseModel):
    """Conversation creation schema."""

    customer_id: str
    initial_channel: str


class ConversationResponse(BaseModel):
    """Conversation response schema."""

    id: str
    customer_id: str
    initial_channel: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    status: str
    sentiment_score: Optional[float] = None
    resolution_type: Optional[str] = None
    messages: Optional[List[dict]] = None


# ============================================================================
# Message Schemas
# ============================================================================

class MessageCreate(BaseModel):
    """Message creation schema."""

    conversation_id: str
    channel: str
    direction: str  # inbound, outbound
    role: str  # customer, agent, system
    content: str


class MessageResponse(BaseModel):
    """Message response schema."""

    id: str
    conversation_id: str
    channel: str
    direction: str
    role: str
    content: str
    created_at: datetime
    delivery_status: str


# ============================================================================
# Knowledge Base Schemas
# ============================================================================

class KnowledgeSearchRequest(BaseModel):
    """Knowledge base search request schema."""

    query: str = Field(..., description="Search query")
    max_results: int = Field(default=5, description="Maximum results")
    category: Optional[str] = Field(default=None, description="Optional category filter")


class KnowledgeSearchResponse(BaseModel):
    """Knowledge base search response schema."""

    results: List[dict]
    total: int


class KnowledgeEntryCreate(BaseModel):
    """Knowledge base entry creation schema."""

    title: str
    content: str
    category: Optional[str] = None


# ============================================================================
# Escalation Schemas
# ============================================================================

class EscalationCreate(BaseModel):
    """Escalation creation schema."""

    ticket_id: str
    reason: str
    urgency: str = "normal"
    notes: Optional[str] = None


class EscalationResponse(BaseModel):
    """Escalation response schema."""

    escalation_id: str
    ticket_id: str
    status: str
    message: str
    estimated_response_time: str


class EscalationReason(BaseModel):
    """Escalation reason code schema."""

    code: str
    description: str
    auto_escalate: bool


# ============================================================================
# Agent Tool Input Schemas
# ============================================================================

class KnowledgeSearchInput(BaseModel):
    """Input schema for knowledge base search tool."""
    query: str = Field(..., description="Search query text")
    max_results: int = Field(default=5, description="Maximum number of results to return")
    category: Optional[str] = Field(default=None, description="Optional category filter")


class TicketInput(BaseModel):
    """Input schema for ticket creation tool."""
    customer_id: str = Field(..., description="Unique customer identifier")
    issue: str = Field(..., description="Issue description")
    priority: str = Field(default="medium", description="Priority level: low, medium, high")
    category: Optional[str] = Field(default=None, description="Issue category")
    channel: str = Field(..., description="Channel: email, whatsapp, web_form")


class EscalationInput(BaseModel):
    """Input schema for escalation tool."""
    ticket_id: str = Field(..., description="Ticket ID to escalate")
    reason: str = Field(..., description="Escalation reason code")
    urgency: str = Field(default="normal", description="Urgency: normal, high, urgent")


class ResponseInput(BaseModel):
    """Input schema for response tool."""
    ticket_id: str = Field(..., description="Ticket ID")
    message: str = Field(..., description="Response message content")
    channel: str = Field(..., description="Channel: email, whatsapp, web_form")


# ============================================================================
# Metrics Schemas
# ============================================================================

class MetricsSummary(BaseModel):
    """Metrics summary schema."""

    total_messages: int
    total_escalations: int
    escalation_rate: float
    avg_latency_ms: float
    period: str
    timestamp: datetime


class ChannelMetrics(BaseModel):
    """Channel-specific metrics schema."""

    channel: str
    total_conversations: int
    avg_sentiment: float
    total_escalations: int
