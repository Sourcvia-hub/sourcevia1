import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Status badge component
const StatusBadge = ({ status }) => {
  const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending_officer_review': 'bg-yellow-100 text-yellow-800',
    'pending_hop_approval': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'approved_with_conditions': 'bg-orange-100 text-orange-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    'draft': 'Draft',
    'pending_officer_review': 'Pending Officer Review',
    'pending_hop_approval': 'Pending HoP Approval',
    'approved': 'Approved',
    'approved_with_conditions': 'Approved with Conditions',
    'rejected': 'Rejected',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
      {statusLabels[status] || status}
    </span>
  );
};

// Risk Level Badge
const RiskBadge = ({ level, score }) => {
  const colors = {
    'Low': 'bg-green-100 text-green-800 border-green-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'High': 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${colors[level] || 'bg-gray-100'}`}>
      <span className="text-2xl font-bold">{score?.toFixed(0) || 0}</span>
      <div>
        <div className="text-xs opacity-75">Risk Score</div>
        <div className="font-semibold">{level} Risk</div>
      </div>
    </div>
  );
};

// AI Confidence Badge
const ConfidenceBadge = ({ level }) => {
  const colors = {
    'High': 'text-green-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-red-600',
  };

  const icons = {
    'High': '✓✓✓',
    'Medium': '✓✓',
    'Low': '✓',
  };

  return (
    <span className={`font-medium ${colors[level] || 'text-gray-600'}`}>
      {icons[level]} {level} Confidence
    </span>
  );
};

// Extracted Field Display
const ExtractedFieldDisplay = ({ label, field, onEdit }) => {
  const statusColors = {
    'Extracted': 'bg-green-50 border-green-200',
    'Inferred': 'bg-yellow-50 border-yellow-200',
    'Not Provided': 'bg-gray-50 border-gray-200',
    'Manual': 'bg-blue-50 border-blue-200',
  };

  const statusIcons = {
    'Extracted': '✓',
    'Inferred': '?',
    'Not Provided': '—',
    'Manual': '✎',
  };

  const fieldData = typeof field === 'object' ? field : { value: field, status: 'Manual' };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[fieldData.status] || 'bg-gray-50'}`}>
      <div className="flex justify-between items-start mb-1">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <span className="text-xs text-gray-400" title={fieldData.status}>
          {statusIcons[fieldData.status]} {fieldData.status}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 flex-1">
          {fieldData.value || '—'}
        </span>
        {onEdit && (
          <button onClick={() => onEdit(label, fieldData.value)} className="text-blue-500 hover:text-blue-700 text-xs">
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

const VendorDDForm = ({ vendorId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ddData, setDdData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [runningAI, setRunningAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  
  // Risk acceptance form
  const [riskAcceptance, setRiskAcceptance] = useState({
    risk_acceptance_reason: '',
    mitigating_controls: '',
    scope_limitations: '',
  });
  
  // Officer review form
  const [officerReview, setOfficerReview] = useState({
    accept_assessment: true,
    comments: '',
  });
  
  // HoP approval form
  const [hopApproval, setHopApproval] = useState({
    approved: true,
    with_conditions: false,
    comments: '',
  });

  const isOfficer = ['procurement_officer', 'procurement_manager'].includes(user?.role);
  const isHoP = user?.role === 'procurement_manager';

  const fetchDDData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/vendor-dd/vendors/${vendorId}/dd`, { withCredentials: true });
      setDdData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // DD not initialized, initialize it
        try {
          await axios.post(`${API}/vendor-dd/vendors/${vendorId}/init-dd`, {}, { withCredentials: true });
          const response = await axios.get(`${API}/vendor-dd/vendors/${vendorId}/dd`, { withCredentials: true });
          setDdData(response.data);
        } catch (initError) {
          console.error('Error initializing DD:', initError);
          alert('Failed to initialize Due Diligence');
        }
      } else {
        console.error('Error fetching DD data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchDDData();
  }, [fetchDDData]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF and Word documents are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API}/vendor-dd/vendors/${vendorId}/dd/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Document uploaded successfully');
      fetchDDData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRunAI = async () => {
    if (!window.confirm('Run AI extraction and risk assessment on uploaded documents?')) return;

    setRunningAI(true);
    try {
      const response = await axios.post(`${API}/vendor-dd/vendors/${vendorId}/dd/run-ai`, {}, { withCredentials: true });
      alert(`AI Assessment Complete!\n\nRisk Score: ${response.data.risk_score}\nRisk Level: ${response.data.risk_level}\nConfidence: ${response.data.confidence_level}`);
      fetchDDData();
    } catch (error) {
      console.error('AI run error:', error);
      alert(`AI assessment failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setRunningAI(false);
    }
  };

  const handleFieldEdit = (fieldName, currentValue) => {
    setEditField(fieldName);
    setEditValue(currentValue || '');
    setEditReason('');
  };

  const handleFieldSave = async () => {
    try {
      await axios.put(`${API}/vendor-dd/vendors/${vendorId}/dd/fields`, {
        field_name: editField,
        new_value: editValue,
        reason: editReason,
      }, { withCredentials: true });
      setEditField(null);
      fetchDDData();
    } catch (error) {
      alert('Failed to update field');
    }
  };

  const handleOfficerSubmit = async () => {
    if (!window.confirm('Submit review to Head of Procurement?')) return;

    setSubmitting(true);
    try {
      await axios.post(`${API}/vendor-dd/vendors/${vendorId}/dd/officer-review`, officerReview, { withCredentials: true });
      alert('Review submitted to Head of Procurement');
      fetchDDData();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(`Failed to submit review: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRiskAcceptance = async () => {
    if (!riskAcceptance.risk_acceptance_reason || !riskAcceptance.mitigating_controls) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/vendor-dd/vendors/${vendorId}/dd/risk-acceptance`, riskAcceptance, { withCredentials: true });
      alert('Risk acceptance recorded');
      fetchDDData();
    } catch (error) {
      alert(`Failed to submit risk acceptance: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHoPApproval = async () => {
    const action = hopApproval.approved ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this vendor?`)) return;

    setSubmitting(true);
    try {
      await axios.post(`${API}/vendor-dd/vendors/${vendorId}/dd/hop-approval`, hopApproval, { withCredentials: true });
      alert(`Vendor ${hopApproval.approved ? 'approved' : 'rejected'} successfully`);
      fetchDDData();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(`Failed to process approval: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const aiAssessment = ddData?.ai_assessment;
  const isHighRisk = aiAssessment?.vendor_risk_level === 'High';
  const hasRiskAcceptance = !!ddData?.risk_acceptance;

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Vendor Due Diligence</h2>
            <p className="text-blue-100 mt-1">AI-Powered Risk Assessment</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={ddData?.status} />
            {onClose && (
              <button onClick={onClose} className="text-white hover:text-blue-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Risk Summary */}
        {aiAssessment && (
          <div className="mt-4 flex items-center gap-6">
            <RiskBadge level={aiAssessment.vendor_risk_level} score={aiAssessment.vendor_risk_score} />
            <ConfidenceBadge level={aiAssessment.ai_confidence_level} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {['overview', 'extracted', 'documents', 'workflow', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Assessment Summary */}
            {aiAssessment ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Risk Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Top Risk Drivers</h4>
                    <ul className="space-y-2">
                      {aiAssessment.top_risk_drivers?.map((driver, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500">⚠</span>
                          <span className="text-sm text-gray-600">{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Assessment Summary</h4>
                    <p className="text-sm text-gray-600">{aiAssessment.assessment_summary}</p>
                  </div>
                </div>

                {aiAssessment.notes_for_human_review && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠ Notes for Human Review</h4>
                    <p className="text-sm text-yellow-700 whitespace-pre-wrap">{aiAssessment.notes_for_human_review}</p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-400">
                  Confidence Rationale: {aiAssessment.ai_confidence_rationale}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-4">No AI assessment yet. Upload a document and run AI analysis.</p>
              </div>
            )}

            {/* Actions based on status and role */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              {/* Upload & Run AI (Officer only, Draft status) */}
              {isOfficer && ddData?.status === 'draft' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Vendor Document (PDF/Word)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {ddData?.uploaded_documents?.length > 0 && (
                    <button
                      onClick={handleRunAI}
                      disabled={runningAI}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {runningAI ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Running AI Assessment...
                        </>
                      ) : (
                        <>
                          🤖 Run AI Assessment
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Officer Review (Pending Officer Review status) */}
              {isOfficer && ddData?.status === 'pending_officer_review' && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={officerReview.accept_assessment}
                        onChange={(e) => setOfficerReview({ ...officerReview, accept_assessment: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Accept AI Assessment</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                      value={officerReview.comments}
                      onChange={(e) => setOfficerReview({ ...officerReview, comments: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Add review comments..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRunAI}
                      disabled={runningAI}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                      🔄 Re-run AI
                    </button>
                    <button
                      onClick={handleOfficerSubmit}
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      Submit to HoP
                    </button>
                  </div>
                </div>
              )}

              {/* Risk Acceptance (HoP only, High Risk vendors) */}
              {isHoP && ddData?.status === 'pending_hop_approval' && isHighRisk && !hasRiskAcceptance && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">⚠ Risk Acceptance Required</h4>
                    <p className="text-sm text-red-600">This is a High Risk vendor. Risk acceptance is mandatory before approval.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Acceptance Reason *</label>
                    <textarea
                      value={riskAcceptance.risk_acceptance_reason}
                      onChange={(e) => setRiskAcceptance({ ...riskAcceptance, risk_acceptance_reason: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain why this risk is acceptable..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mitigating Controls *</label>
                    <textarea
                      value={riskAcceptance.mitigating_controls}
                      onChange={(e) => setRiskAcceptance({ ...riskAcceptance, mitigating_controls: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe controls to mitigate the risk..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scope Limitations (Optional)</label>
                    <textarea
                      value={riskAcceptance.scope_limitations}
                      onChange={(e) => setRiskAcceptance({ ...riskAcceptance, scope_limitations: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Any limitations on vendor scope..."
                    />
                  </div>
                  <button
                    onClick={handleRiskAcceptance}
                    disabled={submitting}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
                  >
                    Submit Risk Acceptance
                  </button>
                </div>
              )}

              {/* HoP Approval (Pending HoP Approval status) */}
              {isHoP && ddData?.status === 'pending_hop_approval' && (!isHighRisk || hasRiskAcceptance) && (
                <div className="space-y-4">
                  {hasRiskAcceptance && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-green-800 mb-2">✓ Risk Acceptance Recorded</h4>
                      <p className="text-sm text-green-600">Risk acceptance has been submitted. You can now proceed with approval.</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={hopApproval.approved}
                          onChange={() => setHopApproval({ ...hopApproval, approved: true })}
                          className="text-blue-600"
                        />
                        <span>Approve</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!hopApproval.approved}
                          onChange={() => setHopApproval({ ...hopApproval, approved: false })}
                          className="text-blue-600"
                        />
                        <span>Reject</span>
                      </label>
                    </div>
                  </div>
                  
                  {hopApproval.approved && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hopApproval.with_conditions}
                        onChange={(e) => setHopApproval({ ...hopApproval, with_conditions: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Approve with Conditions</span>
                    </label>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                      value={hopApproval.comments}
                      onChange={(e) => setHopApproval({ ...hopApproval, comments: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleHoPApproval}
                    disabled={submitting}
                    className={`px-6 py-2 rounded-lg font-medium disabled:opacity-50 ${
                      hopApproval.approved
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {hopApproval.approved ? 'Approve Vendor' : 'Reject Vendor'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extracted Data Tab */}
        {activeTab === 'extracted' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
            
            {/* Vendor Information */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Vendor Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ExtractedFieldDisplay label="Name (Arabic)" field={ddData?.name_arabic} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Name (English)" field={ddData?.name_english} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Commercial Name" field={ddData?.commercial_name} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Entity Type" field={ddData?.entity_type} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="VAT Number" field={ddData?.vat_registration_number} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="CR Number" field={ddData?.cr_number} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="CR Expiry" field={ddData?.cr_expiry_date} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Country" field={ddData?.country} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Activity" field={ddData?.activity_description} onEdit={isOfficer ? handleFieldEdit : null} />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ExtractedFieldDisplay label="Street" field={ddData?.street} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="City" field={ddData?.city} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Mobile" field={ddData?.mobile} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Email" field={ddData?.email_address} onEdit={isOfficer ? handleFieldEdit : null} />
              </div>
            </div>

            {/* Representative Information */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Representative</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ExtractedFieldDisplay label="Name" field={ddData?.rep_full_name} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="Designation" field={ddData?.rep_designation} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="ID Number" field={ddData?.rep_id_document_number} onEdit={isOfficer ? handleFieldEdit : null} />
              </div>
            </div>

            {/* Bank Information */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ExtractedFieldDisplay label="Bank Name" field={ddData?.bank_name} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="IBAN" field={ddData?.iban} onEdit={isOfficer ? handleFieldEdit : null} />
                <ExtractedFieldDisplay label="SWIFT Code" field={ddData?.swift_code} onEdit={isOfficer ? handleFieldEdit : null} />
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
            
            {ddData?.uploaded_documents?.length > 0 ? (
              <div className="space-y-3">
                {ddData.uploaded_documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">{doc.filename}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded by {doc.uploaded_by_name} on {new Date(doc.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {doc.file_type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
            )}
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Status</h3>
            
            {/* Workflow Timeline */}
            <div className="relative">
              {[
                { status: 'draft', label: 'Draft', icon: '📝' },
                { status: 'pending_officer_review', label: 'Officer Review', icon: '👤' },
                { status: 'pending_hop_approval', label: 'HoP Approval', icon: '👔' },
                { status: 'approved', label: 'Approved', icon: '✓' },
              ].map((step, idx, arr) => {
                const isCompleted = arr.findIndex(s => s.status === ddData?.status) > idx;
                const isCurrent = step.status === ddData?.status;
                
                return (
                  <div key={step.status} className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Review Details */}
            {ddData?.officer_reviewed_by && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Officer Review</h4>
                <p className="text-sm text-gray-600">
                  Reviewed by {ddData.officer_reviewed_by_name} on {new Date(ddData.officer_reviewed_at).toLocaleString()}
                </p>
                {ddData.officer_comments && (
                  <p className="text-sm text-gray-600 mt-2">Comments: {ddData.officer_comments}</p>
                )}
              </div>
            )}

            {ddData?.hop_approved_by && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">HoP Decision</h4>
                <p className="text-sm text-gray-600">
                  {ddData.status === 'rejected' ? 'Rejected' : 'Approved'} by {ddData.hop_approved_by_name} on {new Date(ddData.hop_approved_at).toLocaleString()}
                </p>
                {ddData.hop_comments && (
                  <p className="text-sm text-gray-600 mt-2">Comments: {ddData.hop_comments}</p>
                )}
              </div>
            )}

            {/* Risk Acceptance */}
            {ddData?.risk_acceptance && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">Risk Acceptance</h4>
                <div className="space-y-2 text-sm text-orange-700">
                  <p><strong>Reason:</strong> {ddData.risk_acceptance.risk_acceptance_reason}</p>
                  <p><strong>Controls:</strong> {ddData.risk_acceptance.mitigating_controls}</p>
                  {ddData.risk_acceptance.scope_limitations && (
                    <p><strong>Limitations:</strong> {ddData.risk_acceptance.scope_limitations}</p>
                  )}
                  <p className="text-xs text-orange-500">
                    Accepted by {ddData.risk_acceptance.acceptance_owner_name} on {new Date(ddData.risk_acceptance.acceptance_date).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
            
            <div className="space-y-3">
              {ddData?.audit_log?.slice().reverse().map((entry, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                    {entry.action === 'document_uploaded' ? '📄' :
                     entry.action === 'ai_run' ? '🤖' :
                     entry.action === 'field_changed' ? '✏️' :
                     entry.action === 'officer_submit' ? '📤' :
                     entry.action === 'hop_approval' ? '✅' :
                     entry.action === 'risk_acceptance' ? '⚠️' : '📌'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">
                      {entry.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      By {entry.performed_by_name} on {new Date(entry.performed_at).toLocaleString()}
                    </p>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {JSON.stringify(entry.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {(!ddData?.audit_log || ddData.audit_log.length === 0) && (
                <p className="text-gray-500 text-center py-8">No audit entries yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Field Edit Modal */}
      {editField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Field: {editField}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Value</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change</label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this change is needed..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditField(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFieldSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDDForm;
