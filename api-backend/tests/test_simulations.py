"""Tests for the simulations endpoints."""

import csv
import io


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
    assert "simulation_id" in data
    assert "daily_results" in data
    assert len(data["daily_results"]) > 0
    assert "summary" in data
    assert "config" in data
    assert data["config"]["crop_name"] == "barley"


def test_list_simulations_empty(client):
    resp = client.get("/api/v1/simulations")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_list_simulations_after_run(client):
    _run_simulation(client)
    resp = client.get("/api/v1/simulations")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


def test_get_simulation_detail(client):
    create_resp = _run_simulation(client)
    sim_id = create_resp.json()["simulation_id"]

    resp = client.get(f"/api/v1/simulations/{sim_id}")
    assert resp.status_code == 200
    assert resp.json()["simulation_id"] == sim_id


def test_get_simulation_not_found(client):
    resp = client.get("/api/v1/simulations/nonexistent-id")
    assert resp.status_code == 404


def test_delete_simulation(client):
    create_resp = _run_simulation(client)
    sim_id = create_resp.json()["simulation_id"]

    resp = client.delete(f"/api/v1/simulations/{sim_id}")
    assert resp.status_code == 204

    # Should be gone
    resp = client.get(f"/api/v1/simulations/{sim_id}")
    assert resp.status_code == 404


def test_delete_simulation_not_found(client):
    resp = client.delete("/api/v1/simulations/nonexistent-id")
    assert resp.status_code == 404


def test_export_simulation_csv(client):
    create_resp = _run_simulation(client)
    sim_id = create_resp.json()["simulation_id"]

    resp = client.get(f"/api/v1/simulations/{sim_id}/export")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]

    reader = csv.reader(io.StringIO(resp.text))
    header = next(reader)
    assert "day" in header
    assert "DVS" in header
    assert "TAGP" in header

    rows = list(reader)
    assert len(rows) > 0


def test_export_simulation_not_found(client):
    resp = client.get("/api/v1/simulations/nonexistent-id/export")
    assert resp.status_code == 404


def test_run_simulation_validation_error(client):
    resp = client.post("/api/v1/simulations", json={"dias_cultivo": 0})
    assert resp.status_code == 422


def test_run_simulation_invalid_luz(client):
    resp = client.post("/api/v1/simulations", json={"luz": "invalid"})
    assert resp.status_code == 422
