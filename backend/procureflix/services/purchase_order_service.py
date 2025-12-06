"""Purchase order business logic for ProcureFlix."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from ..models import PurchaseOrder, PurchaseOrderStatus
from ..repositories.purchase_order_repository import InMemoryPurchaseOrderRepository


class PurchaseOrderService:
  def __init__(self, repository: InMemoryPurchaseOrderRepository) -> None:
    self._repository = repository
    self._counter: int = 0

  # Queries -----------------------------------------------------------------

  def list_purchase_orders(self) -> List[PurchaseOrder]:
    return self._repository.list()

  def get_purchase_order(self, po_id: str) -> Optional[PurchaseOrder]:
    return self._repository.get(po_id)

  # Commands ----------------------------------------------------------------

  def create_purchase_order(self, po: PurchaseOrder) -> PurchaseOrder:
    now = datetime.now(timezone.utc)
    po.created_at = now
    po.updated_at = now

    if not po.po_number:
      po.po_number = self._generate_po_number(now)

    po.status = PurchaseOrderStatus.DRAFT
    return self._repository.add(po)

  def update_purchase_order(self, po_id: str, updated: PurchaseOrder) -> Optional[PurchaseOrder]:
    existing = self._repository.get(po_id)
    if not existing:
      return None

    updated.id = po_id
    updated.po_number = existing.po_number or updated.po_number
    updated.created_at = existing.created_at
    updated.created_by = existing.created_by
    updated.updated_at = datetime.now(timezone.utc)
    return self._repository.update(po_id, updated)

  def change_status(self, po_id: str, status: PurchaseOrderStatus) -> Optional[PurchaseOrder]:
    po = self._repository.get(po_id)
    if not po:
      return None

    # Simple approval / issue flow
    if status == PurchaseOrderStatus.PENDING_APPROVAL and po.status == PurchaseOrderStatus.DRAFT:
      po.status = status
    elif status == PurchaseOrderStatus.APPROVED and po.status in {PurchaseOrderStatus.PENDING_APPROVAL, PurchaseOrderStatus.DRAFT}:
      po.status = status
    elif status == PurchaseOrderStatus.ISSUED and po.status == PurchaseOrderStatus.APPROVED:
      po.status = status
    elif status == PurchaseOrderStatus.CANCELLED:
      po.status = status
    else:
      po.status = status  # allow idempotent or manual override

    po.updated_at = datetime.now(timezone.utc)
    return self._repository.update(po_id, po)

  # Internal helpers --------------------------------------------------------

  def _generate_po_number(self, now: datetime) -> str:
    year_suffix = now.year % 100
    self._counter += 1
    return f"PO-{year_suffix:02d}-{self._counter:04d}"
