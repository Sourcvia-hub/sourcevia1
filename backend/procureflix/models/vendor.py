"""Vendor domain model for ProcureFlix.

This is a simplified but representative version based on the Sourcevia
BRD and SharePoint schemas. It deliberately avoids any persistence or
MongoDB-specific concerns.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, ConfigDict, EmailStr


class VendorRiskCategory(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class Vendor(BaseModel):
    """Core vendor entity used by ProcureFlix.

    This mirrors the business fields from Sourcevia at a high level but is
    intentionally storage-agnostic.
    """

    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid4()))
    vendor_number: Optional[str] = Field(
        default=None,
        description="Auto-generated vendor number, e.g. Vendor-25-0001.",
    )

    # Basic identity
    name_english: str = Field(..., description="Primary legal / English name of the vendor")
    commercial_name: Optional[str] = Field(
        default=None, description="Trade / commercial name if different from legal name"
    )

    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    # Risk-related fields (simplified for Phase 1)
    risk_score: float = Field(0.0, ge=0.0, description="Composite numeric risk score (0–100+)")
    risk_category: VendorRiskCategory = Field(
        default=VendorRiskCategory.LOW,
        description="High-level risk band derived from risk_score.",
    )

    dd_required: bool = Field(
        default=False,
        description="Whether detailed due diligence is required for this vendor.",
    )
    dd_completed: bool = Field(
        default=False, description="Has the due diligence questionnaire been completed?"
    )

    # Audit metadata
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp (UTC)",
    )

    tags: List[str] = Field(default_factory=list, description="Free-form tags for filtering/search")
