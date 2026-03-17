"""
Database helper functions for conversations
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from .models import Conversation, Customer
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


async def create_conversation(
    session: AsyncSession,
    customer_id: UUID,
    initial_channel: str,
) -> Conversation:
    """
    Create a new conversation.

    Args:
        session: Database session
        customer_id: Customer UUID
        initial_channel: Initial channel (email, whatsapp, web_form)

    Returns:
        Conversation: Created conversation
    """
    conversation = Conversation(
        customer_id=customer_id,
        initial_channel=initial_channel,
        status="active",
    )
    session.add(conversation)
    await session.flush()
    logger.info(f"Created conversation: {conversation.id} for customer: {customer_id}")

    return conversation


async def get_conversation_by_id(
    session: AsyncSession,
    conversation_id: UUID,
) -> Conversation | None:
    """
    Get conversation by ID.

    Args:
        session: Database session
        conversation_id: Conversation UUID

    Returns:
        Conversation or None if not found
    """
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_active_conversation(
    session: AsyncSession,
    customer_id: UUID,
    channel: str,
) -> Conversation:
    """
    Get active conversation (within 24 hours) or create new one.

    Args:
        session: Database session
        customer_id: Customer UUID
        channel: Channel type

    Returns:
        Conversation: Existing active or new conversation
    """
    # Check for active conversation (within last 24 hours)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    
    result = await session.execute(
        select(Conversation)
        .where(Conversation.customer_id == customer_id)
        .where(Conversation.status == "active")
        .where(Conversation.started_at > twenty_four_hours_ago)
        .order_by(Conversation.started_at.desc())
        .limit(1)
    )
    
    conversation = result.scalar_one_or_none()
    
    if conversation:
        logger.info(f"Found active conversation: {conversation.id} for customer: {customer_id}")
        return conversation
    
    # Create new conversation
    conversation = await create_conversation(session, customer_id, channel)
    return conversation


async def close_conversation(
    session: AsyncSession,
    conversation_id: UUID,
    status: str = "resolved",
    resolution_type: str | None = None,
) -> Conversation | None:
    """
    Close a conversation with resolution status.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        status: Final status (resolved, escalated)
        resolution_type: How it was resolved

    Returns:
        Conversation or None if not found
    """
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        logger.warning(f"Conversation {conversation_id} not found for closing")
        return None
    
    conversation.status = status
    conversation.ended_at = datetime.utcnow()
    conversation.resolution_type = resolution_type
    
    await session.flush()
    logger.info(f"Closed conversation: {conversation_id} with status: {status}")
    
    return conversation


async def get_conversation_messages(
    session: AsyncSession,
    conversation_id: UUID,
    limit: int = 20,
) -> list[dict]:
    """
    Get messages for a conversation.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        limit: Maximum number of messages to return

    Returns:
        List of message dictionaries
    """
    from .models import Message
    
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    
    messages = result.scalars().all()
    
    return [
        {
            "id": str(msg.id),
            "channel": msg.channel,
            "direction": msg.direction,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
            "delivery_status": msg.delivery_status,
        }
        for msg in reversed(messages)
    ]


async def update_conversation_sentiment(
    session: AsyncSession,
    conversation_id: UUID,
    sentiment_score: float,
) -> Conversation | None:
    """
    Update conversation sentiment score.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        sentiment_score: New sentiment score (-1.0 to 1.0)

    Returns:
        Conversation or None if not found
    """
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        return None
    
    conversation.sentiment_score = sentiment_score
    await session.flush()
    
    return conversation


async def get_conversations_by_customer(
    session: AsyncSession,
    customer_id: UUID,
    limit: int = 10,
) -> list[Conversation]:
    """
    Get all conversations for a customer.

    Args:
        session: Database session
        customer_id: Customer UUID
        limit: Maximum number of conversations to return

    Returns:
        List of conversations
    """
    result = await session.execute(
        select(Conversation)
        .where(Conversation.customer_id == customer_id)
        .order_by(Conversation.started_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()
