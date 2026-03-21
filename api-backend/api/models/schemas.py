"""Pydantic schemas for request / response models."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────

class LuzLevel(str, Enum):
    baja = "baja"
    media = "media"
    alta = "alta"


# ── Simulation ───────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    crop_name: str = Field(default="barley", description="Crop name")
    variety_name: str = Field(
        default="Barley_Hydroponic_Forage_AR_Moderate",
        description="Variety within the crop file",
    )
    fecha_inicio: date = Field(default=date(2024, 1, 1), description="Start date")
    dias_cultivo: int = Field(default=10, ge=1, le=365, description="Duration (days)")
    temperatura_ambiente: float = Field(default=22.0, description="Ambient temp (°C)")
    luz: LuzLevel = Field(default=LuzLevel.media, description="Light level")
    ph: float = Field(default=6.0, ge=0, le=14, description="pH")
    ec: float = Field(default=2.0, ge=0, le=10, description="EC (mS/cm)")


class DailyResult(BaseModel):
    day: date
    DVS: Optional[float] = None
    LAI: Optional[float] = None
    TAGP: Optional[float] = None
    TWSO: Optional[float] = None
    TWLV: Optional[float] = None
    TWST: Optional[float] = None
    TWRT: Optional[float] = None
    TRA: Optional[float] = None
    RD: Optional[float] = None
    SM: Optional[float] = None
    WWLOW: Optional[float] = None
    RFTRA: Optional[float] = None


class SimulationSummary(BaseModel):
    final_DVS: Optional[float] = None
    final_LAI: Optional[float] = None
    final_TAGP: Optional[float] = None
    final_TWSO: Optional[float] = None


class SimulationResponse(BaseModel):
    simulation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    config: SimulationRequest
    summary: SimulationSummary
    daily_results: list[DailyResult]
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class SimulationListItem(BaseModel):
    simulation_id: str
    crop_name: str
    variety_name: str
    fecha_inicio: date
    dias_cultivo: int
    final_TWSO: Optional[float] = None
    created_at: datetime


class SimulationListResponse(BaseModel):
    total: int
    items: list[SimulationListItem]


# ── Crops ────────────────────────────────────────────────────────────────

class CropsResponse(BaseModel):
    crops: list[str]


class CropVarietiesResponse(BaseModel):
    crop_name: str
    varieties: list[str]


# ── Health ───────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
