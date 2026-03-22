"""Quick CLI demo to validate scenario pipeline with PCSE/WOFOST."""

from __future__ import annotations

import argparse
import json

from simulation.pipeline import simulate_scenario
from simulation.wofost_runner import run_wofost_yield


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ph", type=float, default=6.0)
    parser.add_argument("--ec", type=float, default=2.0)
    parser.add_argument("--temp", type=float, default=22.0)
    parser.add_argument("--luz", type=str, default="media")
    parser.add_argument("--dias", type=int, default=10)
    parser.add_argument("--samples", type=int, default=120)
    parser.add_argument("--tds", type=float, default=900.0)
    args = parser.parse_args()

    config = {
        "crop_name": "barley",
        "variety_name": "Barley_Hydroponic_Forage_AR_Moderate",
        "fecha_inicio": "2024-01-01",
        "dias_cultivo": args.dias,
        "temperatura_ambiente": args.temp,
        "luz": args.luz,
        "ph": args.ph,
        "ec": args.ec,
        "solidos_disueltos": args.tds,
    }
    out = simulate_scenario(
        config,
        run_wofost_yield=run_wofost_yield,
        n_samples=args.samples,
        seed=42,
    )
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
