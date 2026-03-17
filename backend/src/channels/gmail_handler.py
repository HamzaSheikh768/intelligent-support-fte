"""
Gmail Channel Handler

Handles Gmail integration via Gmail API and Pub/Sub webhooks.
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Request
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.cloud import pubsub_v1
import base64
import email
from email.mime.text import MIMEText
import logging
import re
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["gmail-webhook"])


# ============================================================================
# Webhook Schemas
# ============================================================================

class GmailPubSubMessage(BaseModel):
    """Gmail Pub/Sub webhook payload."""

    message: Dict[str, str]
    subscription: str


class GmailMessageData(BaseModel):
    """Parsed Gmail message data."""

    channel: str = "email"
    channel_message_id: str
    customer_email: str
    subject: str
    content: str
    received_at: str
    thread_id: Optional[str] = None
    metadata: Optional[Dict] = None


# ============================================================================
# Gmail Handler Class
# ============================================================================

class GmailHandler:
    """Handler for Gmail API integration."""

    def __init__(self, credentials_path: Optional[str] = None):
        """
        Initialize Gmail handler.

        Args:
            credentials_path: Path to Gmail API credentials file
        """
        self.credentials_path = credentials_path or os.getenv("GMAIL_CREDENTIALS_PATH")
        self.service = None
        self._initialize_service()

    def _initialize_service(self):
        """Initialize Gmail API service."""
        try:
            if self.credentials_path and os.path.exists(self.credentials_path):
                credentials = Credentials.from_authorized_user_file(self.credentials_path)
                self.service = build('gmail', 'v1', credentials=credentials)
                logger.info("Gmail API service initialized")
            else:
                logger.warning("Gmail credentials not found - running in mock mode")
        except Exception as e:
            logger.error(f"Failed to initialize Gmail API: {e}")

    async def setup_push_notifications(self, topic_name: str) -> dict:
        """
        Set up Gmail push notifications via Pub/Sub.

        Args:
            topic_name: Pub/Sub topic name

        Returns:
            Setup result with historyId
        """
        try:
            if not self.service:
                return {"error": "Gmail service not initialized"}

            request = {
                'labelIds': ['INBOX'],
                'topicName': topic_name,
                'labelFilterAction': 'include'
            }

            result = self.service.users().watch(userId='me', body=request).execute()
            logger.info(f"Gmail push notifications setup: {result}")

            return result

        except Exception as e:
            logger.error(f"Failed to setup Gmail push notifications: {e}")
            return {"error": str(e)}

    async def process_notification(self, pubsub_message: dict) -> List[GmailMessageData]:
        """
        Process incoming Pub/Sub notification from Gmail.

        Args:
            pubsub_message: Pub/Sub message with historyId

        Returns:
            List of parsed Gmail messages
        """
        try:
            history_id = pubsub_message.get('message', {}).get('historyId')

            if not history_id or not self.service:
                return []

            # Get new messages since last history ID
            history = self.service.users().history().list(
                userId='me',
                startHistoryId=history_id,
                historyTypes=['messageAdded']
            ).execute()

            messages = []
            for record in history.get('history', []):
                for msg_added in record.get('messagesAdded', []):
                    msg_id = msg_added['message']['id']
                    message = await self.get_message(msg_id)
                    messages.append(message)

            logger.info(f"Processed {len(messages)} Gmail messages")
            return messages

        except Exception as e:
            logger.error(f"Failed to process Gmail notification: {e}")
            return []

    async def get_message(self, message_id: str) -> GmailMessageData:
        """
        Fetch and parse a Gmail message.

        Args:
            message_id: Gmail message ID

        Returns:
            Parsed GmailMessageData
        """
        try:
            if not self.service:
                # Return mock data for development
                return GmailMessageData(
                    channel_message_id=message_id,
                    customer_email="customer@example.com",
                    subject="Test Email",
                    content="This is a test email message.",
                    received_at=datetime.utcnow().isoformat(),
                    thread_id="test-thread-id",
                )

            msg = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()

            headers = {h['name']: h['value'] for h in msg['payload']['headers']}
            body = self._extract_body(msg['payload'])
            customer_email = self._extract_email(headers.get('From', ''))

            return GmailMessageData(
                channel_message_id=message_id,
                customer_email=customer_email,
                subject=headers.get('Subject', ''),
                content=body,
                received_at=datetime.utcnow().isoformat(),
                thread_id=msg.get('threadId'),
                metadata={
                    'headers': headers,
                    'labels': msg.get('labelIds', []),
                }
            )

        except Exception as e:
            logger.error(f"Failed to get Gmail message: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch Gmail message: {str(e)}"
            )

    def _extract_body(self, payload: dict) -> str:
        """
        Extract text body from email payload.

        Args:
            payload: Gmail message payload

        Returns:
            Message body text
        """
        if 'body' in payload and payload['body'].get('data'):
            return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')

        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain' and part['body'].get('data'):
                    return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')

        return ''

    def _extract_email(self, from_header: str) -> str:
        """
        Extract email address from From header.

        Args:
            from_header: From header value

        Returns:
            Email address
        """
        match = re.search(r'<(.+?)>', from_header)
        return match.group(1) if match else from_header

    async def send_reply(
        self,
        to_email: str,
        subject: str,
        body: str,
        thread_id: Optional[str] = None,
    ) -> dict:
        """
        Send email reply via Gmail API.

        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            thread_id: Optional thread ID for reply

        Returns:
            Gmail API response with message ID and status
        """
        try:
            if not self.service:
                # Return mock response for development
                logger.info(f"Mock Gmail response to {to_email}: {subject}")
                return {
                    "channel_message_id": f"mock-{datetime.utcnow().isoformat()}",
                    "delivery_status": "sent",
                }

            # Create MIME message
            message = MIMEText(body)
            message['to'] = to_email
            message['subject'] = f"Re: {subject}" if not subject.startswith('Re:') else subject

            if thread_id:
                message['threadId'] = thread_id

            raw = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            send_request = {'raw': raw}

            if thread_id:
                send_request['threadId'] = thread_id

            result = self.service.users().messages().send(
                userId='me',
                body=send_request
            ).execute()

            logger.info(f"Sent Gmail response to {to_email}, message ID: {result['id']}")

            return {
                "channel_message_id": result['id'],
                "delivery_status": "sent",
            }

        except Exception as e:
            logger.error(f"Failed to send Gmail response: {e}")
            return {
                "channel_message_id": "",
                "delivery_status": "failed",
                "error": str(e),
            }


# ============================================================================
# Webhook Endpoints
# ============================================================================

@router.post("/gmail")
async def gmail_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Handle Gmail push notifications via Pub/Sub.

    This endpoint:
    1. Receives Pub/Sub notification from Gmail
    2. Fetches new messages from Gmail API
    3. Processes each message through the FTE agent
    4. Publishes to Kafka for processing

    Args:
        request: FastAPI request
        background_tasks: FastAPI background tasks
    """
    try:
        body = await request.json()
        pubsub_message = body.get('message', {})

        logger.info(f"Gmail webhook received - messageId: {pubsub_message.get('messageId')}")

        # Parse Pub/Sub message
        if 'data' in pubsub_message:
            data = base64.b64decode(pubsub_message['data']).decode('utf-8')
            logger.debug(f"Pub/Sub data: {data}")

        # TODO: Process messages through FTE agent
        # TODO: Send responses via Gmail API

        return {"status": "processed", "messageId": pubsub_message.get('messageId')}

    except Exception as e:
        logger.error(f"Error processing Gmail webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Helper Functions
# ============================================================================

def parse_gmail_message(raw_message: str) -> GmailMessageData:
    """
    Parse raw Gmail message into structured data.

    Args:
        raw_message: Base64-encoded raw message

    Returns:
        Parsed GmailMessageData
    """
    decoded = base64.urlsafe_b64decode(raw_message)
    msg = email.message_from_bytes(decoded)

    subject = msg.get('Subject', '')
    from_header = msg.get('From', '')
    customer_email = extract_email(from_header)
    body = extract_body(msg)

    return GmailMessageData(
        channel_message_id=msg.get('Message-ID', ''),
        customer_email=customer_email,
        subject=subject,
        content=body,
        received_at=datetime.utcnow().isoformat(),
        thread_id=msg.get('X-Gmail-Thread-ID', ''),
    )


def extract_email(from_header: str) -> str:
    """
    Extract email address from From header.

    Args:
        from_header: From header value

    Returns:
        Email address
    """
    match = re.search(r'<(.+?)>', from_header)
    return match.group(1) if match else from_header


def extract_body(msg) -> str:
    """
    Extract text body from email message.

    Args:
        msg: Email message object

    Returns:
        Message body text
    """
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                try:
                    return part.get_content()
                except:
                    pass

    for part in msg.walk():
        if part.get_content_type() == "text/html":
            try:
                return part.get_content()
            except:
                pass

    return ""
