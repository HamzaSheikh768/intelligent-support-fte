"""
Escalations API

Handles escalation of tickets to human agents.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/escalations", tags=["escalations"])


# ============================================================================
# Request/Response Schemas
# ============================================================================

class EscalationCreate(BaseModel):
    """Escalation creation request schema."""
    
    ticket_id: str = Field(..., description="Ticket ID to escalate")
    reason: str = Field(..., description="Escalation reason code")
    urgency: str = Field(default="normal", description="Urgency: normal, high, urgent")
    notes: Optional[str] = Field(default=None, description="Additional notes")


class EscalationResponse(BaseModel):
    """Escalation response schema."""
    
    escalation_id: str
    ticket_id: str
    status: str
    message: str
    estimated_response_time: str


class EscalationReason(BaseModel):
    """Escalation reason code schema."""
    
    code: str
    description: str
    auto_escalate: bool


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/", response_model=EscalationResponse, status_code=status.HTTP_201_CREATED)
async def create_escalation(escalation: EscalationCreate):
    """
    Create an escalation to human agent.
    
    This endpoint:
    1. Validates the escalation request
    2. Updates ticket status to 'escalated'
    3. Notifies human agents via Kafka
    4. Returns escalation confirmation
    
    Args:
        escalation: Escalation creation data
        
    Returns:
        EscalationResponse: Escalation confirmation
    """
    try:
        # Generate escalation ID
        escalation_id = str(uuid.uuid4())
        
        # Validate reason code
        valid_reasons = [
            'pricing_inquiry', 'refund_request', 'legal_issue',
            'security_concern', 'angry_customer', 'technical_complex',
            'human_requested', 'billing_dispute'
        ]
        
        if escalation.reason not in valid_reasons:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid reason code. Must be one of: {valid_reasons}"
            )
        
        # TODO: Update ticket status in database
        # TODO: Publish to Kafka for human agents
        # TODO: Send notification to on-call agent
        
        logger.info(
            f"Escalation created: {escalation_id} - "
            f"ticket: {escalation.ticket_id} - "
            f"reason: {escalation.reason} - "
            f"urgency: {escalation.urgency}"
        )
        
        # Determine estimated response time based on urgency
        response_times = {
            'urgent': '15 minutes',
            'high': '1 hour',
            'normal': '4 hours',
        }
        estimated_time = response_times.get(escalation.urgency, '4 hours')
        
        return EscalationResponse(
            escalation_id=escalation_id,
            ticket_id=escalation.ticket_id,
            status='escalated',
            message=f"Escalated to human support with {escalation.urgency} priority",
            estimated_response_time=estimated_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating escalation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create escalation"
        )


@router.get("/reasons", response_model=List[EscalationReason])
async def get_escalation_reasons():
    """
    Get all valid escalation reason codes.
    
    Returns:
        List of escalation reasons with descriptions
    """
    reasons = [
        EscalationReason(
            code='pricing_inquiry',
            description='Customer asking about pricing or plans',
            auto_escalate=True
        ),
        EscalationReason(
            code='refund_request',
            description='Customer requesting refund or chargeback',
            auto_escalate=True
        ),
        EscalationReason(
            code='legal_issue',
            description='Legal mentions (lawyer, lawsuit, etc.)',
            auto_escalate=True
        ),
        EscalationReason(
            code='security_concern',
            description='Security breach or unauthorized access',
            auto_escalate=True
        ),
        EscalationReason(
            code='angry_customer',
            description='Customer sentiment very negative (< 0.2)',
            auto_escalate=True
        ),
        EscalationReason(
            code='technical_complex',
            description='Technical issue unresolved after 2 attempts',
            auto_escalate=False
        ),
        EscalationReason(
            code='human_requested',
            description='Customer explicitly requested human agent',
            auto_escalate=True
        ),
        EscalationReason(
            code='billing_dispute',
            description='Billing dispute or duplicate charge',
            auto_escalate=True
        ),
    ]
    
    return reasons


@router.get("/{escalation_id}")
async def get_escalation_status(escalation_id: str):
    """
    Get escalation status.
    
    Args:
        escalation_id: Escalation ID
        
    Returns:
        Escalation status and details
    """
    # TODO: Implement escalation status lookup
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Escalation {escalation_id} not found"
    )
