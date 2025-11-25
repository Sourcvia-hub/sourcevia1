import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [relatedOSRs, setRelatedOSRs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAsset();
    fetchRelatedOSRs();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await axios.get(`${API}/assets/${id}`, { withCredentials: true });
      setAsset(response.data);
    } catch (error) {
      console.error('Error fetching asset:', error);
      alert('Asset not found');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedOSRs = async () => {
    try {
      const response = await axios.get(`${API}/osr`, { withCredentials: true });
      const filtered = response.data.filter(osr => osr.asset_id === id);
      setRelatedOSRs(filtered);
    } catch (error) {
      console.error('Error fetching OSRs:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      try {
        await axios.delete(`${API}/assets/${id}`, { withCredentials: true });
        alert('Asset deleted successfully');
        navigate('/assets');
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error deleting asset');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      under_maintenance: 'bg-yellow-100 text-yellow-800',
      out_of_service: 'bg-red-100 text-red-800',
      replaced: 'bg-gray-100 text-gray-800',
      decommissioned: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition) => {
    const colors = {
      good: 'text-green-600',
      fair: 'text-yellow-600',
      poor: 'text-red-600'
    };
    return colors[condition] || 'text-gray-600';
  };

  const getOSRStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
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

  if (!asset) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}>
                {asset.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600">Asset #{asset.asset_number}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/assets"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Back to List
            </Link>
            <Link
              to={`/assets/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Edit Asset
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-900 font-medium">{asset.category_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="text-gray-900 font-medium">{asset.model || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="text-gray-900 font-medium">{asset.serial_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manufacturer</p>
                <p className="text-gray-900 font-medium">{asset.manufacturer || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className={`font-medium ${getConditionColor(asset.condition)}`}>
                  {asset.condition ? asset.condition.toUpperCase() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Warranty Status</h3>
              {asset.warranty_status ? (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  asset.warranty_status === 'in_warranty' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {asset.warranty_status === 'in_warranty' ? 'In Warranty' : 'Out of Warranty'}
                </span>
              ) : (
                <p className="text-gray-400">Not Set</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Related OSRs</h3>
              <p className="text-3xl font-bold text-blue-600">{relatedOSRs.length}</p>
              <p className="text-sm text-gray-500 mt-1">Service Requests</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Building</p>
              <p className="text-gray-900 font-medium">{asset.building_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Floor</p>
              <p className="text-gray-900 font-medium">{asset.floor_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Room/Area</p>
              <p className="text-gray-900 font-medium">{asset.room_area || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Custodian</p>
              <p className="text-gray-900 font-medium">{asset.custodian || '-'}</p>
            </div>
          </div>
        </div>

        {/* Procurement & Contract */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Procurement & Contract</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              {asset.vendor_id ? (
                <Link to={`/vendors/${asset.vendor_id}`} className="text-blue-600 hover:underline font-medium">
                  {asset.vendor_name || asset.vendor_id}
                </Link>
              ) : (
                <p className="text-gray-900 font-medium">-</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Purchase Date</p>
              <p className="text-gray-900 font-medium">
                {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost</p>
              <p className="text-gray-900 font-medium">
                {asset.cost ? `$${asset.cost.toLocaleString()}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PO Number</p>
              <p className="text-gray-900 font-medium">{asset.po_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">AMC Contract</p>
              {asset.contract_id ? (
                <Link to={`/contracts/${asset.contract_id}`} className="text-blue-600 hover:underline font-medium">
                  {asset.contract_number || asset.contract_id}
                </Link>
              ) : (
                <p className="text-gray-900 font-medium">-</p>
              )}
            </div>
          </div>
        </div>

        {/* Warranty & Lifecycle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Warranty</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-gray-900 font-medium">
                  {asset.warranty_start_date ? new Date(asset.warranty_start_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-gray-900 font-medium">
                  {asset.warranty_end_date ? new Date(asset.warranty_end_date).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Maintenance</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Installation Date</p>
                <p className="text-gray-900 font-medium">
                  {asset.installation_date ? new Date(asset.installation_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Maintenance</p>
                <p className="text-gray-900 font-medium">
                  {asset.last_maintenance_date ? new Date(asset.last_maintenance_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Maintenance Due</p>
                <p className="text-gray-900 font-medium">
                  {asset.next_maintenance_due ? new Date(asset.next_maintenance_due).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {asset.notes && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
          </div>
        )}

        {/* File Attachments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Attachments</h2>
          <FileUpload
            entityId={id}
            module="assets"
            label="Upload asset photos, manuals, warranties, etc."
            accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
            multiple={true}
            onUploadComplete={() => {
              console.log('Files uploaded');
            }}
          />
        </div>

        {/* Related OSRs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Service Requests ({relatedOSRs.length})</h2>
            <Link
              to={`/osr/new?asset_id=${id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              + New Service Request
            </Link>
          </div>
          {relatedOSRs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No service requests for this asset yet</p>
          ) : (
            <div className="space-y-3">
              {relatedOSRs.map((osr) => (
                <div key={osr.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">{osr.osr_number}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOSRStatusColor(osr.status)}`}>
                          {osr.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{osr.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{osr.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Category: {osr.category}</span>
                        <span>Priority: {osr.priority}</span>
                        <span>Created: {new Date(osr.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      to={`/osr/${osr.id}`}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssetDetail;
