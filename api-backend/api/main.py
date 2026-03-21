"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import settings
from api.routers import crops, health, simulations

app = FastAPI(
    title="DigiTwin API",
    description="Digital-twin backend for hydroponic crop simulation using PCSE/WOFOST.",
    version=settings.APP_VERSION,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
PREFIX = "/api/v1"
app.include_router(health.router, prefix=PREFIX)
app.include_router(crops.router, prefix=PREFIX)
app.include_router(simulations.router, prefix=PREFIX)
