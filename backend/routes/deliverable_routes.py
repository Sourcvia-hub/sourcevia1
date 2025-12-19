"""
Deliverable and Payment Authorization Routes
"""
from fastapi import APIRouter, HTTPException, Request
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from pydantic import BaseModel
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/deliverables", tags=["Deliverables"])

# Import dependencies
from utils.database import db
from utils.auth import require_auth
from services.payment_authorization_ai_service import get_payment_authorization_ai_service
from models.deliverable import (
    Deliverable,
    DeliverableStatus,
    DeliverableType,
    PaymentAuthorization,
    PaymentAuthorizationStatus
)


# ==================== REQUEST MODELS ====================

class CreateDeliverableRequest(BaseModel):
    contract_id: Optional[str] = None
    po_id: Optional[str] = None
    tender_id: Optional[str] = None
    vendor_id: str
    title: str
    description: str
    deliverable_type: str = "milestone"
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    due_date: Optional[str] = None
    amount: float = 0.0
    currency: str = "SAR"
    percentage_of_contract: Optional[float] = None
    documents: List[str] = []


class UpdateDeliverableRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deliverable_type: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    due_date: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    documents: Optional[List[str]] = None


class ReviewDeliverableRequest(BaseModel):
    status: str  # "accepted", "rejected", "partially_accepted"
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class PAFApprovalRequest(BaseModel):
    decision: str  # "approved", "rejected"
    notes: Optional[str] = None


# ==================== HELPER FUNCTIONS ====================

async def generate_deliverable_number() -> str:
    """Generate unique deliverable number"""
    year = datetime.now().year
    count = await db.deliverables.count_documents({})
    return f"DEL-{year}-{str(count + 1).zfill(4)}"


async def generate_paf_number() -> str:
    """Generate unique PAF number"""
    year = datetime.now().year
    count = await db.payment_authorizations.count_documents({})
    return f"PAF-{year}-{str(count + 1).zfill(4)}"


def add_audit_trail(paf: Dict, action: str, user_id: str, notes: Optional[str] = None) -> List[Dict]:
    """Add entry to PAF audit trail"""
    audit_trail = paf.get("audit_trail", [])
    audit_trail.append({
        "action": action,
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": notes
    })
    return audit_trail


# ==================== DELIVERABLE ENDPOINTS ====================

@router.get("")
async def list_deliverables(
    request: Request,
    contract_id: Optional[str] = None,
    po_id: Optional[str] = None,
    vendor_id: Optional[str] = None,
    status: Optional[str] = None
):
    """List deliverables with optional filters"""
    user = await require_auth(request)
    
    query = {}
    if contract_id:
        query["contract_id"] = contract_id
    if po_id:
        query["po_id"] = po_id
    if vendor_id:
        query["vendor_id"] = vendor_id
    if status:
        query["status"] = status
    
    deliverables = await db.deliverables.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return {"deliverables": deliverables, "count": len(deliverables)}


@router.post("")
async def create_deliverable(
    request: Request,
    data: CreateDeliverableRequest
):
    """Create a new deliverable"""
    user = await require_auth(request)
    
    # Validate references
    if data.contract_id:
        contract = await db.contracts.find_one({"id": data.contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
    
    if data.po_id:
        po = await db.purchase_orders.find_one({"id": data.po_id})
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    # Create deliverable
    deliverable = Deliverable(
        deliverable_number=await generate_deliverable_number(),
        contract_id=data.contract_id,
        po_id=data.po_id,
        tender_id=data.tender_id,
        vendor_id=data.vendor_id,
        title=data.title,
        description=data.description,
        deliverable_type=DeliverableType(data.deliverable_type) if data.deliverable_type else DeliverableType.MILESTONE,
        period_start=datetime.fromisoformat(data.period_start) if data.period_start else None,
        period_end=datetime.fromisoformat(data.period_end) if data.period_end else None,
        due_date=datetime.fromisoformat(data.due_date) if data.due_date else None,
        amount=data.amount,
        currency=data.currency,
        percentage_of_contract=data.percentage_of_contract,
        documents=data.documents,
        status=DeliverableStatus.DRAFT,
        created_by=user.id
    )
    
    await db.deliverables.insert_one(deliverable.model_dump())
    
    return {"success": True, "deliverable": deliverable.model_dump()}


@router.get("/{deliverable_id}")
async def get_deliverable(deliverable_id: str, request: Request):
    """Get a single deliverable with enriched data"""
    user = await require_auth(request)
    
    deliverable = await db.deliverables.find_one({"id": deliverable_id}, {"_id": 0})
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    # Enrich with related data
    if deliverable.get("contract_id"):
        contract = await db.contracts.find_one({"id": deliverable["contract_id"]}, {"_id": 0, "title": 1, "contract_number": 1, "value": 1})
        deliverable["contract_info"] = contract
    
    if deliverable.get("po_id"):
        po = await db.purchase_orders.find_one({"id": deliverable["po_id"]}, {"_id": 0, "po_number": 1, "total_amount": 1})
        deliverable["po_info"] = po
    
    if deliverable.get("vendor_id"):
        vendor = await db.vendors.find_one({"id": deliverable["vendor_id"]}, {"_id": 0, "name_english": 1, "commercial_name": 1})
        deliverable["vendor_info"] = vendor
    
    if deliverable.get("payment_authorization_id"):
        paf = await db.payment_authorizations.find_one({"id": deliverable["payment_authorization_id"]}, {"_id": 0})
        deliverable["payment_authorization"] = paf
    
    return deliverable


@router.put("/{deliverable_id}")
async def update_deliverable(
    deliverable_id: str,
    data: UpdateDeliverableRequest,
    request: Request
):
    """Update a deliverable"""
    user = await require_auth(request)
    
    deliverable = await db.deliverables.find_one({"id": deliverable_id})
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    # Only allow updates on draft or submitted status
    if deliverable.get("status") not in ["draft", "submitted"]:
        raise HTTPException(status_code=400, detail=f"Cannot update deliverable in '{deliverable.get('status')}' status")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.deliverables.update_one({"id": deliverable_id}, {"$set": update_data})
    
    return {"success": True, "message": "Deliverable updated"}


@router.post("/{deliverable_id}/submit")
async def submit_deliverable(deliverable_id: str, request: Request):
    """Submit a deliverable for review"""
    user = await require_auth(request)
    
    deliverable = await db.deliverables.find_one({"id": deliverable_id})
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    if deliverable.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only draft deliverables can be submitted")
    
    await db.deliverables.update_one(
        {"id": deliverable_id},
        {"$set": {
            "status": "submitted",
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "submitted_by": user.id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Deliverable submitted for review"}


@router.post("/{deliverable_id}/review")
async def review_deliverable(
    deliverable_id: str,
    data: ReviewDeliverableRequest,
    request: Request
):
    """Review/accept/reject a deliverable"""
    user = await require_auth(request)
    
    deliverable = await db.deliverables.find_one({"id": deliverable_id})
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    if deliverable.get("status") not in ["submitted", "under_review"]:
        raise HTTPException(status_code=400, detail="Deliverable must be submitted before review")
    
    valid_statuses = ["accepted", "rejected", "partially_accepted"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    update_data = {
        "status": data.status,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": user.id,
        "review_notes": data.review_notes,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if data.status == "rejected":
        update_data["rejection_reason"] = data.rejection_reason
    
    await db.deliverables.update_one({"id": deliverable_id}, {"$set": update_data})
    
    return {"success": True, "message": f"Deliverable {data.status}"}


@router.post("/{deliverable_id}/validate-ai")
async def validate_deliverable_ai(deliverable_id: str, request: Request):
    """Run AI validation on a deliverable"""
    user = await require_auth(request)
    
    deliverable = await db.deliverables.find_one({"id": deliverable_id}, {"_id": 0})
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    # Get related data
    contract = None
    po = None
    tender = None
    vendor = None
    
    if deliverable.get("contract_id"):
        contract = await db.contracts.find_one({"id": deliverable["contract_id"]}, {"_id": 0})
    if deliverable.get("po_id"):
        po = await db.purchase_orders.find_one({"id": deliverable["po_id"]}, {"_id": 0})
    if deliverable.get("tender_id"):
        tender = await db.tenders.find_one({"id": deliverable["tender_id"]}, {"_id": 0})
    if deliverable.get("vendor_id"):
        vendor = await db.vendors.find_one({"id": deliverable["vendor_id"]}, {"_id": 0})
    
    # Run AI validation
    ai_service = get_payment_authorization_ai_service()
    validation = await ai_service.validate_deliverable_for_payment(
        deliverable, contract, po, tender, vendor
    )
    
    # Update deliverable with AI validation
    await db.deliverables.update_one(
        {"id": deliverable_id},
        {"$set": {
            "ai_validation_summary": validation.get("advisory_summary"),
            "ai_validation_status": validation.get("payment_readiness"),
            "ai_validated_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "validation": validation}


# ==================== PAYMENT AUTHORIZATION ENDPOINTS ====================

@router.post("/{deliverable_id}/generate-paf")
async def generate_payment_authorization(deliverable_id: str, request: Request):
    """
    Generate Payment Authorization Form from an accepted deliverable
    Only available when deliverable status = accepted
    """
    user = await require_auth(request)
    
    # Get deliverable
    deliverable = await db.deliverables.find_one({"id": deliverable_id}, {"_id": 0})
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    # Validate status
    if deliverable.get("status") != "accepted":
        raise HTTPException(
            status_code=400,
            detail=f"Payment Authorization can only be generated for accepted deliverables. Current status: {deliverable.get('status')}"
        )
    
    # Check if PAF already exists
    if deliverable.get("payment_authorization_id"):
        raise HTTPException(
            status_code=400,
            detail="Payment Authorization already exists for this deliverable"
        )
    
    # Get related data
    contract = None
    po = None
    tender = None
    vendor = None
    
    if deliverable.get("contract_id"):
        contract = await db.contracts.find_one({"id": deliverable["contract_id"]}, {"_id": 0})
    if deliverable.get("po_id"):
        po = await db.purchase_orders.find_one({"id": deliverable["po_id"]}, {"_id": 0})
    if deliverable.get("tender_id"):
        tender = await db.tenders.find_one({"id": deliverable["tender_id"]}, {"_id": 0})
    if deliverable.get("vendor_id"):
        vendor = await db.vendors.find_one({"id": deliverable["vendor_id"]}, {"_id": 0})
    
    # Run AI validation for PAF
    ai_service = get_payment_authorization_ai_service()
    validation = await ai_service.validate_deliverable_for_payment(
        deliverable, contract, po, tender, vendor
    )
    
    # Create Payment Authorization Form
    paf = PaymentAuthorization(
        paf_number=await generate_paf_number(),
        generated_date=datetime.now(timezone.utc),
        generated_by=user.id,
        
        # Deliverable reference
        deliverable_id=deliverable_id,
        deliverable_number=deliverable.get("deliverable_number"),
        deliverable_description=deliverable.get("description"),
        deliverable_period_start=deliverable.get("period_start"),
        deliverable_period_end=deliverable.get("period_end"),
        
        # Vendor reference
        vendor_id=deliverable.get("vendor_id"),
        vendor_name=vendor.get("name_english") or vendor.get("commercial_name") if vendor else None,
        
        # Contract/PO reference
        contract_id=deliverable.get("contract_id"),
        contract_number=contract.get("contract_number") if contract else None,
        contract_title=contract.get("title") if contract else None,
        
        po_id=deliverable.get("po_id"),
        po_number=po.get("po_number") if po else None,
        
        # Tender/PR reference
        tender_id=deliverable.get("tender_id"),
        tender_number=tender.get("tender_number") if tender else None,
        project_name=tender.get("project_name") if tender else None,
        
        # Financial
        authorized_amount=deliverable.get("amount", 0),
        currency=deliverable.get("currency", "SAR"),
        
        # Supporting documents
        supporting_documents=deliverable.get("documents", []),
        
        # AI Validation
        ai_deliverable_validation=deliverable.get("ai_validation_summary"),
        ai_payment_readiness=validation.get("payment_readiness"),
        ai_key_observations=validation.get("key_observations", []),
        ai_required_clarifications=validation.get("required_clarifications", []),
        ai_advisory_summary=validation.get("advisory_summary"),
        ai_confidence=validation.get("confidence"),
        
        # Status
        status=PaymentAuthorizationStatus.GENERATED,
        
        # Initial audit trail
        audit_trail=[{
            "action": "generated",
            "user_id": user.id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": "Payment Authorization Form generated from accepted deliverable"
        }]
    )
    
    # Save PAF
    await db.payment_authorizations.insert_one(paf.model_dump())
    
    # Update deliverable with PAF link
    await db.deliverables.update_one(
        {"id": deliverable_id},
        {"$set": {
            "payment_authorization_id": paf.id,
            "payment_authorization_status": "generated",
            "payment_authorization_date": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "success": True,
        "payment_authorization": paf.model_dump(),
        "message": f"Payment Authorization {paf.paf_number} generated successfully"
    }


@router.get("/paf/list")
async def list_payment_authorizations(
    request: Request,
    status: Optional[str] = None,
    vendor_id: Optional[str] = None
):
    """List Payment Authorization Forms"""
    user = await require_auth(request)
    
    query = {}
    if status:
        query["status"] = status
    if vendor_id:
        query["vendor_id"] = vendor_id
    
    pafs = await db.payment_authorizations.find(query, {"_id": 0}).sort("generated_date", -1).to_list(100)
    
    return {"payment_authorizations": pafs, "count": len(pafs)}


@router.get("/paf/{paf_id}")
async def get_payment_authorization(paf_id: str, request: Request):
    """Get a single Payment Authorization Form"""
    user = await require_auth(request)
    
    paf = await db.payment_authorizations.find_one({"id": paf_id}, {"_id": 0})
    if not paf:
        raise HTTPException(status_code=404, detail="Payment Authorization not found")
    
    return paf


@router.post("/paf/{paf_id}/approve")
async def approve_payment_authorization(
    paf_id: str,
    data: PAFApprovalRequest,
    request: Request
):
    """Approve or reject a Payment Authorization Form"""
    user = await require_auth(request)
    
    paf = await db.payment_authorizations.find_one({"id": paf_id})
    if not paf:
        raise HTTPException(status_code=404, detail="Payment Authorization not found")
    
    if paf.get("status") not in ["generated", "pending_approval"]:
        raise HTTPException(status_code=400, detail=f"Cannot process PAF in '{paf.get('status')}' status")
    
    valid_decisions = ["approved", "rejected"]
    if data.decision not in valid_decisions:
        raise HTTPException(status_code=400, detail=f"Invalid decision. Must be one of: {valid_decisions}")
    
    # Add to audit trail
    audit_trail = add_audit_trail(paf, data.decision, user.id, data.notes)
    
    update_data = {
        "status": data.decision,
        "audit_trail": audit_trail,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if data.decision == "approved":
        update_data["approved_by"] = user.id
        update_data["approved_at"] = datetime.now(timezone.utc).isoformat()
        update_data["approval_notes"] = data.notes
    else:
        update_data["rejected_by"] = user.id
        update_data["rejected_at"] = datetime.now(timezone.utc).isoformat()
        update_data["rejection_reason"] = data.notes
    
    await db.payment_authorizations.update_one({"id": paf_id}, {"$set": update_data})
    
    # Update linked deliverable
    if paf.get("deliverable_id"):
        await db.deliverables.update_one(
            {"id": paf["deliverable_id"]},
            {"$set": {
                "payment_authorization_status": data.decision,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    return {"success": True, "message": f"Payment Authorization {data.decision}"}


@router.post("/paf/{paf_id}/export")
async def export_payment_authorization(paf_id: str, request: Request):
    """Mark a Payment Authorization as exported"""
    user = await require_auth(request)
    
    paf = await db.payment_authorizations.find_one({"id": paf_id})
    if not paf:
        raise HTTPException(status_code=404, detail="Payment Authorization not found")
    
    if paf.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Only approved PAFs can be exported")
    
    # Add to audit trail
    audit_trail = add_audit_trail(paf, "exported", user.id, "Payment Authorization exported for processing")
    
    export_ref = f"EXP-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    await db.payment_authorizations.update_one(
        {"id": paf_id},
        {"$set": {
            "exported": True,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "exported_by": user.id,
            "export_reference": export_ref,
            "audit_trail": audit_trail,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "export_reference": export_ref, "message": "Payment Authorization exported"}
