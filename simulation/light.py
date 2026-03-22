"""Light-level mapping helpers for synthetic indoor weather generation."""

from __future__ import annotations

from dataclasses import dataclass
from random import Random


_LEVEL_ALIASES = {
    "low": "low",
    "baja": "low",
    "medium": "medium",
    "media": "medium",
    "high": "high",
    "alta": "high",
}


@dataclass(frozen=True)
class LightProfile:
    level: str
    photoperiod_hours: float
    irrad_kj_m2_day: float
    photoperiod_range_hours: tuple[float, float]
    ppfd_umol_m2_s: float


def canonical_light_level(level: str) -> str:
    """Return canonical light level: low, medium or high."""
    key = str(level).strip().lower()
    if key not in _LEVEL_ALIASES:
        raise ValueError(
            f"Unsupported light level '{level}'. Use low/medium/high or baja/media/alta."
        )
    return _LEVEL_ALIASES[key]


def light_profile(level: str, rng: Random | None = None) -> LightProfile:
    """Map categorical light to photoperiod + irradiance assumptions.

    If *rng* is provided, photoperiod is sampled uniformly in the range.
    Otherwise the midpoint is used for deterministic behavior.
    """
    canonical = canonical_light_level(level)

    profiles: dict[str, dict[str, float | tuple[float, float]]] = {
        "low": {
            "photoperiod_range_hours": (8.0, 10.0),
            "irrad_kj_m2_day": 8000.0,
            "ppfd_umol_m2_s": 140.0,
        },
        "medium": {
            "photoperiod_range_hours": (12.0, 14.0),
            "irrad_kj_m2_day": 14000.0,
            "ppfd_umol_m2_s": 230.0,
        },
        "high": {
            "photoperiod_range_hours": (16.0, 18.0),
            "irrad_kj_m2_day": 20000.0,
            "ppfd_umol_m2_s": 320.0,
        },
    }
    profile = profiles[canonical]
    period_min, period_max = profile["photoperiod_range_hours"]  # type: ignore[index]
    photoperiod = (
        rng.uniform(period_min, period_max)
        if rng is not None
        else (period_min + period_max) / 2.0
    )

    return LightProfile(
        level=canonical,
        photoperiod_hours=photoperiod,
        irrad_kj_m2_day=float(profile["irrad_kj_m2_day"]),
        photoperiod_range_hours=(period_min, period_max),
        ppfd_umol_m2_s=float(profile["ppfd_umol_m2_s"]),
    )
