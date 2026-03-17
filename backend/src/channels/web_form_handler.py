"""
Web Form Channel Handler

Handles web form submissions via FastAPI endpoint.
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
import logging

from ..database.session import AsyncSessionLocal
from ..database.customers import get_or_create_customer
from ..database.tickets import create_ticket
from ..database.conversations import create_conversation
from ..database.messages import create_message
from ..utils.kafka_producer import FTEKafkaProducer, TOPICS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support-form"])


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
    attachments: Optional[List[dict]] = Field(default=None, description="File attachments (Base64)")

    @validator('category')
    def validate_category(cls, v):
        valid_categories = ['general', 'technical', 'billing', 'feedback', 'bug_report']
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {valid_categories}')
        return v

    @validator('priority')
    def validate_priority(cls, v):
        valid_priorities = ['low', 'medium', 'high']
        if v not in valid_priorities:
            raise ValueError(f'Priority must be one of: {valid_priorities}')
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
# Endpoints
# ============================================================================

@router.post("/submit", response_model=SupportFormResponse, status_code=status.HTTP_201_CREATED)
async def submit_support_form(
    submission: SupportFormSubmission,
    background_tasks: BackgroundTasks,
):
    """
    Submit a support form request.

    This endpoint:
    1. Validates the submission
    2. Creates or gets customer
    3. Creates conversation and ticket
    4. Publishes to Kafka for agent processing
    5. Returns confirmation to user

    Args:
        submission: Support form submission data
        background_tasks: FastAPI background tasks

    Returns:
        SupportFormResponse: Ticket ID and confirmation message
    """
    try:
        ticket_id = str(uuid4())

        async with AsyncSessionLocal() as session:
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

            # Create initial message
            await create_message(
                session=session,
                conversation_id=conversation.id,
                channel="web_form",
                direction="inbound",
                role="customer",
                content=submission.message,
                ticket_id=ticket.id,
            )

            # Handle attachments
            if submission.attachments:
                logger.info(f"Received {len(submission.attachments)} attachments")
                # TODO: Save attachments to S3/blob storage
                # TODO: Store file metadata in Message model

            # Publish to Kafka for agent processing
            kafka_message = {
                'channel': 'web_form',
                'channel_message_id': str(ticket.id),
                'customer_email': submission.email,
                'customer_name': submission.name,
                'subject': submission.subject,
                'content': submission.message,
                'category': submission.category,
                'priority': submission.priority,
                'received_at': datetime.utcnow().isoformat(),
                'metadata': {
                    'form_version': '1.0',
                    'attachments': submission.attachments,
                }
            }

            # Publish in background
            producer = FTEKafkaProducer()
            await producer.start()
            background_tasks.add_task(
                producer.publish,
                TOPICS['tickets_incoming'],
                kafka_message
            )

            logger.info(f"Web form submission received - ticket: {ticket.id}, email: {submission.email}")

            return SupportFormResponse(
                ticket_id=str(ticket.id),
                message="Thank you for contacting us! Our AI assistant will respond shortly.",
                estimated_response_time="Usually within 5 minutes"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing web form submission: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit support request"
        )


@router.get("/ticket/{ticket_id}", response_model=TicketStatus)
async def get_ticket_status(ticket_id: str):
    """
    Get status and conversation history for a ticket.

    Args:
        ticket_id: Ticket UUID

    Returns:
        TicketStatus: Ticket status and messages

    Raises:
        HTTPException: If ticket not found
    """
    from uuid import UUID
    from ..database.tickets import get_ticket_by_id
    from ..database.messages import get_messages_by_conversation

    try:
        ticket_uuid = UUID(ticket_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket ID format"
        )

    async with AsyncSessionLocal() as session:
        ticket = await get_ticket_by_id(session, ticket_uuid)

        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket {ticket_id} not found"
            )

        # Get messages for this ticket
        messages = []
        if ticket.conversation_id:
            messages = await get_messages_by_conversation(
                session,
                ticket.conversation_id,
                limit=50
            )

        return TicketStatus(
            ticket_id=str(ticket.id),
            status=ticket.status,
            created_at=ticket.created_at,
            last_updated=ticket.resolved_at,
            messages=[
                {
                    "id": str(msg.id),
                    "channel": msg.channel,
                    "direction": msg.direction,
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                }
                for msg in messages
            ]
        )
