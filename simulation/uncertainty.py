"""Uncertainty propagation helpers (Monte Carlo)."""

from __future__ import annotations

from dataclasses import dataclass
from random import Random
from statistics import mean, median, pstdev
from typing import Any, Callable

from simulation.light import light_profile
from simulation.stress import effective_weather_inputs, stress_bundle
from simulation.validation import validate_config

YieldRunner = Callable[[dict[str, Any]], float]


@dataclass(frozen=True)
class UncertaintySpec:
    temperature_sigma_c: float = 1.0
    ph_sigma: float = 0.15
    ec_sigma: float = 0.20
    solids_sigma_ppm: float = 80.0
    model_noise_sigma_rel: float = 0.04


def _quantile(values: list[float], q: float) -> float:
    if not values:
        return float("nan")
    sorted_values = sorted(values)
    if len(sorted_values) == 1:
        return sorted_values[0]
    idx = (len(sorted_values) - 1) * q
    lo = int(idx)
    hi = min(lo + 1, len(sorted_values) - 1)
    frac = idx - lo
    return sorted_values[lo] * (1.0 - frac) + sorted_values[hi] * frac


def _sample_config(base: dict[str, Any], spec: UncertaintySpec, rng: Random) -> dict[str, Any]:
    cfg = dict(base)
    cfg["temperatura_ambiente"] = float(base["temperatura_ambiente"]) + rng.gauss(
        0.0, spec.temperature_sigma_c
    )
    cfg["ph"] = float(base["ph"]) + rng.gauss(0.0, spec.ph_sigma)
    cfg["ec"] = max(0.0, float(base["ec"]) + rng.gauss(0.0, spec.ec_sigma))
    cfg["solidos_disueltos"] = max(
        0.0, float(base["solidos_disueltos"]) + rng.gauss(0.0, spec.solids_sigma_ppm)
    )
    return cfg


def run_uncertainty_analysis(
    *,
    base_config: dict[str, Any],
    run_wofost_yield: YieldRunner,
    n_samples: int = 200,
    seed: int = 42,
    spec: UncertaintySpec | None = None,
) -> dict[str, Any]:
    """Run Monte Carlo around base config and return confidence ranges."""
    if n_samples <= 0:
        return {
            "n_samples": 0,
            "n_valid_samples": 0,
            "n_invalid_samples": 0,
            "stats": {},
            "risk_probabilities": {},
            "samples": {},
        }

    spec = spec or UncertaintySpec()
    rng = Random(seed)

    adjusted_yields: list[float] = []
    base_yields: list[float] = []
    stress_factors: list[float] = []
    invalid_samples = 0

    for _ in range(n_samples):
        sampled = _sample_config(base_config, spec, rng)
        validation = validate_config(sampled)
        if not validation.is_valid:
            invalid_samples += 1
            continue

        cfg = validation.config
        light = light_profile(cfg["luz"], rng=rng)
        stress = stress_bundle(cfg["ph"], cfg["ec"], cfg["solidos_disueltos"])
        env = effective_weather_inputs(
            temperature_c=cfg["temperatura_ambiente"],
            irrad_kj_m2_day=light.irrad_kj_m2_day,
            vap_kpa=1.5,
            stress=stress,
        )

        sim_cfg = {
            **cfg,
            "irrad": env["irrad_efectiva_kj_m2_day"],
            "temperatura_ambiente": env["temperatura_ambiente_efectiva"],
            "vap": env["vap_efectiva_kpa"],
        }

        base_yield = float(run_wofost_yield(sim_cfg))
        model_noise = rng.gauss(0.0, spec.model_noise_sigma_rel)
        adjusted = base_yield * stress.combined_factor * (1.0 + model_noise)

        base_yields.append(base_yield)
        adjusted_yields.append(max(0.0, adjusted))
        stress_factors.append(stress.combined_factor)

    if not adjusted_yields:
        return {
            "n_samples": n_samples,
            "n_valid_samples": 0,
            "n_invalid_samples": invalid_samples,
            "stats": {},
            "risk_probabilities": {},
            "samples": {},
        }

    p10 = _quantile(adjusted_yields, 0.10)
    p50 = _quantile(adjusted_yields, 0.50)
    p90 = _quantile(adjusted_yields, 0.90)
    p05 = _quantile(adjusted_yields, 0.05)
    p95 = _quantile(adjusted_yields, 0.95)

    low_threshold = p50 * 0.80
    low_prob = sum(y < low_threshold for y in adjusted_yields) / len(adjusted_yields)

    return {
        "n_samples": n_samples,
        "n_valid_samples": len(adjusted_yields),
        "n_invalid_samples": invalid_samples,
        "stats": {
            "mean": mean(adjusted_yields),
            "median": median(adjusted_yields),
            "std": pstdev(adjusted_yields) if len(adjusted_yields) > 1 else 0.0,
            "p05": p05,
            "p10": p10,
            "p50": p50,
            "p90": p90,
            "p95": p95,
            "confidence_range_80": [p10, p90],
            "confidence_range_90": [p05, p95],
            "mean_base_yield": mean(base_yields),
            "mean_stress_factor": mean(stress_factors),
        },
        "risk_probabilities": {
            "prob_adjusted_yield_below_80pct_median": low_prob,
            "prob_invalid_input_sample": invalid_samples / n_samples,
        },
        "samples": {
            "adjusted_yields": adjusted_yields,
            "base_yields": base_yields,
            "stress_factors": stress_factors,
        },
    }
