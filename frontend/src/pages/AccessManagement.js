import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../App';

const AccessManagement = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all'); // all, entry, exit

  // Mock data - will be replaced with actual access log data
  const accessLogs = [
    {
      id: 1,
      personName: 'Ahmed Al-Rashid',
      employeeId: 'EMP-001',
      type: 'entry',
      location: 'Main Entrance',
      timestamp: '2025-11-26T08:15:30',
      accessCard: 'AC-12345',
      photo: null
    },
    {
      id: 2,
      personName: 'Sara Mohammed',
      employeeId: 'EMP-023',
      type: 'exit',
      location: 'Main Entrance',
      timestamp: '2025-11-26T17:45:12',
      accessCard: 'AC-23456',
      photo: null
    },
    {
      id: 3,
      personName: 'Visitor - John Smith',
      employeeId: 'VISITOR',
      type: 'entry',
      location: 'Reception',
      timestamp: '2025-11-26T10:30:00',
      accessCard: 'TEMP-789',
      photo: null
    },
    {
      id: 4,
      personName: 'Khaled Hassan',
      employeeId: 'EMP-045',
      type: 'entry',
      location: 'Parking Gate',
      timestamp: '2025-11-26T08:45:22',
      accessCard: 'AC-34567',
      photo: null
    },
    {
      id: 5,
      personName: 'Fatima Ali',
      employeeId: 'EMP-067',
      type: 'exit',
      location: 'Emergency Exit 1',
      timestamp: '2025-11-26T18:12:45',
      accessCard: 'AC-45678',
      photo: null
    },
  ];

  const getTypeBadge = (type) => {
    return type === 'entry'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const getTypeIcon = (type) => {
    return type === 'entry' ? '🚪➡️' : '🚪⬅️';
  };

  const filteredLogs = filterType === 'all'
    ? accessLogs
    : accessLogs.filter(log => log.type === filterType);

  const todayStats = {
    totalEntries: accessLogs.filter(log => log.type === 'entry').length,
    totalExits: accessLogs.filter(log => log.type === 'exit').length,
    currentOccupancy: accessLogs.filter(log => log.type === 'entry').length - accessLogs.filter(log => log.type === 'exit').length,
    visitors: accessLogs.filter(log => log.employeeId === 'VISITOR').length
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Access Management</h1>
              <p className="text-gray-600 mt-1">Track entry and exit logs for all locations</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Viewing as: <span className="font-semibold text-purple-600">{user?.name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{todayStats.totalEntries}</p>
              </div>
              <div className="text-4xl">🚪➡️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exits</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{todayStats.totalExits}</p>
              </div>
              <div className="text-4xl">🚪⬅️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Occupancy</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{todayStats.currentOccupancy}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visitors Today</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{todayStats.visitors}</p>
              </div>
              <div className="text-4xl">🎫</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Activities</option>
                <option value="entry">Entries Only</option>
                <option value="exit">Exits Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                📊 Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Access Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Access Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${getTypeBadge(log.type)}`}>
                        <span>{getTypeIcon(log.type)}</span>
                        {log.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.personName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      📍 {log.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {log.accessCard}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No access logs found for the selected filters</p>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Access Management System - Configuration Pending</h3>
              <p className="text-sm text-yellow-800 mb-2">
                This page will display real-time access control data. To configure the system:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Integrate with your access control system API</li>
                <li>Configure door access points and readers</li>
                <li>Set up employee and visitor badge management</li>
                <li>Enable automatic notifications for unauthorized access</li>
                <li>Configure audit trail and compliance reports</li>
              </ul>
              <p className="text-xs text-yellow-700 mt-3 font-medium">
                🔒 Access restricted to Procurement Managers and Administrators only
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessManagement;
