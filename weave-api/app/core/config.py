from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # AI Providers
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # CORS Configuration
    ALLOWED_ORIGINS: str = "*"  # Comma-separated list of origins, "*" for all (dev only)

    class Config:
        env_file = ".env"


settings = Settings()
