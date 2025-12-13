import React from 'react';

const WorkflowStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-500',
      textColor: 'text-white'
    },
    pending_review: {
      label: 'Pending Review',
      color: 'bg-yellow-500',
      textColor: 'text-white'
    },
    reviewed: {
      label: 'Under Review',
      color: 'bg-blue-500',
      textColor: 'text-white'
    },
    approved_by_approver: {
      label: 'Approved',
      color: 'bg-green-500',
      textColor: 'text-white'
    },
    final_approved: {
      label: 'Final Approved',
      color: 'bg-green-600',
      textColor: 'text-white'
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-500',
      textColor: 'text-white'
    },
    returned_for_clarification: {
      label: 'Needs Clarification',
      color: 'bg-orange-500',
      textColor: 'text-white'
    },
    // Legacy statuses
    approved: {
      label: 'Approved',
      color: 'bg-green-600',
      textColor: 'text-white'
    },
    published: {
      label: 'Published',
      color: 'bg-green-600',
      textColor: 'text-white'
    },
    active: {
      label: 'Active',
      color: 'bg-green-600',
      textColor: 'text-white'
    },
    closed: {
      label: 'Closed',
      color: 'bg-gray-600',
      textColor: 'text-white'
    },
    expired: {
      label: 'Expired',
      color: 'bg-gray-600',
      textColor: 'text-white'
    },
    awarded: {
      label: 'Awarded',
      color: 'bg-purple-600',
      textColor: 'text-white'
    }
  };

  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'bg-gray-400',
    textColor: 'text-white'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.textColor}`}>
      {config.label}
    </span>
  );
};

export default WorkflowStatusBadge;
