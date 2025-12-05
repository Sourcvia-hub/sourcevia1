"""Base repository abstractions for ProcureFlix."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Generic, Iterable, List, Optional, TypeVar

T = TypeVar("T")


class IRepository(ABC, Generic[T]):
    """Minimal generic repository interface.

    Concrete repositories (e.g. VendorRepository) should implement this
    interface and may add domain-specific methods as needed.
    """

    @abstractmethod
    def list(self) -> List[T]:  # pragma: no cover - interface only
        """Return all items."""

    @abstractmethod
    def get(self, item_id: str) -> Optional[T]:  # pragma: no cover
        """Get item by ID, or None if not found."""

    @abstractmethod
    def add(self, item: T) -> T:  # pragma: no cover
        """Add a new item and return it."""

    @abstractmethod
    def update(self, item_id: str, item: T) -> Optional[T]:  # pragma: no cover
        """Replace an existing item, returning the updated version or None."""

    @abstractmethod
    def delete(self, item_id: str) -> bool:  # pragma: no cover
        """Delete item by ID. Returns True if something was deleted."""

    @abstractmethod
    def bulk_seed(self, items: Iterable[T]) -> None:  # pragma: no cover
        """Seed repository with a collection of items (idempotent for demos)."""
