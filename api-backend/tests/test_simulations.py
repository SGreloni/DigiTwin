"""Tests for the simulations endpoints."""




def _run_simulation(client, **overrides):
    """Helper: run a simulation with defaults (or overrides) and return response."""
    payload = {
        "crop_name": "barley",
        "variety_name": "Barley_Hydroponic_Forage_AR_Moderate",
        "fecha_inicio": "2024-01-01",
        "dias_cultivo": 10,
        "temperatura_ambiente": 22.0,
        "luz": "media",
        "ph": 6.0,
        "ec": 2.0,
    }
    payload.update(overrides)
    return client.post("/api/v1/simulations", json=payload)


def test_run_simulation(client):
    resp = _run_simulation(client)
    assert resp.status_code == 201
    data = resp.json()
    assert "daily_results" in data
    assert len(data["daily_results"]) > 0
    assert "summary" in data
    assert "config" in data
    assert data["config"]["crop_name"] == "barley"





def test_run_simulation_validation_error(client):
    resp = client.post("/api/v1/simulations", json={"dias_cultivo": 0})
    assert resp.status_code == 422


def test_run_simulation_invalid_luz(client):
    resp = client.post("/api/v1/simulations", json={"luz": "invalid"})
    assert resp.status_code == 422
