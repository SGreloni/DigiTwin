"""Shared pytest fixtures."""

import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.services import storage


@pytest.fixture()
def client():
    """Provide a fresh TestClient with an empty storage for each test."""
    storage.clear()
    with TestClient(app) as c:
        yield c
    storage.clear()
