"""In-memory Vendor repository backed by JSON seed data."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from ..models import Vendor
from .base import IRepository


@dataclass
class _VendorRecord:
    """Internal record wrapper used for in-memory storage.

    We keep this separate from the Pydantic model so that we can later
    change storage concerns (e.g. add SharePoint IDs) without affecting
    the public API model.
    """

    id: str
    vendor: Vendor


class InMemoryVendorRepository(IRepository[Vendor]):
    """Simple in-memory vendor repository with JSON seeding.

    This is suitable for demos and early development. It is not intended
    for production persistence.
    """

    def __init__(self, seed_path: Optional[Path] = None) -> None:
        self._items: List[_VendorRecord] = []
        if seed_path is not None and seed_path.exists():
            self._load_seed(seed_path)

    # ------------------------------------------------------------------
    # IRepository implementation
    # ------------------------------------------------------------------

    def list(self) -> List[Vendor]:
        return [record.vendor for record in self._items]

    def get(self, item_id: str) -> Optional[Vendor]:
        for record in self._items:
            if record.id == item_id:
                return record.vendor
        return None

    def add(self, item: Vendor) -> Vendor:
        now = datetime.now(timezone.utc)
        item.updated_at = now
        if item.created_at is None:
            item.created_at = now
        self._items.append(_VendorRecord(id=item.id, vendor=item))
        return item

    def update(self, item_id: str, item: Vendor) -> Optional[Vendor]:
        for idx, record in enumerate(self._items):
            if record.id == item_id:
                item.updated_at = datetime.now(timezone.utc)
                self._items[idx] = _VendorRecord(id=item_id, vendor=item)
                return item
        return None

    def delete(self, item_id: str) -> bool:
        initial_len = len(self._items)
        self._items = [r for r in self._items if r.id != item_id]
        return len(self._items) != initial_len

    def bulk_seed(self, items) -> None:
        """Replace current contents with provided items.

        For deterministic demos we simply clear and reload all vendors.
        """

        self._items = [_VendorRecord(id=item.id, vendor=item) for item in items]

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_seed(self, seed_path: Path) -> None:
        try:
            raw = json.loads(seed_path.read_text(encoding="utf-8"))
            vendors: List[Vendor] = []
            for entry in raw:
                vendors.append(Vendor(**entry))
            self.bulk_seed(vendors)
        except Exception as exc:  # pragma: no cover - defensive
            # In Phase 1 we fail silently to avoid breaking the app if
            # seed data is malformed; logs can be added later.
            print(f"[ProcureFlix] Failed to load vendor seed data: {exc}")
