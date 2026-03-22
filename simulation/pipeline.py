"""Scenario pipeline: validation -> WOFOST -> stress -> uncertainty."""

from __future__ import annotations

from typing import Any, Callable

from simulation.light import light_profile
from simulation.stress import effective_weather_inputs, stress_bundle
from simulation.uncertainty import run_uncertainty_analysis
from simulation.validation import validate_config

YieldRunner = Callable[[dict[str, Any]], float]


def simulate_scenario(
    config: dict[str, Any],
    *,
    run_wofost_yield: YieldRunner,
    n_samples: int = 150,
    seed: int = 42,
) -> dict[str, Any]:
    """Run deterministic + probabilistic scenario using external stress correction."""
    validation = validate_config(config)
    cfg = validation.config

    if not validation.is_valid:
        return {
            "validity_status": "invalid",
            "warnings": validation.warnings,
            "errors": validation.hard_errors,
            "risk_level": "invalid",
            "input_summary": cfg,
        }

    light = light_profile(cfg["luz"])
    stress = stress_bundle(cfg["ph"], cfg["ec"], cfg["solidos_disueltos"])
    env = effective_weather_inputs(
        temperature_c=cfg["temperatura_ambiente"],
        irrad_kj_m2_day=light.irrad_kj_m2_day,
        vap_kpa=1.5,
        stress=stress,
    )

    deterministic_cfg = {
        **cfg,
        "irrad": env["irrad_efectiva_kj_m2_day"],
        "temperatura_ambiente": env["temperatura_ambiente_efectiva"],
        "vap": env["vap_efectiva_kpa"],
    }
    base_yield = float(run_wofost_yield(deterministic_cfg))
    adjusted_yield = base_yield * stress.combined_factor

    uncertainty = run_uncertainty_analysis(
        base_config=cfg,
        run_wofost_yield=run_wofost_yield,
        n_samples=n_samples,
        seed=seed,
    )

    return {
        "validity_status": "valid",
        "warnings": validation.warnings,
        "errors": [],
        "risk_level": validation.risk_level,
        "input_summary": cfg,
        "light_profile": {
            "level": light.level,
            "photoperiod_hours": light.photoperiod_hours,
            "photoperiod_range_hours": list(light.photoperiod_range_hours),
            "irrad_kj_m2_day": light.irrad_kj_m2_day,
            "ppfd_umol_m2_s": light.ppfd_umol_m2_s,
        },
        "stress_factors": {
            "ph_factor": stress.ph_factor,
            "ec_factor": stress.ec_factor,
            "tds_factor": stress.tds_factor,
            "combined_factor": stress.combined_factor,
            "irrad_multiplier": stress.irrad_multiplier,
            "temperature_offset_c": stress.temperature_offset_c,
            "vap_multiplier": stress.vap_multiplier,
        },
        "effective_inputs_for_wofost": env,
        "base_yield": base_yield,
        "predicted_yield": adjusted_yield,
        "uncertainty": uncertainty,
    }
