"""Invoice model for ProcureFlix."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class InvoiceStatus(str, Enum):
  PENDING = "pending"
  UNDER_REVIEW = "under_review"
  APPROVED = "approved"
  REJECTED = "rejected"
  PAID = "paid"


class Invoice(BaseModel):
  """ProcureFlix invoice entity."""

  model_config = ConfigDict(extra="ignore")

  id: str = Field(default_factory=lambda: str(uuid4()))
  invoice_number: str

  vendor_id: str
  contract_id: Optional[str] = None
  po_id: Optional[str] = None

  amount: float
  currency: str
  invoice_date: datetime
  due_date: datetime

  status: InvoiceStatus = InvoiceStatus.PENDING

  created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
  updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
