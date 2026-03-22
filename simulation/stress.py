"""Post-WOFOST stress modeling and stress-to-input translation."""

from __future__ import annotations

from dataclasses import dataclass
from math import exp, isfinite, log
from typing import Any


def _smooth_penalty(
    value: float,
    optimum_min: float,
    optimum_max: float,
    valid_min: float,
    valid_max: float,
) -> float:
    """Smooth penalty in [0, 1] with a 1.0 plateau in the optimum range."""
    if not isfinite(value):
        return 0.0
    if value < valid_min or value > valid_max:
        return 0.0
    if optimum_min <= value <= optimum_max:
        return 1.0

    if value < optimum_min:
        distance = optimum_min - value
        span = max(optimum_min - valid_min, 1e-6)
    else:
        distance = value - optimum_max
        span = max(valid_max - optimum_max, 1e-6)

    # exp(-k*x^2): smooth decline, keeps derivative continuous at the optimum border.
    x = distance / span
    k = 4.0
    penalty = exp(-k * x * x)
    return max(0.0, min(1.0, penalty))


def penalty_ph(ph: float) -> float:
    return _smooth_penalty(
        value=float(ph),
        optimum_min=5.5,
        optimum_max=6.5,
        valid_min=4.0,
        valid_max=8.0,
    )


def penalty_ec(ec: float) -> float:
    return _smooth_penalty(
        value=float(ec),
        optimum_min=1.0,
        optimum_max=3.0,
        valid_min=0.0,
        valid_max=6.0,
    )


def penalty_tds(solids_ppm: float | None) -> float:
    """Optional solids penalty (TDS proxy)."""
    if solids_ppm is None:
        return 1.0
    return _smooth_penalty(
        value=float(solids_ppm),
        optimum_min=700.0,
        optimum_max=1200.0,
        valid_min=200.0,
        valid_max=2500.0,
    )


def combined_penalty(ph: float, ec: float, solids_ppm: float | None = None) -> float:
    """Weighted geometric mean so one strong stressor can dominate."""
    f_ph = penalty_ph(ph)
    f_ec = penalty_ec(ec)
    f_tds = penalty_tds(solids_ppm)

    # f = exp(sum(w_i*ln(f_i))) prevents one variable with tiny penalty from being hidden.
    terms = [(0.50, f_ph), (0.40, f_ec), (0.10, f_tds)]
    acc = 0.0
    for weight, factor in terms:
        acc += weight * log(max(factor, 1e-9))
    return max(0.0, min(1.0, exp(acc)))


@dataclass(frozen=True)
class StressBundle:
    ph_factor: float
    ec_factor: float
    tds_factor: float
    combined_factor: float
    irrad_multiplier: float
    temperature_offset_c: float
    vap_multiplier: float


def stress_bundle(ph: float, ec: float, solids_ppm: float | None = None) -> StressBundle:
    """Translate chemistry stress to multiplicative corrections.

    This does not alter WOFOST internals; it adjusts effective weather-driver proxies
    and applies a final post-simulation yield penalty.
    """
    f_ph = penalty_ph(ph)
    f_ec = penalty_ec(ec)
    f_tds = penalty_tds(solids_ppm)
    f_all = combined_penalty(ph, ec, solids_ppm)

    # Stress proxy -> reduced effective assimilation conditions
    stress_gap = 1.0 - f_all
    irrad_multiplier = 1.0 - 0.30 * stress_gap
    temperature_offset_c = -2.5 * stress_gap
    vap_multiplier = 1.0 + 0.18 * stress_gap

    return StressBundle(
        ph_factor=f_ph,
        ec_factor=f_ec,
        tds_factor=f_tds,
        combined_factor=f_all,
        irrad_multiplier=irrad_multiplier,
        temperature_offset_c=temperature_offset_c,
        vap_multiplier=vap_multiplier,
    )


def effective_weather_inputs(
    temperature_c: float,
    irrad_kj_m2_day: float,
    vap_kpa: float,
    stress: StressBundle,
) -> dict[str, Any]:
    """Map stress into effective weather inputs consumed by WOFOST wrappers."""
    t_eff = float(temperature_c) + stress.temperature_offset_c
    irrad_eff = float(irrad_kj_m2_day) * stress.irrad_multiplier
    vap_eff = float(vap_kpa) * stress.vap_multiplier
    return {
        "temperatura_ambiente_efectiva": t_eff,
        "irrad_efectiva_kj_m2_day": irrad_eff,
        "vap_efectiva_kpa": vap_eff,
    }
