"""ProcureFlix backend package.

Clean, modular implementation of procurement modules, separate from legacy Sourcevia code.

This package is intentionally decoupled from MongoDB/Atlas and will
initially use in-memory + JSON-seeded repositories, with a clear
abstraction layer to swap in SharePoint later.
"""

from .api.router import router  # Re-export main ProcureFlix router

__all__ = ["router"]
