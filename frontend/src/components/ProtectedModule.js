import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { canAccessModule } from '../utils/permissions';
import Layout from './Layout';

/**
 * ProtectedModule - Wraps a component and checks if user has permission to access the module
 * If no access, shows an Access Denied message
 */
const ProtectedModule = ({ children, module }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has access to this module
  if (!canAccessModule(user.role, module)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this module.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your role: <span className="font-semibold capitalize">{user.role?.replace('_', ' ')}</span>
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return children;
};

export default ProtectedModule;
