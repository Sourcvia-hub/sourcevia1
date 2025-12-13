"""
Workflow models for multi-level approval system
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum


class WorkflowStatus(str, Enum):
    """Request workflow status"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    REVIEWED = "reviewed"
    APPROVED_BY_APPROVER = "approved_by_approver"
    FINAL_APPROVED = "final_approved"
    REJECTED = "rejected"
    RETURNED_FOR_CLARIFICATION = "returned_for_clarification"


class WorkflowAction(str, Enum):
    """Workflow action types"""
    CREATED = "created"
    SUBMITTED = "submitted"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETURNED = "returned"
    FINAL_APPROVED = "final_approved"
    REOPENED = "reopened"


class ApprovalRecord(BaseModel):
    """Individual approval record"""
    approver_id: str
    approver_name: str
    approved: bool
    comment: Optional[str] = None
    approved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RejectionRecord(BaseModel):
    """Individual rejection record"""
    rejected_by: str
    rejected_by_name: str
    reason: str
    rejected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ClarificationRequest(BaseModel):
    """Request for clarification"""
    by: str
    by_name: str
    reason: str
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WorkflowHistoryEntry(BaseModel):
    """Single entry in workflow history"""
    action: WorkflowAction
    by: str
    by_name: str
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    comment: Optional[str] = None


class WorkflowData(BaseModel):
    """Complete workflow tracking data"""
    submitted_by: Optional[str] = None
    submitted_by_name: Optional[str] = None
    submitted_at: Optional[datetime] = None
    
    reviewed_by: Optional[str] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    assigned_approvers: List[str] = Field(default_factory=list)
    assigned_approver_names: List[str] = Field(default_factory=list)
    
    approvals: List[ApprovalRecord] = Field(default_factory=list)
    rejections: List[RejectionRecord] = Field(default_factory=list)
    
    final_approved_by: Optional[str] = None
    final_approved_by_name: Optional[str] = None
    final_approved_at: Optional[datetime] = None
    
    returned_for_clarification: Optional[ClarificationRequest] = None
    
    history: List[WorkflowHistoryEntry] = Field(default_factory=list)
    
    def add_history(self, action: WorkflowAction, by: str, by_name: str, comment: Optional[str] = None):
        """Add entry to workflow history"""
        entry = WorkflowHistoryEntry(
            action=action,
            by=by,
            by_name=by_name,
            at=datetime.now(timezone.utc),
            comment=comment
        )
        self.history.append(entry)
    
    def get_approval_status(self) -> dict:
        """Get current approval status"""
        total_approvers = len(self.assigned_approvers)
        approved_count = len([a for a in self.approvals if a.approved])
        rejected_count = len(self.rejections)
        
        return {
            "total_approvers": total_approvers,
            "approved_count": approved_count,
            "rejected_count": rejected_count,
            "pending_count": total_approvers - approved_count,
            "all_approved": approved_count == total_approvers and total_approvers > 0
        }
