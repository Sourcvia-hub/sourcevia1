"""
Repository Pattern Implementation

This package provides a clean abstraction layer for data access.
The repository pattern allows us to swap data sources (MongoDB, JSON files, SharePoint)
without changing business logic or API endpoints.

Current Implementation: JSONRepository (file-based storage)
Future Implementation: SharePointRepository (via SharePoint REST API)
"""

from .base_repository import BaseRepository
from .json_repository import JSONRepository

__all__ = [
    "BaseRepository",
    "JSONRepository",
]
