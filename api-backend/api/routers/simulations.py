"""Simulations router: run, list, detail, delete, export."""

from __future__ import annotations

import io
import csv
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from api.models.schemas import (
    SimulationListItem,
    SimulationListResponse,
    SimulationRequest,
    SimulationResponse,
)
from api.services import simulation as sim_service
from api.services import storage

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
    storage.save(result)
    return result


@router.get("", response_model=SimulationListResponse)
def list_simulations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List stored simulations (paginated, newest first)."""
    total, items = storage.list_all(skip=skip, limit=limit)
    list_items = [
        SimulationListItem(
            simulation_id=s.simulation_id,
            crop_name=s.config.crop_name,
            variety_name=s.config.variety_name,
            fecha_inicio=s.config.fecha_inicio,
            dias_cultivo=s.config.dias_cultivo,
            final_TWSO=s.summary.final_TWSO,
            created_at=s.created_at,
        )
        for s in items
    ]
    return SimulationListResponse(total=total, items=list_items)


@router.get("/{simulation_id}", response_model=SimulationResponse)
def get_simulation(simulation_id: str):
    """Get full detail of a stored simulation."""
    sim = storage.get(simulation_id)
    if sim is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


@router.delete("/{simulation_id}", status_code=204)
def delete_simulation(simulation_id: str):
    """Delete a stored simulation."""
    if not storage.delete(simulation_id):
        raise HTTPException(status_code=404, detail="Simulation not found")
    return None


@router.get("/{simulation_id}/export")
def export_simulation(simulation_id: str):
    """Export simulation daily results as CSV."""
    sim = storage.get(simulation_id)
    if sim is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    output = io.StringIO()
    writer = csv.writer(output)
    columns = [
        "day", "DVS", "LAI", "TAGP", "TWSO", "TWLV",
        "TWST", "TWRT", "TRA", "RD", "SM", "WWLOW", "RFTRA",
    ]
    writer.writerow(columns)
    for row in sim.daily_results:
        writer.writerow([getattr(row, col) for col in columns])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="simulation_{simulation_id}.csv"'
        },
    )
