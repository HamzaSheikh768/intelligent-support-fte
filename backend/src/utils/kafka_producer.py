"""
Kafka producer and consumer utilities
"""

from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import json
from datetime import datetime
from .config import settings


# Topic definitions
TOPICS = {
    "tickets_incoming": settings.KAFKA_TOPIC_TICKETS_INCOMING,
    "escalations": settings.KAFKA_TOPIC_ESCALATIONS,
    "metrics": settings.KAFKA_TOPIC_METRICS,
}


class KafkaProducerWrapper:
    """
    Kafka producer wrapper for publishing events.
    
    Example:
        ```python
        producer = KafkaProducerWrapper()
        await producer.start()
        await producer.publish("tickets_incoming", {"event": "data"})
        await producer.stop()
        ```
    """
    
    def __init__(self):
        self.producer = None
    
    async def start(self) -> None:
        """Start the Kafka producer."""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        )
        await self.producer.start()
    
    async def stop(self) -> None:
        """Stop the Kafka producer."""
        if self.producer:
            await self.producer.stop()
    
    async def publish(self, topic_key: str, event: dict) -> None:
        """
        Publish an event to a Kafka topic.
        
        Args:
            topic_key: Topic key from TOPICS dict
            event: Event data to publish
        """
        if topic_key not in TOPICS:
            raise ValueError(f"Unknown topic key: {topic_key}")
        
        topic = TOPICS[topic_key]
        event["timestamp"] = datetime.utcnow().isoformat()
        
        await self.producer.send_and_wait(topic, event)


class KafkaConsumerWrapper:
    """
    Kafka consumer wrapper for consuming events.
    
    Example:
        ```python
        consumer = KafkaConsumerWrapper(["tickets_incoming"], "group-id")
        await consumer.start()
        await consumer.consume(handler_function)
        ```
    """
    
    def __init__(self, topics: list[str], group_id: str):
        self.consumer = AIOKafkaConsumer(
            *topics,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=group_id,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        )
    
    async def start(self) -> None:
        """Start the Kafka consumer."""
        await self.consumer.start()
    
    async def stop(self) -> None:
        """Stop the Kafka consumer."""
        await self.consumer.stop()
    
    async def consume(self, handler) -> None:
        """
        Consume messages and call handler for each message.
        
        Args:
            handler: Async function to call with (topic, message)
        """
        async for msg in self.consumer:
            await handler(msg.topic, msg.value)
