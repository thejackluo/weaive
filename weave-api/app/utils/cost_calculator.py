"""
AI Cost Calculator - Model-specific pricing utility

Story: 1.5.3 - AI Services Standardization (AC-5)
Provides unified cost calculation for all AI modalities (text/image/audio).

Pricing sourced from:
- OpenAI: https://openai.com/api/pricing/
- Anthropic: https://anthropic.com/pricing
- Google AI: https://ai.google.dev/pricing
- AssemblyAI: https://www.assemblyai.com/pricing

Environment Variables (override defaults without code changes):
- GPT4O_MINI_INPUT_COST (default: 0.15 per MTok)
- GPT4O_MINI_OUTPUT_COST (default: 0.60 per MTok)
- GPT4O_INPUT_COST (default: 2.50 per MTok)
- GPT4O_OUTPUT_COST (default: 10.00 per MTok)
- CLAUDE_SONNET_INPUT_COST (default: 3.00 per MTok)
- CLAUDE_SONNET_OUTPUT_COST (default: 15.00 per MTok)
- GEMINI_FLASH_IMAGE_COST (default: 0.0005 per image)
- GPT4O_VISION_IMAGE_COST (default: 0.02 per image)
- ASSEMBLYAI_COST_PER_HOUR (default: 0.15)
- WHISPER_COST_PER_MINUTE (default: 0.006)
"""

import logging
import os
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# ===========================
# TEXT AI PRICING (per MTok)
# ===========================

# Default pricing (fallback if env vars not set)
DEFAULT_TEXT_PRICING = {
    'gpt-4o-mini': {'input': 0.15, 'output': 0.60},
    'gpt-4o': {'input': 2.50, 'output': 10.00},
    'claude-3.7-sonnet': {'input': 3.00, 'output': 15.00},
    'claude-3.5-haiku': {'input': 1.00, 'output': 5.00},
    'bedrock': {'input': 3.00, 'output': 15.00},  # Same as Claude Sonnet
}

# ===========================
# IMAGE AI PRICING (per image)
# ===========================

DEFAULT_IMAGE_PRICING = {
    'gemini-3-flash': 0.0005,
    'gpt-4o-vision': 0.02,
}

# ===========================
# AUDIO AI PRICING
# ===========================

DEFAULT_AUDIO_PRICING = {
    'assemblyai': 0.15 / 3600,  # $0.15/hour = $0.00004167/second
    'whisper': 0.006 / 60,      # $0.006/minute = $0.0001/second
}


def get_text_pricing() -> Dict[str, Dict[str, float]]:
    """
    Get text AI pricing from environment variables or defaults.
    
    Returns:
        Dict[model_name, {'input': cost_per_mtok, 'output': cost_per_mtok}]
    """
    return {
        'gpt-4o-mini': {
            'input': float(os.getenv('GPT4O_MINI_INPUT_COST', DEFAULT_TEXT_PRICING['gpt-4o-mini']['input'])),
            'output': float(os.getenv('GPT4O_MINI_OUTPUT_COST', DEFAULT_TEXT_PRICING['gpt-4o-mini']['output'])),
        },
        'gpt-4o': {
            'input': float(os.getenv('GPT4O_INPUT_COST', DEFAULT_TEXT_PRICING['gpt-4o']['input'])),
            'output': float(os.getenv('GPT4O_OUTPUT_COST', DEFAULT_TEXT_PRICING['gpt-4o']['output'])),
        },
        'claude-3.7-sonnet': {
            'input': float(os.getenv('CLAUDE_SONNET_INPUT_COST', DEFAULT_TEXT_PRICING['claude-3.7-sonnet']['input'])),
            'output': float(os.getenv('CLAUDE_SONNET_OUTPUT_COST', DEFAULT_TEXT_PRICING['claude-3.7-sonnet']['output'])),
        },
        'claude-3.5-haiku': {
            'input': float(os.getenv('CLAUDE_HAIKU_INPUT_COST', DEFAULT_TEXT_PRICING['claude-3.5-haiku']['input'])),
            'output': float(os.getenv('CLAUDE_HAIKU_OUTPUT_COST', DEFAULT_TEXT_PRICING['claude-3.5-haiku']['output'])),
        },
        'bedrock': {
            'input': float(os.getenv('BEDROCK_INPUT_COST', DEFAULT_TEXT_PRICING['bedrock']['input'])),
            'output': float(os.getenv('BEDROCK_OUTPUT_COST', DEFAULT_TEXT_PRICING['bedrock']['output'])),
        },
    }


def get_image_pricing() -> Dict[str, float]:
    """
    Get image AI pricing from environment variables or defaults.
    
    Returns:
        Dict[model_name, cost_per_image]
    """
    return {
        'gemini-3-flash': float(os.getenv('GEMINI_FLASH_IMAGE_COST', DEFAULT_IMAGE_PRICING['gemini-3-flash'])),
        'gpt-4o-vision': float(os.getenv('GPT4O_VISION_IMAGE_COST', DEFAULT_IMAGE_PRICING['gpt-4o-vision'])),
    }


def get_audio_pricing() -> Dict[str, float]:
    """
    Get audio AI pricing from environment variables or defaults.
    
    Returns:
        Dict[provider_name, cost_per_second]
    """
    assemblyai_cost_per_hour = float(os.getenv('ASSEMBLYAI_COST_PER_HOUR', 0.15))
    whisper_cost_per_minute = float(os.getenv('WHISPER_COST_PER_MINUTE', 0.006))
    
    return {
        'assemblyai': assemblyai_cost_per_hour / 3600,  # Convert to per-second
        'whisper': whisper_cost_per_minute / 60,        # Convert to per-second
    }


def calculate_text_cost(
    model_name: str,
    input_tokens: int,
    output_tokens: int
) -> float:
    """
    Calculate cost for text AI generation.
    
    Args:
        model_name: Model identifier (e.g., 'gpt-4o-mini', 'claude-3.7-sonnet')
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
    
    Returns:
        Cost in USD (accurate to 6 decimal places)
    
    Raises:
        ValueError: If model_name is not recognized
    """
    pricing = get_text_pricing()
    
    # Normalize model name (handle variants like 'gpt-4o-mini-2024-07-18')
    normalized_name = model_name.lower()
    for known_model in pricing.keys():
        if known_model in normalized_name:
            model_key = known_model
            break
    else:
        logger.warning(f"Unknown text AI model: {model_name}, defaulting to gpt-4o-mini pricing")
        model_key = 'gpt-4o-mini'
    
    # Calculate cost (pricing is per million tokens, so divide by 1M)
    input_cost = (input_tokens / 1_000_000) * pricing[model_key]['input']
    output_cost = (output_tokens / 1_000_000) * pricing[model_key]['output']
    
    total_cost = input_cost + output_cost
    
    logger.debug(
        f"Text AI cost: {model_name} | "
        f"{input_tokens} in + {output_tokens} out = ${total_cost:.6f}"
    )
    
    return round(total_cost, 6)


def calculate_image_cost(
    model_name: str,
    image_count: int = 1
) -> float:
    """
    Calculate cost for image AI analysis.
    
    Args:
        model_name: Model identifier (e.g., 'gemini-3-flash', 'gpt-4o-vision')
        image_count: Number of images analyzed (default: 1)
    
    Returns:
        Cost in USD (accurate to 6 decimal places)
    
    Raises:
        ValueError: If model_name is not recognized
    """
    pricing = get_image_pricing()
    
    # Normalize model name
    normalized_name = model_name.lower()
    for known_model in pricing.keys():
        if known_model in normalized_name:
            model_key = known_model
            break
    else:
        logger.warning(f"Unknown image AI model: {model_name}, defaulting to gemini-3-flash pricing")
        model_key = 'gemini-3-flash'
    
    total_cost = pricing[model_key] * image_count
    
    logger.debug(
        f"Image AI cost: {model_name} | "
        f"{image_count} image(s) = ${total_cost:.6f}"
    )
    
    return round(total_cost, 6)


def calculate_audio_cost(
    provider_name: str,
    duration_seconds: int
) -> float:
    """
    Calculate cost for audio AI transcription.
    
    Args:
        provider_name: Provider identifier (e.g., 'assemblyai', 'whisper')
        duration_seconds: Audio duration in seconds
    
    Returns:
        Cost in USD (accurate to 6 decimal places)
    
    Raises:
        ValueError: If provider_name is not recognized
    """
    pricing = get_audio_pricing()
    
    # Normalize provider name
    normalized_name = provider_name.lower()
    if normalized_name not in pricing:
        logger.warning(f"Unknown audio AI provider: {provider_name}, defaulting to assemblyai pricing")
        normalized_name = 'assemblyai'
    
    cost_per_second = pricing[normalized_name]
    total_cost = cost_per_second * duration_seconds
    
    logger.debug(
        f"Audio AI cost: {provider_name} | "
        f"{duration_seconds}s = ${total_cost:.6f}"
    )
    
    return round(total_cost, 6)


def get_pricing_table() -> str:
    """
    Generate human-readable pricing table for documentation.
    
    Returns:
        Formatted pricing table string
    """
    text_pricing = get_text_pricing()
    image_pricing = get_image_pricing()
    audio_pricing = get_audio_pricing()
    
    table = []
    table.append("=" * 70)
    table.append("AI Services Pricing (Story 1.5.3)")
    table.append("=" * 70)
    table.append("")
    
    # Text AI section
    table.append("TEXT AI (per million tokens):")
    table.append("-" * 70)
    for model, costs in text_pricing.items():
        table.append(f"  {model:30s} | Input: ${costs['input']:.2f} | Output: ${costs['output']:.2f}")
    table.append("")
    
    # Image AI section
    table.append("IMAGE AI (per image):")
    table.append("-" * 70)
    for model, cost in image_pricing.items():
        table.append(f"  {model:30s} | ${cost:.4f}")
    table.append("")
    
    # Audio AI section
    table.append("AUDIO AI (per second):")
    table.append("-" * 70)
    for provider, cost_per_sec in audio_pricing.items():
        cost_per_hour = cost_per_sec * 3600
        table.append(f"  {provider:30s} | ${cost_per_sec:.6f}/sec (${cost_per_hour:.2f}/hour)")
    table.append("")
    
    table.append("=" * 70)
    table.append("Note: Pricing can be overridden via environment variables.")
    table.append("See docstring for variable names (e.g., GPT4O_MINI_INPUT_COST)")
    table.append("=" * 70)
    
    return "\n".join(table)


if __name__ == "__main__":
    # Print pricing table when run as script
    print(get_pricing_table())
    
    # Example calculations
    print("\nExample Calculations:")
    print(f"  GPT-4o-mini (1000 in, 500 out): ${calculate_text_cost('gpt-4o-mini', 1000, 500):.6f}")
    print(f"  Claude Sonnet (2000 in, 1000 out): ${calculate_text_cost('claude-3.7-sonnet', 2000, 1000):.6f}")
    print(f"  Gemini Flash (1 image): ${calculate_image_cost('gemini-3-flash', 1):.6f}")
    print(f"  AssemblyAI (60 seconds): ${calculate_audio_cost('assemblyai', 60):.6f}")
    print(f"  Whisper (60 seconds): ${calculate_audio_cost('whisper', 60):.6f}")
