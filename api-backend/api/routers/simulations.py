"""Simulations router: run, list, detail, delete, export."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from api.models.schemas import (
    SimulationRequest,
    SimulationResponse,
)
from api.services import simulation as sim_service

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.post("", response_model=SimulationResponse, status_code=201)
def run_simulation(req: SimulationRequest):
    """Run a PCSE/WOFOST simulation and store the result."""
    try:
        result = sim_service.run_simulation(req)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {exc}",
        )
    return result



