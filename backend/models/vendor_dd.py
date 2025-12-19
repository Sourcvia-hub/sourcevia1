"""
Vendor Due Diligence Models - New AI-powered risk evaluation system
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class VendorDDStatus(str, Enum):
    """Vendor DD Workflow Status"""
    DRAFT = "draft"
    PENDING_OFFICER_REVIEW = "pending_officer_review"
    PENDING_HOP_APPROVAL = "pending_hop_approval"
    APPROVED = "approved"
    APPROVED_WITH_CONDITIONS = "approved_with_conditions"
    REJECTED = "rejected"


class AIConfidenceLevel(str, Enum):
    """AI Confidence Level for risk assessment"""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class VendorRiskLevel(str, Enum):
    """Vendor Risk Level based on thresholds"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class FieldExtractionStatus(str, Enum):
    """Status of AI-extracted fields"""
    EXTRACTED = "Extracted"
    INFERRED = "Inferred"
    NOT_PROVIDED = "Not Provided"
    MANUAL = "Manual"


class ExtractedField(BaseModel):
    """A single extracted field with status"""
    value: Optional[Any] = None
    status: FieldExtractionStatus = FieldExtractionStatus.NOT_PROVIDED
    confidence: Optional[float] = None  # 0.0 to 1.0


class AIAssessment(BaseModel):
    """AI Risk Assessment Result"""
    vendor_name: Optional[str] = None
    country_jurisdiction: Optional[str] = None
    vendor_risk_score: float = 0.0  # 0-100
    vendor_risk_level: VendorRiskLevel = VendorRiskLevel.LOW
    top_risk_drivers: List[str] = Field(default_factory=list, max_length=3)
    assessment_summary: Optional[str] = None
    ai_confidence_level: AIConfidenceLevel = AIConfidenceLevel.MEDIUM
    ai_confidence_rationale: Optional[str] = None
    notes_for_human_review: Optional[str] = None
    assessed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    prompt_version: str = "1.0"


class RiskAcceptance(BaseModel):
    """Risk Acceptance for High Risk vendors"""
    risk_acceptance_reason: str
    mitigating_controls: str
    scope_limitations: Optional[str] = None
    acceptance_owner: str  # HoP user ID
    acceptance_owner_name: Optional[str] = None
    acceptance_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DDDocumentUpload(BaseModel):
    """Uploaded DD Document record"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_path: str
    file_type: str  # "pdf" or "docx"
    uploaded_by: str
    uploaded_by_name: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AIRunRecord(BaseModel):
    """Record of an AI assessment run"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    prompt_version: str = "1.0"
    confidence_level: AIConfidenceLevel
    risk_score: float
    risk_level: VendorRiskLevel
    triggered_by: str  # user ID
    triggered_by_name: Optional[str] = None


class FieldChangeRecord(BaseModel):
    """Record of field changes after AI extraction"""
    field_name: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    changed_by: str
    changed_by_name: Optional[str] = None
    changed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reason: Optional[str] = None


class DDAuditLog(BaseModel):
    """Audit log entry for DD activities"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str  # document_uploaded, ai_run, field_changed, officer_submit, hop_approval, etc.
    details: Dict[str, Any] = Field(default_factory=dict)
    performed_by: str
    performed_by_name: Optional[str] = None
    performed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class VendorDDData(BaseModel):
    """Complete Vendor Due Diligence Data"""
    
    # Request Type
    request_type: Optional[str] = None  # "new_registration" or "update_information"
    request_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # === Vendor Information ===
    name_arabic: ExtractedField = Field(default_factory=ExtractedField)
    name_english: ExtractedField = Field(default_factory=ExtractedField)
    commercial_name: ExtractedField = Field(default_factory=ExtractedField)
    entity_type: ExtractedField = Field(default_factory=ExtractedField)
    vat_registration_number: ExtractedField = Field(default_factory=ExtractedField)
    unified_number: ExtractedField = Field(default_factory=ExtractedField)  # Saudi Entities
    cr_number: ExtractedField = Field(default_factory=ExtractedField)
    cr_expiry_date: ExtractedField = Field(default_factory=ExtractedField)
    cr_country_city: ExtractedField = Field(default_factory=ExtractedField)
    license_number: ExtractedField = Field(default_factory=ExtractedField)
    license_expiry_date: ExtractedField = Field(default_factory=ExtractedField)
    activity_description: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Employee Details ===
    number_of_employees_total: ExtractedField = Field(default_factory=ExtractedField)
    number_of_employees_saudi: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Address and Contact ===
    street: ExtractedField = Field(default_factory=ExtractedField)
    building_no: ExtractedField = Field(default_factory=ExtractedField)
    city: ExtractedField = Field(default_factory=ExtractedField)
    district: ExtractedField = Field(default_factory=ExtractedField)
    fax: ExtractedField = Field(default_factory=ExtractedField)
    country: ExtractedField = Field(default_factory=ExtractedField)
    mobile: ExtractedField = Field(default_factory=ExtractedField)
    landline: ExtractedField = Field(default_factory=ExtractedField)
    email_address: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Representative Information ===
    rep_full_name: ExtractedField = Field(default_factory=ExtractedField)
    rep_designation: ExtractedField = Field(default_factory=ExtractedField)
    rep_id_document_type: ExtractedField = Field(default_factory=ExtractedField)
    rep_id_document_number: ExtractedField = Field(default_factory=ExtractedField)
    rep_nationality: ExtractedField = Field(default_factory=ExtractedField)
    rep_mobile: ExtractedField = Field(default_factory=ExtractedField)
    rep_residence_tel: ExtractedField = Field(default_factory=ExtractedField)
    rep_phone_area_code: ExtractedField = Field(default_factory=ExtractedField)
    rep_email: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Financial Details ===
    number_of_vendors: ExtractedField = Field(default_factory=ExtractedField)
    years_of_business: ExtractedField = Field(default_factory=ExtractedField)
    number_of_customers: ExtractedField = Field(default_factory=ExtractedField)
    number_of_branches: ExtractedField = Field(default_factory=ExtractedField)
    branches_subsidiaries_affiliates: ExtractedField = Field(default_factory=ExtractedField)
    key_customers: ExtractedField = Field(default_factory=ExtractedField)
    country_list: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Bank Account Details ===
    bank_account_name: ExtractedField = Field(default_factory=ExtractedField)
    bank_name: ExtractedField = Field(default_factory=ExtractedField)
    bank_branch: ExtractedField = Field(default_factory=ExtractedField)
    bank_country: ExtractedField = Field(default_factory=ExtractedField)
    iban: ExtractedField = Field(default_factory=ExtractedField)
    currency: ExtractedField = Field(default_factory=ExtractedField)
    swift_code: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Owners/Partners/Managers ===
    owners_managers: List[Dict[str, Any]] = Field(default_factory=list)
    
    # === Operations Questions (Yes/No) ===
    # Ownership and General
    q_ownership_change_past_year: ExtractedField = Field(default_factory=ExtractedField)
    q_location_moved_closed: ExtractedField = Field(default_factory=ExtractedField)
    q_opened_branches: ExtractedField = Field(default_factory=ExtractedField)
    q_financial_obligation_default: ExtractedField = Field(default_factory=ExtractedField)
    q_shareholding_in_bank: ExtractedField = Field(default_factory=ExtractedField)
    
    # Business Continuity
    q_bc_rely_third_parties: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_intend_subcontract: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_business_stopped_week: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_alternative_locations: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_test_frequency: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_certified_standard: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_dedicated_staff: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_risk_assessment: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_threats_identified: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_essential_activities: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_strategy_exists: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_emergency_responders: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_arrangements_updated: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_documented_strategy: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_exercise_evidence: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_exercise_results_improve: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_management_trained: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_staff_aware: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_it_continuity_plan: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_data_backed_up: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_vital_documents_offsite: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_critical_suppliers: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_suppliers_consulted: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_communication_method: ExtractedField = Field(default_factory=ExtractedField)
    q_bc_pr_crisis_management: ExtractedField = Field(default_factory=ExtractedField)
    
    # Anti-Fraud
    q_fraud_whistleblowing: ExtractedField = Field(default_factory=ExtractedField)
    q_fraud_prevention_procedures: ExtractedField = Field(default_factory=ExtractedField)
    q_fraud_internal_last_year: ExtractedField = Field(default_factory=ExtractedField)
    q_fraud_burglary_theft: ExtractedField = Field(default_factory=ExtractedField)
    
    # Operational Risks
    q_op_criminal_cases: ExtractedField = Field(default_factory=ExtractedField)
    q_op_financial_issues: ExtractedField = Field(default_factory=ExtractedField)
    q_op_documented_procedures: ExtractedField = Field(default_factory=ExtractedField)
    q_op_internal_audit: ExtractedField = Field(default_factory=ExtractedField)
    q_op_specific_license: ExtractedField = Field(default_factory=ExtractedField)
    q_op_services_outside_ksa: ExtractedField = Field(default_factory=ExtractedField)
    q_op_coi_policy: ExtractedField = Field(default_factory=ExtractedField)
    q_op_complaint_handling: ExtractedField = Field(default_factory=ExtractedField)
    q_op_customer_complaints: ExtractedField = Field(default_factory=ExtractedField)
    q_op_insurance_contracts: ExtractedField = Field(default_factory=ExtractedField)
    
    # Cyber Security
    q_cyber_cloud_services: ExtractedField = Field(default_factory=ExtractedField)
    q_cyber_data_outside_ksa: ExtractedField = Field(default_factory=ExtractedField)
    q_cyber_remote_access: ExtractedField = Field(default_factory=ExtractedField)
    q_cyber_digital_channels: ExtractedField = Field(default_factory=ExtractedField)
    q_cyber_card_payments: ExtractedField = Field(default_factory=ExtractedField)
    q_cyber_third_party_access: ExtractedField = Field(default_factory=ExtractedField)
    
    # Safety and Security
    q_safety_procedures: ExtractedField = Field(default_factory=ExtractedField)
    q_safety_24_7: ExtractedField = Field(default_factory=ExtractedField)
    q_safety_cctv: ExtractedField = Field(default_factory=ExtractedField)
    q_safety_fire_exits: ExtractedField = Field(default_factory=ExtractedField)
    
    # Human Resources
    q_hr_localization_policy: ExtractedField = Field(default_factory=ExtractedField)
    q_hr_hiring_standards: ExtractedField = Field(default_factory=ExtractedField)
    q_hr_background_check: ExtractedField = Field(default_factory=ExtractedField)
    q_hr_academic_verification: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Document Checklist ===
    # Saudi Vendor Documents
    doc_saudization_certificate: ExtractedField = Field(default_factory=ExtractedField)
    doc_gosi_certificate: ExtractedField = Field(default_factory=ExtractedField)
    doc_nitaqat_certificate: ExtractedField = Field(default_factory=ExtractedField)
    doc_zakat_certificate: ExtractedField = Field(default_factory=ExtractedField)
    doc_license_activity_practice: ExtractedField = Field(default_factory=ExtractedField)
    
    # All Vendor Documents
    doc_tax_vat_certificate: ExtractedField = Field(default_factory=ExtractedField)
    doc_commercial_registration: ExtractedField = Field(default_factory=ExtractedField)
    doc_company_profile: ExtractedField = Field(default_factory=ExtractedField)
    doc_authorization_letter: ExtractedField = Field(default_factory=ExtractedField)
    doc_owners_managers_ids: ExtractedField = Field(default_factory=ExtractedField)
    
    # Special Documents
    doc_real_estate_license: ExtractedField = Field(default_factory=ExtractedField)
    doc_saudi_payments_license: ExtractedField = Field(default_factory=ExtractedField)
    doc_electricity_authority_license: ExtractedField = Field(default_factory=ExtractedField)
    
    # === Authorized Persons ===
    authorized_persons: List[Dict[str, Any]] = Field(default_factory=list)
    
    # === AI Assessment Results ===
    ai_assessment: Optional[AIAssessment] = None
    ai_run_history: List[AIRunRecord] = Field(default_factory=list)
    
    # === Risk Acceptance (for High Risk) ===
    risk_acceptance: Optional[RiskAcceptance] = None
    
    # === Workflow ===
    status: VendorDDStatus = VendorDDStatus.DRAFT
    
    # Officer Review
    officer_reviewed_by: Optional[str] = None
    officer_reviewed_by_name: Optional[str] = None
    officer_reviewed_at: Optional[datetime] = None
    officer_comments: Optional[str] = None
    officer_accepted_assessment: Optional[bool] = None
    
    # HoP Approval
    hop_approved_by: Optional[str] = None
    hop_approved_by_name: Optional[str] = None
    hop_approved_at: Optional[datetime] = None
    hop_comments: Optional[str] = None
    
    # === Document Uploads ===
    uploaded_documents: List[DDDocumentUpload] = Field(default_factory=list)
    
    # === Audit Trail ===
    audit_log: List[DDAuditLog] = Field(default_factory=list)
    field_change_history: List[FieldChangeRecord] = Field(default_factory=list)
    
    def add_audit_log(self, action: str, details: Dict[str, Any], user_id: str, user_name: str):
        """Add an entry to the audit log"""
        entry = DDAuditLog(
            action=action,
            details=details,
            performed_by=user_id,
            performed_by_name=user_name
        )
        self.audit_log.append(entry)


# Default High-Risk Countries (can be updated via admin)
DEFAULT_HIGH_RISK_COUNTRIES = [
    "Russia",
    "North Korea",
    "Iran",
    "Syria",
    "Cuba",
    "Venezuela",
    "Myanmar",
    "Belarus",
    "Zimbabwe",
    "Sudan",
    "South Sudan",
    "Democratic Republic of Congo",
    "Central African Republic",
    "Libya",
    "Somalia",
    "Yemen",
    "Afghanistan",
    "Iraq",
]
