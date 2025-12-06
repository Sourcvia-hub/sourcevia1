"""SharePoint integration module for ProcureFlix.

This module provides SharePoint client functionality and SharePoint-backed
repositories for persistent data storage.
"""

from .client import SharePointClient, SharePointError

__all__ = ["SharePointClient", "SharePointError"]
