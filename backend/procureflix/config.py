"""Configuration for ProcureFlix backend.

This module defines a dedicated settings object for ProcureFlix so we can
cleanly manage environment variables (including future SharePoint
integration and AI settings) without interfering with legacy Sourcevia
configuration.
"""

from functools import lru_cache
from pydantic import BaseSettings, Field, AnyHttpUrl
from typing import Optional


class ProcureFlixSettings(BaseSettings):
    """ProcureFlix-specific settings.

    These are intentionally minimal for Phase 1 and will be extended as we
    wire more modules and integrate SharePoint.
    """

    # Application metadata
    app_name: str = Field("ProcureFlix", description="Human-readable app name")

    # SharePoint integration placeholders (Phase 4 target)
    sharepoint_site_url: Optional[AnyHttpUrl] = Field(
        default=None, env="SHAREPOINT_SITE_URL",
        description="Base URL of the SharePoint site to be used as primary data store."
    )
    sharepoint_tenant_id: Optional[str] = Field(
        default=None, env="TENANT_ID",
        description="Azure AD tenant ID for SharePoint integration."
    )
    sharepoint_client_id: Optional[str] = Field(
        default=None, env="CLIENT_ID",
        description="Client (application) ID for SharePoint integration."
    )
    sharepoint_client_secret: Optional[str] = Field(
        default=None, env="CLIENT_SECRET",
        description="Client secret for SharePoint integration."
    )

    # AI / LLM configuration (for later phases)
    enable_ai: bool = Field(
        default=True,
        description="Whether AI-assisted features should be enabled if a key is available.",
    )

    class Config:
        env_prefix = "PROCUREFLIX_"  # Optional prefix, e.g. PROCUREFLIX_ENABLE_AI
        case_sensitive = False


@lru_cache(maxsize=1)
def get_settings() -> ProcureFlixSettings:
    """Return cached ProcureFlix settings instance.

    Using lru_cache ensures we only parse environment variables once.
    """

    return ProcureFlixSettings()  # type: ignore[arg-type]
