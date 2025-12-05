"""Main ProcureFlix API router.

This router is intended to be included from the legacy `server.py` via:

    from procureflix import router as procureflix_router
    api_router.include_router(procureflix_router, prefix="/procureflix")

Given that `api_router` already has the `/api` prefix, all ProcureFlix
endpoints will live under `/api/procureflix/...` as requested.
"""

from __future__ import annotations

from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException

from ..config import get_settings
from ..models import Vendor
from ..repositories import InMemoryVendorRepository
from ..services import VendorService


router = APIRouter()

# For Phase 1 we wire a very small vertical slice around vendors to
# validate the architecture. Other modules will follow.

# Initialise in-memory vendor repository with JSON seed data
_seed_dir = Path(__file__).resolve().parent.parent / "seed"
_vendor_seed_path = _seed_dir / "vendors.json"
_vendor_repo = InMemoryVendorRepository(seed_path=_vendor_seed_path)
_vendor_service = VendorService(repository=_vendor_repo)


@router.get("/health")
async def procureflix_health() -> dict:
    """Simple health endpoint for ProcureFlix namespace."""

    settings = get_settings()
    return {
        "app": settings.app_name,
        "status": "ok",
        "sharepoint_configured": bool(settings.sharepoint_site_url),
    }


@router.get("/vendors", response_model=List[Vendor])
async def list_vendors() -> List[Vendor]:
    """List all vendors from the in-memory repository."""

    return _vendor_service.list_vendors()


@router.post("/vendors", response_model=Vendor, status_code=201)
async def create_vendor(vendor: Vendor) -> Vendor:
    """Create a new vendor.

    This is intentionally simple for Phase 1 and will evolve with full
    risk logic and AI support in later phases.
    """

    if not vendor.name_english:
        raise HTTPException(status_code=400, detail="name_english is required")
    return _vendor_service.create_vendor(vendor)
