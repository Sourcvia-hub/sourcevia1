"""
Bulk Import Routes - CSV/Excel import for vendors, contracts, and other data
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from uuid import uuid4
import csv
import io
import json

from utils.database import db
from utils.auth import require_create_permission, require_permission
from utils.permissions import Permission

router = APIRouter(prefix="/bulk-import", tags=["Bulk Import"])


# ============== IMPORT TEMPLATES ==============

@router.get("/templates/{entity_type}")
async def get_import_template(entity_type: str, request: Request):
    """Get CSV template for bulk import"""
    await require_permission(request, "dashboard", Permission.VIEWER)
    
    templates = {
        "vendors": {
            "columns": [
                "name_english", "commercial_name", "entity_type", "vat_number", 
                "cr_number", "email", "mobile", "city", "country", 
                "bank_name", "iban", "vendor_type"
            ],
            "required": ["name_english", "email", "city", "country"],
            "sample_row": {
                "name_english": "Sample Company Ltd",
                "commercial_name": "Sample Co",
                "entity_type": "LLC",
                "vat_number": "VAT123456",
                "cr_number": "CR789012",
                "email": "contact@sample.com",
                "mobile": "+966501234567",
                "city": "Riyadh",
                "country": "Saudi Arabia",
                "bank_name": "Sample Bank",
                "iban": "SA1234567890123456789012",
                "vendor_type": "local"
            }
        },
        "purchase_orders": {
            "columns": [
                "vendor_name_or_id", "item_name", "quantity", "unit_price",
                "delivery_days", "notes"
            ],
            "required": ["vendor_name_or_id", "item_name", "quantity", "unit_price"],
            "sample_row": {
                "vendor_name_or_id": "Sample Company Ltd",
                "item_name": "Office Supplies",
                "quantity": "10",
                "unit_price": "100.00",
                "delivery_days": "30",
                "notes": "Monthly order"
            }
        },
        "invoices": {
            "columns": [
                "vendor_name_or_id", "invoice_number", "amount", 
                "description", "contract_number"
            ],
            "required": ["vendor_name_or_id", "invoice_number", "amount"],
            "sample_row": {
                "vendor_name_or_id": "Sample Company Ltd",
                "invoice_number": "INV-2025-001",
                "amount": "5000.00",
                "description": "Monthly service",
                "contract_number": "CNT-25-0001"
            }
        },
        "contracts": {
            "columns": [
                "vendor_name_or_id", "title", "value", "start_date", 
                "end_date", "sow", "sla"
            ],
            "required": ["vendor_name_or_id", "title", "value", "start_date", "end_date"],
            "sample_row": {
                "vendor_name_or_id": "Sample Company Ltd",
                "title": "IT Support Services",
                "value": "100000.00",
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "sow": "Provide IT support services",
                "sla": "99.9% uptime"
            }
        }
    }
    
    if entity_type not in templates:
        raise HTTPException(status_code=400, detail=f"Invalid entity type. Valid types: {list(templates.keys())}")
    
    return templates[entity_type]


@router.get("/templates/{entity_type}/csv")
async def download_csv_template(entity_type: str, request: Request):
    """Download CSV template file"""
    from fastapi.responses import StreamingResponse
    
    await require_permission(request, "dashboard", Permission.VIEWER)
    
    template = await get_import_template(entity_type, request)
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=template["columns"])
    writer.writeheader()
    writer.writerow(template["sample_row"])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={entity_type}_import_template.csv"
        }
    )


# ============== BULK VENDOR IMPORT ==============

class BulkImportResult(BaseModel):
    total_rows: int
    successful: int
    failed: int
    errors: List[Dict[str, Any]]
    created_ids: List[str]

@router.post("/vendors")
async def bulk_import_vendors(request: Request, file: UploadFile = File(...)):
    """
    Bulk import vendors from CSV file.
    Required columns: name_english, email, city, country
    """
    user = await require_create_permission(request, "vendors")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    reader = csv.DictReader(io.StringIO(decoded))
    
    results = {
        "total_rows": 0,
        "successful": 0,
        "failed": 0,
        "errors": [],
        "created_ids": []
    }
    
    for row_num, row in enumerate(reader, start=2):  # Start at 2 (row 1 is header)
        results["total_rows"] += 1
        
        try:
            # Validate required fields
            required = ["name_english", "email", "city", "country"]
            missing = [f for f in required if not row.get(f, "").strip()]
            if missing:
                raise ValueError(f"Missing required fields: {', '.join(missing)}")
            
            # Check for duplicate email
            existing = await db.vendors.find_one({"email": row["email"].strip()})
            if existing:
                raise ValueError(f"Vendor with email {row['email']} already exists")
            
            # Create vendor document
            vendor_doc = {
                "id": str(uuid4()),
                "name_english": row.get("name_english", "").strip(),
                "commercial_name": row.get("commercial_name", "").strip(),
                "entity_type": row.get("entity_type", "").strip(),
                "vat_number": row.get("vat_number", "").strip(),
                "cr_number": row.get("cr_number", "").strip(),
                "email": row.get("email", "").strip(),
                "mobile": row.get("mobile", "").strip(),
                "city": row.get("city", "").strip(),
                "country": row.get("country", "").strip(),
                "bank_name": row.get("bank_name", "").strip(),
                "iban": row.get("iban", "").strip(),
                "vendor_type": row.get("vendor_type", "local").strip() or "local",
                "status": "draft",
                "risk_category": "low",
                "dd_required": False,
                "dd_completed": False,
                "created_by": user.id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.vendors.insert_one(vendor_doc)
            results["successful"] += 1
            results["created_ids"].append(vendor_doc["id"])
            
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({
                "row": row_num,
                "data": dict(row),
                "error": str(e)
            })
    
    return results


# ============== BULK PO IMPORT ==============

@router.post("/purchase-orders")
async def bulk_import_pos(request: Request, file: UploadFile = File(...)):
    """
    Bulk import purchase orders from CSV file.
    Groups items by vendor into single POs.
    Required columns: vendor_name_or_id, item_name, quantity, unit_price
    """
    user = await require_create_permission(request, "purchase_orders")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    reader = csv.DictReader(io.StringIO(decoded))
    
    # Group items by vendor
    vendor_items = {}
    errors = []
    total_rows = 0
    
    for row_num, row in enumerate(reader, start=2):
        total_rows += 1
        
        try:
            # Validate required fields
            required = ["vendor_name_or_id", "item_name", "quantity", "unit_price"]
            missing = [f for f in required if not row.get(f, "").strip()]
            if missing:
                raise ValueError(f"Missing required fields: {', '.join(missing)}")
            
            vendor_ref = row["vendor_name_or_id"].strip()
            
            # Find vendor by ID or name
            vendor = await db.vendors.find_one({
                "$or": [
                    {"id": vendor_ref},
                    {"name_english": {"$regex": vendor_ref, "$options": "i"}},
                    {"commercial_name": {"$regex": vendor_ref, "$options": "i"}}
                ]
            })
            
            if not vendor:
                raise ValueError(f"Vendor not found: {vendor_ref}")
            
            if vendor.get("status") != "approved":
                raise ValueError(f"Vendor {vendor_ref} is not approved")
            
            vendor_id = vendor["id"]
            
            if vendor_id not in vendor_items:
                vendor_items[vendor_id] = {
                    "items": [],
                    "delivery_days": int(row.get("delivery_days", "30") or "30"),
                    "notes": row.get("notes", "Bulk import")
                }
            
            # Add item
            quantity = int(row["quantity"])
            price = float(row["unit_price"])
            vendor_items[vendor_id]["items"].append({
                "name": row["item_name"].strip(),
                "description": "",
                "quantity": quantity,
                "price": price,
                "total": quantity * price
            })
            
        except Exception as e:
            errors.append({
                "row": row_num,
                "data": dict(row),
                "error": str(e)
            })
    
    # Create POs for each vendor
    created_pos = []
    
    for vendor_id, po_data in vendor_items.items():
        try:
            total_amount = sum(item["total"] for item in po_data["items"])
            
            year = datetime.now(timezone.utc).strftime('%y')
            count = await db.purchase_orders.count_documents({}) + 1
            po_number = f"PO-{year}-{count:04d}"
            
            requires_contract = total_amount > 1000000
            
            po_doc = {
                "id": str(uuid4()),
                "po_number": po_number,
                "vendor_id": vendor_id,
                "items": po_data["items"],
                "total_amount": total_amount,
                "delivery_time": f"{po_data['delivery_days']} days",
                "notes": po_data["notes"],
                "status": "draft" if requires_contract else "issued",
                "requires_contract": requires_contract,
                "amount_over_million": total_amount > 1000000,
                "has_data_access": False,
                "has_onsite_presence": False,
                "has_implementation": False,
                "duration_more_than_year": False,
                "created_by": user.id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.purchase_orders.insert_one(po_doc)
            created_pos.append({"po_id": po_doc["id"], "po_number": po_number, "vendor_id": vendor_id})
            
        except Exception as e:
            errors.append({
                "vendor_id": vendor_id,
                "error": str(e)
            })
    
    return {
        "total_rows": total_rows,
        "vendors_processed": len(vendor_items),
        "pos_created": len(created_pos),
        "created_pos": created_pos,
        "failed": len(errors),
        "errors": errors
    }


# ============== BULK INVOICE IMPORT ==============

@router.post("/invoices")
async def bulk_import_invoices(request: Request, file: UploadFile = File(...)):
    """
    Bulk import invoices from CSV file.
    Required columns: vendor_name_or_id, invoice_number, amount
    """
    user = await require_create_permission(request, "invoices")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    reader = csv.DictReader(io.StringIO(decoded))
    
    results = {
        "total_rows": 0,
        "successful": 0,
        "failed": 0,
        "errors": [],
        "created_ids": []
    }
    
    for row_num, row in enumerate(reader, start=2):
        results["total_rows"] += 1
        
        try:
            # Validate required fields
            required = ["vendor_name_or_id", "invoice_number", "amount"]
            missing = [f for f in required if not row.get(f, "").strip()]
            if missing:
                raise ValueError(f"Missing required fields: {', '.join(missing)}")
            
            vendor_ref = row["vendor_name_or_id"].strip()
            
            # Find vendor
            vendor = await db.vendors.find_one({
                "$or": [
                    {"id": vendor_ref},
                    {"name_english": {"$regex": vendor_ref, "$options": "i"}},
                    {"commercial_name": {"$regex": vendor_ref, "$options": "i"}}
                ]
            })
            
            if not vendor:
                raise ValueError(f"Vendor not found: {vendor_ref}")
            
            invoice_number = row["invoice_number"].strip()
            
            # Check for duplicate
            existing = await db.invoices.find_one({
                "invoice_number": invoice_number,
                "vendor_id": vendor["id"]
            })
            if existing:
                raise ValueError(f"Invoice {invoice_number} already exists for this vendor")
            
            # Find contract if provided
            contract_id = None
            if row.get("contract_number"):
                contract = await db.contracts.find_one({"contract_number": row["contract_number"].strip()})
                if contract:
                    contract_id = contract["id"]
            
            # Generate reference
            year = datetime.now(timezone.utc).strftime('%y')
            month = datetime.now(timezone.utc).strftime('%m')
            count = await db.invoices.count_documents({}) + 1
            invoice_ref = f"INV-{year}{month}-{count:04d}"
            
            invoice_doc = {
                "id": str(uuid4()),
                "invoice_number": invoice_number,
                "invoice_reference": invoice_ref,
                "vendor_id": vendor["id"],
                "contract_id": contract_id,
                "amount": float(row["amount"]),
                "description": row.get("description", "").strip() or f"Invoice from {vendor.get('name_english', 'Vendor')}",
                "status": "pending",
                "currency": "SAR",
                "created_by": user.id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.invoices.insert_one(invoice_doc)
            results["successful"] += 1
            results["created_ids"].append(invoice_doc["id"])
            
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({
                "row": row_num,
                "data": dict(row),
                "error": str(e)
            })
    
    return results


# ============== IMPORT VALIDATION (DRY RUN) ==============

@router.post("/validate/{entity_type}")
async def validate_import(entity_type: str, request: Request, file: UploadFile = File(...)):
    """
    Validate import file without actually importing.
    Returns validation results for each row.
    """
    await require_permission(request, "dashboard", Permission.VIEWER)
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    reader = csv.DictReader(io.StringIO(decoded))
    
    template = await get_import_template(entity_type, request)
    required_fields = template["required"]
    
    validation_results = {
        "total_rows": 0,
        "valid": 0,
        "invalid": 0,
        "warnings": [],
        "errors": []
    }
    
    for row_num, row in enumerate(reader, start=2):
        validation_results["total_rows"] += 1
        
        # Check required fields
        missing = [f for f in required_fields if not row.get(f, "").strip()]
        
        if missing:
            validation_results["invalid"] += 1
            validation_results["errors"].append({
                "row": row_num,
                "type": "missing_fields",
                "message": f"Missing required fields: {', '.join(missing)}"
            })
        else:
            validation_results["valid"] += 1
            
            # Add warnings for potential issues
            if entity_type == "vendors":
                if row.get("email") and "@" not in row.get("email", ""):
                    validation_results["warnings"].append({
                        "row": row_num,
                        "type": "invalid_email",
                        "message": "Email format appears invalid"
                    })
    
    return validation_results
