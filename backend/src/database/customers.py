"""
Database helper functions for customers
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import Customer
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


async def get_customer_by_email(session: AsyncSession, email: str) -> Customer | None:
    """
    Get customer by email.

    Args:
        session: Database session
        email: Customer email

    Returns:
        Customer or None if not found
    """
    result = await session.execute(
        select(Customer).where(Customer.email == email)
    )
    return result.scalar_one_or_none()


async def get_customer_by_phone(session: AsyncSession, phone: str) -> Customer | None:
    """
    Get customer by phone.

    Args:
        session: Database session
        phone: Customer phone

    Returns:
        Customer or None if not found
    """
    result = await session.execute(
        select(Customer).where(Customer.phone == phone)
    )
    return result.scalar_one_or_none()


async def get_customer_by_id(session: AsyncSession, customer_id: UUID) -> Customer | None:
    """
    Get customer by ID.

    Args:
        session: Database session
        customer_id: Customer UUID

    Returns:
        Customer or None if not found
    """
    result = await session.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_customer(
    session: AsyncSession,
    email: str | None = None,
    phone: str | None = None,
    name: str | None = None,
) -> Customer:
    """
    Get existing customer or create new one.

    Args:
        session: Database session
        email: Customer email
        phone: Customer phone
        name: Customer name

    Returns:
        Customer: Existing or newly created customer
    """
    # Try to find by email first
    if email:
        customer = await get_customer_by_email(session, email)
        if customer:
            logger.info(f"Found existing customer by email: {customer.id}")
            return customer

    # Try to find by phone
    if phone:
        customer = await get_customer_by_phone(session, phone)
        if customer:
            logger.info(f"Found existing customer by phone: {customer.id}")
            return customer

    # Create new customer
    customer = Customer(email=email, phone=phone, name=name or "")
    session.add(customer)
    await session.flush()
    logger.info(f"Created new customer: {customer.id}")

    return customer


async def get_customer_history(
    session: AsyncSession,
    customer_id: UUID,
    limit: int = 20,
) -> list[dict]:
    """
    Get customer's conversation history across all channels.

    Args:
        session: Database session
        customer_id: Customer UUID
        limit: Maximum number of messages to return

    Returns:
        List of message dictionaries
    """
    from .models import Conversation, Message

    result = await session.execute(
        select(Conversation, Message)
        .join(Message, Message.conversation_id == Conversation.id)
        .where(Conversation.customer_id == customer_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )

    history = []
    for conv, msg in result.all():
        history.append({
            "channel": msg.channel,
            "direction": msg.direction,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        })

    return history


async def get_customer_conversations(
    session: AsyncSession,
    customer_id: UUID,
    limit: int = 10,
) -> list[dict]:
    """
    Get all conversations for a customer.

    Args:
        session: Database session
        customer_id: Customer UUID
        limit: Maximum number of conversations to return

    Returns:
        List of conversation dictionaries
    """
    from .models import Conversation
    
    result = await session.execute(
        select(Conversation)
        .where(Conversation.customer_id == customer_id)
        .order_by(Conversation.started_at.desc())
        .limit(limit)
    )
    
    conversations = result.scalars().all()
    
    return [
        {
            "id": str(conv.id),
            "initial_channel": conv.initial_channel,
            "started_at": conv.started_at.isoformat(),
            "status": conv.status,
            "sentiment_score": conv.sentiment_score,
        }
        for conv in conversations
    ]


async def add_customer_identifier(
    session: AsyncSession,
    customer_id: UUID,
    identifier_type: str,
    identifier_value: str,
    verified: bool = False,
) -> bool:
    """
    Add a new identifier (email/phone) to a customer.

    Args:
        session: Database session
        customer_id: Customer UUID
        identifier_type: Type of identifier (email, phone, whatsapp)
        identifier_value: Identifier value
        verified: Whether the identifier is verified

    Returns:
        bool: True if added successfully
    """
    from .models import CustomerIdentifier
    
    # Check if identifier already exists
    existing = await session.execute(
        select(CustomerIdentifier).where(
            CustomerIdentifier.identifier_type == identifier_type,
            CustomerIdentifier.identifier_value == identifier_value
        )
    )
    
    if existing.scalar_one_or_none():
        logger.info(f"Identifier {identifier_type}:{identifier_value} already exists")
        return False
    
    # Create new identifier
    identifier = CustomerIdentifier(
        customer_id=customer_id,
        identifier_type=identifier_type,
        identifier_value=identifier_value,
        verified=verified,
    )
    session.add(identifier)
    await session.flush()
    logger.info(f"Added {identifier_type} identifier to customer {customer_id}")
    
    return True
