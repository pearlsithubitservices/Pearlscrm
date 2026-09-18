from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/", response_model=HealthResponse)
@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Liveness check — confirms the Python service is running."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        version="0.1.0",
    )
