"""
Database helper functions for messages
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, Dict, Any
from .models import Message, Conversation
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


async def create_message(
    session: AsyncSession,
    conversation_id: UUID,
    channel: str,
    direction: str,
    role: str,
    content: str,
    ticket_id: Optional[UUID] = None,
    tokens_used: Optional[int] = None,
    latency_ms: Optional[int] = None,
    tool_calls: Optional[Dict[str, Any]] = None,
    channel_message_id: Optional[str] = None,
    delivery_status: str = "sent",
) -> Message:
    """
    Create a new message in a conversation.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        channel: Channel type (email, whatsapp, web_form)
        direction: Message direction (inbound, outbound)
        role: Message role (customer, agent, system)
        content: Message content
        ticket_id: Optional ticket UUID
        tokens_used: Optional token count
        latency_ms: Optional processing latency
        tool_calls: Optional tool calls data
        channel_message_id: Optional external channel message ID
        delivery_status: Delivery status

    Returns:
        Message: Created message
    """
    message = Message(
        conversation_id=conversation_id,
        ticket_id=ticket_id,
        channel=channel,
        direction=direction,
        role=role,
        content=content,
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        tool_calls=tool_calls,
        channel_message_id=channel_message_id,
        delivery_status=delivery_status,
    )
    session.add(message)
    await session.flush()
    logger.debug(f"Created message: {message.id} in conversation: {conversation_id}")
    
    return message


async def get_message_by_id(
    session: AsyncSession,
    message_id: UUID,
) -> Message | None:
    """
    Get message by ID.

    Args:
        session: Database session
        message_id: Message UUID

    Returns:
        Message or None if not found
    """
    result = await session.execute(
        select(Message).where(Message.id == message_id)
    )
    return result.scalar_one_or_none()


async def get_messages_by_conversation(
    session: AsyncSession,
    conversation_id: UUID,
    limit: int = 20,
) -> list[Message]:
    """
    Get messages for a conversation.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        limit: Maximum number of messages to return

    Returns:
        List of messages ordered by creation time
    """
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()


async def update_message_delivery(
    session: AsyncSession,
    message_id: UUID,
    status: str,
) -> Message | None:
    """
    Update message delivery status.

    Args:
        session: Database session
        message_id: Message UUID
        status: New delivery status (pending, sent, delivered, failed)

    Returns:
        Message or None if not found
    """
    result = await session.execute(
        select(Message).where(Message.id == message_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        logger.warning(f"Message {message_id} not found for delivery update")
        return None
    
    message.delivery_status = status
    await session.flush()
    logger.debug(f"Updated message {message_id} delivery status to: {status}")
    
    return message


async def get_messages_by_ticket(
    session: AsyncSession,
    ticket_id: UUID,
    limit: int = 50,
) -> list[Message]:
    """
    Get messages associated with a ticket.

    Args:
        session: Database session
        ticket_id: Ticket UUID
        limit: Maximum number of messages to return

    Returns:
        List of messages
    """
    result = await session.execute(
        select(Message)
        .where(Message.ticket_id == ticket_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()


async def get_last_message_by_conversation(
    session: AsyncSession,
    conversation_id: UUID,
) -> Message | None:
    """
    Get the last message in a conversation.

    Args:
        session: Database session
        conversation_id: Conversation UUID

    Returns:
        Last message or None if conversation is empty
    """
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    
    return result.scalar_one_or_none()
