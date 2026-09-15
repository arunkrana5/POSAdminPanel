export const getApiBaseUrl = (): string => {
  const saved = localStorage.getItem('custom_api_url');
  if (saved) return saved.replace(/\/$/, '');
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  if (window.location.origin.includes('onrender.com')) {
    return '/api';
  }
  return 'https://villageshop-api.onrender.com/api';
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

