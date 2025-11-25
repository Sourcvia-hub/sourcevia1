import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OSRList = () => {
  const [osrs, setOsrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: ''
  });

  useEffect(() => {
    fetchOSRs();
  }, []);

  const fetchOSRs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/osrs`, { withCredentials: true });
      setOsrs(response.data);
    } catch (error) {
      console.error('Error fetching OSRs:', error);
      alert('Error loading service requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredOSRs = osrs.filter(osr => {
    if (filters.search && !osr.title?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !osr.osr_number?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && osr.status !== filters.status) return false;
    if (filters.priority && osr.priority !== filters.priority) return false;
    if (filters.type && osr.request_type !== filters.type) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: osrs.length,
    open: osrs.filter(o => o.status === 'open').length,
    assigned: osrs.filter(o => o.status === 'assigned').length,
    inProgress: osrs.filter(o => o.status === 'in_progress').length,
    completed: osrs.filter(o => o.status === 'completed').length,
    highPriority: osrs.filter(o => o.priority === 'high').length
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Operating Service Requests</h1>
            <p className="text-gray-600 mt-1">Manage facility service requests and maintenance</p>
          </div>
          <Link
            to="/osr/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Service Request
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
            <div className="text-sm text-yellow-700">Open</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.open}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
            <div className="text-sm text-blue-700">Assigned</div>
            <div className="text-2xl font-bold text-blue-900">{stats.assigned}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
            <div className="text-sm text-purple-700">In Progress</div>
            <div className="text-2xl font-bold text-purple-900">{stats.inProgress}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
            <div className="text-sm text-green-700">Completed</div>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
            <div className="text-sm text-red-700">High Priority</div>
            <div className="text-2xl font-bold text-red-900">{stats.highPriority}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title or number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="asset_related">Asset Related</option>
              <option value="general_request">General Request</option>
            </select>
          </div>
        </div>

        {/* OSR Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OSR #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOSRs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No service requests found. <Link to="/osr/new" className="text-blue-600 hover:underline">Create one</Link>
                  </td>
                </tr>
              ) : (
                filteredOSRs.map((osr) => (
                  <tr key={osr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{osr.osr_number}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{osr.title}</div>
                      {osr.asset_name && (
                        <div className="text-xs text-gray-500">Asset: {osr.asset_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {osr.request_type === 'asset_related' ? 'Asset Related' : 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(osr.priority)}`}>
                        {osr.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(osr.status)}`}>
                        {osr.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {osr.building_name && (
                        <div>{osr.building_name} - {osr.floor_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(osr.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/osr/${osr.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default OSRList;
