"""In-memory repositories for tenders and proposals in ProcureFlix."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional

from ..models import Proposal, Tender
from .base import IRepository


@dataclass
class _TenderRecord:
    id: str
    tender: Tender


@dataclass
class _ProposalRecord:
    id: str
    proposal: Proposal


class InMemoryTenderRepository(IRepository[Tender]):
    """Simple in-memory tender repository with JSON seeding."""

    def __init__(self, seed_path: Optional[Path] = None) -> None:
        self._items: List[_TenderRecord] = []
        if seed_path is not None and seed_path.exists():
            self._load_seed(seed_path)

    # IRepository implementation -------------------------------------------------

    def list(self) -> List[Tender]:
        return [r.tender for r in self._items]

    def get(self, item_id: str) -> Optional[Tender]:
        for r in self._items:
            if r.id == item_id:
                return r.tender
        return None

    def add(self, item: Tender) -> Tender:
        now = datetime.now(timezone.utc)
        item.created_at = item.created_at or now
        item.updated_at = now
        self._items.append(_TenderRecord(id=item.id, tender=item))
        return item

    def update(self, item_id: str, item: Tender) -> Optional[Tender]:
        for idx, r in enumerate(self._items):
            if r.id == item_id:
                item.updated_at = datetime.now(timezone.utc)
                self._items[idx] = _TenderRecord(id=item_id, tender=item)
                return item
        return None

    def delete(self, item_id: str) -> bool:
        before = len(self._items)
        self._items = [r for r in self._items if r.id != item_id]
        return len(self._items) != before

    def bulk_seed(self, items: Iterable[Tender]) -> None:
        self._items = [_TenderRecord(id=i.id, tender=i) for i in items]

    # Internal helpers ----------------------------------------------------------

    def _load_seed(self, seed_path: Path) -> None:
        try:
            raw = json.loads(seed_path.read_text(encoding="utf-8"))
            tenders = [Tender(**entry) for entry in raw]
            self.bulk_seed(tenders)
        except Exception as exc:  # pragma: no cover
            print(f"[ProcureFlix] Failed to load tender seed data: {exc}")


class InMemoryProposalRepository(IRepository[Proposal]):
    """In-memory proposal repository with JSON seeding."""

    def __init__(self, seed_path: Optional[Path] = None) -> None:
        self._items: List[_ProposalRecord] = []
        if seed_path is not None and seed_path.exists():
            self._load_seed(seed_path)

    # IRepository implementation -------------------------------------------------

    def list(self) -> List[Proposal]:
        return [r.proposal for r in self._items]

    def get(self, item_id: str) -> Optional[Proposal]:
        for r in self._items:
            if r.id == item_id:
                return r.proposal
        return None

    def add(self, item: Proposal) -> Proposal:
        now = datetime.now(timezone.utc)
        item.submitted_at = item.submitted_at or now
        item.updated_at = now
        self._items.append(_ProposalRecord(id=item.id, proposal=item))
        return item

    def update(self, item_id: str, item: Proposal) -> Optional[Proposal]:
        for idx, r in enumerate(self._items):
            if r.id == item_id:
                item.updated_at = datetime.now(timezone.utc)
                self._items[idx] = _ProposalRecord(id=item_id, proposal=item)
                return item
        return None

    def delete(self, item_id: str) -> bool:
        before = len(self._items)
        self._items = [r for r in self._items if r.id != item_id]
        return len(self._items) != before

    def bulk_seed(self, items: Iterable[Proposal]) -> None:
        self._items = [_ProposalRecord(id=i.id, proposal=i) for i in items]

    # Internal helpers ----------------------------------------------------------

    def _load_seed(self, seed_path: Path) -> None:
        try:
            raw = json.loads(seed_path.read_text(encoding="utf-8"))
            proposals = [Proposal(**entry) for entry in raw]
            self.bulk_seed(proposals)
        except Exception as exc:  # pragma: no cover
            print(f"[ProcureFlix] Failed to load proposal seed data: {exc}")
