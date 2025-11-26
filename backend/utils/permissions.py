"""
Role-Based Access Control (RBAC) Permission System
"""
from enum import Enum
from typing import Dict, List, Set


class Permission(str, Enum):
    """Permission types"""
    NO_ACCESS = "no_access"
    VIEWER = "viewer"
    REQUESTER = "requester"
    VERIFIER = "verifier"
    APPROVER = "approver"
    CONTROLLER = "controller"


class Module(str, Enum):
    """System modules"""
    DASHBOARD = "dashboard"
    VENDORS = "vendors"
    VENDOR_DD = "vendor_dd"
    TENDERS = "tenders"
    TENDER_EVALUATION = "tender_evaluation"
    TENDER_PROPOSALS = "tender_proposals"
    CONTRACTS = "contracts"
    PURCHASE_ORDERS = "purchase_orders"
    RESOURCES = "resources"
    INVOICES = "invoices"
    ASSETS = "assets"
    SERVICE_REQUESTS = "service_requests"


# Role-based permissions mapping
ROLE_PERMISSIONS: Dict[str, Dict[str, List[str]]] = {
    "user": {
        Module.DASHBOARD: [Permission.VIEWER],  # Own requests only
        Module.VENDORS: [Permission.VIEWER],
        Module.VENDOR_DD: [Permission.VIEWER],
        Module.TENDERS: [Permission.REQUESTER],
        Module.TENDER_EVALUATION: [Permission.REQUESTER],
        Module.TENDER_PROPOSALS: [Permission.VIEWER],
        Module.CONTRACTS: [Permission.REQUESTER],
        Module.PURCHASE_ORDERS: [Permission.REQUESTER],
        Module.RESOURCES: [Permission.REQUESTER],
        Module.INVOICES: [Permission.VERIFIER],
        Module.ASSETS: [Permission.NO_ACCESS],
        Module.SERVICE_REQUESTS: [Permission.REQUESTER],
    },
    "direct_manager": {
        Module.DASHBOARD: [Permission.VIEWER],  # Domain only
        Module.VENDORS: [Permission.VIEWER],
        Module.VENDOR_DD: [Permission.VIEWER],
        Module.TENDERS: [Permission.VERIFIER],
        Module.TENDER_EVALUATION: [Permission.VERIFIER],
        Module.TENDER_PROPOSALS: [Permission.VIEWER],
        Module.CONTRACTS: [Permission.VERIFIER],
        Module.PURCHASE_ORDERS: [Permission.VERIFIER],
        Module.RESOURCES: [Permission.VERIFIER],
        Module.INVOICES: [Permission.VERIFIER],
        Module.ASSETS: [Permission.NO_ACCESS],
        Module.SERVICE_REQUESTS: [Permission.REQUESTER],
    },
    "procurement_officer": {
        Module.DASHBOARD: [Permission.VIEWER],
        Module.VENDORS: [Permission.REQUESTER, Permission.VERIFIER],
        Module.VENDOR_DD: [Permission.REQUESTER],
        Module.TENDERS: [Permission.REQUESTER, Permission.VERIFIER],
        Module.TENDER_EVALUATION: [Permission.REQUESTER, Permission.VERIFIER],
        Module.TENDER_PROPOSALS: [Permission.REQUESTER],
        Module.CONTRACTS: [Permission.REQUESTER, Permission.VERIFIER],
        Module.PURCHASE_ORDERS: [Permission.REQUESTER, Permission.VERIFIER],
        Module.RESOURCES: [Permission.REQUESTER, Permission.VERIFIER],
        Module.INVOICES: [Permission.REQUESTER, Permission.VERIFIER],
        Module.ASSETS: [Permission.REQUESTER],
        Module.SERVICE_REQUESTS: [Permission.REQUESTER, Permission.VERIFIER],
    },
    "senior_manager": {
        Module.DASHBOARD: [Permission.VIEWER],
        Module.VENDORS: [Permission.VIEWER],
        Module.VENDOR_DD: [Permission.VIEWER],
        Module.TENDERS: [Permission.APPROVER, Permission.VIEWER],
        Module.TENDER_EVALUATION: [Permission.APPROVER, Permission.VIEWER],
        Module.TENDER_PROPOSALS: [Permission.VIEWER],
        Module.CONTRACTS: [Permission.APPROVER, Permission.VIEWER],
        Module.PURCHASE_ORDERS: [Permission.APPROVER, Permission.VIEWER],
        Module.RESOURCES: [Permission.APPROVER, Permission.VIEWER],
        Module.INVOICES: [Permission.APPROVER, Permission.VIEWER],
        Module.ASSETS: [Permission.NO_ACCESS],
        Module.SERVICE_REQUESTS: [Permission.REQUESTER],
    },
    "procurement_manager": {
        Module.DASHBOARD: [Permission.VIEWER],
        Module.VENDORS: [Permission.APPROVER, Permission.VIEWER],
        Module.VENDOR_DD: [Permission.APPROVER, Permission.VIEWER],
        Module.TENDERS: [Permission.APPROVER, Permission.VIEWER],
        Module.TENDER_EVALUATION: [Permission.APPROVER, Permission.VIEWER],
        Module.TENDER_PROPOSALS: [Permission.APPROVER, Permission.VIEWER],
        Module.CONTRACTS: [Permission.APPROVER, Permission.VIEWER],
        Module.PURCHASE_ORDERS: [Permission.APPROVER, Permission.VIEWER],
        Module.RESOURCES: [Permission.APPROVER, Permission.VIEWER],
        Module.INVOICES: [Permission.APPROVER, Permission.VIEWER],
        Module.ASSETS: [Permission.APPROVER, Permission.VIEWER],
        Module.SERVICE_REQUESTS: [Permission.APPROVER, Permission.VIEWER],
    },
    "admin": {
        Module.DASHBOARD: [Permission.CONTROLLER],
        Module.VENDORS: [Permission.CONTROLLER],
        Module.TENDERS: [Permission.CONTROLLER],
        Module.CONTRACTS: [Permission.CONTROLLER],
        Module.PURCHASE_ORDERS: [Permission.CONTROLLER],
        Module.RESOURCES: [Permission.CONTROLLER],
        Module.INVOICES: [Permission.CONTROLLER],
        Module.ASSETS: [Permission.CONTROLLER],
        Module.SERVICE_REQUESTS: [Permission.CONTROLLER],
    },
}


def has_permission(user_role: str, module: str, required_permission: str) -> bool:
    """
    Check if a user role has a specific permission for a module
    
    Permission Hierarchy:
    CONTROLLER > APPROVER > VERIFIER > REQUESTER > VIEWER
    
    Args:
        user_role: The user's role (e.g., "user", "procurement_officer")
        module: The module to check (e.g., "vendors", "tenders")
        required_permission: The required permission (e.g., "viewer", "requester")
    
    Returns:
        bool: True if user has the permission, False otherwise
    """
    # Admin has all permissions
    if user_role == "admin":
        return True
    
    # Get permissions for this role and module
    role_perms = ROLE_PERMISSIONS.get(user_role, {})
    module_perms = role_perms.get(module, [Permission.NO_ACCESS])
    
    # Check if NO_ACCESS
    if Permission.NO_ACCESS in module_perms:
        return False
    
    # Controller has all permissions
    if Permission.CONTROLLER in module_perms:
        return True
    
    # Define permission hierarchy (higher permissions include lower ones)
    permission_hierarchy = {
        Permission.CONTROLLER: [Permission.APPROVER, Permission.VERIFIER, Permission.REQUESTER, Permission.VIEWER],
        Permission.APPROVER: [Permission.VERIFIER, Permission.REQUESTER, Permission.VIEWER],
        Permission.VERIFIER: [Permission.REQUESTER, Permission.VIEWER],
        Permission.REQUESTER: [Permission.VIEWER],
        Permission.VIEWER: []
    }
    
    # Check if user has the exact permission or a higher permission
    for perm in module_perms:
        if perm == required_permission:
            return True
        # Check if this permission is higher in hierarchy
        if perm in permission_hierarchy and required_permission in permission_hierarchy.get(perm, []):
            return True
    
    return False


def can_access_module(user_role: str, module: str) -> bool:
    """Check if user can access a module at all"""
    role_perms = ROLE_PERMISSIONS.get(user_role, {})
    module_perms = role_perms.get(module, [Permission.NO_ACCESS])
    return Permission.NO_ACCESS not in module_perms


def get_user_permissions(user_role: str, module: str) -> List[str]:
    """Get all permissions a user has for a specific module"""
    if user_role == "admin":
        return [Permission.CONTROLLER]
    
    role_perms = ROLE_PERMISSIONS.get(user_role, {})
    return role_perms.get(module, [Permission.NO_ACCESS])


def can_create(user_role: str, module: str) -> bool:
    """Check if user can create new items in a module"""
    return has_permission(user_role, module, Permission.REQUESTER) or \
           has_permission(user_role, module, Permission.CONTROLLER)


def can_edit(user_role: str, module: str) -> bool:
    """Check if user can edit items in a module"""
    perms = get_user_permissions(user_role, module)
    return any(p in [Permission.REQUESTER, Permission.VERIFIER, Permission.APPROVER, Permission.CONTROLLER] for p in perms)


def can_delete(user_role: str, module: str) -> bool:
    """Check if user can delete items in a module"""
    return has_permission(user_role, module, Permission.CONTROLLER) or \
           has_permission(user_role, module, Permission.APPROVER)


def can_verify(user_role: str, module: str) -> bool:
    """Check if user can verify items in a module"""
    return has_permission(user_role, module, Permission.VERIFIER) or \
           has_permission(user_role, module, Permission.APPROVER) or \
           has_permission(user_role, module, Permission.CONTROLLER)


def can_approve(user_role: str, module: str) -> bool:
    """Check if user can approve items in a module"""
    return has_permission(user_role, module, Permission.APPROVER) or \
           has_permission(user_role, module, Permission.CONTROLLER)


def should_filter_by_user(user_role: str, module: str) -> bool:
    """
    Determine if data should be filtered to show only user's own records
    
    Returns True for roles that should only see their own data:
    - user: sees only their own created items
    """
    if user_role == "admin":
        return False
    
    # Regular users should only see their own data
    if user_role == "user":
        return True
    
    # All other roles can see broader data
    return False


def should_filter_by_domain(user_role: str, module: str) -> bool:
    """
    Determine if data should be filtered by domain/team
    
    Returns True for roles that should see team/department data:
    - direct_manager: sees their team's data
    """
    if user_role == "admin":
        return False
    
    # Managers should see team data
    if user_role == "direct_manager":
        return True
    
    return False


def should_filter_by_user(user_role: str, module: str) -> bool:
    """
    Check if data should be filtered to show only user's own items
    Returns True for User role on Dashboard (show only their requests)
    """
    if user_role == "user" and module == Module.DASHBOARD:
        return True
    return False


def should_filter_by_domain(user_role: str, module: str) -> bool:
    """
    Check if data should be filtered by domain
    Returns True for Direct Manager on Dashboard (show only their domain)
    """
    if user_role == "direct_manager" and module == Module.DASHBOARD:
        return True
    return False
