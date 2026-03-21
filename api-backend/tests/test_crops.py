"""Tests for the crops catalogue endpoints."""


def test_list_crops(client):
    resp = client.get("/api/v1/crops")
    assert resp.status_code == 200
    data = resp.json()
    assert "crops" in data
    assert isinstance(data["crops"], list)
    assert len(data["crops"]) > 0
    assert "barley" in data["crops"]


def test_list_varieties_barley(client):
    resp = client.get("/api/v1/crops/barley/varieties")
    assert resp.status_code == 200
    data = resp.json()
    assert data["crop_name"] == "barley"
    assert isinstance(data["varieties"], list)
    assert "Barley_Hydroponic_Forage_AR_Moderate" in data["varieties"]


def test_list_varieties_potato(client):
    resp = client.get("/api/v1/crops/potato/varieties")
    assert resp.status_code == 200
    data = resp.json()
    assert data["crop_name"] == "potato"
    assert "Potato_701" in data["varieties"]


def test_list_varieties_not_found(client):
    resp = client.get("/api/v1/crops/nonexistent/varieties")
    assert resp.status_code == 404
