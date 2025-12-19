"""
Deliverable Model - Contract/PO Deliverables with Payment Authorization support
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class DeliverableStatus(str, Enum):
    """Deliverable workflow status"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PARTIALLY_ACCEPTED = "partially_accepted"


class DeliverableType(str, Enum):
    """Type of deliverable"""
    MILESTONE = "milestone"
    SERVICE_DELIVERY = "service_delivery"
    PRODUCT_DELIVERY = "product_delivery"
    REPORT = "report"
    OTHER = "other"


class Deliverable(BaseModel):
    """
    Deliverable model - represents work items under a Contract or PO
    Links to Payment Authorization when accepted
    """
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    deliverable_number: Optional[str] = None  # Auto-generated (e.g., DEL-2025-0001)
    
    # References
    contract_id: Optional[str] = None
    po_id: Optional[str] = None
    tender_id: Optional[str] = None  # PR reference
    vendor_id: str
    
    # Core Information
    title: str
    description: str
    deliverable_type: DeliverableType = DeliverableType.MILESTONE
    
    # Period (if applicable)
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    due_date: Optional[datetime] = None
    
    # Financial
    amount: float = 0.0
    currency: str = "SAR"
    percentage_of_contract: Optional[float] = None  # e.g., 25% of contract value
    
    # Status & Workflow
    status: DeliverableStatus = DeliverableStatus.DRAFT
    submitted_at: Optional[datetime] = None
    submitted_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # AI Validation
    ai_validation_summary: Optional[str] = None
    ai_validation_score: Optional[float] = None
    ai_validation_status: Optional[str] = None  # "aligned", "needs_clarification", "misaligned"
    ai_validated_at: Optional[datetime] = None
    
    # Supporting Documents
    documents: List[str] = []  # Document IDs
    
    # Payment Authorization Link
    payment_authorization_id: Optional[str] = None
    payment_authorization_status: Optional[str] = None
    payment_authorization_date: Optional[datetime] = None
    
    # Audit
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentAuthorizationStatus(str, Enum):
    """Payment Authorization Form status"""
    DRAFT = "draft"
    GENERATED = "generated"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"


class PaymentAuthorization(BaseModel):
    """
    Payment Authorization Form (PAF)
    Auto-generated from accepted Deliverables
    """
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    paf_number: Optional[str] = None  # Auto-generated (e.g., PAF-2025-0001)
    
    # Core Information
    generated_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    generated_by: Optional[str] = None
    
    # References (Read-only, copied from Deliverable)
    deliverable_id: str
    deliverable_number: Optional[str] = None
    deliverable_description: Optional[str] = None
    deliverable_period_start: Optional[datetime] = None
    deliverable_period_end: Optional[datetime] = None
    
    vendor_id: str
    vendor_name: Optional[str] = None
    
    contract_id: Optional[str] = None
    contract_number: Optional[str] = None
    contract_title: Optional[str] = None
    
    po_id: Optional[str] = None
    po_number: Optional[str] = None
    
    tender_id: Optional[str] = None  # PR reference
    tender_number: Optional[str] = None
    project_name: Optional[str] = None
    
    # Financial
    authorized_amount: float
    currency: str = "SAR"
    
    # Supporting Documents (copied from Deliverable)
    supporting_documents: List[str] = []
    
    # AI Validation Summary (read-only reference)
    ai_deliverable_validation: Optional[str] = None
    ai_payment_readiness: Optional[str] = None  # "Ready", "Ready with Clarifications", "Not Ready"
    ai_key_observations: List[str] = []
    ai_required_clarifications: List[str] = []
    ai_advisory_summary: Optional[str] = None
    ai_confidence: Optional[str] = None  # "High", "Medium", "Low"
    
    # Status & Workflow
    status: PaymentAuthorizationStatus = PaymentAuthorizationStatus.GENERATED
    
    # Approval Workflow
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approval_notes: Optional[str] = None
    
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Export
    exported: bool = False
    exported_at: Optional[datetime] = None
    exported_by: Optional[str] = None
    export_reference: Optional[str] = None
    
    # Audit
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Audit Trail
    audit_trail: List[Dict[str, Any]] = []
