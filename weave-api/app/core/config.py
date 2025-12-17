from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Supabase (optional for Week 0, required for Story 0.2+)
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_SERVICE_KEY: str = Field(
        default="", description="Supabase service role key"
    )

    # AI Providers (optional for Week 0, required for Story 0.6+)
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    ANTHROPIC_API_KEY: str = Field(default="", description="Anthropic API key")

    # CORS Configuration
    ALLOWED_ORIGINS: str = Field(
        default="*",
        description="Comma-separated list of allowed origins, '*' for all (dev only)",
    )

    class Config:
        env_file = ".env"


settings = Settings()
