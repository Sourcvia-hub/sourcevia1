"""
Resource models
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class WorkType(str, Enum):
    ON_PREMISES = "on_premises"
    OFFSHORE = "offshore"

class ResourceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"

class Relative(BaseModel):
    name: str
    position: str
    department: str
    relation: str

class Resource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resource_number: Optional[str] = None  # Auto-generated
    
    # Contract & Vendor Info
    contract_id: str
    vendor_id: str
    contract_name: Optional[str] = None
    scope: Optional[str] = None
    sla: Optional[str] = None
    contract_duration: Optional[str] = None
    vendor_name: Optional[str] = None
    
    # Resource Details
    name: str
    photo: Optional[str] = None  # URL or path
    nationality: str
    id_number: str
    education_qualification: str
    years_of_experience: float
    work_type: WorkType
    
    # Duration
    start_date: datetime
    end_date: datetime
    
    # Requested Access
    access_development: bool = False
    access_production: bool = False
    access_uat: bool = False
    
    # Scope of Work
    scope_of_work: str
    
    # Relatives Declaration
    has_relatives: bool = False
    relatives: List[Relative] = []
    
    status: ResourceStatus = ResourceStatus.ACTIVE
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

