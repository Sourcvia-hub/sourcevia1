"""
Base Repository Interface

Defines the contract that all repository implementations must follow.
This ensures that we can swap implementations (JSON, SharePoint, MongoDB)
without changing the business logic.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class BaseRepository(ABC):
    """
    Abstract base class for all repositories.
    
    All data access should go through repository methods to maintain
    separation between business logic and data storage.
    """
    
    @abstractmethod
    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new record.
        
        Args:
            data: Dictionary containing the record data
            
        Returns:
            Created record with any auto-generated fields (id, timestamps)
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single record by ID.
        
        Args:
            id: Unique identifier of the record
            
        Returns:
            Record data or None if not found
        """
        pass
    
    @abstractmethod
    async def get_all(self, filters: Optional[Dict[str, Any]] = None, 
                     limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Retrieve all records, optionally filtered.
        
        Args:
            filters: Dictionary of field:value pairs to filter by
            limit: Maximum number of records to return
            
        Returns:
            List of matching records
        """
        pass
    
    @abstractmethod
    async def update(self, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing record.
        
        Args:
            id: Unique identifier of the record
            data: Dictionary containing fields to update
            
        Returns:
            Updated record or None if not found
        """
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        """
        Delete a record by ID.
        
        Args:
            id: Unique identifier of the record
            
        Returns:
            True if deleted, False if not found
        """
        pass
    
    @abstractmethod
    async def find_one(self, filters: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Find a single record matching the filters.
        
        Args:
            filters: Dictionary of field:value pairs to filter by
            
        Returns:
            First matching record or None if not found
        """
        pass
    
    @abstractmethod
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records matching the filters.
        
        Args:
            filters: Dictionary of field:value pairs to filter by
            
        Returns:
            Number of matching records
        """
        pass
    
    @abstractmethod
    async def exists(self, filters: Dict[str, Any]) -> bool:
        """
        Check if any record exists matching the filters.
        
        Args:
            filters: Dictionary of field:value pairs to filter by
            
        Returns:
            True if at least one record exists, False otherwise
        """
        pass
