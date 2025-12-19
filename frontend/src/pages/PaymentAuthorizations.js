import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentAuthorizations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pafs, setPafs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPAF, setSelectedPAF] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPAFs();
  }, []);

  const fetchPAFs = async () => {
    try {
      const response = await axios.get(`${API}/deliverables/paf/list`, { withCredentials: true });
      setPafs(response.data.payment_authorizations || []);
    } catch (error) {
      console.error('Error fetching PAFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      generated: 'bg-blue-100 text-blue-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceBadge = (confidence) => {
    const colors = {
      High: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-red-100 text-red-800',
    };
    return colors[confidence] || 'bg-gray-100 text-gray-800';
  };

  const filteredPAFs = pafs.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const stats = {
    total: pafs.length,
    generated: pafs.filter(p => p.status === 'generated').length,
    approved: pafs.filter(p => p.status === 'approved').length,
    rejected: pafs.filter(p => p.status === 'rejected').length,
    exported: pafs.filter(p => p.exported).length,
  };

  const handleApprove = async (pafId, decision, notes) => {
    try {
      await axios.post(`${API}/deliverables/paf/${pafId}/approve`, {
        decision,
        notes
      }, { withCredentials: true });
      alert(`Payment Authorization ${decision}`);
      fetchPAFs();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving PAF:', error);
      alert('Failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleExport = async (pafId) => {
    try {
      const response = await axios.post(`${API}/deliverables/paf/${pafId}/export`, {}, { withCredentials: true });
      alert(`Exported with reference: ${response.data.export_reference}`);
      fetchPAFs();
    } catch (error) {
      console.error('Error exporting PAF:', error);
      alert('Failed: ' + (error.response?.data?.detail || error.message));
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>💰</span> Payment Authorizations
            </h1>
            <p className="text-gray-600 mt-1">Manage payment authorization forms for accepted deliverables</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <p className="text-sm text-gray-600">Total PAFs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Generated</p>
            <p className="text-2xl font-bold text-blue-600">{stats.generated}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Exported</p>
            <p className="text-2xl font-bold text-purple-600">{stats.exported}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b pb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'generated', label: 'Generated' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PAF List */}
        {filteredPAFs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">💰</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Authorizations</h3>
            <p className="text-gray-600">Payment authorizations are generated from accepted deliverables.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPAFs.map(paf => (
              <PAFCard
                key={paf.id}
                paf={paf}
                getStatusBadge={getStatusBadge}
                getConfidenceBadge={getConfidenceBadge}
                onViewDetail={() => {
                  setSelectedPAF(paf);
                  setShowDetailModal(true);
                }}
                onApprove={handleApprove}
                onExport={handleExport}
              />
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedPAF && (
          <PAFDetailModal
            paf={selectedPAF}
            getStatusBadge={getStatusBadge}
            getConfidenceBadge={getConfidenceBadge}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPAF(null);
            }}
            onApprove={handleApprove}
            onExport={handleExport}
          />
        )}
      </div>
    </Layout>
  );
};

// PAF Card Component
const PAFCard = ({ paf, getStatusBadge, getConfidenceBadge, onViewDetail, onApprove, onExport }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{paf.paf_number}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(paf.status)}`}>
              {(paf.status || '').replace(/_/g, ' ').toUpperCase()}
            </span>
            {paf.exported && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                EXPORTED
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{paf.deliverable_description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
            <span>Vendor: <strong className="text-gray-700">{paf.vendor_name}</strong></span>
            <span>Contract: <strong className="text-gray-700">{paf.contract_number || 'N/A'}</strong></span>
            <span>Generated: <strong className="text-gray-700">{new Date(paf.generated_date).toLocaleDateString()}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-green-600">
              {paf.currency} {paf.authorized_amount?.toLocaleString()}
            </span>
            {paf.ai_payment_readiness && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                paf.ai_payment_readiness === 'Ready' ? 'bg-green-100 text-green-800' :
                paf.ai_payment_readiness === 'Ready with Clarifications' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                AI: {paf.ai_payment_readiness}
              </span>
            )}
            {paf.ai_confidence && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(paf.ai_confidence)}`}>
                {paf.ai_confidence} Confidence
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={onViewDetail}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            View Details
          </button>
          
          {paf.status === 'generated' && (
            <>
              <button
                onClick={() => onApprove(paf.id, 'approved', '')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) onApprove(paf.id, 'rejected', reason);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                ❌ Reject
              </button>
            </>
          )}
          
          {paf.status === 'approved' && !paf.exported && (
            <button
              onClick={() => onExport(paf.id)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              📤 Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// PAF Detail Modal
const PAFDetailModal = ({ paf, getStatusBadge, getConfidenceBadge, onClose, onApprove, onExport }) => {
  const [approvalNotes, setApprovalNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{paf.paf_number}</h2>
            <p className="text-sm text-gray-500">Payment Authorization Form</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(paf.status)}`}>
            {(paf.status || '').replace(/_/g, ' ').toUpperCase()}
          </span>
          {paf.exported && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              EXPORTED: {paf.export_reference}
            </span>
          )}
        </div>

        {/* Financial */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-600 font-medium">Authorized Amount</p>
          <p className="text-3xl font-bold text-green-700">{paf.currency} {paf.authorized_amount?.toLocaleString()}</p>
        </div>

        {/* References */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Vendor</p>
            <p className="font-medium text-gray-900">{paf.vendor_name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Contract</p>
            <p className="font-medium text-gray-900">{paf.contract_number || 'N/A'}</p>
            <p className="text-sm text-gray-600">{paf.contract_title}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Deliverable</p>
            <p className="font-medium text-gray-900">{paf.deliverable_number}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Project/PR</p>
            <p className="font-medium text-gray-900">{paf.project_name || paf.tender_number || 'N/A'}</p>
          </div>
        </div>

        {/* Deliverable Description */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Deliverable Description</p>
          <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{paf.deliverable_description}</p>
        </div>

        {/* AI Validation Summary */}
        {paf.ai_payment_readiness && (
          <div className="mb-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h3 className="font-semibold text-blue-900">AI Validation Summary</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(paf.ai_confidence)}`}>
                {paf.ai_confidence} Confidence
              </span>
            </div>

            <div className="mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                paf.ai_payment_readiness === 'Ready' ? 'bg-green-100 text-green-800' :
                paf.ai_payment_readiness === 'Ready with Clarifications' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Payment Readiness: {paf.ai_payment_readiness}
              </span>
            </div>

            {paf.ai_key_observations?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-blue-800 mb-1">Key Observations:</p>
                <ul className="text-sm text-blue-700 list-disc list-inside">
                  {paf.ai_key_observations.map((obs, i) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {paf.ai_required_clarifications?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-orange-800 mb-1">Required Clarifications:</p>
                <ul className="text-sm text-orange-700 list-disc list-inside">
                  {paf.ai_required_clarifications.map((clar, i) => (
                    <li key={i}>{clar}</li>
                  ))}
                </ul>
              </div>
            )}

            {paf.ai_advisory_summary && (
              <div className="bg-white rounded p-3 text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Advisory Summary:</p>
                {paf.ai_advisory_summary}
              </div>
            )}
          </div>
        )}

        {/* Audit Trail */}
        {paf.audit_trail?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Audit Trail</h3>
            <div className="space-y-2">
              {paf.audit_trail.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    entry.action === 'approved' ? 'bg-green-100 text-green-800' :
                    entry.action === 'rejected' ? 'bg-red-100 text-red-800' :
                    entry.action === 'exported' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.action.toUpperCase()}
                  </span>
                  {entry.notes && <span className="text-gray-600">{entry.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {paf.status === 'generated' && (
          <div className="border-t pt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Notes</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Add any notes for approval/rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(paf.id, 'approved', approvalNotes)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                ✅ Approve Payment Authorization
              </button>
              <button
                onClick={() => onApprove(paf.id, 'rejected', approvalNotes || 'Rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}

        {paf.status === 'approved' && !paf.exported && (
          <div className="border-t pt-4">
            <button
              onClick={() => onExport(paf.id)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              📤 Export Payment Authorization
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentAuthorizations;
