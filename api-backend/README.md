# DigiTwin API Backend

FastAPI backend for the DigiTwin hydroponic crop-simulation platform, powered by [PCSE/WOFOST](https://pcse.readthedocs.io/).

---

## Local Development

### 1. Create a virtual environment

```bash
cd api-backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the development server

```bash
uvicorn api.main:app --reload --port 8000
```

The API is now available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 4. Run tests

```bash
pytest tests/ -v
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `<project>/data` | Path to the data directory |
| `DEBUG` | `false` | Enable debug logging |
| `CORS_ORIGINS` | `["*"]` | JSON array of allowed CORS origins |

You can create a `.env` file in this directory to override defaults:

```env
DATA_DIR=/absolute/path/to/data
DEBUG=true
```

---

## Project Layout

```
api-backend/
├── api/
│   ├── main.py               # FastAPI app + CORS + routers
│   ├── config.py              # Settings (pydantic-settings)
│   ├── models/
│   │   └── schemas.py         # Pydantic request/response models
│   ├── services/
│   │   ├── crop.py            # Crop/variety catalogue
│   │   ├── simulation.py      # PCSE/WOFOST simulation engine
│   │   └── storage.py         # In-memory simulation store
│   └── routers/
│       ├── health.py          # GET /api/v1/health
│       ├── crops.py           # Crops catalogue endpoints
│       └── simulations.py     # Simulation CRUD + CSV export
├── tests/
│   ├── conftest.py            # Shared fixtures
│   ├── test_health.py
│   ├── test_crops.py
│   └── test_simulations.py
├── data/                      # PCSE data files
├── requirements.txt
├── Dockerfile
└── README.md                  # ← you are here
```

## Docker

To build and run as a standalone container:

```bash
docker build -t digitwin-backend .
docker run -p 8000:8000 digitwin-backend
```

Or use `docker compose` from the project root (see root `README.md`).
