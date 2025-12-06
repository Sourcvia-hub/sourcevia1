"""Repository factory for ProcureFlix.

This module provides factory functions that return the appropriate repository
implementation (memory or SharePoint) based on configuration settings.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING

from ..config import get_settings
from ..models import (
    Contract,
    Invoice,
    Proposal,
    PurchaseOrder,
    Tender,
    Vendor,
)
from .base import IRepository

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

# Singleton SharePoint client instance
_sharepoint_client = None


def _get_sharepoint_client():
    """Get or create SharePoint client instance."""
    global _sharepoint_client

    if _sharepoint_client is not None:
        return _sharepoint_client

    settings = get_settings()

    # Validate SharePoint configuration
    if not all([
        settings.sharepoint_site_url,
        settings.sharepoint_tenant_id,
        settings.sharepoint_client_id,
        settings.sharepoint_client_secret,
    ]):
        error_msg = (
            "SharePoint backend is enabled but configuration is incomplete. "
            "Please set all required environment variables: "
            "SHAREPOINT_SITE_URL, SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, "
            "SHAREPOINT_CLIENT_SECRET"
        )
        logger.error(error_msg)
        raise ValueError(error_msg)

    from ..sharepoint import SharePointClient

    _sharepoint_client = SharePointClient(
        site_url=settings.sharepoint_site_url,
        tenant_id=settings.sharepoint_tenant_id,
        client_id=settings.sharepoint_client_id,
        client_secret=settings.sharepoint_client_secret,
    )

    logger.info("SharePoint client initialized successfully")
    return _sharepoint_client


def get_vendor_repository() -> IRepository[Vendor]:
    """Get vendor repository based on configuration.

    Returns:
        Vendor repository (memory or SharePoint-backed)
    """
    settings = get_settings()

    if settings.data_backend == "sharepoint":
        logger.info("Using SharePoint vendor repository")
        from ..sharepoint.repositories import SharePointVendorRepository

        client = _get_sharepoint_client()
        return SharePointVendorRepository(client)

    # Default to memory
    logger.info("Using in-memory vendor repository")
    from .vendor_repository import InMemoryVendorRepository

    seed_path = Path(__file__).parent.parent / "seed" / "vendors.json"
    return InMemoryVendorRepository(seed_path)


def get_tender_repository() -> IRepository[Tender]:
    """Get tender repository based on configuration.

    Returns:
        Tender repository (memory or SharePoint-backed)
    """
    settings = get_settings()

    if settings.data_backend == "sharepoint":
        logger.info("Using SharePoint tender repository")
        from ..sharepoint.repositories import SharePointTenderRepository

        client = _get_sharepoint_client()
        return SharePointTenderRepository(client)

    # Default to memory
    logger.info("Using in-memory tender repository")
    from .tender_repository import InMemoryTenderRepository

    seed_path = Path(__file__).parent.parent / "seed" / "tenders.json"
    return InMemoryTenderRepository(seed_path)


def get_proposal_repository() -> IRepository[Proposal]:
    """Get proposal repository based on configuration.

    Returns:
        Proposal repository (memory or SharePoint-backed)
    """
    settings = get_settings()

    if settings.data_backend == "sharepoint":
        logger.info("Using SharePoint proposal repository")
        from ..sharepoint.repositories import SharePointProposalRepository

        client = _get_sharepoint_client()
        return SharePointProposalRepository(client)

    # Default to memory
    logger.info("Using in-memory proposal repository")
    from .tender_repository import InMemoryProposalRepository

    seed_path = Path(__file__).parent.parent / "seed" / "proposals.json"
    return InMemoryProposalRepository(seed_path)


def get_contract_repository() -> IRepository[Contract]:
    """Get contract repository based on configuration.

    Returns:
        Contract repository (memory or SharePoint-backed)
    """
    settings = get_settings()

    if settings.data_backend == "sharepoint":
        logger.info("Using SharePoint contract repository")
        from ..sharepoint.repositories import SharePointContractRepository

        client = _get_sharepoint_client()
        return SharePointContractRepository(client)

    # Default to memory
    logger.info("Using in-memory contract repository")
    from .contract_repository import InMemoryContractRepository

    seed_path = Path(__file__).parent.parent / "seed" / "contracts.json"
    return InMemoryContractRepository(seed_path)


def get_purchase_order_repository() -> IRepository[PurchaseOrder]:
    """Get purchase order repository based on configuration.

    Returns:
        PO repository (memory or SharePoint-backed)
    """
    settings = get_settings()

    if settings.data_backend == "sharepoint":
        logger.info("Using SharePoint purchase order repository")
        from ..sharepoint.repositories import SharePointPurchaseOrderRepository

        client = _get_sharepoint_client()
        return SharePointPurchaseOrderRepository(client)

    # Default to memory
    logger.info("Using in-memory purchase order repository")
    from .purchase_order_repository import InMemoryPurchaseOrderRepository

    seed_path = Path(__file__).parent.parent / "seed" / "purchase_orders.json"
    return InMemoryPurchaseOrderRepository(seed_path)


def get_invoice_repository() -> IRepository[Invoice]:
    """Get invoice repository based on configuration.

    Returns:
        Invoice repository (memory or SharePoint-backed)
    """
    settings = get_settings()

    if settings.data_backend == "sharepoint":
        logger.info("Using SharePoint invoice repository")
        from ..sharepoint.repositories import SharePointInvoiceRepository

        client = _get_sharepoint_client()
        return SharePointInvoiceRepository(client)

    # Default to memory
    logger.info("Using in-memory invoice repository")
    from .invoice_repository import InMemoryInvoiceRepository

    seed_path = Path(__file__).parent.parent / "seed" / "invoices.json"
    return InMemoryInvoiceRepository(seed_path)
