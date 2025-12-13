"""
Workflow management utilities
"""
from typing import List, Optional
from models.workflow import WorkflowData, WorkflowAction, WorkflowStatus, ApprovalRecord, RejectionRecord, ClarificationRequest
from datetime import datetime, timezone


class WorkflowManager:
    """Manages workflow operations"""
    
    @staticmethod
    def create_workflow(user_id: str, user_name: str) -> WorkflowData:
        """Create a new workflow for a request"""
        workflow = WorkflowData()
        workflow.add_history(
            action=WorkflowAction.CREATED,
            by=user_id,
            by_name=user_name,
            comment="Request created"
        )
        return workflow
    
    @staticmethod
    def submit_for_review(workflow: WorkflowData, user_id: str, user_name: str) -> WorkflowData:
        """Submit request for review"""
        workflow.submitted_by = user_id
        workflow.submitted_by_name = user_name
        workflow.submitted_at = datetime.now(timezone.utc)
        workflow.add_history(
            action=WorkflowAction.SUBMITTED,
            by=user_id,
            by_name=user_name,
            comment="Submitted for review"
        )
        return workflow
    
    @staticmethod
    def review_and_assign(
        workflow: WorkflowData, 
        reviewer_id: str, 
        reviewer_name: str,
        approver_ids: List[str],
        approver_names: List[str],
        comment: Optional[str] = None
    ) -> WorkflowData:
        """Review request and assign approvers"""
        workflow.reviewed_by = reviewer_id
        workflow.reviewed_by_name = reviewer_name
        workflow.reviewed_at = datetime.now(timezone.utc)
        workflow.assigned_approvers = approver_ids
        workflow.assigned_approver_names = approver_names
        workflow.add_history(
            action=WorkflowAction.REVIEWED,
            by=reviewer_id,
            by_name=reviewer_name,
            comment=comment or f"Assigned to {len(approver_ids)} approver(s)"
        )
        return workflow
    
    @staticmethod
    def approve(
        workflow: WorkflowData,
        approver_id: str,
        approver_name: str,
        comment: Optional[str] = None
    ) -> tuple[WorkflowData, bool]:
        """
        Record approval from an approver
        Returns: (updated_workflow, all_approved)
        """
        # Check if already approved by this approver
        for approval in workflow.approvals:
            if approval.approver_id == approver_id:
                return workflow, False  # Already approved
        
        # Add approval
        approval = ApprovalRecord(
            approver_id=approver_id,
            approver_name=approver_name,
            approved=True,
            comment=comment,
            approved_at=datetime.now(timezone.utc)
        )
        workflow.approvals.append(approval)
        
        workflow.add_history(
            action=WorkflowAction.APPROVED,
            by=approver_id,
            by_name=approver_name,
            comment=comment or "Approved"
        )
        
        # Check if all approvers have approved
        status = workflow.get_approval_status()
        return workflow, status["all_approved"]
    
    @staticmethod
    def reject(
        workflow: WorkflowData,
        rejector_id: str,
        rejector_name: str,
        reason: str
    ) -> WorkflowData:
        """Record rejection"""
        rejection = RejectionRecord(
            rejected_by=rejector_id,
            rejected_by_name=rejector_name,
            reason=reason,
            rejected_at=datetime.now(timezone.utc)
        )
        workflow.rejections.append(rejection)
        
        workflow.add_history(
            action=WorkflowAction.REJECTED,
            by=rejector_id,
            by_name=rejector_name,
            comment=f"Rejected: {reason}"
        )
        
        return workflow
    
    @staticmethod
    def return_for_clarification(
        workflow: WorkflowData,
        returner_id: str,
        returner_name: str,
        reason: str
    ) -> WorkflowData:
        """Return request for clarification"""
        workflow.returned_for_clarification = ClarificationRequest(
            by=returner_id,
            by_name=returner_name,
            reason=reason,
            at=datetime.now(timezone.utc)
        )
        
        workflow.add_history(
            action=WorkflowAction.RETURNED,
            by=returner_id,
            by_name=returner_name,
            comment=f"Returned for clarification: {reason}"
        )
        
        return workflow
    
    @staticmethod
    def final_approve(
        workflow: WorkflowData,
        manager_id: str,
        manager_name: str,
        comment: Optional[str] = None
    ) -> WorkflowData:
        """Final approval by procurement manager"""
        workflow.final_approved_by = manager_id
        workflow.final_approved_by_name = manager_name
        workflow.final_approved_at = datetime.now(timezone.utc)
        
        workflow.add_history(
            action=WorkflowAction.FINAL_APPROVED,
            by=manager_id,
            by_name=manager_name,
            comment=comment or "Final approval granted"
        )
        
        return workflow
    
    @staticmethod
    def reopen(
        workflow: WorkflowData,
        manager_id: str,
        manager_name: str,
        reason: str
    ) -> WorkflowData:
        """Reopen a completed request"""
        workflow.add_history(
            action=WorkflowAction.REOPENED,
            by=manager_id,
            by_name=manager_name,
            comment=f"Reopened: {reason}"
        )
        
        return workflow
    
    @staticmethod
    def can_edit(workflow: WorkflowData, user_id: str, user_role: str, status: str) -> bool:
        """Check if user can edit based on workflow state"""
        # User can edit only their own drafts
        if user_role == "user" and status == WorkflowStatus.DRAFT:
            return workflow.submitted_by == user_id or workflow.submitted_by is None
        
        # Procurement officer can edit draft vendors
        if user_role == "procurement_officer" and status == WorkflowStatus.DRAFT:
            return True
        
        # Procurement manager can edit anything
        if user_role == "procurement_manager":
            return True
        
        return False
    
    @staticmethod
    def get_next_status(current_status: str, action: str) -> str:
        """Determine next status based on action"""
        status_map = {
            (WorkflowStatus.DRAFT, "submit"): WorkflowStatus.PENDING_REVIEW,
            (WorkflowStatus.PENDING_REVIEW, "review"): WorkflowStatus.REVIEWED,
            (WorkflowStatus.REVIEWED, "approve_all"): WorkflowStatus.APPROVED_BY_APPROVER,
            (WorkflowStatus.APPROVED_BY_APPROVER, "final_approve"): WorkflowStatus.FINAL_APPROVED,
            (WorkflowStatus.PENDING_REVIEW, "reject"): WorkflowStatus.REJECTED,
            (WorkflowStatus.REVIEWED, "reject"): WorkflowStatus.REJECTED,
            (WorkflowStatus.APPROVED_BY_APPROVER, "reject"): WorkflowStatus.REJECTED,
            (WorkflowStatus.PENDING_REVIEW, "return"): WorkflowStatus.RETURNED_FOR_CLARIFICATION,
            (WorkflowStatus.REVIEWED, "return"): WorkflowStatus.RETURNED_FOR_CLARIFICATION,
            (WorkflowStatus.APPROVED_BY_APPROVER, "return"): WorkflowStatus.RETURNED_FOR_CLARIFICATION,
            (WorkflowStatus.RETURNED_FOR_CLARIFICATION, "resubmit"): WorkflowStatus.PENDING_REVIEW,
        }
        
        return status_map.get((current_status, action), current_status)
