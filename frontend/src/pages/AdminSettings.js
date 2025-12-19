import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [highRiskCountries, setHighRiskCountries] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [activeTab, setActiveTab] = useState('risk-countries');

  const isAdmin = user?.role === 'procurement_manager' || user?.role === 'system_admin';

  useEffect(() => {
    if (isAdmin) {
      fetchHighRiskCountries();
    }
  }, [isAdmin]);

  const fetchHighRiskCountries = async () => {
    try {
      const response = await axios.get(`${API}/vendor-dd/admin/high-risk-countries`, { withCredentials: true });
      setHighRiskCountries(response.data.countries || []);
    } catch (error) {
      console.error('Error fetching high-risk countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCountry = () => {
    if (newCountry.trim() && !highRiskCountries.includes(newCountry.trim())) {
      setHighRiskCountries([...highRiskCountries, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (country) => {
    setHighRiskCountries(highRiskCountries.filter(c => c !== country));
  };

  const handleSaveCountries = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/vendor-dd/admin/high-risk-countries`, {
        countries: highRiskCountries
      }, { withCredentials: true });
      alert('High-risk countries updated successfully!');
    } catch (error) {
      console.error('Error saving countries:', error);
      alert('Failed to save: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access admin settings.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('risk-countries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'risk-countries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              High-Risk Countries
            </button>
            <button
              onClick={() => setActiveTab('ai-settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai-settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Settings
            </button>
          </nav>
        </div>

        {/* High-Risk Countries Tab */}
        {activeTab === 'risk-countries' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">High-Risk Countries</h2>
              <p className="text-gray-600 text-sm">
                Vendors headquartered in these countries will automatically be assigned a minimum "High" risk level.
                This list is used by the AI risk assessment system.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Add Country Form */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCountry()}
                    placeholder="Enter country name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddCountry}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Add Country
                  </button>
                </div>

                {/* Country List */}
                <div className="border rounded-lg divide-y">
                  {highRiskCountries.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No high-risk countries configured
                    </div>
                  ) : (
                    highRiskCountries.sort().map((country, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <span className="font-medium text-gray-900">{country}</span>
                        <button
                          onClick={() => handleRemoveCountry(country)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveCountries}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* AI Settings Tab */}
        {activeTab === 'ai-settings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">AI Configuration</h2>
              <p className="text-gray-600 text-sm">
                Configure AI-powered features for vendor due diligence.
              </p>
            </div>

            <div className="space-y-6">
              {/* Risk Thresholds (Read-only info) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Risk Score Thresholds</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">0-39</div>
                    <div className="text-sm text-green-600">Low Risk</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-700">40-69</div>
                    <div className="text-sm text-yellow-600">Medium Risk</div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-700">70-100</div>
                    <div className="text-sm text-red-600">High Risk</div>
                  </div>
                </div>
              </div>

              {/* Override Rules (Read-only info) */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Automatic Override Rules</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">⚠</span>
                    <span>High-risk country headquarters → Minimum risk level = <strong>High</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">⚠</span>
                    <span>Sanctions exposure detected → Flagged as critical risk driver</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">⚠</span>
                    <span>Weak ownership transparency → Minimum risk level = <strong>Medium</strong></span>
                  </li>
                </ul>
              </div>

              {/* OpenAI API Key Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">AI Provider Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">OpenAI GPT-4o - Connected</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  AI features use OpenAI's GPT-4o model for document extraction and risk assessment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminSettings;
