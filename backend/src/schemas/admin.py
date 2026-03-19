"""
Admin API schemas
"""

from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


class DailyTicket(BaseModel):
    date: str
    count: int


class DashboardMetricsResponse(BaseModel):
    totalTickets: int
    openTickets: int
    resolvedTickets: int
    escalatedTickets: int
    avgResponseTime: float
    avgResolutionTime: float
    sentimentScore: float
    sentimentLabel: str
    ticketsByChannel: Dict[str, int]
    ticketsByStatus: Dict[str, str]
    ticketsByPriority: Dict[str, int]
    dailyTickets: List[DailyTicket]


class TicketItem(BaseModel):
    id: str
    ticketId: str
    customerId: str
    customerName: str
    customerEmail: str
    channel: str
    subject: str
    message: str
    status: str
    priority: str
    sentiment: str
    sentimentScore: float
    createdAt: str
    updatedAt: str
    resolvedAt: Optional[str] = None
    assignedTo: Optional[str] = None
    tags: List[str] = []
    messages: List[Dict] = []


class TicketListResponse(BaseModel):
    items: List[TicketItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ActivityFeedItem(BaseModel):
    id: str
    ticketId: str
    customerName: str
    channel: str
    messageSnippet: str
    sentiment: str
    sentimentScore: float
    timestamp: str
    type: str


class UserItem(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    totalTickets: int
    lastActive: str
    sentiment: str
    sentimentScore: float


class UserListResponse(BaseModel):
    items: List[UserItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class TicketFilterParams(BaseModel):
    channel: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    search: Optional[str] = None


class UpdateTicketParams(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignedTo: Optional[str] = None
    internalNote: Optional[str] = None
