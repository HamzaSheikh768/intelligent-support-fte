"""
Tests for Customer Success FTE

Run with: pytest backend/tests/ -v
"""

import pytest
from httpx import AsyncClient
from datetime import datetime
from uuid import uuid4

BASE_URL = "http://localhost:8000"


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
async def client():
    """Create async HTTP client for testing."""
    async with AsyncClient(base_url=BASE_URL) as ac:
        yield ac


@pytest.fixture
def sample_support_form_data():
    """Sample support form submission data."""
    return {
        "name": "Test User",
        "email": f"test-{uuid4()}@example.com",
        "subject": "Test Support Request",
        "category": "technical",
        "priority": "medium",
        "message": "This is a test support request for validation."
    }


# ============================================================================
# Support Form Tests
# ============================================================================

class TestSupportForm:
    """Test web support form functionality."""

    @pytest.mark.asyncio
    async def test_form_submission_success(self, client, sample_support_form_data):
        """Test successful support form submission."""
        response = await client.post("/api/v1/support/submit", json=sample_support_form_data)

        assert response.status_code == 201
        data = response.json()
        assert "ticket_id" in data
        assert data["message"] == "Thank you for contacting us! Our AI assistant will respond shortly."
        assert "estimated_response_time" in data

    @pytest.mark.asyncio
    async def test_form_validation_name_too_short(self, client, sample_support_form_data):
        """Test form validation - name too short."""
        sample_support_form_data["name"] = "A"
        response = await client.post("/api/v1/support/submit", json=sample_support_form_data)

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_form_validation_invalid_email(self, client, sample_support_form_data):
        """Test form validation - invalid email."""
        sample_support_form_data["email"] = "invalid-email"
        response = await client.post("/api/v1/support/submit", json=sample_support_form_data)

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_form_validation_invalid_category(self, client, sample_support_form_data):
        """Test form validation - invalid category."""
        sample_support_form_data["category"] = "invalid_category"
        response = await client.post("/api/v1/support/submit", json=sample_support_form_data)

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_form_validation_message_too_short(self, client, sample_support_form_data):
        """Test form validation - message too short."""
        sample_support_form_data["message"] = "Short"
        response = await client.post("/api/v1/support/submit", json=sample_support_form_data)

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_ticket_status_retrieval(self, client, sample_support_form_data):
        """Test retrieving ticket status after submission."""
        # Submit form
        submit_response = await client.post("/api/v1/support/submit", json=sample_support_form_data)
        ticket_id = submit_response.json()["ticket_id"]

        # Get ticket status
        status_response = await client.get(f"/api/v1/support/ticket/{ticket_id}")

        assert status_response.status_code == 200
        data = status_response.json()
        assert data["ticket_id"] == ticket_id
        assert "status" in data
        assert "created_at" in data


# ============================================================================
# Escalation Tests
# ============================================================================

class TestEscalations:
    """Test escalation functionality."""

    @pytest.mark.asyncio
    async def test_create_escalation(self, client):
        """Test creating an escalation."""
        escalation_data = {
            "ticket_id": str(uuid4()),
            "reason": "pricing_inquiry",
            "urgency": "high"
        }

        response = await client.post("/api/v1/escalations/", json=escalation_data)

        assert response.status_code == 201
        data = response.json()
        assert "escalation_id" in data
        assert data["ticket_id"] == escalation_data["ticket_id"]
        assert data["status"] == "escalated"

    @pytest.mark.asyncio
    async def test_create_escalation_invalid_reason(self, client):
        """Test creating escalation with invalid reason."""
        escalation_data = {
            "ticket_id": str(uuid4()),
            "reason": "invalid_reason",
            "urgency": "high"
        }

        response = await client.post("/api/v1/escalations/", json=escalation_data)

        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_get_escalation_reasons(self, client):
        """Test getting all escalation reasons."""
        response = await client.get("/api/v1/escalations/reasons")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        # Check required escalation reasons exist
        reason_codes = [item["code"] for item in data]
        required_reasons = [
            "pricing_inquiry", "refund_request", "legal_issue",
            "security_concern", "angry_customer", "human_requested"
        ]
        for reason in required_reasons:
            assert reason in reason_codes


# ============================================================================
# Health Check Tests
# ============================================================================

class TestHealthCheck:
    """Test health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Test health check endpoint returns healthy status."""
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "channels" in data
        assert "email" in data["channels"]
        assert "whatsapp" in data["channels"]
        assert "web_form" in data["channels"]

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client):
        """Test root endpoint returns API information."""
        response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "docs" in data


# ============================================================================
# Channel Formatter Tests
# ============================================================================

class TestChannelFormatters:
    """Test channel-specific response formatting."""

    def test_format_email_response(self):
        """Test email response formatting."""
        from src.agent.formatters import format_email_response

        message = "This is a test response."
        formatted = format_email_response(message, "TK-123", "John Doe")

        assert "Dear John Doe" in formatted
        assert "This is a test response." in formatted
        assert "Ticket Reference: #TK-123" in formatted
        assert "Best regards" in formatted

    def test_format_whatsapp_response(self):
        """Test WhatsApp response formatting."""
        from src.agent.formatters import format_whatsapp_response

        message = "This is a test response."
        formatted = format_whatsapp_response(message)

        assert "This is a test response." in formatted
        assert "📱" in formatted

    def test_format_whatsapp_response_truncation(self):
        """Test WhatsApp response truncation for long messages."""
        from src.agent.formatters import format_whatsapp_response

        message = "A" * 2000  # Very long message
        formatted = format_whatsapp_response(message)

        assert len(formatted) <= 1700  # Slightly over 1600 for emoji

    def test_format_webform_response(self):
        """Test web form response formatting."""
        from src.agent.formatters import format_webform_response

        message = "This is a test response."
        formatted = format_webform_response(message, "TK-123")

        assert "This is a test response." in formatted
        assert "Ticket Reference: #TK-123" in formatted


# ============================================================================
# Sentiment Analysis Tests
# ============================================================================

class TestSentimentAnalysis:
    """Test sentiment analysis functionality."""

    @pytest.mark.asyncio
    async def test_analyze_sentiment_positive(self):
        """Test sentiment analysis with positive message."""
        from src.agent.tools import analyze_sentiment

        result = await analyze_sentiment("This is great! I love your product!")
        assert "Sentiment score:" in result
        assert "positive" in result.lower()

    @pytest.mark.asyncio
    async def test_analyze_sentiment_negative(self):
        """Test sentiment analysis with negative message."""
        from src.agent.tools import analyze_sentiment

        result = await analyze_sentiment("This is terrible! I'm very frustrated!")
        assert "Sentiment score:" in result
        assert "negative" in result.lower()

    @pytest.mark.asyncio
    async def test_analyze_sentiment_neutral(self):
        """Test sentiment analysis with neutral message."""
        from src.agent.tools import analyze_sentiment

        result = await analyze_sentiment("I have a question about the product.")
        assert "Sentiment score:" in result


# ============================================================================
# Escalation Trigger Tests
# ============================================================================

class TestEscalationTriggers:
    """Test escalation trigger detection."""

    def test_legal_mention_trigger(self):
        """Test escalation trigger for legal mentions."""
        from src.agent.customer_success_agent import check_escalation_triggers

        reason = check_escalation_triggers("I want to sue you!", 0.0)
        assert reason == "legal_issue"

    def test_pricing_inquiry_trigger(self):
        """Test escalation trigger for pricing inquiries."""
        from src.agent.customer_success_agent import check_escalation_triggers

        reason = check_escalation_triggers("How much does the enterprise plan cost?", 0.0)
        assert reason == "pricing_inquiry"

    def test_refund_request_trigger(self):
        """Test escalation trigger for refund requests."""
        from src.agent.customer_success_agent import check_escalation_triggers

        reason = check_escalation_triggers("I want a refund!", 0.0)
        assert reason == "refund_request"

    def test_human_request_trigger(self):
        """Test escalation trigger for human requests."""
        from src.agent.customer_success_agent import check_escalation_triggers

        reason = check_escalation_triggers("I want to speak to a human agent.", 0.0)
        assert reason == "human_requested"

    def test_negative_sentiment_trigger(self):
        """Test escalation trigger for negative sentiment."""
        from src.agent.customer_success_agent import check_escalation_triggers

        reason = check_escalation_triggers("This is awful!", -0.8)
        assert reason == "angry_customer"

    def test_no_trigger_for_normal_message(self):
        """Test no escalation trigger for normal message."""
        from src.agent.customer_success_agent import check_escalation_triggers

        reason = check_escalation_triggers("How do I reset my password?", 0.5)
        assert reason is None


# ============================================================================
# Database Function Tests
# ============================================================================

class TestDatabaseFunctions:
    """Test database helper functions."""

    @pytest.mark.asyncio
    async def test_get_or_create_customer_new(self):
        """Test creating new customer."""
        from src.database.customers import get_or_create_customer
        from src.database.session import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            customer = await get_or_create_customer(
                session,
                email="new-customer@example.com",
                name="New Customer"
            )

            assert customer is not None
            assert customer.email == "new-customer@example.com"

    @pytest.mark.asyncio
    async def test_get_or_create_customer_existing(self):
        """Test retrieving existing customer."""
        from src.database.customers import get_or_create_customer
        from src.database.session import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            # Create customer
            customer1 = await get_or_create_customer(
                session,
                email="existing-customer@example.com",
                name="Existing Customer"
            )

            # Retrieve same customer
            customer2 = await get_or_create_customer(
                session,
                email="existing-customer@example.com"
            )

            assert customer1.id == customer2.id

    @pytest.mark.asyncio
    async def test_create_ticket(self):
        """Test creating ticket."""
        from src.database.customers import get_or_create_customer
        from src.database.tickets import create_ticket
        from src.database.session import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            customer = await get_or_create_customer(
                session,
                email="ticket-test@example.com"
            )

            ticket = await create_ticket(
                session,
                customer_id=customer.id,
                source_channel="web_form",
                category="technical",
                priority="high"
            )

            assert ticket is not None
            assert ticket.status == "open"
            assert ticket.priority == "high"


# ============================================================================
# Integration Tests
# ============================================================================

class TestIntegration:
    """Integration tests for full workflows."""

    @pytest.mark.asyncio
    async def test_full_support_workflow(self, client, sample_support_form_data):
        """Test complete support request workflow."""
        # 1. Submit support form
        submit_response = await client.post("/api/v1/support/submit", json=sample_support_form_data)
        assert submit_response.status_code == 201
        ticket_id = submit_response.json()["ticket_id"]

        # 2. Check ticket status
        status_response = await client.get(f"/api/v1/support/ticket/{ticket_id}")
        assert status_response.status_code == 200

        # 3. Create escalation (simulate agent escalation)
        escalation_data = {
            "ticket_id": ticket_id,
            "reason": "technical_complex",
            "urgency": "normal"
        }
        escalation_response = await client.post("/api/v1/escalations/", json=escalation_data)
        assert escalation_response.status_code == 201

        # 4. Check health
        health_response = await client.get("/health")
        assert health_response.status_code == 200
        assert health_response.json()["status"] == "healthy"


# ============================================================================
# Run Tests
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
