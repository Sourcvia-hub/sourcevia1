import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContractApprovals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingContracts, setPendingContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [decisionModal, setDecisionModal] = useState(false);
  const [decisionForm, setDecisionForm] = useState({
    decision: '',
    notes: '',
    risk_acceptance: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(`${API}/contract-governance/pending-approvals`, { withCredentials: true });
      setPendingContracts(response.data.contracts || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getClassificationBadge = (classification) => {
    const colors = {
      not_outsourcing: 'bg-green-100 text-green-800',
      outsourcing: 'bg-yellow-100 text-yellow-800',
      material_outsourcing: 'bg-orange-100 text-orange-800',
      cloud_computing: 'bg-blue-100 text-blue-800',
      insourcing: 'bg-purple-100 text-purple-800',
      exempted: 'bg-gray-100 text-gray-800',
    };
    return colors[classification] || 'bg-gray-100 text-gray-800';
  };

  const openDecisionModal = (contract) => {
    setSelectedContract(contract);
    setDecisionForm({ decision: '', notes: '', risk_acceptance: false });
    setDecisionModal(true);
  };

  const handleDecisionSubmit = async () => {
    if (!decisionForm.decision) {
      alert('Please select a decision');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/contract-governance/hop-decision/${selectedContract.id}`, decisionForm, { withCredentials: true });
      alert(`Contract ${decisionForm.decision === 'approved' ? 'approved' : decisionForm.decision === 'rejected' ? 'rejected' : 'returned'} successfully`);
      setDecisionModal(false);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSubmitting(false);
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
              <span>📋</span> Contract Approvals
            </h1>
            <p className="text-gray-600 mt-1">Head of Procurement approval dashboard</p>
          </div>
          <div className="text-sm text-gray-500">
            {pendingContracts.length} contract(s) pending approval
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingContracts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">High Risk</p>
            <p className="text-2xl font-bold text-red-600">
              {pendingContracts.filter(c => c.risk_level === 'high').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600">SAMA NOC Required</p>
            <p className="text-2xl font-bold text-orange-600">
              {pendingContracts.filter(c => c.sama_noc_status && c.sama_noc_status !== 'not_required').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Outsourcing</p>
            <p className="text-2xl font-bold text-purple-600">
              {pendingContracts.filter(c => c.outsourcing_classification && c.outsourcing_classification !== 'not_outsourcing').length}
            </p>
          </div>
        </div>

        {/* Contracts List */}
        {pendingContracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">✅</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All contracts have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingContracts.map((contract) => (
              <div key={contract.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  {/* Left side - Contract Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                      {contract.contract_number && (
                        <span className="text-xs text-blue-600 font-medium">#{contract.contract_number}</span>
                      )}
                    </div>

                    {/* Classification & Risk Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {contract.outsourcing_classification && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getClassificationBadge(contract.outsourcing_classification)}`}>
                          {contract.outsourcing_classification.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      )}
                      {contract.risk_level && (
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(contract.risk_level)}`}>
                          {contract.risk_level.toUpperCase()} RISK ({contract.risk_score?.toFixed(0)})
                        </span>
                      )}
                      {contract.sama_noc_status && contract.sama_noc_status !== 'not_required' && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          SAMA: {contract.sama_noc_status.toUpperCase()}
                        </span>
                      )}
                      {contract.contract_dd_status && contract.contract_dd_status !== 'not_required' && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          DD: {contract.contract_dd_status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Contract Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-2 font-medium">${contract.value?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vendor:</span>
                        <span className="ml-2 font-medium">
                          {contract.vendor_info?.name_english || contract.vendor_info?.commercial_name || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">PR:</span>
                        <span className="ml-2 font-medium">{contract.pr_info?.title || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-2 font-medium">
                          {contract.hop_submitted_at ? new Date(contract.hop_submitted_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Risk Drivers */}
                    {contract.risk_drivers?.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded text-sm">
                        <span className="font-medium text-red-800">Risk Drivers: </span>
                        <span className="text-red-700">{contract.risk_drivers.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openDecisionModal(contract)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                      Make Decision
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decision Modal */}
        {decisionModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contract Approval Decision</h2>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{selectedContract.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Value: ${selectedContract.value?.toLocaleString()}</p>
                {selectedContract.risk_level && (
                  <p className="text-sm mt-1">
                    Risk: <span className={`font-medium ${selectedContract.risk_level === 'high' ? 'text-red-600' : selectedContract.risk_level === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {selectedContract.risk_level.toUpperCase()}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDecisionForm({ ...decisionForm, decision: 'approved' })}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        decisionForm.decision === 'approved'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      ✅ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionForm({ ...decisionForm, decision: 'returned' })}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        decisionForm.decision === 'returned'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      ↩️ Return
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionForm({ ...decisionForm, decision: 'rejected' })}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        decisionForm.decision === 'rejected'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>

                {selectedContract.requires_risk_acceptance && decisionForm.decision === 'approved' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={decisionForm.risk_acceptance}
                        onChange={(e) => setDecisionForm({ ...decisionForm, risk_acceptance: e.target.checked })}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-medium text-red-800">I accept the high risk associated with this contract</span>
                        <p className="text-xs text-red-600 mt-1">
                          This contract has been flagged as HIGH RISK. By approving, you acknowledge and accept this risk.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={decisionForm.notes}
                    onChange={(e) => setDecisionForm({ ...decisionForm, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any comments or instructions..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDecisionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecisionSubmit}
                  disabled={submitting || !decisionForm.decision || (selectedContract.requires_risk_acceptance && decisionForm.decision === 'approved' && !decisionForm.risk_acceptance)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContractApprovals;
