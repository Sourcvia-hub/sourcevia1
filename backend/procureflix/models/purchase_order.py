"""Purchase order model for ProcureFlix."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class PurchaseOrderStatus(str, Enum):
  DRAFT = "draft"
  PENDING_APPROVAL = "pending_approval"
  APPROVED = "approved"
  ISSUED = "issued"
  CANCELLED = "cancelled"


class PurchaseOrder(BaseModel):
  """ProcureFlix purchase order entity."""

  model_config = ConfigDict(extra="ignore")

  id: str = Field(default_factory=lambda: str(uuid4()))
  po_number: Optional[str] = Field(
    default=None,
    description="Auto-generated number, e.g. PO-25-0001",
  )

  vendor_id: str
  contract_id: Optional[str] = None
  tender_id: Optional[str] = None

  description: str
  amount: float
  currency: str
  requested_by: str
  delivery_location: str

  status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT

  created_by: Optional[str] = None
  created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
  updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
