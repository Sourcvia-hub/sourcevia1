"""Contract model for ProcureFlix.

This model mirrors the core contract concepts from Sourcevia and the
SharePoint schema, but is implemented in a storage-agnostic way and
aligned with ProcureFlix's clean architecture.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

from .vendor import RiskCategory


class ContractType(str, Enum):
    OUTSOURCING = "outsourcing"
    CLOUD = "cloud"
    STANDARD = "standard"


class ContractStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    EXPIRED = "expired"
    TERMINATED = "terminated"


class CriticalityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Contract(BaseModel):
    """Core contract entity for ProcureFlix."""

    model_config = ConfigDict(extra="ignore")

    # Identity / linking
    id: str = Field(default_factory=lambda: str(uuid4()))
    contract_number: Optional[str] = Field(
        default=None,
        description="Auto-generated number, e.g. Contract-25-0001",
    )
    vendor_id: str
    tender_id: Optional[str] = None

    # Core data
    title: str
    description: str
    contract_type: ContractType = ContractType.STANDARD
    contract_value: float
    currency: str
    start_date: datetime
    end_date: datetime
    auto_renewal: bool = False

    # Risk & compliance flags
    has_data_access: bool = False
    has_onsite_presence: bool = False
    has_implementation: bool = False
    criticality_level: CriticalityLevel = CriticalityLevel.LOW

    risk_score: float = 0.0
    risk_category: RiskCategory = RiskCategory.LOW
    dd_required: bool = False
    noc_required: bool = False

    # Status
    status: ContractStatus = ContractStatus.DRAFT

    # Meta
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    terminated_at: Optional[datetime] = None
    termination_reason: Optional[str] = None
