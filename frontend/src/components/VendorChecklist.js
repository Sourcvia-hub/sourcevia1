import React from 'react';

const VendorChecklist = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
      <h3 className="text-lg font-bold text-green-900 mb-4">Verification Checklist</h3>
      <p className="text-sm text-gray-700 mb-4">Please confirm the following items have been completed:</p>
      
      <div className="space-y-3">
        <label className="flex items-start p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50">
          <input
            type="checkbox"
            checked={formData.dd_checklist_supporting_documents || false}
            onChange={(e) => handleChange('dd_checklist_supporting_documents', e.target.checked)}
            className="mt-1 mr-3 w-5 h-5"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Supporting Documents Provided</span>
            <p className="text-xs text-gray-600 mt-1">All required supporting documents have been collected and verified</p>
          </div>
        </label>

        <label className="flex items-start p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50">
          <input
            type="checkbox"
            checked={formData.dd_checklist_related_party_checked || false}
            onChange={(e) => handleChange('dd_checklist_related_party_checked', e.target.checked)}
            className="mt-1 mr-3 w-5 h-5"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Related Party Checked</span>
            <p className="text-xs text-gray-600 mt-1">Verification completed for any related party relationships</p>
          </div>
        </label>

        <label className="flex items-start p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50">
          <input
            type="checkbox"
            checked={formData.dd_checklist_sanction_screening || false}
            onChange={(e) => handleChange('dd_checklist_sanction_screening', e.target.checked)}
            className="mt-1 mr-3 w-5 h-5"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Sanction Screening Completed</span>
            <p className="text-xs text-gray-600 mt-1">Vendor has been screened against sanction lists</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default VendorChecklist;
