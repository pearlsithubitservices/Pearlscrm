from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

   

    APP_NAME: str = "WhatsApp AI Backend"
    ENVIRONMENT: str = "development"

    

    CRM_BASE_URL: str

    CRM_API_TOKEN: str | None = None

    CRM_REQUEST_TIMEOUT_SECONDS: float = 10.0

    

    GEMINI_API_KEY: str

    GEMINI_MODEL: str = "gemini-3.6-flash"

    GEMINI_REQUEST_TIMEOUT_SECONDS: float = 20.0

   

    WHATSAPP_ACCESS_TOKEN: str | None = None

    WHATSAPP_PHONE_NUMBER_ID: str | None = None

    WHATSAPP_VERIFY_TOKEN: str | None = None

    WHATSAPP_API_VERSION: str = "v23.0"

 

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()