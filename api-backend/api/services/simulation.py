"""PCSE / WOFOST simulation service.

Refactored from the notebook ``02 Running with custom input data.ipynb``.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

from api.config import settings
from api.models.schemas import (
    DailyResult,
    SimulationRequest,
    SimulationResponse,
    SimulationSummary,
)


# ── Helper functions (from notebook) ─────────────────────────────────────

def _luz_a_irrad(luz: str) -> float:
    """Map a light level string to irradiance (kJ m⁻² d⁻¹)."""
    mapa = {
        "baja": 8000.0,
        "media": 14000.0,
        "alta": 20000.0,
    }
    return mapa.get(str(luz).lower(), 14000.0)


def _crear_weather_sintetico(
    data_dir: Path,
    fecha_inicio: str,
    dias_cultivo: int,
    temperatura_ambiente: float,
    luz: str,
    lat: float = -34.60,
    lon: float = -58.38,
    elev: float = 25.0,
    nombre_archivo: str = "weather_hydro.csv",
) -> Path:
    """Generate a synthetic daily-weather CSV for PCSE's CSVWeatherDataProvider."""
    fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
    irrad = _luz_a_irrad(luz)

    rows = []
    for i in range(dias_cultivo):
        dia = fecha_inicio_dt + timedelta(days=i)
        rows.append(
            {
                "DAY": dia.strftime("%Y-%m-%d"),
                "IRRAD": irrad,
                "TMIN": temperatura_ambiente - 2.0,
                "TMAX": temperatura_ambiente + 2.0,
                "VAP": 1.5,
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
        f.write(
            'Description = "Synthetic daily weather for indoor hydroponic barley"\n'
        )
        f.write('Source = "User-defined defaults/inputs"\n')
        f.write('Contact = ""\n')
        f.write(
            f"Longitude = {lon}; Latitude = {lat}; Elevation = {elev}; "
            f"AngstromA = 0.18; AngstromB = 0.55; HasSunshine = False\n"
        )
        f.write("## Daily weather observations (missing values are NaN)\n")
        df.to_csv(f, index=False)

    return weather_path


def _crear_agromanagement(
    fecha_inicio_str: str = "2024-01-01",
    dias_cultivo: int = 10,
    crop_name: str = "barley",
    variety_name: str = "Barley_Hydroponic_Forage_AR_Moderate",
) -> dict:
    """Build the agro-management dict expected by PCSE."""
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


# ── Main entry point ─────────────────────────────────────────────────────

def run_simulation(req: SimulationRequest) -> SimulationResponse:
    """Execute a PCSE/WOFOST simulation and return structured results."""

    # --- late imports to avoid heavy load at module level ----------------
    from pcse.base import ParameterProvider
    from pcse.input import CSVWeatherDataProvider, YAMLCropDataProvider
    from pcse.input import CABOFileReader, WOFOST72SiteDataProvider
    from pcse.models import Wofost72_PP

    data_dir = settings.DATA_DIR
    fecha_str = req.fecha_inicio.isoformat()

    # 1. Crop parameters
    cropd = YAMLCropDataProvider(fpath=data_dir / "crop", force_reload=True)
    cropd.set_active_crop(req.crop_name, req.variety_name)

    # 2. Soil parameters
    soilfile = data_dir / "soil" / "ec3.soil"
    soild = CABOFileReader(soilfile)

    # 3. Site parameters
    sited = WOFOST72SiteDataProvider(WAV=14.0, SSI=0.0, SSMAX=0.0, SMLIM=0.45)

    # 4. Bundle parameters
    params = ParameterProvider(cropdata=cropd, soildata=soild, sitedata=sited)

    # 5. Agromanagement
    agromanagement = _crear_agromanagement(
        fecha_inicio_str=fecha_str,
        dias_cultivo=req.dias_cultivo,
        crop_name=req.crop_name,
        variety_name=req.variety_name,
    )

    # 6. Synthetic weather
    weatherfile = _crear_weather_sintetico(
        data_dir=data_dir,
        fecha_inicio=fecha_str,
        dias_cultivo=req.dias_cultivo,
        temperatura_ambiente=req.temperatura_ambiente,
        luz=req.luz.value,
    )

    weatherdataprovider = CSVWeatherDataProvider(
        weatherfile, dateformat="%Y-%m-%d", force_reload=True
    )

    # 7. Run model
    wofsim = Wofost72_PP(params, weatherdataprovider, agromanagement)
    wofsim.run_till_terminate()

    # 8. Collect output
    df = pd.DataFrame(wofsim.get_output())
    df = df.set_index("day")

    daily: list[DailyResult] = []
    for day_idx, row in df.iterrows():
        daily.append(
            DailyResult(
                day=day_idx,
                DVS=row.get("DVS"),
                LAI=row.get("LAI"),
                TAGP=row.get("TAGP"),
                TWSO=row.get("TWSO"),
                TWLV=row.get("TWLV"),
                TWST=row.get("TWST"),
                TWRT=row.get("TWRT"),
                TRA=row.get("TRA"),
                RD=row.get("RD"),
                SM=row.get("SM"),
                WWLOW=row.get("WWLOW"),
                RFTRA=row.get("RFTRA"),
            )
        )

    last = df.iloc[-1] if not df.empty else {}
    summary = SimulationSummary(
        final_DVS=last.get("DVS"),
        final_LAI=last.get("LAI"),
        final_TAGP=last.get("TAGP"),
        final_TWSO=last.get("TWSO"),
    )

    return SimulationResponse(
        config=req,
        summary=summary,
        daily_results=daily,
    )
