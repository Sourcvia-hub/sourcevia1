"""
Repository Factory

Centralized access to all repositories.
This makes it easy to swap implementations (JSON → SharePoint) in one place.
"""

from .json_repository import JSONRepository
from typing import Dict


class RepositoryFactory:
    """
    Factory class for creating and caching repository instances.
    
    Usage:
        repos = RepositoryFactory()
        users = repos.users
        vendors = repos.vendors
    """
    
    def __init__(self, data_dir: str = "/app/data"):
        """
        Initialize the factory.
        
        Args:
            data_dir: Directory where data files are stored
        """
        self.data_dir = data_dir
        self._cache: Dict[str, JSONRepository] = {}
    
    def _get_repo(self, collection_name: str) -> JSONRepository:
        """
        Get or create a repository for a collection.
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            Repository instance
        """
        if collection_name not in self._cache:
            self._cache[collection_name] = JSONRepository(collection_name, self.data_dir)
        return self._cache[collection_name]
    
    # User Management
    @property
    def users(self) -> JSONRepository:
        """Repository for users collection."""
        return self._get_repo("users")
    
    # Vendor Management
    @property
    def vendors(self) -> JSONRepository:
        """Repository for vendors collection."""
        return self._get_repo("vendors")
    
    # Tender Management
    @property
    def tenders(self) -> JSONRepository:
        """Repository for tenders collection."""
        return self._get_repo("tenders")
    
    @property
    def proposals(self) -> JSONRepository:
        """Repository for proposals collection."""
        return self._get_repo("proposals")
    
    # Contract Management
    @property
    def contracts(self) -> JSONRepository:
        """Repository for contracts collection."""
        return self._get_repo("contracts")
    
    # Purchase Orders
    @property
    def purchase_orders(self) -> JSONRepository:
        """Repository for purchase orders collection."""
        return self._get_repo("purchase_orders")
    
    # Invoice Management
    @property
    def invoices(self) -> JSONRepository:
        """Repository for invoices collection."""
        return self._get_repo("invoices")
    
    # Resource Management
    @property
    def resources(self) -> JSONRepository:
        """Repository for resources collection."""
        return self._get_repo("resources")
    
    # Asset Management
    @property
    def buildings(self) -> JSONRepository:
        """Repository for buildings collection."""
        return self._get_repo("buildings")
    
    @property
    def floors(self) -> JSONRepository:
        """Repository for floors collection."""
        return self._get_repo("floors")
    
    @property
    def asset_categories(self) -> JSONRepository:
        """Repository for asset categories collection."""
        return self._get_repo("asset_categories")
    
    @property
    def assets(self) -> JSONRepository:
        """Repository for assets collection."""
        return self._get_repo("assets")
    
    # OSR Management
    @property
    def osr(self) -> JSONRepository:
        """Repository for OSR (Operational Service Requests) collection."""
        return self._get_repo("osr")
    
    # Notifications & Audit
    @property
    def notifications(self) -> JSONRepository:
        """Repository for notifications collection."""
        return self._get_repo("notifications")
    
    @property
    def audit_logs(self) -> JSONRepository:
        """Repository for audit logs collection."""
        return self._get_repo("audit_logs")


# Global repository factory instance
repos = RepositoryFactory()
