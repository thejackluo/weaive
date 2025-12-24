"""
STT (Speech-to-Text) Configuration

Centralized configuration for STT rate limits, file sizes, and other constants.
This allows for easy subscription-tier customization in the future.
"""

from typing import Dict

# ═══════════════════════════════════════════════════════════════════════
# RATE LIMITS (per user, per day in user's timezone)
# ═══════════════════════════════════════════════════════════════════════

# Default rate limits (free tier)
DEFAULT_RATE_LIMITS: Dict[str, int] = {
    "max_requests": 50,  # Maximum transcription requests per day
    "max_minutes": 300,  # Maximum audio duration (5 hours) per day
}

# Future: Add subscription tier limits
# PREMIUM_RATE_LIMITS = {'max_requests': 200, 'max_minutes': 1200}
# ENTERPRISE_RATE_LIMITS = {'max_requests': -1, 'max_minutes': -1}  # Unlimited


# ═══════════════════════════════════════════════════════════════════════
# FILE SIZE LIMITS
# ═══════════════════════════════════════════════════════════════════════

MAX_AUDIO_FILE_SIZE_MB = 25  # Maximum audio file size in megabytes
MAX_AUDIO_FILE_SIZE_BYTES = MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024  # 25MB in bytes


# ═══════════════════════════════════════════════════════════════════════
# TIMEOUTS AND EXPIRATIONS
# ═══════════════════════════════════════════════════════════════════════

AUDIO_CONVERSION_TIMEOUT_SEC = 30  # ffmpeg timeout for audio conversion
SIGNED_URL_EXPIRATION_SEC = 3600  # 1 hour expiration for audio playback URLs


# ═══════════════════════════════════════════════════════════════════════
# QUERY LIMITS
# ═══════════════════════════════════════════════════════════════════════

MAX_RECORDING_HISTORY_LIMIT = 50  # Maximum recordings returned in history queries


# ═══════════════════════════════════════════════════════════════════════
# SUPPORTED LANGUAGES (ISO 639-1)
# ═══════════════════════════════════════════════════════════════════════

# AssemblyAI and Whisper support these languages
SUPPORTED_LANGUAGES = {
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "nl",
    "pl",
    "ru",
    "ja",
    "ko",
    "zh",
    "ar",
    "hi",
    "tr",
    "vi",
    "id",
    "th",
    "uk",
    "ro",
    "sv",
    "cs",
    "da",
    "fi",
    "no",
    "el",
    "hu",
    "he",
    "ms",
    "fa",
    "bn",
    "ta",
    "te",
    "mr",
    "gu",
}


# ═══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════


def get_rate_limits_for_user(user_tier: str = "free") -> Dict[str, int]:
    """
    Get rate limits based on user subscription tier.

    Args:
        user_tier: Subscription tier ('free', 'premium', 'enterprise')

    Returns:
        Dict with 'max_requests' and 'max_minutes' keys
    """
    # Future: Add tier-based logic
    # if user_tier == "premium":
    #     return PREMIUM_RATE_LIMITS
    # elif user_tier == "enterprise":
    #     return ENTERPRISE_RATE_LIMITS

    return DEFAULT_RATE_LIMITS
