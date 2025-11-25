"""
Operating Service Request (OSR) models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid

class OSRType(str, Enum):
    ASSET_RELATED = "asset_related"
    GENERAL_REQUEST = "general_request"

class OSRCategory(str, Enum):
    MAINTENANCE = "maintenance"
    CLEANING = "cleaning"
    RELOCATION = "relocation"
    SAFETY = "safety"
    OTHER = "other"

class OSRStatus(str, Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OSRPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


class OSR(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    osr_number: Optional[str] = None  # Auto-generated (e.g., OSR-2025-0001)
    
    # Request Details
    title: str
    request_type: OSRType
    category: OSRCategory
    priority: OSRPriority = OSRPriority.NORMAL
    description: str
    
    # Location
    building_id: str
    building_name: Optional[str] = None
    floor_id: str
    floor_name: Optional[str] = None
    room_area: Optional[str] = None
    
    # Asset-Related (conditional)
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    asset_warranty_status: Optional[str] = None
    asset_contract_id: Optional[str] = None
    asset_contract_number: Optional[str] = None
    
    # Assignment
    assigned_to_type: Optional[str] = None  # "internal" or "vendor"
    assigned_to_vendor_id: Optional[str] = None
    assigned_to_vendor_name: Optional[str] = None
    assigned_to_internal: Optional[str] = None  # Team/Person name
    assigned_date: Optional[datetime] = None
    
    # Status & Resolution
    status: OSRStatus = OSRStatus.OPEN
    resolution_notes: Optional[str] = None
    closed_date: Optional[datetime] = None
    
    # Attachments
    attachments: List[Dict[str, Any]] = []
    
    # Metadata
    created_by: str
    created_by_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

