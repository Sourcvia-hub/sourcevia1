"""SharePoint REST API client for ProcureFlix.

This module implements authentication and basic CRUD operations against
SharePoint Online using the client credentials flow (app registration).
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

import requests

logger = logging.getLogger(__name__)


class SharePointError(Exception):
    """Base exception for SharePoint-related errors."""

    pass


class SharePointClient:
    """SharePoint REST API client using client credentials flow.

    This client handles:
    - OAuth2 token acquisition using client_id + client_secret
    - Token caching and refresh
    - Basic list item CRUD operations (create, read, update, delete)
    - Error handling and logging
    """

    def __init__(
        self,
        site_url: str,
        tenant_id: str,
        client_id: str,
        client_secret: str,
    ) -> None:
        """Initialize SharePoint client.

        Args:
            site_url: SharePoint site URL (e.g., https://tenant.sharepoint.com/sites/SiteName)
            tenant_id: Azure AD tenant ID
            client_id: App registration client ID
            client_secret: App registration client secret
        """
        self.site_url = site_url.rstrip("/")
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret

        # Token caching
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None

    def _get_access_token(self) -> str:
        """Get a valid access token, refreshing if necessary.

        Returns:
            Valid access token string

        Raises:
            SharePointError: If token acquisition fails
        """
        # Check if we have a cached token that's still valid
        if (
            self._access_token
            and self._token_expires_at
            and datetime.now() < self._token_expires_at
        ):
            return self._access_token

        # Request new token using client credentials flow
        token_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"

        # Extract resource from site_url (e.g., https://tenant.sharepoint.com)
        resource = "/".join(self.site_url.split("/")[:3])

        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": f"{resource}/.default",
        }

        try:
            response = requests.post(token_url, data=data, timeout=30)
            response.raise_for_status()
            token_data = response.json()

            self._access_token = token_data["access_token"]
            expires_in = token_data.get("expires_in", 3600)
            # Refresh 5 minutes before actual expiry
            self._token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)

            logger.info("SharePoint access token acquired successfully")
            return self._access_token

        except requests.RequestException as e:
            logger.error(f"Failed to acquire SharePoint access token: {e}")
            raise SharePointError(f"Authentication failed: {e}")

    def _make_request(
        self,
        method: str,
        endpoint: str,
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make an authenticated request to SharePoint REST API.

        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            endpoint: API endpoint path
            json_data: JSON body for POST/PATCH requests
            params: Query parameters

        Returns:
            Response JSON data

        Raises:
            SharePointError: If request fails
        """
        token = self._get_access_token()
        url = f"{self.site_url}/_api{endpoint}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
        }

        if method in ["PATCH", "DELETE"]:
            headers["IF-MATCH"] = "*"
            if method == "PATCH":
                headers["X-HTTP-Method"] = "MERGE"

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                params=params,
                timeout=30,
            )
            response.raise_for_status()

            # DELETE returns no content
            if method == "DELETE" or response.status_code == 204:
                return {}

            return response.json()

        except requests.RequestException as e:
            logger.error(f"SharePoint API request failed: {method} {url} - {e}")
            raise SharePointError(f"API request failed: {e}")

    # ------------------------------------------------------------------
    # List Operations
    # ------------------------------------------------------------------

    def get_list_items(
        self,
        list_name: str,
        select_fields: Optional[List[str]] = None,
        filter_query: Optional[str] = None,
        top: int = 5000,
    ) -> List[Dict[str, Any]]:
        """Get items from a SharePoint list.

        Args:
            list_name: Name of the SharePoint list
            select_fields: List of field names to retrieve (None = all)
            filter_query: OData filter query string
            top: Maximum number of items to retrieve

        Returns:
            List of item dictionaries
        """
        endpoint = f"/web/lists/getbytitle('{list_name}')/items"

        params = {"$top": top}
        if select_fields:
            params["$select"] = ",".join(select_fields)
        if filter_query:
            params["$filter"] = filter_query

        response = self._make_request("GET", endpoint, params=params)
        return response.get("d", {}).get("results", [])

    def get_list_item(self, list_name: str, item_id: int) -> Dict[str, Any]:
        """Get a single item from a SharePoint list by ID.

        Args:
            list_name: Name of the SharePoint list
            item_id: SharePoint item ID

        Returns:
            Item dictionary
        """
        endpoint = f"/web/lists/getbytitle('{list_name}')/items({item_id})"
        response = self._make_request("GET", endpoint)
        return response.get("d", {})

    def create_list_item(
        self, list_name: str, item_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new item in a SharePoint list.

        Args:
            list_name: Name of the SharePoint list
            item_data: Dictionary of field values

        Returns:
            Created item dictionary (including ID)
        """
        endpoint = f"/web/lists/getbytitle('{list_name}')/items"

        # Add metadata for the list item type
        payload = {
            "__metadata": {"type": f"SP.Data.{list_name}ListItem"},
            **item_data,
        }

        response = self._make_request("POST", endpoint, json_data=payload)
        return response.get("d", {})

    def update_list_item(
        self, list_name: str, item_id: int, item_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing item in a SharePoint list.

        Args:
            list_name: Name of the SharePoint list
            item_id: SharePoint item ID
            item_data: Dictionary of field values to update

        Returns:
            Updated item dictionary
        """
        endpoint = f"/web/lists/getbytitle('{list_name}')/items({item_id})"

        # Add metadata for the list item type
        payload = {
            "__metadata": {"type": f"SP.Data.{list_name}ListItem"},
            **item_data,
        }

        self._make_request("PATCH", endpoint, json_data=payload)

        # Fetch and return the updated item
        return self.get_list_item(list_name, item_id)

    def delete_list_item(self, list_name: str, item_id: int) -> bool:
        """Delete an item from a SharePoint list.

        Args:
            list_name: Name of the SharePoint list
            item_id: SharePoint item ID

        Returns:
            True if deletion succeeded
        """
        endpoint = f"/web/lists/getbytitle('{list_name}')/items({item_id})"
        self._make_request("DELETE", endpoint)
        return True
