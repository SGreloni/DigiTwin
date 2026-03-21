"""Crop catalogue service.

Reads the available crops from ``data/crop/crops.yaml`` and the varieties
for a given crop from ``data/crop/{crop_name}.yaml``.
"""

from pathlib import Path

import yaml

from api.config import settings


def get_available_crops() -> list[str]:
    """Return the list of crop names from ``crops.yaml``."""
    crops_file = settings.DATA_DIR / "crop" / "crops.yaml"
    with open(crops_file, "r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    return data.get("available_crops", [])


def get_varieties(crop_name: str) -> list[str]:
    """Return variety names for *crop_name*.

    The YAML file has the structure::

        CropParameters:
            ...
            Varieties:
                Variety_Name_1: ...
                Variety_Name_2: ...

    We return the keys under ``Varieties``.
    """
    crop_file: Path = settings.DATA_DIR / "crop" / f"{crop_name}.yaml"
    if not crop_file.exists():
        return []

    with open(crop_file, "r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)

    crop_params = data.get("CropParameters", {})
    varieties_section = crop_params.get("Varieties", {})
    if varieties_section is None:
        return []
    return list(varieties_section.keys())
