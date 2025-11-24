import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FileUpload = ({ 
  entityId, 
  module, 
  fileType = "supporting_documents",
  label = "Attach Files",
  accept = "*",
  multiple = true,
  onUploadComplete 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const url = `${API}/upload/${module}/${entityId}${fileType ? `?file_type=${fileType}` : ''}`;
      
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setUploadedFiles([...uploadedFiles, ...response.data.files]);
      
      if (onUploadComplete) {
        onUploadComplete(response.data.files);
      }

      // Clear input
      event.target.value = '';
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(
        `${API}/download/${module}/${entityId}/${filename}`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename.split('_').slice(1).join('_')); // Remove timestamp
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📎 {label}
        </label>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <span>{uploading ? '⏳' : '📁'}</span>
            <span>{uploading ? 'Uploading...' : 'Choose Files'}</span>
            <input
              type="file"
              multiple={multiple}
              accept={accept}
              onChange={handleFileUpload}
              disabled={uploading || !entityId}
              className="hidden"
            />
          </label>
          
          {!entityId && (
            <span className="text-sm text-gray-500">
              Save first to enable file upload
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Uploaded Files:</p>
          {uploadedFiles.map((file, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-gray-700 truncate">
                  {file.filename}
                </span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => handleDownload(file.stored_filename)}
                className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
