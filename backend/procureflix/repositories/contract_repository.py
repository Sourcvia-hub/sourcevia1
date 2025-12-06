"""In-memory repository for contracts in ProcureFlix."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional

from ..models import Contract
from .base import IRepository


@dataclass
class _ContractRecord:
    id: str
    contract: Contract


class InMemoryContractRepository(IRepository[Contract]):
    def __init__(self, seed_path: Optional[Path] = None) -> None:
        self._items: List[_ContractRecord] = []
        if seed_path is not None and seed_path.exists():
            self._load_seed(seed_path)

    # IRepository implementation ---------------------------------------------

    def list(self) -> List[Contract]:
        return [r.contract for r in self._items]

    def get(self, item_id: str) -> Optional[Contract]:
        for r in self._items:
            if r.id == item_id:
                return r.contract
        return None

    def add(self, item: Contract) -> Contract:
        now = datetime.now(timezone.utc)
        item.created_at = item.created_at or now
        item.updated_at = now
        self._items.append(_ContractRecord(id=item.id, contract=item))
        return item

    def update(self, item_id: str, item: Contract) -> Optional[Contract]:
        for idx, r in enumerate(self._items):
            if r.id == item_id:
                item.updated_at = datetime.now(timezone.utc)
                self._items[idx] = _ContractRecord(id=item_id, contract=item)
                return item
        return None

    def delete(self, item_id: str) -> bool:
        before = len(self._items)
        self._items = [r for r in self._items if r.id != item_id]
        return len(self._items) != before

    def bulk_seed(self, items: Iterable[Contract]) -> None:
        self._items = [_ContractRecord(id=i.id, contract=i) for i in items]

    # Internal helpers --------------------------------------------------------

    def _load_seed(self, seed_path: Path) -> None:
        try:
            raw = json.loads(seed_path.read_text(encoding="utf-8"))
            contracts = [Contract(**entry) for entry in raw]
            self.bulk_seed(contracts)
        except Exception as exc:  # pragma: no cover
            print(f"[ProcureFlix] Failed to load contract seed data: {exc}")
