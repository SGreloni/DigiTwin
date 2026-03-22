"""Shared WOFOST helpers for notebook, scripts and future integrations."""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import pandas as pd
from pcse.base import ParameterProvider
from pcse.input import CABOFileReader, CSVWeatherDataProvider, WOFOST72SiteDataProvider
from pcse.input import YAMLCropDataProvider
from pcse.models import Wofost72_PP


def resolve_project_root(start: Path | None = None) -> Path:
    """Find the repository root by scanning parents for required project markers."""
    current = (start or Path.cwd()).resolve()
    candidates = [current, *current.parents]
    for candidate in candidates:
        has_simulation = (candidate / "simulation" / "__init__.py").exists()
        has_data = (candidate / "api-backend" / "data" / "soil" / "ec3.soil").exists()
        if has_simulation and has_data:
            return candidate
    raise FileNotFoundError(
        "Could not locate project root containing simulation/ and api-backend/data/soil/ec3.soil."
    )


def resolve_data_dir(start: Path | None = None) -> Path:
    """Return canonical PCSE data directory, with a small fallback search."""
    root = resolve_project_root(start)
    candidates = [
        root / "api-backend" / "data",
        root / "data",
    ]
    for candidate in candidates:
        if (candidate / "soil" / "ec3.soil").exists():
            return candidate
    raise FileNotFoundError(
        "No valid data directory found. Expected api-backend/data or data with soil/ec3.soil."
    )


def crear_agromanagement(
    fecha_inicio_str: str,
    dias_cultivo: int,
    crop_name: str,
    variety_name: str,
) -> dict[str, Any]:
    fecha_inicio = datetime.strptime(fecha_inicio_str, "%Y-%m-%d").date()
    fecha_fin = fecha_inicio + timedelta(days=dias_cultivo - 1)
    return {
        "Version": "1.0.0",
        "AgroManagement": [
            {
                fecha_inicio: {
                    "CropCalendar": {
                        "crop_name": crop_name,
                        "variety_name": variety_name,
                        "crop_start_date": fecha_inicio,
                        "crop_start_type": "sowing",
                        "crop_end_date": fecha_fin,
                        "crop_end_type": "harvest",
                        "max_duration": dias_cultivo,
                    },
                    "TimedEvents": None,
                    "StateEvents": None,
                }
            }
        ],
    }


def crear_weather_sintetico_custom(
    *,
    data_dir: Path,
    fecha_inicio: str,
    dias_cultivo: int,
    temperatura_ambiente: float,
    irrad: float,
    vap: float,
    nombre_archivo: str = "weather_hydro_demo.csv",
) -> Path:
    fecha_inicio_dt = datetime.strptime(str(fecha_inicio), "%Y-%m-%d").date()
    rows = []
    for i in range(int(dias_cultivo)):
        dia = fecha_inicio_dt + timedelta(days=i)
        rows.append(
            {
                "DAY": dia.strftime("%Y%m%d"),
                "IRRAD": float(irrad),
                "TMIN": float(temperatura_ambiente) - 2.0,
                "TMAX": float(temperatura_ambiente) + 2.0,
                "VAP": float(vap),
                "WIND": 0.5,
                "RAIN": 0.0,
                "SNOWDEPTH": 0.0,
            }
        )

    df = pd.DataFrame(rows)
    weather_path = data_dir / "meteo" / nombre_archivo
    weather_path.parent.mkdir(parents=True, exist_ok=True)

    with open(weather_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("## Site Characteristics\n")
        f.write('Country = "Argentina"\n')
        f.write('Station = "SyntheticIndoorHydro"\n')
        f.write('Description = "Synthetic daily weather for indoor hydroponic barley"\n')
        f.write('Source = "Scenario demo/notebook"\n')
        f.write('Contact = ""\n')
        f.write(
            "Longitude = -58.38; Latitude = -34.6; Elevation = 25.0; "
            "AngstromA = 0.18; AngstromB = 0.55; HasSunshine = False\n"
        )
        f.write("## Daily weather observations (missing values are NaN)\n")
        df.to_csv(f, index=False)
    return weather_path


def run_wofost_output(config: dict[str, Any], data_dir: Path | None = None) -> pd.DataFrame:
    """Run WOFOST with effective inputs and return the full daily output frame."""
    data_dir = resolve_data_dir(data_dir or Path.cwd())
    crop_name = config.get("crop_name", "barley")
    variety_name = config.get("variety_name", "Barley_Hydroponic_Forage_AR_Moderate")
    fecha_inicio = str(config.get("fecha_inicio", "2024-01-01"))
    dias_cultivo = int(config.get("dias_cultivo", 10))
    temperatura_ambiente = float(config.get("temperatura_ambiente", 22.0))
    irrad = float(config.get("irrad", 14000.0))
    vap = float(config.get("vap", 1.5))

    cropd = YAMLCropDataProvider(fpath=data_dir / "crop", force_reload=True)
    cropd.set_active_crop(crop_name, variety_name)
    soild = CABOFileReader(data_dir / "soil" / "ec3.soil")
    sited = WOFOST72SiteDataProvider(WAV=14.0, SSI=0.0, SSMAX=0.0, SMLIM=0.45)
    params = ParameterProvider(cropdata=cropd, soildata=soild, sitedata=sited)
    agromanagement = crear_agromanagement(fecha_inicio, dias_cultivo, crop_name, variety_name)
    weatherfile = crear_weather_sintetico_custom(
        data_dir=data_dir,
        fecha_inicio=fecha_inicio,
        dias_cultivo=dias_cultivo,
        temperatura_ambiente=temperatura_ambiente,
        irrad=irrad,
        vap=vap,
    )
    weather = CSVWeatherDataProvider(weatherfile, dateformat="%Y%m%d", force_reload=True)
    wofsim = Wofost72_PP(params, weather, agromanagement)
    wofsim.run_till_terminate()

    df = pd.DataFrame(wofsim.get_output())
    if not df.empty and "day" in df.columns:
        df = df.set_index("day")
    return df


def run_wofost_yield(config: dict[str, Any], kpi: str = "TWSO") -> float:
    """Run WOFOST and return the last value for the selected KPI."""
    df = run_wofost_output(config)
    if df.empty:
        return 0.0
    return float(df.iloc[-1].get(kpi, 0.0) or 0.0)
