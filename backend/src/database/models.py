"""
SQLModel database models for Customer Success FTE
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from uuid import UUID, uuid4


# ============================================================================
# Customer Model
# ============================================================================

class Customer(SQLModel, table=True):
    """Customer model - unified across all channels."""
    
    __tablename__ = "customers"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: Optional[str] = Field(default=None, unique=True, index=True, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=50)
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata_: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Relationships
    tickets: list["Ticket"] = Relationship(back_populates="customer")
    conversations: list["Conversation"] = Relationship(back_populates="customer")
    identifiers: list["CustomerIdentifier"] = Relationship(back_populates="customer")


# ============================================================================
# Customer Identifier Model
# ============================================================================

class CustomerIdentifier(SQLModel, table=True):
    """Customer identifier model - tracks multiple contact methods per customer."""

    __tablename__ = "customer_identifiers"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    customer_id: UUID = Field(default=None, foreign_key="customers.id", index=True)
    identifier_type: str = Field(..., max_length=50)  # email, phone, whatsapp
    identifier_value: str = Field(..., max_length=255)
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="identifiers")

    # Unique constraint for identifier type + value
    __table_args__ = (
        # This is handled at DB level with unique index
        {"sqlite_autoincrement": True},
    )


# ============================================================================
# Ticket Model
# ============================================================================

class Ticket(SQLModel, table=True):
    """Ticket model - tracks support requests."""
    
    __tablename__ = "tickets"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    customer_id: UUID = Field(default=None, foreign_key="customers.id", index=True)
    conversation_id: Optional[UUID] = Field(default=None, foreign_key="conversations.id", index=True)
    source_channel: str = Field(..., max_length=50)  # email, whatsapp, web_form
    category: Optional[str] = Field(default=None, max_length=100)
    priority: str = Field(default="medium", max_length=20)
    status: str = Field(default="open", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(default=None)
    resolution_notes: Optional[str] = Field(default=None)
    
    # Relationships
    customer: Customer = Relationship(back_populates="tickets")
    conversation: Optional["Conversation"] = Relationship(back_populates="ticket")
    messages: list["Message"] = Relationship(back_populates="ticket")


# ============================================================================
# Conversation Model
# ============================================================================

class Conversation(SQLModel, table=True):
    """Conversation model - tracks conversation threads."""

    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    customer_id: UUID = Field(default=None, foreign_key="customers.id", index=True)
    initial_channel: str = Field(..., max_length=50)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)
    status: str = Field(default="active", max_length=50)
    sentiment_score: Optional[float] = Field(default=None)
    resolution_type: Optional[str] = Field(default=None, max_length=50)
    escalated_to: Optional[str] = Field(default=None, max_length=255)
    metadata_: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    customer: Customer = Relationship(back_populates="conversations")
    ticket: Optional[Ticket] = Relationship(back_populates="conversation")
    messages: list["Message"] = Relationship(back_populates="conversation")


# ============================================================================
# Message Model
# ============================================================================

class Message(SQLModel, table=True):
    """Message model - individual messages in conversations."""
    
    __tablename__ = "messages"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    conversation_id: UUID = Field(default=None, foreign_key="conversations.id", index=True)
    ticket_id: Optional[UUID] = Field(default=None, foreign_key="tickets.id", index=True)
    channel: str = Field(..., max_length=50)
    direction: str = Field(..., max_length=20)  # inbound, outbound
    role: str = Field(..., max_length=20)  # customer, agent, system
    content: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    tokens_used: Optional[int] = Field(default=None)
    latency_ms: Optional[int] = Field(default=None)
    tool_calls: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    channel_message_id: Optional[str] = Field(default=None, max_length=255)
    delivery_status: str = Field(default="pending", max_length=50)
    
    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
    ticket: Optional[Ticket] = Relationship(back_populates="messages")


# ============================================================================
# Knowledge Base Model
# ============================================================================

class KnowledgeBase(SQLModel, table=True):
    """Knowledge base model - product documentation for semantic search."""

    __tablename__ = "knowledge_base"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    title: str = Field(..., max_length=500)
    content: str = Field(...)
    category: Optional[str] = Field(default=None, max_length=100)
    embedding: Optional[str] = Field(default=None, max_length=2000)  # Store as JSON string for now
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Agent Metrics Model
# ============================================================================

class AgentMetrics(SQLModel, table=True):
    """Agent metrics model - performance tracking."""
    
    __tablename__ = "agent_metrics"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    metric_name: str = Field(..., max_length=100)
    metric_value: float = Field(...)
    channel: Optional[str] = Field(default=None, max_length=50)
    dimensions: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
