"""In-memory simulation storage.

Provides a simple dict-based store keyed by ``simulation_id``.
Easy to swap for a database later.
"""

from __future__ import annotations

from typing import Optional

from api.models.schemas import SimulationResponse

# Global in-memory store: { simulation_id: SimulationResponse }
_store: dict[str, SimulationResponse] = {}


def save(simulation: SimulationResponse) -> None:
    _store[simulation.simulation_id] = simulation


def get(simulation_id: str) -> Optional[SimulationResponse]:
    return _store.get(simulation_id)


def list_all(skip: int = 0, limit: int = 20) -> tuple[int, list[SimulationResponse]]:
    """Return (total_count, page_items)."""
    items = list(_store.values())
    # Sort newest first
    items.sort(key=lambda s: s.created_at, reverse=True)
    return len(items), items[skip : skip + limit]


def delete(simulation_id: str) -> bool:
    """Delete a simulation. Returns True if found, False otherwise."""
    return _store.pop(simulation_id, None) is not None


def clear() -> None:
    """Clear all stored simulations (useful for tests)."""
    _store.clear()
