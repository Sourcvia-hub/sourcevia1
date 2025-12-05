"""AI abstraction for ProcureFlix.

In Phase 1 we only define the surface; implementations will be added as
we migrate AI-powered behaviors from Sourcevia in a clean, reusable way.
"""

from .client import ProcureFlixAIClient, get_ai_client

__all__ = ["ProcureFlixAIClient", "get_ai_client"]
