import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyApprovals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPendingApprovals();
    fetchApprovalHistory();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(`${API}/business-requests/my-pending-approvals`, { withCredentials: true });
      setPendingApprovals(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const response = await axios.get(`${API}/business-requests/approval-history`, { withCredentials: true });
      setApprovalHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching approval history:', error);
    }
  };

  const handleApprove = async (notification) => {
    try {
      if (notification.item_type === 'business_request') {
        await axios.post(`${API}/business-requests/${notification.item_id}/additional-approver-decision`, {
          decision: 'approved',
          notes: ''
        }, { withCredentials: true });
      }
      toast({ title: "✅ Approved", description: "Request approved successfully", variant: "success" });
      fetchPendingApprovals();
      fetchApprovalHistory();
    } catch (error) {
      toast({ title: "❌ Error", description: error.response?.data?.detail || "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async (notification) => {
    try {
      if (notification.item_type === 'business_request') {
        await axios.post(`${API}/business-requests/${notification.item_id}/additional-approver-decision`, {
          decision: 'rejected',
          notes: ''
        }, { withCredentials: true });
      }
      toast({ title: "❌ Rejected", description: "Request rejected", variant: "warning" });
      fetchPendingApprovals();
      fetchApprovalHistory();
    } catch (error) {
      toast({ title: "❌ Error", description: error.response?.data?.detail || "Failed to reject", variant: "destructive" });
    }
  };

  const getItemTypeLabel = (type) => {
    const labels = {
      business_request: 'Business Request',
      contract: 'Contract',
      deliverable: 'Deliverable',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Approvals</h1>
          <p className="text-gray-600">Review and approve requests assigned to you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-700">{pendingApprovals.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Approved</p>
            <p className="text-3xl font-bold text-green-700">
              {approvalHistory.filter(h => h.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-3xl font-bold text-red-700">
              {approvalHistory.filter(h => h.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Pending ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            History ({approvalHistory.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p className="text-lg">🎉 No pending approvals!</p>
                <p className="text-sm mt-2">You are all caught up.</p>
              </div>
            ) : (
              pendingApprovals.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getItemTypeLabel(notification.item_type)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.item_title || notification.item_number}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>#{notification.item_number}</span>
                        <span>From: {notification.requested_by_name || 'Unknown'}</span>
                        <span>{new Date(notification.requested_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/tenders/${notification.item_id}`)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleApprove(notification)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(notification)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {approvalHistory.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>No approval history yet.</p>
              </div>
            ) : (
              approvalHistory.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getItemTypeLabel(notification.item_type)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.item_title || notification.item_number}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Decided on: {notification.decision_at ? new Date(notification.decision_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/tenders/${notification.item_id}`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApprovals;
