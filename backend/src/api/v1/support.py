"""
Support API endpoints - Web form submission and ticket management
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from ...database.session import get_session
from ...database.tickets import create_ticket, get_ticket_by_id, get_or_create_customer, create_conversation
from ...schemas.support import SupportFormSubmission, SupportFormResponse, TicketStatus

router = APIRouter()


# ============================================================================
# Request/Response Schemas
# ============================================================================

class SupportFormSubmission(BaseModel):
    """Support form submission request schema."""
    
    name: str = Field(..., min_length=2, max_length=100, description="Customer name")
    email: EmailStr = Field(..., description="Customer email address")
    subject: str = Field(..., min_length=5, max_length=200, description="Subject")
    category: str = Field(..., description="Category: general, technical, billing, feedback, bug_report")
    priority: str = Field(default="medium", description="Priority: low, medium, high")
    message: str = Field(..., min_length=10, max_length=1000, description="Message content")
    attachments: Optional[List[dict]] = Field(default=None, description="File attachments")


class SupportFormResponse(BaseModel):
    """Support form submission response schema."""
    
    ticket_id: str = Field(..., description="Created ticket ID")
    message: str = Field(..., description="Confirmation message")
    estimated_response_time: str = Field(..., description="Expected response time")


class TicketStatus(BaseModel):
    """Ticket status response schema."""
    
    ticket_id: str
    status: str
    created_at: datetime
    last_updated: Optional[datetime]
    messages: Optional[List[dict]]


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/submit", response_model=SupportFormResponse, status_code=status.HTTP_201_CREATED)
async def submit_support_form(
    submission: SupportFormSubmission,
    session: AsyncSession = Depends(get_session),
):
    """
    Submit a support form request.
    
    This endpoint:
    1. Validates the submission
    2. Creates or gets customer
    3. Creates conversation and ticket
    4. Returns confirmation to user
    
    Args:
        submission: Support form submission data
        session: Database session
        
    Returns:
        SupportFormResponse: Ticket ID and confirmation message
    """
    try:
        # Get or create customer
        customer = await get_or_create_customer(
            session=session,
            email=submission.email,
            name=submission.name,
        )
        
        # Create conversation
        conversation = await create_conversation(
            session=session,
            customer_id=customer.id,
            initial_channel="web_form",
        )
        
        # Create ticket
        ticket = await create_ticket(
            session=session,
            customer_id=customer.id,
            conversation_id=conversation.id,
            source_channel="web_form",
            category=submission.category,
            priority=submission.priority,
        )
        
        # TODO: Publish to Kafka for agent processing
        # TODO: Create initial message record
        
        # Handle attachments (Base64 decoding would happen here in production)
        if submission.attachments:
            logger.info(f"Received {len(submission.attachments)} attachments")
            # TODO: Save attachments to S3/blob storage
            # TODO: Store file metadata in Message model
        
        return SupportFormResponse(
            ticket_id=str(ticket.id),
            message="Thank you for contacting us! Our AI assistant will respond shortly.",
            estimated_response_time="Usually within 5 minutes"
        )
        
    except Exception as e:
        logger.error(f"Error submitting support form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit support request"
        )


@router.get("/ticket/{ticket_id}", response_model=TicketStatus)
async def get_ticket_status(
    ticket_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Get status and conversation history for a ticket.

    Accepts both UUID format and TK-YYYY-NNNNNN format.
    Note: TK-YYYY-NNNNNN format is currently not supported as tickets use UUID.

    Args:
        ticket_id: Ticket UUID (string format)
        session: Database session

    Returns:
        TicketStatus: Ticket status and messages

    Raises:
        HTTPException: If ticket not found or invalid format
    """
    # Try to parse as UUID
    try:
        ticket_uuid = UUID(ticket_id)
    except ValueError:
        # If it looks like TK-YYYY-NNNNNN format, explain it's not supported
        if ticket_id.startswith("TK-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ticket ID format not supported. Please use the UUID from the submission response (e.g., '550e8400-e29b-41d4-a716-446655440000'). The TK-YYYY-NNNNNN format shown in the UI is for display purposes only."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket ID format. Must be a valid UUID."
        )

    ticket = await get_ticket_by_id(session, ticket_uuid)

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found"
        )

    # TODO: Get messages for this ticket

    return TicketStatus(
        ticket_id=str(ticket.id),
        status=ticket.status,
        created_at=ticket.created_at,
        last_updated=ticket.resolved_at,
        messages=[],
    )


# Add logger import
import logging
logger = logging.getLogger(__name__)
