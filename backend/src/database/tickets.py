"""
Database helper functions for tickets and customers
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from .models import Customer, Ticket, Conversation
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


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
        result = await session.execute(
            select(Customer).where(Customer.email == email)
        )
        customer = result.scalar_one_or_none()
        
        if customer:
            logger.info(f"Found existing customer: {customer.id}")
            return customer
    
    # Try to find by phone
    if phone:
        result = await session.execute(
            select(Customer).where(Customer.phone == phone)
        )
        customer = result.scalar_one_or_none()
        
        if customer:
            logger.info(f"Found existing customer by phone: {customer.id}")
            return customer
    
    # Create new customer
    customer = Customer(email=email, phone=phone, name=name or "")
    session.add(customer)
    await session.flush()  # Get the ID
    logger.info(f"Created new customer: {customer.id}")
    
    return customer


async def create_ticket(
    session: AsyncSession,
    customer_id: UUID,
    conversation_id: UUID | None = None,
    source_channel: str = "web_form",
    category: str | None = None,
    priority: str = "medium",
) -> Ticket:
    """
    Create a new support ticket.
    
    Args:
        session: Database session
        customer_id: Customer UUID
        conversation_id: Optional conversation UUID
        source_channel: Channel source (email, whatsapp, web_form)
        category: Ticket category
        priority: Ticket priority
        
    Returns:
        Ticket: Created ticket
    """
    ticket = Ticket(
        customer_id=customer_id,
        conversation_id=conversation_id,
        source_channel=source_channel,
        category=category,
        priority=priority,
        status="open",
    )
    session.add(ticket)
    await session.flush()
    logger.info(f"Created ticket: {ticket.id} for customer: {customer_id}")
    
    return ticket


async def get_ticket_by_id(session: AsyncSession, ticket_id: UUID) -> Ticket | None:
    """
    Get ticket by ID.
    
    Args:
        session: Database session
        ticket_id: Ticket UUID
        
    Returns:
        Ticket or None if not found
    """
    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    return result.scalar_one_or_none()


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


async def update_ticket_status(
    session: AsyncSession,
    ticket_id: UUID,
    status: str,
    resolution_notes: str | None = None,
) -> Ticket | None:
    """
    Update ticket status.

    Args:
        session: Database session
        ticket_id: Ticket UUID
        status: New status (open, processing, resolved, escalated)
        resolution_notes: Optional resolution notes

    Returns:
        Ticket or None if not found
    """
    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        logger.warning(f"Ticket {ticket_id} not found for status update")
        return None
    
    ticket.status = status
    
    if status == "resolved":
        ticket.resolved_at = datetime.utcnow()
        ticket.resolution_notes = resolution_notes
    elif resolution_notes:
        ticket.resolution_notes = resolution_notes
    
    await session.flush()
    logger.info(f"Updated ticket {ticket_id} status to: {status}")
    
    return ticket


async def get_tickets_by_customer(
    session: AsyncSession,
    customer_id: UUID,
    limit: int = 10,
) -> list[Ticket]:
    """
    Get all tickets for a customer.

    Args:
        session: Database session
        customer_id: Customer UUID
        limit: Maximum number of tickets to return

    Returns:
        List of tickets ordered by creation time
    """
    result = await session.execute(
        select(Ticket)
        .where(Ticket.customer_id == customer_id)
        .order_by(Ticket.created_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()


async def get_tickets_by_status(
    session: AsyncSession,
    status: str,
    limit: int = 50,
) -> list[Ticket]:
    """
    Get tickets by status.

    Args:
        session: Database session
        status: Ticket status to filter
        limit: Maximum number of tickets to return

    Returns:
        List of tickets with given status
    """
    result = await session.execute(
        select(Ticket)
        .where(Ticket.status == status)
        .order_by(Ticket.created_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()
