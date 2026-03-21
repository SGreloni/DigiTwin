"""Health-check router."""

from fastapi import APIRouter

from api.config import settings
from api.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def health_check():
    return HealthResponse(status="ok", version=settings.APP_VERSION)
