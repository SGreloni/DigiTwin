# DigiTwin

**Digital Twin for Hydroponic Crop Simulation**

DigiTwin is a digital-twin platform for hydroponic barley (and other crop) cultivation. It wraps the [PCSE/WOFOST](https://pcse.readthedocs.io/) crop-simulation engine behind a REST API, enabling mobile and web applications to configure, run, and visualise growth simulations.

---

## Architecture

```
┌─────────────┐              ┌─────────────────┐
│  Mobile App  │ ── REST ──▶ │  FastAPI Backend │
│  (frontend)  │ ◀── JSON ── │  (api-backend/)  │
└─────────────┘              └────────┬────────┘
                                      │
                                      ▼
                               PCSE/WOFOST Engine
```

- **Backend** — FastAPI (Python) inside `api-backend/`.
- **Frontend** — Placeholder (not yet implemented; see `frontend-reqs.md`).
- **Simulation engine** — [PCSE 6.x](https://pypi.org/project/pcse/) running the WOFOST 7.2 potential-production model.

## API Endpoints

Full specification in [`api-endpoints.md`](api-endpoints.md). Quick overview:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/crops` | List available crops |
| `GET` | `/api/v1/crops/{name}/varieties` | Varieties for a crop |
| `POST` | `/api/v1/simulations` | Run a simulation |
| `GET` | `/api/v1/simulations` | List history |
| `GET` | `/api/v1/simulations/{id}` | Simulation detail |
| `DELETE` | `/api/v1/simulations/{id}` | Delete simulation |
| `GET` | `/api/v1/simulations/{id}/export` | Export CSV |

## Documentation

| File | Contents |
|------|----------|
| [`frontend-reqs.md`](frontend-reqs.md) | Mobile-app feature requirements |
| [`api-endpoints.md`](api-endpoints.md) | REST API specification |
| [`api-backend/README.md`](api-backend/README.md) | Backend local development guide |

---

## Prerequisites

- **Docker** ≥ 24 and **Docker Compose** ≥ 2 (for containerised mode).
- Or **Python 3.11+** (for local development — see `api-backend/README.md`).

## Running with Docker Compose

```bash
# Clone the repo
git clone <repo-url> && cd DigiTwin

# Build and start
docker compose up --build

# The API is available at:
#   http://localhost:8000/docs   (Swagger UI)
#   http://localhost:8000/api/v1/health
```

To stop:

```bash
docker compose down
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `/app/data` | Path to the data directory inside the container |
| `DEBUG` | `false` | Enable debug mode |
| `CORS_ORIGINS` | `["*"]` | Allowed CORS origins (JSON array) |

These can be customised in `docker-compose.yml` under the `backend` service.

### Data Volume

The `docker-compose.yml` mounts `./api-backend/data` as a volume at `/app/data`, so you can modify crop/soil/weather data without rebuilding the image.

---

## Project Structure

```
DigiTwin/
├── api-backend/          # Backend application
│   ├── api/              # FastAPI source code
│   ├── tests/            # Pytest test suite
│   ├── data/             # PCSE data files (crop, soil, meteo)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md         # Local dev guide
├── docker-compose.yml    # Orchestration
├── frontend-reqs.md      # Mobile-app requirements
├── api-endpoints.md      # API specification
└── README.md             # ← you are here
```

## License

TBD
