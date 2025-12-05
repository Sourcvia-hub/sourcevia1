"""Vendor-related business logic for ProcureFlix.

Phase 1 focuses on wiring a minimal but realistic vertical slice for
the Vendor module: listing, basic creation, and a placeholder for risk
scoring (to be expanded with AI support in later phases).
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from ..models import Vendor, VendorRiskCategory
from ..repositories import InMemoryVendorRepository


class VendorService:
    """Application service for vendor operations."""

    def __init__(self, repository: InMemoryVendorRepository) -> None:
        self._repository = repository

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def list_vendors(self) -> List[Vendor]:
        return self._repository.list()

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def create_vendor(self, vendor: Vendor) -> Vendor:
        """Create a new vendor with basic risk initialization.

        For Phase 1 we keep the risk logic extremely simple while
        preserving the structure so we can later plug in the full
        Sourcevia-based scoring and AI explanations.
        """

        vendor.created_at = datetime.now(timezone.utc)
        vendor.updated_at = vendor.created_at

        # Placeholder: trivial risk logic (all new vendors start as LOW)
        vendor.risk_score = 0.0
        vendor.risk_category = VendorRiskCategory.LOW

        return self._repository.add(vendor)
