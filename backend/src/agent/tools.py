"""
Function Tools for Customer Success FTE Agent

This module defines all the tools the agent can use to interact with the system.
"""

from agents import function_tool
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import json

from ..core.config import settings
from ..database.session import AsyncSessionLocal
from ..database.models import Customer, Ticket, Conversation, Message, KnowledgeBase
from ..database.customers import (
    get_or_create_customer,
    get_customer_by_id,
    get_customer_history,
)
from ..database.tickets import (
    create_ticket,
    get_ticket_by_id,
    update_ticket_status,
)
from ..database.conversations import (
    create_conversation,
    get_conversation_by_id,
    get_or_create_active_conversation,
    get_conversation_messages,
)
from ..database.messages import create_message
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


# ============================================================================
# Input Schemas
# ============================================================================

class KnowledgeSearchInput(BaseModel):
    """Input schema for knowledge base search."""
    query: str = Field(..., description="Search query text")
    max_results: int = Field(default=5, description="Maximum number of results to return")
    category: Optional[str] = Field(default=None, description="Optional category filter")


class TicketInput(BaseModel):
    """Input schema for ticket creation."""
    customer_id: str = Field(..., description="Unique customer identifier")
    issue: str = Field(..., description="Issue description")
    priority: str = Field(default="medium", description="Priority level: low, medium, high")
    category: Optional[str] = Field(default=None, description="Issue category")
    channel: str = Field(..., description="Channel: email, whatsapp, web_form")


class EscalationInput(BaseModel):
    """Input schema for escalation."""
    ticket_id: str = Field(..., description="Ticket ID to escalate")
    reason: str = Field(..., description="Escalation reason code")
    urgency: str = Field(default="normal", description="Urgency: normal, high, urgent")


class ResponseInput(BaseModel):
    """Input schema for sending response."""
    ticket_id: str = Field(..., description="Ticket ID")
    message: str = Field(..., description="Response message content")
    channel: str = Field(..., description="Channel: email, whatsapp, web_form")


# ============================================================================
# Tool: search_knowledge_base
# ============================================================================

@function_tool
async def search_knowledge_base(input: KnowledgeSearchInput) -> str:
    """
    Search product documentation for relevant information.

    Use this when the customer asks questions about product features,
    how to use something, or needs technical information.

    Args:
        input: Search parameters including query and optional filters

    Returns:
        Formatted search results with relevance scores
    """
    try:
        async with AsyncSessionLocal() as session:
            # For now, use simple text search
            # TODO: Implement vector search with pgvector when available
            stmt = select(KnowledgeBase).where(
                KnowledgeBase.content.ilike(f"%{input.query}%")
            ).limit(input.max_results)

            if input.category:
                stmt = stmt.where(KnowledgeBase.category == input.category)

            results = await session.execute(stmt)
            kb_entries = results.scalars().all()

            if not kb_entries:
                return "No relevant documentation found. Consider escalating to human support."

            # Format results
            formatted = []
            for entry in kb_entries:
                content_preview = entry.content[:500] + "..." if len(entry.content) > 500 else entry.content
                formatted.append(f"**{entry.title}**\n{content_preview}")

            return "\n\n---\n\n".join(formatted)

    except Exception as e:
        logger.error(f"Knowledge base search failed: {e}")
        return "Knowledge base temporarily unavailable. Please try again or escalate."


# ============================================================================
# Tool: create_ticket
# ============================================================================

@function_tool
async def create_ticket(input: TicketInput) -> str:
    """
    Create a support ticket for tracking.

    ALWAYS create a ticket at the start of every conversation.
    Include the source channel for proper tracking.

    Args:
        input: Ticket parameters including customer_id, issue, priority, channel

    Returns:
        ticket_id string
    """
    try:
        async with AsyncSessionLocal() as session:
            # Get or create conversation
            conversation = await get_or_create_active_conversation(
                session,
                input.customer_id,
                input.channel,
            )

            # Create ticket
            ticket = await create_ticket(
                session,
                input.customer_id,
                conversation.id,
                input.channel,
                input.category,
                input.priority,
            )

            logger.info(f"Created ticket {ticket.id} for customer {input.customer_id}")
            return f"Ticket created: {ticket.id}"

    except Exception as e:
        logger.error(f"Ticket creation failed: {e}")
        return f"Failed to create ticket: {str(e)}"


# ============================================================================
# Tool: get_customer_history
# ============================================================================

@function_tool
async def get_customer_history(customer_id: str) -> str:
    """
    Get customer's complete interaction history across ALL channels.

    Use this to understand context from previous conversations,
    even if they happened on a different channel.

    Args:
        customer_id: Unique customer identifier

    Returns:
        Customer's history with last 20 messages
    """
    try:
        from uuid import UUID
        customer_uuid = UUID(customer_id)
        
        async with AsyncSessionLocal() as session:
            history = await get_customer_history(session, customer_uuid, limit=20)

            if not history:
                return "No previous conversation history found for this customer."

            # Format history
            formatted = []
            for msg in history:
                formatted.append(
                    f"[{msg['created_at']}] {msg['channel']} ({msg['role']}): {msg['content'][:200]}"
                )

            return "\n".join(formatted)

    except Exception as e:
        logger.error(f"Failed to get customer history: {e}")
        return "Unable to retrieve customer history."


# ============================================================================
# Tool: escalate_to_human
# ============================================================================

@function_tool
async def escalate_to_human(input: EscalationInput) -> str:
    """
    Escalate conversation to human support.

    Use this when:
    - Customer asks about pricing or refunds
    - Customer sentiment is negative
    - You cannot find relevant information
    - Customer explicitly requests human help

    Args:
        input: Escalation parameters including ticket_id, reason, urgency

    Returns:
        Escalation confirmation with reference ID
    """
    try:
        from uuid import UUID
        ticket_uuid = UUID(input.ticket_id)
        
        async with AsyncSessionLocal() as session:
            # Update ticket status
            ticket = await update_ticket_status(
                session,
                ticket_uuid,
                "escalated",
                f"Escalated: {input.reason} (urgency: {input.urgency})"
            )

            if ticket:
                logger.info(f"Escalated ticket {ticket.id} - reason: {input.reason}")

                # TODO: Publish to Kafka for human agents
                # await publish_to_kafka("escalations", {...})

                return f"Escalated to human support. Reference: {ticket.id}"
            else:
                return f"Ticket {input.ticket_id} not found."

    except Exception as e:
        logger.error(f"Escalation failed: {e}")
        return f"Failed to escalate: {str(e)}"


# ============================================================================
# Tool: send_response
# ============================================================================

@function_tool
async def send_response(input: ResponseInput) -> str:
    """
    Send response to customer via their preferred channel.

    The response will be automatically formatted for the channel:
    - Email: Formal with greeting/signature
    - WhatsApp: Concise and conversational
    - Web: Semi-formal

    Args:
        input: Response parameters including ticket_id, message, channel

    Returns:
        Delivery status confirmation
    """
    try:
        from uuid import UUID
        ticket_uuid = UUID(input.ticket_id)
        
        async with AsyncSessionLocal() as session:
            # Get ticket to find customer and conversation
            ticket = await get_ticket_by_id(session, ticket_uuid)

            if not ticket:
                return f"Ticket {input.ticket_id} not found."

            # Get customer
            customer = await get_customer_by_id(session, ticket.customer_id)
            customer_name = customer.name if customer else None

            # Get conversation
            conversation = await get_conversation_by_id(session, ticket.conversation_id)

            # Format response for channel
            from .formatters import format_for_channel
            formatted_message = format_for_channel(
                input.message,
                input.channel,
                input.ticket_id,
                customer_name,
            )

            # Create message record in database
            message = await create_message(
                session,
                conversation.id,
                input.channel,
                "outbound",
                "agent",
                formatted_message,
                ticket.id,
                delivery_status="sent",
            )

            # TODO: Send via actual channel (Gmail API, Twilio, etc.)
            logger.info(f"Sending {input.channel} response for ticket {input.ticket_id}")

            return f"Response sent via {input.channel}: delivered"

    except Exception as e:
        logger.error(f"Failed to send response: {e}")
        return f"Failed to send response: {str(e)}"


# ============================================================================
# Tool: analyze_sentiment (Helper)
# ============================================================================

@function_tool
async def analyze_sentiment(text: str) -> str:
    """
    Analyze the sentiment of a customer message.

    Use this to detect if a customer is frustrated or angry.

    Args:
        text: Customer message text

    Returns:
        Sentiment score (-1.0 to 1.0) and interpretation
    """
    try:
        # Simple keyword-based sentiment analysis
        # TODO: Replace with ML-based sentiment analysis
        
        negative_words = [
            "angry", "frustrated", "terrible", "awful", "hate", "worst",
            "disappointed", "useless", "broken", "failed", "error", "problem",
            "issue", "wrong", "bad", "poor", "horrible", "ridiculous"
        ]
        
        positive_words = [
            "great", "awesome", "excellent", "good", "helpful", "love",
            "thank", "appreciate", "perfect", "wonderful", "amazing"
        ]
        
        text_lower = text.lower()
        
        negative_count = sum(1 for word in negative_words if word in text_lower)
        positive_count = sum(1 for word in positive_words if word in text_lower)
        
        # Calculate score
        total = negative_count + positive_count
        if total == 0:
            score = 0.0
        else:
            score = (positive_count - negative_count) / max(total, 1)
        
        # Interpret score
        if score < -0.5:
            interpretation = "Very negative - consider escalation"
        elif score < 0:
            interpretation = "Somewhat negative - show empathy"
        elif score > 0.5:
            interpretation = "Very positive - customer is happy"
        elif score > 0:
            interpretation = "Somewhat positive"
        else:
            interpretation = "Neutral"
        
        return f"Sentiment score: {score:.2f} ({interpretation})"

    except Exception as e:
        logger.error(f"Sentiment analysis failed: {e}")
        return "Sentiment analysis unavailable."
