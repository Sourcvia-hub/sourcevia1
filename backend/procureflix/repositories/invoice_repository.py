"""In-memory repository for invoices in ProcureFlix."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional

from ..models import Invoice
from .base import IRepository


@dataclass
class _InvoiceRecord:
  id: str
  invoice: Invoice


class InMemoryInvoiceRepository(IRepository[Invoice]):
  def __init__(self, seed_path: Optional[Path] = None) -> None:
    self._items: List[_InvoiceRecord] = []
    if seed_path is not None and seed_path.exists():
      self._load_seed(seed_path)

  def list(self) -> List[Invoice]:
    return [r.invoice for r in self._items]

  def get(self, item_id: str) -> Optional[Invoice]:
    for r in self._items:
      if r.id == item_id:
        return r.invoice
    return None

  def add(self, item: Invoice) -> Invoice:
    now = datetime.now(timezone.utc)
    item.created_at = item.created_at or now
    item.updated_at = now
    self._items.append(_InvoiceRecord(id=item.id, invoice=item))
    return item

  def update(self, item_id: str, item: Invoice) -> Optional[Invoice]:
    for idx, r in enumerate(self._items):
      if r.id == item_id:
        item.updated_at = datetime.now(timezone.utc)
        self._items[idx] = _InvoiceRecord(id=item_id, invoice=item)
        return item
    return None

  def delete(self, item_id: str) -> bool:
    before = len(self._items)
    self._items = [r for r in self._items if r.id != item_id]
    return len(self._items) != before

  def bulk_seed(self, items: Iterable[Invoice]) -> None:
    self._items = [_InvoiceRecord(id=i.id, invoice=i) for i in items]

  def _load_seed(self, seed_path: Path) -> None:
    try:
      raw = json.loads(seed_path.read_text(encoding='utf-8'))
      invoices = [Invoice(**entry) for entry in raw]
      self.bulk_seed(invoices)
    except Exception as exc:  # pragma: no cover
      print(f"[ProcureFlix] Failed to load invoice seed data: {exc}")
