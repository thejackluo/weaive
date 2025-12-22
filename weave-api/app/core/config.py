import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env file explicitly into os.environ
# This ensures environment variables are available to os.getenv() calls throughout the app
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    logging.info(f"✅ Loaded environment from {env_path}")
else:
    logging.warning(f"⚠️  .env file not found at {env_path}")

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings from environment variables"""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Environment Configuration
    ENV: str = Field(
        default="development",
        description="Environment: development, staging, production",
    )

    # Supabase (optional for Week 0, required for Story 0.2+)
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_SERVICE_KEY: str = Field(
        default="", description="Supabase service role key"
    )
    SUPABASE_JWT_SECRET: str = Field(
        default="", description="Supabase JWT secret for token verification (Story 0.3+)"
    )

    # AI Providers (optional for Week 0, required for Story 0.6+)
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    ANTHROPIC_API_KEY: str = Field(default="", description="Anthropic API key")
    ASSEMBLYAI_API_KEY: str = Field(default="", description="AssemblyAI API key (Story 0.11)")

    @field_validator("SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET", mode="after")
    @classmethod
    def validate_supabase_credentials(cls, v: str, info) -> str:
        """Warn if Supabase credentials are missing in non-dev environments."""
        field_name = info.field_name
        env = info.data.get("ENV", "development")

        if not v and env in ["production", "prod", "staging"]:
            logger.error(
                f"❌ MISSING REQUIRED CONFIG: {field_name} is not set in {env} environment! "
                "This will cause database operations to fail."
            )
        elif not v and env == "development":
            story_requirement = "Story 0.3+" if field_name == "SUPABASE_JWT_SECRET" else "Story 0.2+"
            logger.warning(
                f"⚠️  {field_name} is not set. Database features will not work. "
                f"Set this in .env for {story_requirement}."
            )
        return v

    @field_validator("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "ASSEMBLYAI_API_KEY", mode="after")
    @classmethod
    def validate_ai_credentials(cls, v: str, info) -> str:
        """Warn if AI API keys are missing in non-dev environments."""
        field_name = info.field_name
        env = info.data.get("ENV", "development")

        if not v and env in ["production", "prod", "staging"]:
            logger.error(
                f"❌ MISSING REQUIRED CONFIG: {field_name} is not set in {env} environment! "
                "AI features will fail."
            )
        elif not v and env == "development":
            story_requirement = "Story 0.11+" if field_name == "ASSEMBLYAI_API_KEY" else "Story 0.6+"
            logger.warning(
                f"⚠️  {field_name} is not set. AI features will not work. "
                f"Set this in .env for {story_requirement}."
            )
        return v

    # CORS Configuration
    ALLOWED_ORIGINS: str = Field(
        default="*",
        description="Comma-separated list of allowed origins, '*' for all (dev only)",
    )


settings = Settings()
