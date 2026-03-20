"""
Admin API endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from sqlmodel import SQLModel
from ...database.session import AsyncSessionLocal
from ...database.models import Ticket, Customer, Message, Conversation

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_db() -> AsyncSession:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/metrics")
async def get_dashboard_metrics(session: AsyncSession = Depends(get_db)):
    """Get dashboard metrics"""
    try:
        # Total tickets
        total_result = await session.execute(select(func.count(Ticket.id)))
        total = total_result.scalar() or 0
        
        # Tickets by status
        open_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.status == 'open')
        )
        open_count = open_result.scalar() or 0
        
        resolved_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.status == 'resolved')
        )
        resolved_count = resolved_result.scalar() or 0
        
        escalated_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.status == 'escalated')
        )
        escalated_count = escalated_result.scalar() or 0
        
        # Tickets by channel
        whatsapp_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.source_channel == 'whatsapp')
        )
        whatsapp_count = whatsapp_result.scalar() or 0
        
        gmail_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.source_channel == 'email')
        )
        gmail_count = gmail_result.scalar() or 0
        
        webform_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.source_channel == 'web_form')
        )
        webform_count = webform_result.scalar() or 0
        
        # Tickets by priority
        low_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.priority == 'low')
        )
        low_count = low_result.scalar() or 0
        
        medium_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.priority == 'medium')
        )
        medium_count = medium_result.scalar() or 0
        
        high_result = await session.execute(
            select(func.count(Ticket.id)).where(Ticket.priority == 'high')
        )
        high_count = high_result.scalar() or 0
        
        # Sentiment score from conversations
        sentiment_result = await session.execute(
            select(func.avg(Conversation.sentiment_score))
        )
        avg_sentiment = sentiment_result.scalar() or 0.82
        
        # Daily tickets (last 7 days) - simplified
        daily_tickets = []
        
        return {
            "totalTickets": total,
            "openTickets": open_count,
            "resolvedTickets": resolved_count,
            "escalatedTickets": escalated_count,
            "avgResponseTime": 2.4,  # Mock for now
            "avgResolutionTime": 15.3,  # Mock for now
            "sentimentScore": round(avg_sentiment, 2) if avg_sentiment else 0.82,
            "sentimentLabel": "positive" if (avg_sentiment or 0.82) > 0.6 else "neutral",
            "ticketsByChannel": {
                "whatsapp": whatsapp_count,
                "gmail": gmail_count,
                "webform": webform_count,
            },
            "ticketsByStatus": {
                "open": open_count,
                "resolved": resolved_count,
                "escalated": escalated_count,
            },
            "ticketsByPriority": {
                "low": low_count,
                "medium": medium_count,
                "high": high_count,
            },
            "dailyTickets": daily_tickets,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tickets")
async def get_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    channel: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_db)
):
    """Get all tickets with filtering and pagination"""
    try:
        # Build query
        query = select(Ticket).join(Customer).order_by(Ticket.created_at.desc())
        
        if channel:
            query = query.where(Ticket.source_channel == channel)
        if status:
            query = query.where(Ticket.status == status)
        if priority:
            query = query.where(Ticket.priority == priority)
        if search:
            query = query.where(
                or_(
                    Customer.name.ilike(f"%{search}%"),
                    Customer.email.ilike(f"%{search}%"),
                    Ticket.category.ilike(f"%{search}%"),
                )
            )
        
        # Get total count
        count_query = select(func.count(Ticket.id))
        if channel:
            count_query = count_query.where(Ticket.source_channel == channel)
        if status:
            count_query = count_query.where(Ticket.status == status)
        if priority:
            count_query = count_query.where(Ticket.priority == priority)
        
        total_result = await session.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        result = await session.execute(query)
        tickets = result.scalars().all()
        
        return {
            "items": [
                {
                    "id": str(ticket.id),
                    "ticketId": f"TK-{ticket.id.hex[:8]}",
                    "customerId": str(ticket.customer_id),
                    "customerName": ticket.customer.name if ticket.customer else "Unknown",
                    "customerEmail": ticket.customer.email if ticket.customer else "unknown@example.com",
                    "channel": ticket.source_channel,
                    "subject": ticket.category or "General",
                    "message": "",
                    "status": ticket.status,
                    "priority": ticket.priority,
                    "sentiment": "neutral",
                    "sentimentScore": 0.5,
                    "createdAt": str(ticket.created_at),
                    "updatedAt": str(ticket.created_at),
                    "tags": [],
                    "messages": [],
                }
                for ticket in tickets
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activity-feed")
async def get_activity_feed(
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db)
):
    """Get recent activity feed"""
    try:
        # Get recent messages from customers
        result = await session.execute(
            select(Message)
            .where(Message.role == "customer")
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = result.scalars().all()

        return [
            {
                "id": str(msg.id),
                "ticketId": str(msg.ticket_id) if msg.ticket_id else "",
                "customerName": "Customer",
                "channel": msg.channel,
                "messageSnippet": msg.content[:100] if msg.content else "",
                "sentiment": "neutral",
                "sentimentScore": 0.5,
                "timestamp": str(msg.created_at),
                "type": "new_message",
            }
            for msg in messages
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users")
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_db)
):
    """Get all users"""
    try:
        # Build query
        query = select(Customer).order_by(Customer.created_at.desc())
        
        if search:
            query = query.where(
                or_(
                    Customer.name.ilike(f"%{search}%"),
                    Customer.email.ilike(f"%{search}%"),
                )
            )
        
        # Get total count
        count_query = select(func.count(Customer.id))
        if search:
            count_query = count_query.where(
                or_(
                    Customer.name.ilike(f"%{search}%"),
                    Customer.email.ilike(f"%{search}%"),
                )
            )
        
        total_result = await session.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        result = await session.execute(query)
        customers = result.scalars().all()
        
        return {
            "items": [
                {
                    "id": str(customer.id),
                    "name": customer.name or "Unknown",
                    "email": customer.email or "unknown@example.com",
                    "phone": customer.phone or "N/A",
                    "totalTickets": 0,  # Would need to count tickets per customer
                    "lastActive": str(customer.created_at),
                    "sentiment": "neutral",
                    "sentimentScore": 0.5,
                }
                for customer in customers
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Import or_ for search functionality
from sqlalchemy import or_
