"""
Message Processor Worker

Processes incoming messages from all channels through the FTE agent.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

from ..core.config import settings
from ..utils.kafka_producer import FTEKafkaConsumer, FTEKafkaProducer, TOPICS
from ..agent.customer_success_agent import run_agent, check_escalation_triggers, analyze_sentiment
from ..database.session import AsyncSessionLocal
from ..database.models import Customer, Conversation, Message, Ticket
from ..database.customers import get_or_create_customer, get_customer_by_id
from ..database.conversations import get_or_create_active_conversation, close_conversation
from ..database.tickets import update_ticket_status
from ..database.messages import create_message, get_messages_by_conversation
from sqlalchemy import select

logger = logging.getLogger(__name__)


class UnifiedMessageProcessor:
    """Process incoming messages from all channels through the FTE agent."""

    def __init__(self):
        self.producer = FTEKafkaProducer()
        self.consumer = None
        self.running = False

    async def start(self):
        """Start the message processor."""
        await self.producer.start()

        # Create consumer for incoming tickets
        self.consumer = FTEKafkaConsumer(
            topics=[TOPICS['tickets_incoming']],
            group_id='fte-message-processor'
        )
        await self.consumer.start()

        self.running = True
        logger.info("Message processor started, listening for tickets...")
        await self.consumer.consume(self.process_message)

    async def stop(self):
        """Stop the message processor."""
        self.running = False
        if self.consumer:
            await self.consumer.stop()
        if self.producer:
            await self.producer.stop()
        logger.info("Message processor stopped")

    async def process_message(self, topic: str, message: dict):
        """
        Process a single incoming message from any channel.

        Args:
            topic: Kafka topic
            message: Message data from Kafka
        """
        if not self.running:
            return

        try:
            start_time = datetime.utcnow()

            # Extract channel
            channel = message.get('channel', 'web_form')

            # Get or create customer
            customer_id = await self.resolve_customer(message)

            # Get or create conversation
            conversation_id = await self.get_or_create_conversation(
                customer_id=customer_id,
                channel=channel,
                message=message
            )

            # Store incoming message
            await self.store_message(
                conversation_id=conversation_id,
                channel=channel,
                direction='inbound',
                role='customer',
                content=message.get('content', ''),
            )

            # Analyze sentiment
            sentiment_result = await analyze_sentiment(message.get('content', ''))
            sentiment_score = self._parse_sentiment_score(sentiment_result)

            # Check for escalation triggers
            escalation_reason = check_escalation_triggers(
                message.get('content', ''),
                sentiment_score
            )

            if escalation_reason:
                logger.info(f"Escalation trigger detected: {escalation_reason}")
                await self.handle_escalation(
                    customer_id=customer_id,
                    conversation_id=conversation_id,
                    channel=channel,
                    reason=escalation_reason,
                    original_message=message
                )
                return

            # Load conversation history
            history = await self.load_conversation_history(conversation_id)

            # Run agent
            result = await run_agent(
                message=message.get('content', ''),
                customer_id=customer_id,
                channel=channel,
                conversation_id=conversation_id,
            )

            # Calculate metrics
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Store agent response
            await self.store_message(
                conversation_id=conversation_id,
                channel=channel,
                direction='outbound',
                role='agent',
                content=result.get('output', ''),
                latency_ms=latency_ms,
            )

            # Check if agent triggered escalation
            if result.get('escalated'):
                logger.info(f"Agent escalated ticket - reason: {result.get('escalation_reason')}")
                await self.handle_escalation(
                    customer_id=customer_id,
                    conversation_id=conversation_id,
                    channel=channel,
                    reason=result.get('escalation_reason', 'agent_decision'),
                    original_message=message
                )
                return

            # Publish metrics
            await self.producer.publish(TOPICS['metrics'], {
                'event_type': 'message_processed',
                'channel': channel,
                'latency_ms': latency_ms,
                'escalated': False,
                'sentiment_score': sentiment_score,
            })

            logger.info(f"Processed {channel} message in {latency_ms:.0f}ms")

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.handle_error(message, e)

    async def resolve_customer(self, message: dict) -> str:
        """
        Resolve or create customer from message identifiers.

        Args:
            message: Message data

        Returns:
            Customer ID
        """
        async with AsyncSessionLocal() as session:
            email = message.get('customer_email')
            phone = message.get('customer_phone')
            name = message.get('customer_name')

            customer = await get_or_create_customer(
                session=session,
                email=email,
                phone=phone,
                name=name,
            )

            return str(customer.id)

    async def get_or_create_conversation(
        self,
        customer_id: str,
        channel: str,
        message: dict,
    ) -> str:
        """
        Get active conversation or create new one.

        Args:
            customer_id: Customer ID
            channel: Channel type
            message: Message data

        Returns:
            Conversation ID
        """
        from uuid import UUID

        async with AsyncSessionLocal() as session:
            conversation = await get_or_create_active_conversation(
                session,
                UUID(customer_id),
                channel
            )
            return str(conversation.id)

    async def store_message(
        self,
        conversation_id: str,
        channel: str,
        direction: str,
        role: str,
        content: str,
        latency_ms: Optional[int] = None,
    ):
        """
        Store message in database.

        Args:
            conversation_id: Conversation ID
            channel: Channel type
            direction: Message direction (inbound/outbound)
            role: Message role (customer/agent/system)
            content: Message content
            latency_ms: Optional processing latency
        """
        from uuid import UUID

        async with AsyncSessionLocal() as session:
            await create_message(
                session=session,
                conversation_id=UUID(conversation_id),
                channel=channel,
                direction=direction,
                role=role,
                content=content,
                latency_ms=latency_ms,
                delivery_status='sent',
            )

    async def load_conversation_history(self, conversation_id: str) -> list:
        """
        Load conversation history for agent context.

        Args:
            conversation_id: Conversation ID

        Returns:
            List of message dictionaries
        """
        from uuid import UUID

        async with AsyncSessionLocal() as session:
            messages = await get_messages_by_conversation(
                session,
                UUID(conversation_id),
                limit=20
            )

            return [
                {"role": msg.role, "content": msg.content}
                for msg in reversed(messages)
            ]

    async def handle_escalation(
        self,
        customer_id: str,
        conversation_id: str,
        channel: str,
        reason: str,
        original_message: dict,
    ):
        """
        Handle escalation to human agent.

        Args:
            customer_id: Customer ID
            conversation_id: Conversation ID
            channel: Channel type
            reason: Escalation reason
            original_message: Original message that triggered escalation
        """
        from uuid import UUID

        async with AsyncSessionLocal() as session:
            # Close conversation as escalated
            await close_conversation(
                session,
                UUID(conversation_id),
                "escalated",
                reason
            )

            # Send apology message
            apology = "I understand this requires human assistance. A member of our team will respond within 1 hour."

            await create_message(
                session=session,
                conversation_id=UUID(conversation_id),
                channel=channel,
                direction='outbound',
                role='system',
                content=apology,
                delivery_status='sent',
            )

            # Publish to escalations topic
            await self.producer.publish(TOPICS['escalations'], {
                'event_type': 'escalation',
                'customer_id': customer_id,
                'conversation_id': conversation_id,
                'channel': channel,
                'reason': reason,
                'original_message': original_message,
                'timestamp': datetime.utcnow().isoformat(),
            })

            logger.info(f"Escalation published for conversation {conversation_id}")

    async def handle_error(self, message: dict, error: Exception):
        """
        Handle processing errors gracefully.

        Args:
            message: Original message
            error: Exception that occurred
        """
        # Send apologetic response via appropriate channel
        channel = message.get('channel', 'web_form')
        apology = "I'm sorry, I'm having trouble processing your request right now. A human agent will follow up shortly."

        # Publish for human review
        await self.producer.publish(TOPICS['escalations'], {
            'event_type': 'processing_error',
            'original_message': message,
            'error': str(error),
            'requires_human': True,
        })

        logger.error(f"Message processing error published for human review")

    def _parse_sentiment_score(self, sentiment_result: str) -> float:
        """
        Parse sentiment score from result string.

        Args:
            sentiment_result: Sentiment analysis result string

        Returns:
            Sentiment score as float
        """
        try:
            # Extract score from "Sentiment score: X.XX (...)"
            if "Sentiment score:" in sentiment_result:
                score_part = sentiment_result.split("Sentiment score:")[1].strip()
                score = float(score_part.split()[0])
                return max(-1.0, min(1.0, score))
        except Exception:
            pass
        return 0.0


async def main():
    """Main entry point for message processor worker."""
    processor = UnifiedMessageProcessor()

    try:
        await processor.start()
        # Keep running
        while processor.running:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down message processor...")
        await processor.stop()
    except Exception as e:
        logger.error(f"Message processor crashed: {e}")
        await processor.stop()
        raise


if __name__ == "__main__":
    asyncio.run(main())
