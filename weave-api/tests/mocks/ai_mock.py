"""Mock AI service providers for deterministic testing.

These mocks allow testing AI-dependent features without making real API calls,
ensuring tests are fast, deterministic, and don't incur costs.
"""

from typing import Any, Dict


class MockOpenAIProvider:
    """Mock OpenAI provider for testing."""

    def __init__(self, response_override: str = None):
        """Initialize with optional response override."""
        self.response_override = response_override
        self.call_count = 0

    def complete(self, prompt: str, **kwargs: Any) -> Dict[str, Any]:
        """Return deterministic response."""
        self.call_count += 1

        if self.response_override:
            content = self.response_override
        else:
            # Generate predictable response based on prompt keywords
            if "triad" in prompt.lower():
                content = "Task 1: Morning workout\nTask 2: Code review\nTask 3: Evening reading"
            elif "recap" in prompt.lower():
                content = "Great progress today! You completed 3 tasks and stayed consistent."
            elif "breakdown" in prompt.lower():
                content = "Step 1: Setup\nStep 2: Implementation\nStep 3: Testing"
            else:
                content = f"Mock response for prompt: {prompt[:50]}..."

        return {
            "provider": "openai-mock",
            "content": content,
            "cost_usd": 0.0,
            "tokens_input": len(prompt.split()),
            "tokens_output": len(content.split()),
        }


class MockAnthropicProvider:
    """Mock Anthropic provider for testing."""

    def __init__(self, response_override: str = None):
        """Initialize with optional response override."""
        self.response_override = response_override
        self.call_count = 0

    def complete(self, prompt: str, **kwargs: Any) -> Dict[str, Any]:
        """Return deterministic response."""
        self.call_count += 1

        if self.response_override:
            content = self.response_override
        else:
            content = f"Anthropic mock response: {prompt[:50]}..."

        return {
            "provider": "anthropic-mock",
            "content": content,
            "cost_usd": 0.0,
            "tokens_input": len(prompt.split()),
            "tokens_output": len(content.split()),
        }


class MockAIService:
    """Mock AI service that mimics the real AIService interface."""

    def __init__(self):
        """Initialize with mock providers."""
        self.openai_provider = MockOpenAIProvider()
        self.anthropic_provider = MockAnthropicProvider()
        self.current_provider = "openai"

    def generate(self, prompt: str, module: str = "default", **kwargs: Any) -> Dict[str, Any]:
        """Generate mock AI response."""
        if self.current_provider == "openai":
            return self.openai_provider.complete(prompt, **kwargs)
        else:
            return self.anthropic_provider.complete(prompt, **kwargs)

    def generate_triad(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock triad tasks."""
        return {
            "tasks": [
                "Morning: 30-min workout",
                "Afternoon: Code review session",
                "Evening: Read 20 pages",
            ],
            "rationale": "Mock rationale for task selection",
            "provider": "openai-mock",
        }

    def generate_goal_breakdown(self, goal_text: str) -> Dict[str, Any]:
        """Generate mock goal breakdown."""
        return {
            "title": f"Breakdown for: {goal_text}",
            "milestones": ["Setup phase", "Implementation phase", "Launch phase"],
            "binds": [
                "Daily code commits",
                "Weekly progress review",
                "Monthly retrospective",
            ],
            "provider": "openai-mock",
        }


def create_mock_ai_response(content: str, provider: str = "mock") -> Dict[str, Any]:
    """Helper to create mock AI response dictionaries.

    Args:
        content: The response content
        provider: Provider name for the response

    Returns:
        Mock AI response in standard format
    """
    return {
        "provider": provider,
        "content": content,
        "cost_usd": 0.0,
        "tokens_input": 100,
        "tokens_output": 50,
        "model": "mock-model",
    }
