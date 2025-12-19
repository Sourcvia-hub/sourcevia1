"""
Contract Governance Models - AI-Powered Contract Intelligence System
Supports end-to-end contract journey with role-based governance
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


# ==================== ENUMS ====================

class ContractClassification(str, Enum):
    """Contract classification types based on SAMA requirements"""
    NOT_OUTSOURCING = "not_outsourcing"
    OUTSOURCING = "outsourcing"
    MATERIAL_OUTSOURCING = "material_outsourcing"
    CLOUD_COMPUTING = "cloud_computing"
    INSOURCING = "insourcing"
    EXEMPTED = "exempted"


class ContractRiskLevel(str, Enum):
    """Contract risk levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SAMANOCStatus(str, Enum):
    """SAMA NOC approval status"""
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"


class ContractDDStatus(str, Enum):
    """Contract Due Diligence status"""
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    APPROVED = "approved"
    REJECTED = "rejected"


class DataLocationChoice(str, Enum):
    """Data location options"""
    INSIDE_KSA = "inside_ksa"
    OUTSIDE_KSA = "outside_ksa"
    UNKNOWN = "unknown"


class ContractDuration(str, Enum):
    """Contract duration categories"""
    LESS_THAN_6_MONTHS = "less_than_6_months"
    SIX_TO_12_MONTHS = "6_to_12_months"
    MORE_THAN_12_MONTHS = "more_than_12_months"


# ==================== CONTRACT CONTEXT QUESTIONNAIRE ====================

class ContractContextQuestionnaire(BaseModel):
    """
    Contract Context Questionnaire - Filled by Business User during PR creation
    Used to determine outsourcing/cloud indicators early in the process
    """
    model_config = ConfigDict(extra="ignore")
    
    # Q1: Does the service require access to company systems or data?
    requires_system_data_access: Optional[str] = None  # "yes", "no", "unknown"
    
    # Q2: Is the service cloud-based?
    is_cloud_based: Optional[str] = None  # "yes", "no", "unknown"
    
    # Q3: Is the vendor operating a service on behalf of the company? (Outsourcing indicator)
    is_outsourcing_service: Optional[str] = None  # "yes", "no", "unknown"
    
    # Q4: Expected data location
    expected_data_location: Optional[DataLocationChoice] = None
    
    # Q5: Is onsite presence required?
    requires_onsite_presence: Optional[str] = None  # "yes", "no"
    
    # Q6: Expected contract duration
    expected_duration: Optional[ContractDuration] = None
    
    # Internal notes by procurement officer
    procurement_notes: Optional[str] = None
    
    # Validation status
    validated_by_procurement: bool = False
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None


# ==================== CONTRACT AI EXTRACTION ====================

class ContractAIExtraction(BaseModel):
    """
    AI-extracted data from uploaded contract documents
    """
    model_config = ConfigDict(extra="ignore")
    
    # Extracted SOW summary
    sow_summary: Optional[str] = None
    sow_details: Optional[str] = None
    
    # Extracted SLA summary
    sla_summary: Optional[str] = None
    sla_details: Optional[List[Dict[str, Any]]] = []  # Priority levels, response times, etc.
    
    # Contract duration
    extracted_start_date: Optional[str] = None
    extracted_end_date: Optional[str] = None
    extracted_duration_months: Optional[int] = None
    
    # Contract value
    extracted_value: Optional[float] = None
    extracted_currency: Optional[str] = "SAR"
    
    # Milestones
    extracted_milestones: Optional[List[Dict[str, Any]]] = []
    
    # Parties
    supplier_name: Optional[str] = None
    supplier_country: Optional[str] = None
    
    # Key exhibits identified
    exhibits_identified: Optional[List[str]] = []
    
    # AI analysis metadata
    extraction_confidence: Optional[float] = None
    extraction_notes: Optional[str] = None
    extracted_at: Optional[datetime] = None


# ==================== AI ADVISORY ====================

class DraftingHint(BaseModel):
    """Drafting hint for a specific exhibit"""
    model_config = ConfigDict(extra="ignore")
    
    exhibit_number: int
    exhibit_name: str
    hint_text: str
    is_critical: bool = False
    relevant_for: List[str] = []  # ["outsourcing", "cloud", "data_processing"]


class ClauseSuggestion(BaseModel):
    """AI-suggested clause for the contract"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    clause_type: str  # "exit_plan", "bcp", "insurance", "dpa", etc.
    clause_title: str
    clause_text: str
    reason: str
    exhibit_reference: Optional[str] = None
    is_mandatory: bool = False
    applied: bool = False
    applied_by: Optional[str] = None
    applied_at: Optional[datetime] = None


class ConsistencyWarning(BaseModel):
    """Consistency check warning between PR and Contract"""
    model_config = ConfigDict(extra="ignore")
    
    warning_type: str  # "scope_mismatch", "vendor_mismatch", "value_mismatch"
    severity: str  # "low", "medium", "high"
    pr_value: Optional[str] = None
    contract_value: Optional[str] = None
    description: str
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None


class ContractAIAdvisory(BaseModel):
    """
    AI Advisory for contract - includes drafting hints, clause suggestions, and warnings
    """
    model_config = ConfigDict(extra="ignore")
    
    # Drafting hints per exhibit
    drafting_hints: List[DraftingHint] = []
    
    # Suggested clauses
    clause_suggestions: List[ClauseSuggestion] = []
    
    # Consistency warnings
    consistency_warnings: List[ConsistencyWarning] = []
    
    # Overall AI notes
    ai_analysis_notes: Optional[str] = None
    
    # Metadata
    generated_at: Optional[datetime] = None
    last_updated: Optional[datetime] = None


# ==================== CONTRACT RISK ASSESSMENT ====================

class ContractRiskAssessment(BaseModel):
    """
    Contract-level risk assessment
    """
    model_config = ConfigDict(extra="ignore")
    
    # Risk score (0-100)
    risk_score: float = 0.0
    risk_level: ContractRiskLevel = ContractRiskLevel.LOW
    
    # Risk drivers
    top_risk_drivers: List[str] = []
    
    # Risk factors breakdown
    vendor_risk_contribution: float = 0.0
    data_exposure_risk: float = 0.0
    outsourcing_cloud_risk: float = 0.0
    duration_dependency_risk: float = 0.0
    value_risk: float = 0.0
    
    # Required actions based on risk
    requires_contract_dd: bool = False
    requires_sama_noc: bool = False
    requires_risk_acceptance: bool = False
    
    # Assessment metadata
    assessed_by: Optional[str] = None  # "ai" or user_id
    assessed_at: Optional[datetime] = None
    notes: Optional[str] = None


# ==================== SAMA NOC TRACKING ====================

class SAMANOCTracking(BaseModel):
    """
    SAMA NOC (No Objection Certificate) tracking
    """
    model_config = ConfigDict(extra="ignore")
    
    # Status
    status: SAMANOCStatus = SAMANOCStatus.NOT_REQUIRED
    
    # Reference details
    reference_number: Optional[str] = None
    
    # Dates
    submission_date: Optional[datetime] = None
    approval_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    
    # Documents
    submission_document_id: Optional[str] = None
    approval_document_id: Optional[str] = None
    
    # Notes
    submission_notes: Optional[str] = None
    approval_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # Audit trail
    submitted_by: Optional[str] = None
    approved_by: Optional[str] = None
    last_updated_by: Optional[str] = None
    last_updated_at: Optional[datetime] = None


# ==================== CONTRACT DUE DILIGENCE ====================

class ContractDDQuestion(BaseModel):
    """Individual DD question response"""
    model_config = ConfigDict(extra="ignore")
    
    question_id: str
    section: str
    question_text: str
    answer: Optional[str] = None  # "yes", "no", or free text
    notes: Optional[str] = None
    evidence_document_id: Optional[str] = None


class ContractDDAnalysis(BaseModel):
    """
    AI analysis of Contract Due Diligence document
    """
    model_config = ConfigDict(extra="ignore")
    
    # Overall DD risk
    dd_risk_level: ContractRiskLevel = ContractRiskLevel.MEDIUM
    dd_risk_score: float = 50.0
    
    # Key findings
    key_findings: List[str] = []
    
    # Missing items
    missing_items: List[str] = []
    
    # Required follow-ups
    required_followups: List[str] = []
    
    # Section-wise summary
    business_continuity_summary: Optional[str] = None
    anti_fraud_summary: Optional[str] = None
    operational_risks_summary: Optional[str] = None
    cyber_security_summary: Optional[str] = None
    safety_security_summary: Optional[str] = None
    regulatory_summary: Optional[str] = None
    data_management_summary: Optional[str] = None
    sama_compliance_summary: Optional[str] = None
    
    # Analysis metadata
    analyzed_at: Optional[datetime] = None
    analysis_confidence: Optional[float] = None


class ContractDueDiligence(BaseModel):
    """
    Contract Due Diligence - Full questionnaire and analysis
    """
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contract_id: str
    
    # Status
    status: ContractDDStatus = ContractDDStatus.NOT_REQUIRED
    
    # Questionnaire responses (from uploaded document or manual entry)
    questionnaire_responses: List[ContractDDQuestion] = []
    
    # Uploaded document
    dd_document_id: Optional[str] = None
    dd_document_version: int = 1
    
    # AI Analysis
    ai_analysis: Optional[ContractDDAnalysis] = None
    
    # Workflow
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    # Notes
    completion_notes: Optional[str] = None
    review_notes: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== ENHANCED CONTRACT MODEL ====================

class ContractGovernanceData(BaseModel):
    """
    Extended contract governance data - to be embedded in Contract model
    """
    model_config = ConfigDict(extra="ignore")
    
    # Contract Context (from PR)
    context_questionnaire: Optional[ContractContextQuestionnaire] = None
    
    # AI Extraction (from uploaded contract)
    ai_extraction: Optional[ContractAIExtraction] = None
    
    # AI Advisory
    ai_advisory: Optional[ContractAIAdvisory] = None
    
    # Classification
    classification: Optional[ContractClassification] = None
    classification_reason: Optional[str] = None
    classification_by: Optional[str] = None  # "ai" or user_id
    classification_at: Optional[datetime] = None
    
    # Risk Assessment
    risk_assessment: Optional[ContractRiskAssessment] = None
    
    # SAMA NOC
    sama_noc: Optional[SAMANOCTracking] = None
    
    # Creation method
    creation_method: Optional[str] = None  # "upload" or "manual"
    uploaded_contract_document_id: Optional[str] = None


# ==================== SERVICE AGREEMENT EXHIBITS ====================

SERVICE_AGREEMENT_EXHIBITS = [
    {"number": 1, "name": "Definitions", "always_required": True},
    {"number": 2, "name": "Statement of Work", "always_required": True},
    {"number": 3, "name": "Service Levels", "always_required": True},
    {"number": 4, "name": "Pricing and Financial Provisions", "always_required": True},
    {"number": 5, "name": "Human Resources", "always_required": False},
    {"number": 6, "name": "Sites", "always_required": False},
    {"number": 7, "name": "Technical Architecture", "always_required": False},
    {"number": 8, "name": "Reports", "always_required": False},
    {"number": 9, "name": "Business Continuity Plan and Disaster Recovery Plan", "always_required": False, "required_for": ["outsourcing", "cloud"]},
    {"number": 10, "name": "Duration", "always_required": True},
    {"number": 11, "name": "Supplier Insurance Requirements", "always_required": False, "required_for": ["outsourcing"]},
    {"number": 12, "name": "Termination Assistance Compensation", "always_required": False, "required_for": ["material_outsourcing"]},
    {"number": 13, "name": "Termination Assistance", "always_required": False, "required_for": ["material_outsourcing"]},
    {"number": 14, "name": "Data Processing Agreement", "always_required": False, "required_for": ["personal_data"]},
]


# ==================== CONTRACT DD QUESTIONNAIRE TEMPLATE ====================

CONTRACT_DD_QUESTIONNAIRE_SECTIONS = [
    {
        "section": "Business Continuity",
        "questions": [
            {"id": "bc_1", "text": "Will the Vendor rely on third parties for the services it provides to the company?"},
            {"id": "bc_2", "text": "Does the Vendor intend or plan to outsource or subcontract any business in relation to the contractual relationship with the company?"},
            {"id": "bc_3", "text": "Has the Vendor been exposed to events that caused its business to stop for a period exceeding one week during the last 3 years?"},
            {"id": "bc_4", "text": "Does the Vendor have alternative locations in place to ensure business continuity?"},
            {"id": "bc_5", "text": "What is the frequency of business continuity site readiness tests?", "type": "text"},
            {"id": "bc_6", "text": "Is the Vendor registered (certified) to any recognized Business Continuity Standard?"},
            {"id": "bc_7", "text": "Does the Vendor have staff assigned to undertake Business Continuity Management (BCM) with clearly defined and documented roles & responsibilities?"},
            {"id": "bc_8", "text": "Did the vendor assess the risks to its operations and taken the necessary actions to protect its continuity of business?"},
            {"id": "bc_9", "text": "Did the vendor identify and mitigate risks or threats to the business operations from specific events?"},
            {"id": "bc_10", "text": "Did the vendor identify the activities that are essential for its delivery of products, services and works?"},
            {"id": "bc_11", "text": "Does the vendor have a business continuity strategy for people, premises, technology, information, suppliers and stakeholders?"},
            {"id": "bc_12", "text": "Did the vendor engage with local emergency responders to develop plans for helping during an emergency?"},
            {"id": "bc_13", "text": "Does the vendor update its Business Continuity arrangement regularly?"},
            {"id": "bc_14", "text": "Does the vendor have a documented strategy for exercising the Business Continuity Plan?"},
            {"id": "bc_15", "text": "Can the Vendor provide information on its exercising program, and evidence of its most recent exercises?"},
            {"id": "bc_16", "text": "Does the vendor use exercise results to improve and update its BCM arrangements?"},
            {"id": "bc_17", "text": "Are the vendor's senior management & operational management teams trained in business continuity and managing incidents?"},
            {"id": "bc_18", "text": "Are all staff aware of the BC Procedures and their roles and responsibilities within them?"},
            {"id": "bc_19", "text": "Does the Vendor have a proven and effective IT Continuity Plan?"},
            {"id": "bc_20", "text": "Is all critical data backed up and readily available offsite?"},
            {"id": "bc_21", "text": "Are copies of all vital documents and records readily available offsite?"},
            {"id": "bc_22", "text": "Has the vendor identified its critical suppliers of goods & services?"},
            {"id": "bc_23", "text": "Has the vendor consulted its suppliers during the preparation of plans?"},
            {"id": "bc_24", "text": "Does the Vendor have a method to communicate with its key staff/stakeholders during a service disruption?"},
            {"id": "bc_25", "text": "Does the Vendor have the capability to manage a public relation situation affecting reputation?"},
        ]
    },
    {
        "section": "Anti-Fraud",
        "questions": [
            {"id": "af_1", "text": "Has the Vendor been subject to internal fraud in the last year?"},
            {"id": "af_2", "text": "Has the Vendor been subject to a burglary/theft in the last year?"},
        ]
    },
    {
        "section": "Operational Risks",
        "questions": [
            {"id": "or_1", "text": "Does providing the service require obtaining a specific business license?"},
            {"id": "or_2", "text": "Will the Vendor provide its outsourced services from outside the Kingdom of Saudi Arabia?"},
            {"id": "or_3", "text": "Does the Vendor have approved policies for dealing with conflicts of interest?"},
            {"id": "or_4", "text": "Does the Vendor have policies and procedures for handling and escalating customer complaints?"},
            {"id": "or_5", "text": "Has the Vendor faced any customer complaints about the services and products provided during the last year?"},
            {"id": "or_6", "text": "Does the Vendor have insurance contracts for its properties and systems?"},
        ]
    },
    {
        "section": "Cyber Security",
        "questions": [
            {"id": "cs_1", "text": "Does the Vendor engagement result in deploying cloud services?"},
            {"id": "cs_2", "text": "Does the Vendor engagement result in processing or hosting data outside KSA?"},
            {"id": "cs_3", "text": "Does the Vendor engagement result in managing its services through remote access outside KSA?"},
            {"id": "cs_4", "text": "Does the Vendor engagement result in deploying the services through digital channels?"},
            {"id": "cs_5", "text": "Does the Vendor engagement result in adding or a change in Cards related payments?"},
            {"id": "cs_6", "text": "Does the Vendor engagement result in granting access to company systems to third parties?"},
        ]
    },
    {
        "section": "Safety and Security Measures",
        "questions": [
            {"id": "ss_1", "text": "Does the Vendor have Security and Safety procedures?"},
            {"id": "ss_2", "text": "Are the Vendor's security jobs available 24/7?"},
            {"id": "ss_3", "text": "Do the Vendor's sites have security equipment? (CCTV, intrusion detection devices)"},
            {"id": "ss_4", "text": "Do the Vendor's sites have safety equipment? (Emergency exits, fire extinguishers, first aid boxes)"},
        ]
    },
    {
        "section": "Judicial / Legal Representation",
        "questions": [
            {"id": "jl_1", "text": "Will the company be formally represented in a court, in front a judicial body, or public authority?"},
        ]
    },
    {
        "section": "Regulatory Authorities",
        "questions": [
            {"id": "ra_1", "text": "Are the Vendor business activities regulated by instructions of a regulatory or official government body?"},
            {"id": "ra_2", "text": "Are the Vendor's financial statements audited by an independent auditor?"},
        ]
    },
    {
        "section": "Data Management",
        "questions": [
            {"id": "dm_1", "text": "Does the Vendor have a policy for managing, protecting, processing and storing customer data?"},
        ]
    },
    {
        "section": "Financial Consumer Protection Principles and Rules",
        "questions": [
            {"id": "fc_1", "text": "Have the Vendor and its employees read, reviewed and understood the Financial Consumer Protection Principles and Rules issued by the Saudi Central Bank?"},
            {"id": "fc_2", "text": "Will the Vendor and its employees comply with the Financial Consumer Protection Principles and Rules issued by the Saudi Central Bank?"},
        ]
    },
]
