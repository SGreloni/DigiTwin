"""Input normalization, validation and risk assessment."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any

from simulation.light import canonical_light_level


DEFAULT_CONFIG: dict[str, Any] = {
    "fecha_inicio": "2024-01-01",
    "dias_cultivo": 10,
    "temperatura_ambiente": 22.0,
    "luz": "media",
    "ph": 6.0,
    "ec": 2.0,
    "solidos_disueltos": 900.0,  # ppm (approx 0.5 conversion from EC when unknown)
}


@dataclass(frozen=True)
class ValidationResult:
    is_valid: bool
    hard_errors: list[str]
    warnings: list[str]
    risk_level: str
    config: dict[str, Any]


def _to_float(value: Any, field_name: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Field '{field_name}' must be numeric.") from exc


def normalize_config(config: dict[str, Any]) -> dict[str, Any]:
    """Merge defaults and normalize aliases/typing."""
    incoming = config or {}
    cfg = {**DEFAULT_CONFIG, **incoming}

    # Optional English aliases, useful when this is reused outside this notebook.
    if "temperature" in cfg and "temperatura_ambiente" not in incoming:
        cfg["temperatura_ambiente"] = cfg["temperature"]
    if "light_level" in cfg and "luz" not in incoming:
        cfg["luz"] = cfg["light_level"]
    if "start_date" in cfg and "fecha_inicio" not in incoming:
        cfg["fecha_inicio"] = cfg["start_date"]
    if "crop_duration_days" in cfg and "dias_cultivo" not in incoming:
        cfg["dias_cultivo"] = cfg["crop_duration_days"]

    cfg["temperatura_ambiente"] = _to_float(cfg["temperatura_ambiente"], "temperatura_ambiente")
    cfg["ph"] = _to_float(cfg["ph"], "ph")
    cfg["ec"] = _to_float(cfg["ec"], "ec")
    cfg["solidos_disueltos"] = _to_float(cfg["solidos_disueltos"], "solidos_disueltos")
    cfg["dias_cultivo"] = int(cfg["dias_cultivo"])

    # Canonicalized in English internally; original value is still accepted as input.
    canonical = canonical_light_level(cfg["luz"])
    cfg["luz"] = {"low": "baja", "medium": "media", "high": "alta"}[canonical]
    cfg["light_level"] = canonical

    if isinstance(cfg["fecha_inicio"], date):
        cfg["fecha_inicio"] = cfg["fecha_inicio"].isoformat()
    else:
        cfg["fecha_inicio"] = str(cfg["fecha_inicio"])

    return cfg


def validate_config(config: dict[str, Any]) -> ValidationResult:
    """Validate hydroponic scenario with hard constraints and soft warnings."""
    cfg = normalize_config(config)
    hard_errors: list[str] = []
    warnings: list[str] = []

    temp = float(cfg["temperatura_ambiente"])
    ph = float(cfg["ph"])
    ec = float(cfg["ec"])
    days = int(cfg["dias_cultivo"])

    # Hard constraints
    if ph < 4.0 or ph > 8.0:
        hard_errors.append("pH out of valid range [4.0, 8.0].")
    if ec > 6.0:
        hard_errors.append("EC out of valid range (must be <= 6.0 mS/cm).")
    if ec < 0.0:
        hard_errors.append("EC cannot be negative.")
    if temp < 5.0 or temp > 45.0:
        hard_errors.append("Temperature out of valid range [5, 45] C.")
    if days < 1 or days > 365:
        hard_errors.append("Crop duration must be between 1 and 365 days.")

    # Soft warnings
    if ph < 5.5 or ph > 6.5:
        warnings.append("pH outside recommended hydroponic range [5.5, 6.5].")
    if ec < 1.0 or ec > 3.0:
        warnings.append("EC outside recommended hydroponic range [1.0, 3.0] mS/cm.")
    if temp < 15.0 or temp > 30.0:
        warnings.append("Temperature outside preferred range [15, 30] C.")

    risk_score = 0
    risk_score += 100 if hard_errors else 0
    risk_score += len(warnings) * 18

    # Boundary proximity penalties (still valid but fragile)
    if 4.0 <= ph < 5.0 or 7.0 < ph <= 8.0:
        risk_score += 20
    if 0.0 <= ec < 0.8 or 4.5 < ec <= 6.0:
        risk_score += 20
    if 5.0 <= temp < 10.0 or 35.0 < temp <= 45.0:
        risk_score += 20

    risk_level = _risk_level(risk_score)
    return ValidationResult(
        is_valid=not hard_errors,
        hard_errors=hard_errors,
        warnings=warnings,
        risk_level=risk_level,
        config=cfg,
    )


def _risk_level(score: int) -> str:
    if score >= 100:
        return "invalid"
    if score >= 55:
        return "high"
    if score >= 25:
        return "medium"
    return "low"
