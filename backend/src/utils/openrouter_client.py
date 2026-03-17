"""
OpenRouter API Client Configuration

This module configures the OpenAI SDK to use OpenRouter API.
"""

import os
from openai import OpenAI

from ..core.config import settings


def get_openrouter_client() -> OpenAI:
    """
    Get OpenAI client configured for OpenRouter API.

    OpenRouter is an API gateway that provides access to multiple LLM providers
    through a unified API compatible with the OpenAI SDK.

    Returns:
        OpenAI: Configured OpenAI client
    """
    return OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": "https://github.com/your-org/crm-digital-fte-factory",
            "X-Title": "Customer Success FTE",
        }
    )


# Global client instance (lazy initialization)
_openrouter_client = None


def get_client() -> OpenAI:
    """
    Get or create OpenRouter client instance.

    Returns:
        OpenAI: OpenRouter client
    """
    global _openrouter_client
    if _openrouter_client is None:
        _openrouter_client = get_openrouter_client()
    return _openrouter_client
