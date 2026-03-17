"""
Metrics Collector Worker

Collects and aggregates performance metrics from the FTE system.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from ..core.config import settings
from ..utils.kafka_producer import FTEKafkaConsumer, FTEKafkaProducer, TOPICS
from ..database.session import AsyncSessionLocal
from ..database.models import AgentMetrics, Conversation, Message, Ticket
from sqlalchemy import select, func, avg

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collect and aggregate FTE performance metrics."""

    def __init__(self):
        self.producer = FTEKafkaProducer()
        self.consumer = None
        self.running = False

        # Metric buffers
        self.message_metrics = []
        self.escalation_metrics = []

    async def start(self):
        """Start the metrics collector."""
        await self.producer.start()

        # Create consumer for metrics events
        self.consumer = FTEKafkaConsumer(
            topics=[TOPICS['metrics'], TOPICS['escalations']],
            group_id='fte-metrics-collector'
        )
        await self.consumer.start()

        self.running = True
        logger.info("Metrics collector started")
        await self.consumer.consume(self.collect_metric)

        # Start periodic aggregation
        asyncio.create_task(self.periodic_aggregation())

    async def stop(self):
        """Stop the metrics collector."""
        self.running = False
        if self.consumer:
            await self.consumer.stop()
        if self.producer:
            await self.producer.stop()
        logger.info("Metrics collector stopped")

    async def collect_metric(self, topic: str, event: dict):
        """
        Collect a metric event.

        Args:
            topic: Kafka topic
            event: Metric event data
        """
        if not self.running:
            return

        try:
            timestamp = datetime.utcnow()

            if topic == TOPICS['metrics']:
                # Process message metric
                await self.store_metric(
                    metric_name=event.get('event_type', 'unknown'),
                    metric_value=event.get('latency_ms', 0),
                    channel=event.get('channel', 'unknown'),
                    dimensions={
                        'escalated': event.get('escalated', False),
                        'sentiment_score': event.get('sentiment_score', 0),
                    }
                )

                logger.debug(f"Collected metric: {event.get('event_type')} - {event.get('latency_ms')}ms")

            elif topic == TOPICS['escalations']:
                # Process escalation metric
                await self.store_metric(
                    metric_name='escalation',
                    metric_value=1,
                    channel=event.get('channel', 'unknown'),
                    dimensions={
                        'reason': event.get('reason', 'unknown'),
                        'requires_human': event.get('requires_human', False),
                    }
                )

                logger.info(f"Collected escalation: {event.get('reason')}")

        except Exception as e:
            logger.error(f"Error collecting metric: {e}")

    async def store_metric(
        self,
        metric_name: str,
        metric_value: float,
        channel: Optional[str] = None,
        dimensions: Optional[Dict[str, Any]] = None,
    ):
        """
        Store metric in database.

        Args:
            metric_name: Metric name
            metric_value: Metric value
            channel: Optional channel
            dimensions: Optional additional dimensions
        """
        async with AsyncSessionLocal() as session:
            metric = AgentMetrics(
                metric_name=metric_name,
                metric_value=metric_value,
                channel=channel,
                dimensions=dimensions or {},
            )
            session.add(metric)
            await session.commit()

    async def periodic_aggregation(self):
        """Periodically aggregate and report metrics."""
        while self.running:
            try:
                await asyncio.sleep(60)  # Aggregate every minute
                await self.aggregate_metrics()
            except Exception as e:
                logger.error(f"Error in periodic aggregation: {e}")

    async def aggregate_metrics(self):
        """Aggregate metrics for the last minute and publish summary."""
        try:
            async with AsyncSessionLocal() as session:
                one_minute_ago = datetime.utcnow() - timedelta(minutes=1)

                # Get metrics from last minute
                result = await session.execute(
                    select(AgentMetrics).where(
                        AgentMetrics.recorded_at > one_minute_ago
                    )
                )
                metrics = result.scalars().all()

                if not metrics:
                    return

                # Calculate aggregates
                total_messages = sum(1 for m in metrics if m.metric_name == 'message_processed')
                total_escalations = sum(1 for m in metrics if m.metric_name == 'escalation')

                latencies = [m.metric_value for m in metrics if m.metric_name == 'message_processed']
                avg_latency = sum(latencies) / len(latencies) if latencies else 0
                max_latency = max(latencies) if latencies else 0
                min_latency = min(latencies) if latencies else 0

                # Calculate escalation rate
                escalation_rate = (total_escalations / total_messages * 100) if total_messages > 0 else 0

                # Publish summary
                await self.producer.publish(TOPICS['metrics'], {
                    'event_type': 'metrics_summary',
                    'period': '1_minute',
                    'total_messages': total_messages,
                    'total_escalations': total_escalations,
                    'escalation_rate': escalation_rate,
                    'latency': {
                        'avg': avg_latency,
                        'max': max_latency,
                        'min': min_latency,
                    },
                    'timestamp': datetime.utcnow().isoformat(),
                })

                logger.info(
                    f"Metrics summary: {total_messages} messages, "
                    f"{total_escalations} escalations ({escalation_rate:.1f}%), "
                    f"avg latency {avg_latency:.0f}ms"
                )

        except Exception as e:
            logger.error(f"Error aggregating metrics: {e}")

    async def calculate_channel_metrics(self) -> Dict[str, Dict[str, Any]]:
        """
        Calculate metrics by channel.

        Returns:
            Dictionary of channel metrics
        """
        async with AsyncSessionLocal() as session:
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)

            # Get conversations by channel
            result = await session.execute(
                select(
                    Conversation.initial_channel,
                    func.count(Conversation.id).label('total'),
                    func.avg(Conversation.sentiment_score).label('avg_sentiment'),
                )
                .where(Conversation.started_at > one_hour_ago)
                .group_by(Conversation.initial_channel)
            )

            channel_metrics = {}
            for row in result.all():
                channel_metrics[row[0]] = {
                    'total_conversations': row[1],
                    'avg_sentiment': float(row[2]) if row[2] else 0,
                }

            return channel_metrics

    async def calculate_agent_performance(self) -> Dict[str, Any]:
        """
        Calculate overall agent performance metrics.

        Returns:
            Dictionary of performance metrics
        """
        async with AsyncSessionLocal() as session:
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)

            # Get message count
            message_result = await session.execute(
                select(func.count(Message.id))
                .where(Message.created_at > one_hour_ago)
            )
            total_messages = message_result.scalar() or 0

            # Get average latency
            latency_result = await session.execute(
                select(func.avg(Message.latency_ms))
                .where(Message.created_at > one_hour_ago)
                .where(Message.latency_ms.isnot(None))
            )
            avg_latency = latency_result.scalar() or 0

            # Get escalation count
            escalation_result = await session.execute(
                select(func.count(Ticket.id))
                .where(Ticket.created_at > one_hour_ago)
                .where(Ticket.status == 'escalated')
            )
            total_escalations = escalation_result.scalar() or 0

            # Calculate escalation rate
            escalation_rate = (total_escalations / total_messages * 100) if total_messages > 0 else 0

            return {
                'total_messages': total_messages,
                'avg_latency_ms': avg_latency,
                'total_escalations': total_escalations,
                'escalation_rate': escalation_rate,
                'period': '1_hour',
            }


async def main():
    """Main entry point for metrics collector worker."""
    collector = MetricsCollector()

    try:
        await collector.start()
        # Keep running
        while collector.running:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down metrics collector...")
        await collector.stop()
    except Exception as e:
        logger.error(f"Metrics collector crashed: {e}")
        await collector.stop()
        raise


if __name__ == "__main__":
    asyncio.run(main())
