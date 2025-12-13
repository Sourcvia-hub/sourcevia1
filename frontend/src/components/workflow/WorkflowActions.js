import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const WorkflowActions = ({ item, module, userRole, onActionComplete }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const status = item?.status;
  const workflow = item?.workflow || {};

  const handleAction = async (action, requiresComment = false) => {
    if (requiresComment) {
      setModalAction(action);
      setShowCommentModal(true);
      return;
    }

    await executeAction(action, '');
  };

  const executeAction = async (action, commentText) => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (action) {
        case 'submit':
          endpoint = `${API_URL}/api/${module}/${item.id}/submit`;
          break;
        case 'approve':
          endpoint = `${API_URL}/api/${module}/${item.id}/approve`;
          payload = { comment: commentText };
          break;
        case 'reject':
          endpoint = `${API_URL}/api/${module}/${item.id}/reject`;
          payload = { reason: commentText };
          break;
        case 'return':
          endpoint = `${API_URL}/api/${module}/${item.id}/return`;
          payload = { reason: commentText };
          break;
        case 'final-approve':
          endpoint = `${API_URL}/api/${module}/${item.id}/final-approve`;
          payload = { comment: commentText };
          break;
        case 'reopen':
          endpoint = `${API_URL}/api/${module}/${item.id}/reopen`;
          payload = { reason: commentText };
          break;
        case 'direct-approve':
          endpoint = `${API_URL}/api/vendors/${item.id}/direct-approve`;
          payload = { comment: commentText };
          break;
        default:
          break;
      }

      await axios.post(endpoint, payload, { withCredentials: true });
      
      setShowCommentModal(false);
      setComment('');
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const renderButtons = () => {
    const buttons = [];

    // User actions
    if (userRole === 'user') {
      if (status === 'draft' || status === 'returned_for_clarification') {
        buttons.push(
          <button
            key="submit"
            onClick={() => handleAction('submit')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Submit for Review
          </button>
        );
      }
    }

    // Procurement Officer actions
    if (userRole === 'procurement_officer' || userRole === 'procurement_manager') {
      // Special vendor direct approval
      if (module === 'vendors' && status === 'draft') {
        buttons.push(
          <button
            key="direct-approve"
            onClick={() => handleAction('direct-approve', true)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Approve Vendor
          </button>
        );
      }

      if (status === 'pending_review' || status === 'reviewed') {
        buttons.push(
          <button
            key="return"
            onClick={() => handleAction('return', true)}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Return for Clarification
          </button>
        );
      }
    }

    // Approver actions
    if (userRole === 'senior_manager') {
      const isAssigned = workflow.assigned_approvers?.includes(item.currentUserId);
      const hasApproved = workflow.approvals?.some(a => a.approver_id === item.currentUserId);

      if (status === 'reviewed' && isAssigned && !hasApproved) {
        buttons.push(
          <button
            key="approve"
            onClick={() => handleAction('approve', true)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
        );
        buttons.push(
          <button
            key="reject"
            onClick={() => handleAction('reject', true)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        );
        buttons.push(
          <button
            key="return"
            onClick={() => handleAction('return', true)}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Return for Clarification
          </button>
        );
      }
    }

    // Procurement Manager actions
    if (userRole === 'procurement_manager') {
      if (status === 'approved_by_approver') {
        buttons.push(
          <button
            key="final-approve"
            onClick={() => handleAction('final-approve', true)}
            disabled={loading}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            Final Approve
          </button>
        );
        buttons.push(
          <button
            key="reject"
            onClick={() => handleAction('reject', true)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Final Reject
          </button>
        );
      }

      if (status === 'final_approved' || status === 'rejected') {
        buttons.push(
          <button
            key="reopen"
            onClick={() => handleAction('reopen', true)}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Reopen Request
          </button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {renderButtons()}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {modalAction === 'reject' || modalAction === 'return' || modalAction === 'reopen' ? 'Reason Required' : 'Add Comment (Optional)'}
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={modalAction === 'reject' || modalAction === 'return' || modalAction === 'reopen' ? 'Enter reason...' : 'Enter comment...'}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
              required={modalAction === 'reject' || modalAction === 'return' || modalAction === 'reopen'}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => executeAction(modalAction, comment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || ((modalAction === 'reject' || modalAction === 'return' || modalAction === 'reopen') && !comment.trim())}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowActions;
