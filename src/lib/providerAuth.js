// Provider authentication utilities for client-side

export const getProviderAuth = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('providerAuth');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed;
  } catch (error) {
    console.error('Error reading provider auth:', error);
    localStorage.removeItem('providerAuth');
    return null;
  }
};

export const isProviderAuthenticated = () => {
  const auth = getProviderAuth();
  return auth !== null && auth.token && auth.provider;
};

export const getProviderToken = () => {
  const auth = getProviderAuth();
  return auth?.token || null;
};

export const getProviderData = () => {
  const auth = getProviderAuth();
  return auth?.provider || null;
};

export const clearProviderAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('providerAuth');
  }
};

export const setProviderAuth = (token, provider) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('providerAuth', JSON.stringify({ token, provider }));
  }
};

export const canProviderWork = () => {
  const provider = getProviderData();
  return provider?.profileStatus === 'APPROVED' && provider?.verificationStatus === 'APPROVED' && provider?.isVerified === true;
};

