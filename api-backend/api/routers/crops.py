"""Crops catalogue router."""

from fastapi import APIRouter, HTTPException

from api.models.schemas import CropVarietiesResponse, CropsResponse
from api.services import crop as crop_service

router = APIRouter(prefix="/crops", tags=["crops"])


@router.get("", response_model=CropsResponse)
def list_crops():
    """Return the list of available crop names."""
    crops = crop_service.get_available_crops()
    return CropsResponse(crops=crops)


@router.get("/{crop_name}/varieties", response_model=CropVarietiesResponse)
def list_varieties(crop_name: str):
    """Return variety names for a given crop."""
    available = crop_service.get_available_crops()
    if crop_name not in available:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found")

    varieties = crop_service.get_varieties(crop_name)
    if not varieties:
        raise HTTPException(
            status_code=404,
            detail=f"No varieties found for crop '{crop_name}'",
        )

    return CropVarietiesResponse(crop_name=crop_name, varieties=varieties)
