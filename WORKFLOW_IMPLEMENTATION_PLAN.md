# 🔄 Sourcevia Workflow Implementation Plan

## Overview
Complete refactoring of the approval workflow system with multi-level approvals and role-based access control.

---

## 📋 Phase 1: Database Schema & Models (Backend)

### 1.1 New Approval Tracking Schema

**Add to all request modules (Vendor, PR/Tender, Contract, PO, Invoice, Service Request, Resource):**

```python
# New fields to add to each request model
{
    "status": "draft | pending_review | reviewed | approved_by_approver | final_approved | rejected | returned_for_clarification",
    "workflow": {
        "submitted_by": "user_id",
        "submitted_at": "datetime",
        "reviewed_by": "procurement_officer_id",
        "reviewed_at": "datetime",
        "assigned_approvers": ["approver_id_1", "approver_id_2", ...],
        "approvals": [
            {
                "approver_id": "user_id",
                "approved": true/false,
                "comment": "approval comment",
                "approved_at": "datetime"
            }
        ],
        "rejections": [
            {
                "rejected_by": "user_id",
                "reason": "rejection reason",
                "rejected_at": "datetime"
            }
        ],
        "final_approved_by": "procurement_manager_id",
        "final_approved_at": "datetime",
        "returned_for_clarification": {
            "by": "user_id",
            "reason": "clarification needed",
            "at": "datetime"
        },
        "history": [
            {
                "action": "submitted | reviewed | approved | rejected | returned | final_approved",
                "by": "user_id",
                "at": "datetime",
                "comment": "action comment"
            }
        ]
    }
}
```

### 1.2 Status Flow Definition

```
User Creates → draft
↓
User Submits → pending_review
↓
Procurement Officer Reviews → reviewed (assigns approvers)
↓
Approvers Review → approved_by_approver (all must approve)
↓
Procurement Manager → final_approved
```

**Alternative Paths:**
- Any stage → returned_for_clarification → back to User
- Any approver rejects → recorded in rejections
- Procurement Manager rejects → status = rejected

---

## 📋 Phase 2: Role & Permission Updates

### 2.1 Update Role Permissions

**User Role:**
```python
{
    "can_create": ["vendor", "pr", "contract", "po", "resource", "invoice", "service_request"],
    "can_view_own": True,
    "can_edit_own_draft": True,
    "can_submit": True,
    "can_view": ["vendor", "pr", "contract", "po", "resource", "invoice", "service_request"]
}
```

**Procurement Officer:**
```python
{
    "can_view_all": True,
    "can_review": True,
    "can_assign_approvers": True,
    "can_return_to_applicant": True,
    "can_reject_with_justification": True,
    "can_edit": ["vendor_draft"],
    "can_approve": ["vendor"],  # Can directly approve vendors
    "modules": ["vendor", "pr", "contract", "po", "resource", "invoice", "service_request", "asset", "cctv"]
}
```

**Approver (senior_manager):**
```python
{
    "can_view_assigned": True,
    "can_approve": True,
    "can_reject_with_comment": True,
    "can_return_for_clarification": True,
    "can_view_history": True,
    "modules_viewer": ["vendor"],
    "modules_approve": ["pr", "contract", "po", "resource", "invoice", "service_request"],
    "modules_viewer": ["asset"]
}
```

**Procurement Manager:**
```python
{
    "can_view_all": True,
    "can_final_approve": True,
    "can_final_reject": True,
    "can_reopen": True,
    "full_access": True,
    "modules": ["vendor", "pr", "contract", "po", "resource", "invoice", "service_request", "asset", "cctv"]
}
```

### 2.2 Admin Role Migration

```python
# Migration script
def migrate_admin_to_procurement_manager():
    """Convert all admin users to procurement_manager"""
    db.users.update_many(
        {"role": "admin"},
        {"$set": {"role": "procurement_manager"}}
    )
```

---

## 📋 Phase 3: Backend API Endpoints

### 3.1 New Workflow Endpoints

**For each module (vendor, pr, contract, po, invoice, service_request, resource):**

```python
# Submit for review (User)
POST /api/{module}/{id}/submit
- Changes status: draft → pending_review

# Review and assign approvers (Procurement Officer)
POST /api/{module}/{id}/review
Body: {
    "assigned_approvers": ["user_id_1", "user_id_2"],
    "comment": "Review comment"
}
- Changes status: pending_review → reviewed

# Approve (Approver)
POST /api/{module}/{id}/approve
Body: {
    "comment": "Approval comment"
}
- Records approval
- If all approvers approved → approved_by_approver

# Reject (Approver or Procurement Manager)
POST /api/{module}/{id}/reject
Body: {
    "reason": "Rejection reason"
}
- Records rejection in rejections array

# Return for clarification
POST /api/{module}/{id}/return
Body: {
    "reason": "Clarification needed"
}
- Changes status: any → returned_for_clarification

# Final approve (Procurement Manager)
POST /api/{module}/{id}/final-approve
Body: {
    "comment": "Final approval comment"
}
- Changes status: approved_by_approver → final_approved

# Get workflow history
GET /api/{module}/{id}/workflow-history
- Returns full workflow history with all approvals, rejections, comments

# Reopen (Procurement Manager only)
POST /api/{module}/{id}/reopen
- Changes status back to allow re-processing
```

### 3.2 Vendor Module Special Rules

```python
# Vendor creation by User
POST /api/vendors
- Status: draft
- Automatically visible to Procurement Officer
- User cannot edit after creation

# Vendor edit (Procurement Officer only)
PUT /api/vendors/{id}
- Only if status = draft
- Only by procurement_officer role

# Vendor direct approval (Procurement Officer)
POST /api/vendors/{id}/approve
- Procurement Officer can directly approve (no multi-level workflow)
- Changes status: draft → approved
```

### 3.3 Vendor Usage Rules

```python
# In PR (Tender) Module
- Can use vendors with status: draft OR approved

# In Contract Module
- Can use ONLY vendors with status: approved

# In PO Module
- Can use ONLY vendors with status: approved
```

---

## 📋 Phase 4: Frontend Updates

### 4.1 Module Renaming: Tender → PR

**Files to update:**
- `/app/frontend/src/pages/Tenders.js` → Rename to `PurchaseRequests.js`
- Update all "Tender" labels to "Purchase Request" or "PR"
- Update navigation menu
- Update breadcrumbs
- Keep API endpoints as `/api/tenders` (backend unchanged)

### 4.2 New UI Components

**1. Workflow Status Badge Component**
```jsx
<WorkflowStatusBadge status={request.status} />
// Shows: Draft, Pending Review, Under Review, Approved, Rejected, etc.
```

**2. Approver Assignment Component**
```jsx
<ApproverSelector 
  assignedApprovers={request.workflow.assigned_approvers}
  onAssign={handleAssign}
/>
// Multi-select for Procurement Officer
```

**3. Approval Action Buttons**
```jsx
<ApprovalActions
  request={request}
  userRole={user.role}
  onApprove={handleApprove}
  onReject={handleReject}
  onReturn={handleReturn}
/>
// Shows buttons based on user role and request status
```

**4. Workflow History Timeline**
```jsx
<WorkflowHistory history={request.workflow.history} />
// Shows timeline of all actions with comments
```

### 4.3 Page Updates

**For each module page (Vendor, PR, Contract, PO, Invoice, Service Request, Resource):**

**User View:**
- Create new request (saves as draft)
- Submit button (changes to pending_review)
- View own requests with status
- Edit only if status = draft
- Resubmit if status = returned_for_clarification

**Procurement Officer View:**
- Dashboard: All pending_review requests
- Review action: Assign multiple approvers
- Return to user action
- Reject with justification
- For Vendors: Edit and approve directly

**Approver View:**
- Dashboard: Assigned requests
- Approve with comment
- Reject with comment
- Return for clarification
- View full history

**Procurement Manager View:**
- Dashboard: All requests waiting final approval
- Final approve
- Final reject
- Reopen completed requests
- View all system data

---

## 📋 Phase 5: Database Migration Scripts

### 5.1 Add Workflow Fields to Existing Records

```python
async def migrate_existing_records():
    """Add workflow fields to all existing records"""
    
    collections = ["vendors", "tenders", "contracts", "purchase_orders", 
                   "invoices", "service_requests", "resources"]
    
    for collection_name in collections:
        await db[collection_name].update_many(
            {},
            {
                "$set": {
                    "workflow": {
                        "submitted_by": None,
                        "submitted_at": None,
                        "reviewed_by": None,
                        "reviewed_at": None,
                        "assigned_approvers": [],
                        "approvals": [],
                        "rejections": [],
                        "final_approved_by": None,
                        "final_approved_at": None,
                        "returned_for_clarification": None,
                        "history": []
                    }
                }
            }
        )
    
    print("✅ Migration completed")
```

### 5.2 Migrate Admin Users

```python
async def migrate_admin_users():
    """Convert admin users to procurement_manager"""
    result = await db.users.update_many(
        {"role": "admin"},
        {"$set": {"role": "procurement_manager"}}
    )
    print(f"✅ Migrated {result.modified_count} admin users to procurement_manager")
```

---

## 📋 Phase 6: Testing Plan

### 6.1 User Role Testing
- [ ] User can create draft requests
- [ ] User can submit draft requests
- [ ] User can view own requests only
- [ ] User can edit only draft requests
- [ ] User can resubmit returned requests

### 6.2 Procurement Officer Testing
- [ ] Officer can view all pending requests
- [ ] Officer can assign multiple approvers
- [ ] Officer can return requests to users
- [ ] Officer can reject with justification
- [ ] Officer can edit and approve draft vendors

### 6.3 Approver Testing
- [ ] Approver sees only assigned requests
- [ ] Approver can approve with comment
- [ ] Approver can reject with comment (recorded, not final)
- [ ] Approver can return for clarification
- [ ] All approvers must approve for status change

### 6.4 Procurement Manager Testing
- [ ] Manager sees all requests needing final approval
- [ ] Manager can final approve
- [ ] Manager can final reject
- [ ] Manager can reopen completed requests
- [ ] Manager has full system access

### 6.5 Vendor Module Testing
- [ ] Draft vendors visible in PR module
- [ ] Only approved vendors in Contract module
- [ ] Only approved vendors in PO module
- [ ] Procurement Officer can edit draft vendors

### 6.6 Backward Compatibility Testing
- [ ] Existing 2 tenders preserved
- [ ] Existing 1 contract preserved
- [ ] All admin users converted to procurement_manager
- [ ] All users can still access their data

---

## 📋 Phase 7: Deployment Checklist

### Pre-Deployment
- [ ] Run migration scripts on staging database
- [ ] Test all workflows in staging environment
- [ ] Backup production database
- [ ] Prepare rollback plan

### Deployment
- [ ] Run database migrations
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Verify all services running
- [ ] Test critical workflows

### Post-Deployment
- [ ] Monitor error logs
- [ ] Verify user access
- [ ] Test approval workflows
- [ ] Collect user feedback

---

## 📊 Implementation Timeline Estimate

- **Phase 1: Database Schema & Models** - 2-3 hours
- **Phase 2: Role & Permission Updates** - 1-2 hours
- **Phase 3: Backend API Endpoints** - 4-5 hours
- **Phase 4: Frontend Updates** - 5-6 hours
- **Phase 5: Database Migration** - 1 hour
- **Phase 6: Testing** - 3-4 hours
- **Phase 7: Deployment** - 1 hour

**Total Estimated Time: 17-22 hours of development**

---

## ⚠️ Risks & Considerations

1. **Backward Compatibility**: Existing data must work with new workflow
2. **Complex Approval Logic**: Multiple approvers + rejection tracking is complex
3. **UI/UX Changes**: Major workflow changes may require user training
4. **Performance**: Workflow history tracking may impact query performance
5. **Testing Coverage**: Extensive testing needed for all role combinations

---

## 🎯 Success Criteria

✅ All roles work as specified
✅ Multi-level approval workflow functions correctly
✅ Rejection tracking works properly
✅ Request history is complete and visible
✅ Vendor draft/approved rules enforced
✅ All existing data preserved and functional
✅ UI clearly shows workflow status and actions
✅ No admin role exists (all migrated to procurement_manager)

---

**Ready to proceed with implementation?**
