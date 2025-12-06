"""Invoice business logic for ProcureFlix."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from ..models import Invoice, InvoiceStatus
from ..repositories.invoice_repository import InMemoryInvoiceRepository


class InvoiceService:
  def __init__(self, repository: InMemoryInvoiceRepository) -> None:
    self._repository = repository
    self._counter: int = 0

  # Queries -----------------------------------------------------------------

  def list_invoices(self) -> List[Invoice]:
    return self._repository.list()

  def get_invoice(self, invoice_id: str) -> Optional[Invoice]:
    return self._repository.get(invoice_id)

  # Commands ----------------------------------------------------------------

  def create_invoice(self, invoice: Invoice) -> Invoice:
    now = datetime.now(timezone.utc)
    invoice.created_at = now
    invoice.updated_at = now

    # Auto-generate invoice_number if empty
    if not invoice.invoice_number:
      invoice.invoice_number = self._generate_invoice_number(now)

    # Prevent duplicate invoice_number per vendor
    self._ensure_unique_invoice_number(invoice.vendor_id, invoice.invoice_number)

    invoice.status = InvoiceStatus.PENDING
    return self._repository.add(invoice)

  def update_invoice(self, invoice_id: str, updated: Invoice) -> Optional[Invoice]:
    existing = self._repository.get(invoice_id)
    if not existing:
      return None

    # If invoice number changed, re-check uniqueness
    if updated.invoice_number != existing.invoice_number:
      self._ensure_unique_invoice_number(existing.vendor_id, updated.invoice_number)

    updated.id = invoice_id
    updated.created_at = existing.created_at
    updated.updated_at = datetime.now(timezone.utc)
    return self._repository.update(invoice_id, updated)

  def change_status(self, invoice_id: str, status: InvoiceStatus) -> Optional[Invoice]:
    inv = self._repository.get(invoice_id)
    if not inv:
      return None

    # Simple status flow
    if status == InvoiceStatus.UNDER_REVIEW and inv.status == InvoiceStatus.PENDING:
      inv.status = status
    elif status == InvoiceStatus.APPROVED and inv.status in {InvoiceStatus.PENDING, InvoiceStatus.UNDER_REVIEW}:
      inv.status = status
    elif status == InvoiceStatus.REJECTED and inv.status in {InvoiceStatus.PENDING, InvoiceStatus.UNDER_REVIEW}:
      inv.status = status
    elif status == InvoiceStatus.PAID and inv.status == InvoiceStatus.APPROVED:
      inv.status = status
    else:
      inv.status = status  # allow manual override

    inv.updated_at = datetime.now(timezone.utc)
    return self._repository.update(invoice_id, inv)

  # Internal helpers --------------------------------------------------------

  def _generate_invoice_number(self, now: datetime) -> str:
    year_suffix = now.year % 100
    self._counter += 1
    return f"INV-{year_suffix:02d}-{self._counter:04d}"

  def _ensure_unique_invoice_number(self, vendor_id: str, invoice_number: str) -> None:
    for inv in self._repository.list():
      if inv.vendor_id == vendor_id and inv.invoice_number == invoice_number:
        raise ValueError("Duplicate invoice_number for this vendor")
