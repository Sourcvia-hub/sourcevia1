// Simple ProcureFlix role mapping and permission helpers

export const getProcureFlixRole = (email) => {
  if (!email) return 'viewer';
  const lower = email.toLowerCase();

  if (lower === 'admin@sourcevia.com') return 'admin';
  if (lower === 'procurement@test.com' || lower === 'po@sourcevia.com') return 'procurement';
  if (lower === 'manager@test.com') return 'pm';
  if (lower === 'user@sourcevia.com') return 'operations';

  return 'viewer';
};

export const canSeeFinancialModules = (role) => ['admin', 'procurement'].includes(role);

export const canManageFinancialStatus = canSeeFinancialModules;

export const canSeeOperationalModules = (role) => ['admin', 'procurement', 'pm', 'operations'].includes(role);

export const canManageOperationalStatus = (role) => ['admin', 'procurement', 'operations'].includes(role);
