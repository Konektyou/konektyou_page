// Admin authentication utilities for client-side

export const getAdminAuth = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed;
  } catch (error) {
    console.error('Error reading admin auth:', error);
    localStorage.removeItem('adminAuth');
    return null;
  }
};

export const isAdminAuthenticated = () => {
  const auth = getAdminAuth();
  return auth !== null && auth.token && auth.admin;
};

export const getAdminToken = () => {
  const auth = getAdminAuth();
  return auth?.token || null;
};

export const getAdminData = () => {
  const auth = getAdminAuth();
  return auth?.admin || null;
};

export const clearAdminAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminAuth');
  }
};

export const hasAdminRole = (requiredRole) => {
  const admin = getAdminData();
  if (!admin) return false;
  
  // Role hierarchy: super_admin > admin > moderator
  const roleHierarchy = {
    'super_admin': 3,
    'admin': 2,
    'moderator': 1
  };
  
  const adminLevel = roleHierarchy[admin.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return adminLevel >= requiredLevel;
};

