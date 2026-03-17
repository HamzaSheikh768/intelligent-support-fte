"""
WhatsApp Channel Handler

Handles WhatsApp integration via Twilio API.
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Request, Form, Response
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
from twilio.rest import Client
from twilio.request_validator import RequestValidator
import os
import logging

from ..core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["whatsapp-webhook"])


# ============================================================================
# Webhook Schemas
# ============================================================================

class WhatsAppWebhookData(BaseModel):
    """Parsed WhatsApp message data from Twilio."""

    channel: str = "whatsapp"
    channel_message_id: str
    customer_phone: str
    content: str
    received_at: str
    metadata: Optional[Dict] = None


# ============================================================================
# WhatsApp Handler Class
# ============================================================================

class WhatsAppHandler:
    """Handler for WhatsApp integration via Twilio."""

    def __init__(self):
        """Initialize WhatsApp handler with Twilio credentials."""
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", settings.KAFKA_BOOTSTRAP_SERVERS)
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.whatsapp_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        self.validator = RequestValidator(self.auth_token)
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initialize Twilio client."""
        try:
            if self.account_sid and self.auth_token:
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("Twilio client initialized")
            else:
                logger.warning("Twilio credentials not found - running in mock mode")
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {e}")

    async def validate_webhook(self, request: Request) -> bool:
        """
        Validate incoming Twilio webhook signature.

        Args:
            request: FastAPI request object

        Returns:
            True if signature is valid
        """
        try:
            signature = request.headers.get('X-Twilio-Signature', '')
            url = str(request.url)

            # Get form data for validation
            form_data = await request.form()
            params = dict(form_data)

            # In development, skip validation
            if settings.is_development:
                logger.debug("Skipping Twilio signature validation in development")
                return True

            is_valid = self.validator.validate(url, params, signature)

            if not is_valid:
                logger.warning("Invalid Twilio signature")

            return is_valid

        except Exception as e:
            logger.error(f"Failed to validate Twilio webhook: {e}")
            return False

    async def process_webhook(self, form_data: dict) -> WhatsAppWebhookData:
        """
        Process incoming WhatsApp message from Twilio webhook.

        Args:
            form_data: Twilio webhook form data

        Returns:
            Parsed WhatsAppWebhookData
        """
        try:
            message_data = WhatsAppWebhookData(
                channel_message_id=form_data.get('MessageSid', ''),
                customer_phone=form_data.get('From', '').replace('whatsapp:', ''),
                content=form_data.get('Body', ''),
                received_at=datetime.utcnow().isoformat(),
                metadata={
                    'num_media': form_data.get('NumMedia', '0'),
                    'profile_name': form_data.get('ProfileName'),
                    'wa_id': form_data.get('WaId'),
                    'status': form_data.get('SmsStatus'),
                }
            )

            logger.info(f"WhatsApp message received from {message_data.customer_phone}")

            return message_data

        except Exception as e:
            logger.error(f"Failed to process WhatsApp webhook: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process WhatsApp message: {str(e)}"
            )

    async def send_message(self, to_phone: str, body: str) -> dict:
        """
        Send WhatsApp message via Twilio.

        Args:
            to_phone: Recipient phone number
            body: Message content

        Returns:
            Twilio response with message SID and status
        """
        try:
            # Ensure phone number is in WhatsApp format
            if not to_phone.startswith('whatsapp:'):
                to_phone = f'whatsapp:{to_phone}'

            if not self.client:
                # Return mock response for development
                logger.info(f"Mock WhatsApp message to {to_phone}: {body[:50]}...")
                return {
                    "channel_message_id": f"mock-{datetime.utcnow().isoformat()}",
                    "delivery_status": "sent",
                }

            message = self.client.messages.create(
                body=body,
                from_=self.whatsapp_number,
                to=to_phone
            )

            logger.info(f"Sent WhatsApp message to {to_phone}, SID: {message.sid}")

            return {
                "channel_message_id": message.sid,
                "delivery_status": message.status,
            }

        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            return {
                "channel_message_id": "",
                "delivery_status": "failed",
                "error": str(e),
            }

    def format_response(self, response: str, max_length: int = 1600) -> List[str]:
        """
        Format and split response for WhatsApp (max 1600 chars per message).

        Args:
            response: Response content
            max_length: Maximum characters per message

        Returns:
            List of message parts
        """
        if len(response) <= max_length:
            return [response]

        # Split into multiple messages
        messages = []
        while response:
            if len(response) <= max_length:
                messages.append(response)
                break

            # Find a good break point (sentence or word)
            break_point = response.rfind('. ', 0, max_length)
            if break_point == -1:
                break_point = response.rfind(' ', 0, max_length)
            if break_point == -1:
                break_point = max_length

            messages.append(response[:break_point + 1].strip())
            response = response[break_point + 1:].strip()

        return messages


# ============================================================================
# Webhook Endpoints
# ============================================================================

@router.post("/whatsapp")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    MessageSid: str = Form(...),
    From: str = Form(...),
    Body: str = Form(...),
    ProfileName: Optional[str] = Form(None),
    WaId: Optional[str] = Form(None),
):
    """
    Handle incoming WhatsApp messages via Twilio webhook.

    This endpoint:
    1. Receives webhook from Twilio
    2. Validates Twilio signature
    3. Processes message through FTE agent
    4. Sends response via Twilio API

    Args:
        request: FastAPI request object
        background_tasks: Background tasks
        MessageSid: Twilio message SID
        From: Sender phone number (whatsapp:+1234567890)
        Body: Message content
        ProfileName: Sender profile name
        WaId: WhatsApp ID
    """
    try:
        # Validate Twilio signature
        handler = WhatsAppHandler()
        is_valid = await handler.validate_webhook(request)

        if not is_valid and not settings.is_development:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid signature")

        # Parse message data
        form_data = {
            'MessageSid': MessageSid,
            'From': From,
            'Body': Body,
            'ProfileName': ProfileName,
            'WaId': WaId,
        }

        message_data = await handler.process_webhook(form_data)

        # TODO: Process through FTE agent in background
        # background_tasks.add_task(process_message, message_data)

        # Return empty TwiML response (agent will respond asynchronously)
        return Response(
            content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            media_type="application/xml"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing WhatsApp webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/whatsapp/status")
async def whatsapp_status_webhook(
    MessageSid: str = Form(...),
    MessageStatus: str = Form(...),
):
    """
    Handle WhatsApp message status updates (delivered, read, etc.).

    Args:
        MessageSid: Twilio message SID
        MessageStatus: Status (sent, delivered, read, failed)
    """
    logger.info(f"WhatsApp message status: {MessageSid} - {MessageStatus}")

    # TODO: Update message delivery status in database

    return {"status": "received"}


# ============================================================================
# Helper Functions
# ============================================================================

def validate_twilio_signature(
    request: Request,
    signature: str,
    auth_token: str,
) -> bool:
    """
    Validate Twilio webhook signature.

    Args:
        request: FastAPI request
        signature: X-Twilio-Signature header
        auth_token: Twilio auth token

    Returns:
        True if signature is valid
    """
    validator = RequestValidator(auth_token)
    url = str(request.url)

    # Get form params
    import asyncio
    loop = asyncio.get_event_loop()
    form_data = loop.run_until_complete(request.form())
    params = dict(form_data)

    return validator.validate(url, params, signature)


def format_whatsapp_message(message: str, max_length: int = 1600) -> List[str]:
    """
    Format and split message for WhatsApp (max 1600 chars per message).

    Args:
        message: Message content
        max_length: Maximum characters per message

    Returns:
        List of message parts
    """
    if len(message) <= max_length:
        return [message]

    messages = []
    while message:
        if len(message) <= max_length:
            messages.append(message)
            break

        break_point = message.rfind('. ', 0, max_length)
        if break_point == -1:
            break_point = message.rfind(' ', 0, max_length)
        if break_point == -1:
            break_point = max_length

        messages.append(message[:break_point + 1].strip())
        message = message[break_point + 1:].strip()

    return messages
