"""In-memory repository for purchase orders in ProcureFlix."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional

from ..models import PurchaseOrder
from .base import IRepository


@dataclass
class _PORecord:
  id: str
  po: PurchaseOrder


class InMemoryPurchaseOrderRepository(IRepository[PurchaseOrder]):
  def __init__(self, seed_path: Optional[Path] = None) -> None:
    self._items: List[_PORecord] = []
    if seed_path is not None and seed_path.exists():
      self._load_seed(seed_path)

  def list(self) -> List[PurchaseOrder]:
    return [r.po for r in self._items]

  def get(self, item_id: str) -> Optional[PurchaseOrder]:
    for r in self._items:
      if r.id == item_id:
        return r.po
    return None

  def add(self, item: PurchaseOrder) -> PurchaseOrder:
    now = datetime.now(timezone.utc)
    item.created_at = item.created_at or now
    item.updated_at = now
    self._items.append(_PORecord(id=item.id, po=item))
    return item

  def update(self, item_id: str, item: PurchaseOrder) -> Optional[PurchaseOrder]:
    for idx, r in enumerate(self._items):
      if r.id == item_id:
        item.updated_at = datetime.now(timezone.utc)
        self._items[idx] = _PORecord(id=item_id, po=item)
        return item
    return None

  def delete(self, item_id: str) -> bool:
    before = len(self._items)
    self._items = [r for r in self._items if r.id != item_id]
    return len(self._items) != before

  def bulk_seed(self, items: Iterable[PurchaseOrder]) -> None:
    self._items = [_PORecord(id=i.id, po=i) for i in items]

  def _load_seed(self, seed_path: Path) -> None:
    try:
      raw = json.loads(seed_path.read_text(encoding='utf-8'))
      pos = [PurchaseOrder(**entry) for entry in raw]
      self.bulk_seed(pos)
    except Exception as exc:  # pragma: no cover
      print(f"[ProcureFlix] Failed to load purchase order seed data: {exc}")
