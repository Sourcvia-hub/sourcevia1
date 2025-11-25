"""
Purchase Order models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class POStatus(str, Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    CONVERTED_TO_CONTRACT = "converted_to_contract"
    CANCELLED = "cancelled"

class POItem(BaseModel):
    name: str
    description: str
    quantity: float
    price: float
    total: float

class PurchaseOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    po_number: Optional[str] = None  # Auto-generated (e.g., PO-25-0001)
    tender_id: Optional[str] = None  # Optional tender selection
    vendor_id: str
    items: List[POItem] = []
    total_amount: float = 0.0
    delivery_time: Optional[str] = None
    
    # Risk Assessment Questions
    risk_level: str  # From vendor risk
    has_data_access: bool = False
    has_onsite_presence: bool = False
    has_implementation: bool = False
    duration_more_than_year: bool = False
    amount_over_million: bool = False  # Auto-calculated
    
    requires_contract: bool = False  # True if any risk question is yes
    converted_to_contract: bool = False
    contract_id: Optional[str] = None
    
    status: POStatus = POStatus.DRAFT
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkType(str, Enum):
    ON_PREMISES = "on_premises"
    OFFSHORE = "offshore"

class ResourceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"

