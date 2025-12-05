"""Domain models for ProcureFlix.

For Phase 1 we define a minimal Vendor model to exercise the full
stack (model → repository → service → API). Additional modules will be
added incrementally in later phases.
"""

from .vendor import Vendor, VendorRiskCategory

__all__ = ["Vendor", "VendorRiskCategory"]
