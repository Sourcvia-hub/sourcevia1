import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/App';
import { fetchResourceById, changeResourceStatus } from './api';
import { getProcureFlixRole, canManageOperationalStatus } from './roles';

const statusOptions = ['active', 'inactive'];

const PfResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = getProcureFlixRole(user?.email);
  const canManageStatus = canManageOperationalStatus(role);

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResourceById(id);
        setResource(data);
        setSelectedStatus(data.status || 'active');
      } catch (err) {
        console.error('Failed to load resource', err);
        setError('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChangeStatus = async () => {
    if (!resource || !selectedStatus) return;
    setStatusUpdating(true);
    try {
      const updated = await changeResourceStatus(resource.id, selectedStatus);
      setResource(updated);
    } catch (err) {
      console.error('Failed to change status', err);
      setError('Failed to change status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading resource...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!resource) {
    return <p className="text-sm text-slate-500">Resource not found.</p>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/pf/resources')}
        className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
      >
        ← Back to resources
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{resource.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{resource.role}</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Status: {resource.status}</div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 text-sm space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Linkage</h3>
          <p>
            <span className="text-slate-500">Vendor ID:</span> {resource.vendor_id}
          </p>
          <p>
            <span className="text-slate-500">Contract ID:</span> {resource.contract_id || '—'}
          </p>
          <p>
            <span className="text-slate-500">Project:</span> {resource.assigned_to_project || '—'}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4 text-sm space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Lifecycle</h3>

          <div className="mt-3 flex items-center gap-2 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={!canManageStatus}
              className="rounded border px-2 py-1 text-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={handleChangeStatus}
              disabled={statusUpdating || !canManageStatus}
              className="inline-flex items-center rounded-md bg-white border px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {statusUpdating ? 'Updating...' : 'Change status'}
            </button>
            {!canManageStatus && (
              <span className="text-xs text-amber-600">⚠ No permission</span>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Sheets Section - Only for Active Resources */}
      {resource.status === 'active' && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">📊 Attendance Sheets</h3>
          <AttendanceSheetsSection resourceId={resource.id} />
        </div>
      )}
    </div>
  );
};

// Attendance Sheets Component
const AttendanceSheetsSection = ({ resourceId }) => {
  const [sheets, setSheets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheets();
  }, [resourceId]);

  const fetchSheets = async () => {
    try {
      const response = await fetch(
        `${window.location.origin}/api/procureflix/resources/${resourceId}/attendance-sheets`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setSheets(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|xls)$/i)) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${window.location.origin}/api/procureflix/resources/${resourceId}/attendance-sheets`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include'
        }
      );

      if (response.ok) {
        alert('Attendance sheet uploaded successfully!');
        fetchSheets(); // Refresh list
        event.target.value = ''; // Clear input
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm('Are you sure you want to delete this attendance sheet?')) return;

    try {
      const response = await fetch(
        `${window.location.origin}/api/procureflix/resources/${resourceId}/attendance-sheets/${filename}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        alert('Attendance sheet deleted successfully');
        fetchSheets();
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Attendance Sheet'}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <span className="text-xs text-slate-500">Excel files only (.xlsx, .xls)</span>
      </div>

      {/* Sheets List */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading attendance sheets...</p>
      ) : sheets.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No attendance sheets uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {sheets.map((sheet, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{sheet.filename}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(sheet.file_size)} • Uploaded {formatDate(sheet.upload_date)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(sheet.stored_filename)}
                className="flex-shrink-0 text-red-600 hover:text-red-800 p-2"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PfResourceDetail;
