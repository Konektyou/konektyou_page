// Business authentication utilities for client-side

export const getBusinessAuth = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('businessAuth');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed;
  } catch (error) {
    console.error('Error reading business auth:', error);
    localStorage.removeItem('businessAuth');
    return null;
  }
};

export const isBusinessAuthenticated = () => {
  const auth = getBusinessAuth();
  return auth !== null && auth.token && auth.business;
};

export const getBusinessToken = () => {
  const auth = getBusinessAuth();
  return auth?.token || null;
};

export const getBusinessData = () => {
  const auth = getBusinessAuth();
  return auth?.business || null;
};

export const clearBusinessAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('businessAuth');
  }
};

export const setBusinessAuth = (token, business) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('businessAuth', JSON.stringify({ token, business }));
  }
};

