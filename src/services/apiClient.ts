import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('tenantId') || '';
  const tenantCode = localStorage.getItem('tenant_code') || localStorage.getItem('tenantCode') || '';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }
  if (tenantCode) {
    config.headers['X-Tenant-Code'] = tenantCode;
  }
  return config;
});

export default apiClient;
