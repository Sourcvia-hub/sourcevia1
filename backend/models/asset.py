"""
Asset and Facilities Management models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid

class AssetStatus(str, Enum):
    ACTIVE = "active"
    UNDER_MAINTENANCE = "under_maintenance"
    OUT_OF_SERVICE = "out_of_service"
    REPLACED = "replaced"
    DECOMMISSIONED = "decommissioned"

class AssetCondition(str, Enum):
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class Building(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Floor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    building_id: str
    name: str  # e.g., "Ground Floor", "1st Floor", "Basement"
    number: Optional[int] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssetCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset_number: Optional[str] = None  # Auto-generated
    
    # Basic Information
    name: str
    category_id: str  # Links to AssetCategory
    category_name: Optional[str] = None  # Denormalized for display
    model: Optional[str] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    
    # Location
    building_id: str
    building_name: Optional[str] = None  # Denormalized
    floor_id: str
    floor_name: Optional[str] = None  # Denormalized
    room_area: Optional[str] = None  # Free text
    custodian: Optional[str] = None  # Free text for MVP
    
    # Procurement & Contract
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None  # Denormalized
    purchase_date: Optional[datetime] = None
    cost: Optional[float] = None
    po_number: Optional[str] = None
    contract_id: Optional[str] = None  # AMC Contract
    contract_number: Optional[str] = None  # Denormalized
    
    # Warranty
    warranty_start_date: Optional[datetime] = None
    warranty_end_date: Optional[datetime] = None
    warranty_status: Optional[str] = None  # Auto-calculated: "in_warranty" or "out_of_warranty"
    
    # Lifecycle
    installation_date: Optional[datetime] = None
    last_maintenance_date: Optional[datetime] = None
    next_maintenance_due: Optional[datetime] = None
    status: AssetStatus = AssetStatus.ACTIVE
    condition: Optional[AssetCondition] = None
    
    # Attachments
    attachments: List[Dict[str, Any]] = []
    
    # Metadata
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

