"""
Customer Success FTE Agent Definition

This module defines the OpenAI Agents SDK agent for customer support.
Configured to use OpenRouter API for multi-provider LLM access.
"""

from agents import Agent, Runner, function_tool
from typing import Optional
import logging
import os

from .tools import (
    search_knowledge_base,
    create_ticket,
    get_customer_history,
    escalate_to_human,
    send_response,
    analyze_sentiment,
)
from .prompts import CUSTOMER_SUCCESS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Configure OpenRouter API via environment variables
# The OpenAI Agents SDK respects these environment variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")
os.environ["OPENAI_BASE_URL"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

# Get model from settings
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "gpt-4o")


# Define the Customer Success FTE Agent
customer_success_agent = Agent(
    name="Customer Success FTE",
    model=MODEL_NAME,
    instructions=CUSTOMER_SUCCESS_SYSTEM_PROMPT,
    tools=[
        search_knowledge_base,
        create_ticket,
        get_customer_history,
        escalate_to_human,
        send_response,
        analyze_sentiment,
    ],
)


async def run_agent(
    message: str,
    customer_id: str,
    channel: str,
    conversation_id: Optional[str] = None,
) -> dict:
    """
    Run the customer success agent with a message.

    Args:
        message: Customer message content
        customer_id: Unique customer identifier
        channel: Channel source (email, whatsapp, web_form)
        conversation_id: Optional conversation thread ID

    Returns:
        dict: Agent response with output, tool calls, and escalation status
    """
    # Build context for the agent
    context = {
        "customer_id": customer_id,
        "channel": channel,
        "ticket_subject": message[:100],  # Use first 100 chars as subject
    }

    if conversation_id:
        context["conversation_id"] = conversation_id

    try:
        # Run the agent
        result = await Runner.run(
            customer_success_agent,
            message,
            context=context,
        )

        # Extract response
        response = {
            "output": result.output,
            "tool_calls": result.tool_calls if hasattr(result, "tool_calls") else [],
            "escalated": False,
            "escalation_reason": None,
        }

        # Check if escalation was triggered
        for tool_call in response["tool_calls"]:
            if tool_call.get("name") == "escalate_to_human":
                response["escalated"] = True
                response["escalation_reason"] = tool_call.get("arguments", {}).get("reason")
                break

        logger.info(f"Agent processed message for customer {customer_id} via {channel}")

        return response

    except Exception as e:
        logger.error(f"Agent execution failed: {e}")
        return {
            "output": "I'm having trouble processing your request. A human agent will follow up shortly.",
            "tool_calls": [],
            "escalated": True,
            "escalation_reason": "processing_error",
        }


def check_escalation_triggers(message: str, sentiment_score: float) -> Optional[str]:
    """
    Check if message contains escalation triggers.

    Args:
        message: Customer message content
        sentiment_score: Analyzed sentiment score

    Returns:
        Escalation reason code if trigger detected, None otherwise
    """
    message_lower = message.lower()
    
    # Legal mentions
    legal_keywords = ["lawyer", "legal", "sue", "attorney", "lawsuit", "court"]
    if any(word in message_lower for word in legal_keywords):
        return "legal_issue"
    
    # Security concerns
    security_keywords = ["breach", "hacked", "unauthorized", "security", "stolen"]
    if any(word in message_lower for word in security_keywords):
        return "security_concern"
    
    # Billing disputes
    billing_keywords = ["refund", "chargeback", "overcharged", "billing", "duplicate charge"]
    if any(word in message_lower for word in billing_keywords):
        if "refund" in message_lower:
            return "refund_request"
        return "billing_dispute"
    
    # Pricing inquiries
    pricing_keywords = ["price", "pricing", "cost", "expensive", "cheap", "plan", "subscription"]
    if any(word in message_lower for word in pricing_keywords):
        return "pricing_inquiry"
    
    # Human requests
    human_keywords = ["human", "agent", "representative", "person", "manager", "supervisor"]
    if any(word in message_lower for word in human_keywords):
        return "human_requested"
    
    # Negative sentiment
    if sentiment_score < -0.3:
        return "angry_customer"
    
    return None
