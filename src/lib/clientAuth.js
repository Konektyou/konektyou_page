// Client authentication utilities for client-side

export const getClientAuth = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('clientAuth');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed;
  } catch (error) {
    console.error('Error reading client auth:', error);
    localStorage.removeItem('clientAuth');
    return null;
  }
};

export const isClientAuthenticated = () => {
  const auth = getClientAuth();
  return auth !== null && auth.token && auth.client;
};

export const getClientToken = () => {
  const auth = getClientAuth();
  return auth?.token || null;
};

export const getClientData = () => {
  const auth = getClientAuth();
  return auth?.client || null;
};

export const clearClientAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('clientAuth');
  }
};

export const setClientAuth = (token, client) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('clientAuth', JSON.stringify({ token, client }));
  }
};

