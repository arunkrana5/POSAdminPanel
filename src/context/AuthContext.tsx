import React, { createContext, useContext, useState, useEffect } from 'react';
import { TokenResponse } from '../types/api';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface TenantClient {
  id: number;
  tenantId: string;
  name: string;
  code: string;
  plan?: string;
  activeStatus?: string;
  ownerName?: string;
  ownerPhone?: string;
  joinedDate?: string;
  storesCount?: number;
  primaryColor?: string;
}

interface AuthContextType {
  user: TokenResponse | null;
  selectedTenantId: number;
  selectedTenantCode: string;
  selectedTenantName: string;
  availableTenants: TenantClient[];
  login: (data: TokenResponse) => void;
  logout: () => void;
  switchTenant: (idOrCode: number | string, codeOrName?: string, name?: string) => void;
  refreshTenants: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TokenResponse | null>(null);
  const [availableTenants, setAvailableTenants] = useState<TenantClient[]>([]);

  const initialTid = parseInt(localStorage.getItem('tenant_id') || localStorage.getItem('tenantId') || '6', 10) || 6;
  const initialCode = localStorage.getItem('tenant_code') || localStorage.getItem('tenantCode') || 'LAXMI';
  const initialName = localStorage.getItem('tenant_name') || 'Laxmi Store';

  const [selectedTenantId, setSelectedTenantId] = useState<number>(initialTid);
  const [selectedTenantCode, setSelectedTenantCode] = useState<string>(initialCode);
  const [selectedTenantName, setSelectedTenantName] = useState<string>(initialName);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_details');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        if (u.tenantId && !localStorage.getItem('tenant_id')) {
          setSelectedTenantId(u.tenantId);
          setSelectedTenantCode(u.tenantCode || 'LAXMI');
          setSelectedTenantName(u.tenantName || 'Laxmi Store');
        }
      } catch (e) {
        console.error(e);
      }
    }
    refreshTenants();
  }, []);

  const refreshTenants = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/settings/tenants?_t=${Date.now()}`, { headers: getAuthHeaders() });
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.status && data.additionalMessage) {
          const parsed = JSON.parse(data.additionalMessage);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped: TenantClient[] = parsed.map((t: any, idx: number) => {
              const numId = t.id || t.Id || parseInt(t.tenantId?.replace(/\D/g, '') || t.TenantId?.replace(/\D/g, ''), 10) || (idx + 1);
              return {
                id: numId,
                tenantId: t.tenantId || t.TenantId || `TNT-${numId}`,
                name: t.name || t.Name || t.tenantName || 'Store Client',
                code: t.code || t.Code || t.tenantCode || `TNT_${numId}`,
                plan: t.plan || t.Plan || 'Enterprise SaaS',
                activeStatus: t.activeStatus || t.ActiveStatus || 'ACTIVE',
                ownerName: t.ownerName || t.OwnerName || 'Store Owner',
                ownerPhone: t.ownerPhone || t.OwnerPhone || '+91 98765 43210',
                joinedDate: t.joinedDate || t.JoinedDate || 'Recently',
                storesCount: t.storesCount || t.StoresCount || 1,
                primaryColor: t.primaryColor || '#2563EB',
              };
            });
            setAvailableTenants(mapped);
          }
        }
      }
    } catch (_) {}
  };

  const login = (data: TokenResponse) => {
    setUser(data);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user_details', JSON.stringify(data));

    const tid = data.tenantId || 6;
    const tcode = data.tenantCode || 'LAXMI';
    const tname = data.tenantName || 'Laxmi Store';
    setSelectedTenantId(tid);
    setSelectedTenantCode(tcode);
    setSelectedTenantName(tname);
    localStorage.setItem('tenant_id', tid.toString());
    localStorage.setItem('tenantId', tid.toString());
    localStorage.setItem('tenant_code', tcode);
    localStorage.setItem('tenantCode', tcode);
    localStorage.setItem('tenant_name', tname);
  };

  const switchTenant = (idOrCode: number | string, codeOrName?: string, name?: string) => {
    let newId = 6;
    let newCode = 'LAXMI';
    let newName = 'Laxmi Store';

    if (typeof idOrCode === 'number') {
      newId = idOrCode;
      newCode = codeOrName || '';
      newName = name || codeOrName || '';
    } else {
      newCode = idOrCode;
      newName = codeOrName || idOrCode;
      const match = availableTenants.find((t) => t.code.toLowerCase() === newCode.toLowerCase());
      if (match) {
        newId = match.id;
        newName = match.name;
      }
    }

    setSelectedTenantId(newId);
    setSelectedTenantCode(newCode);
    setSelectedTenantName(newName);

    localStorage.setItem('tenant_id', newId.toString());
    localStorage.setItem('tenantId', newId.toString());
    localStorage.setItem('tenant_code', newCode);
    localStorage.setItem('tenantCode', newCode);
    localStorage.setItem('tenant_name', newName);

    if (user) {
      const updatedUser = { ...user, tenantId: newId, tenantCode: newCode, tenantName: newName };
      setUser(updatedUser);
      localStorage.setItem('user_details', JSON.stringify(updatedUser));
    }

    try {
      window.dispatchEvent(new CustomEvent('tenant-changed', {
        detail: { tenantId: newId, tenantCode: newCode, tenantName: newName }
      }));
    } catch (_) {}
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{
      user,
      selectedTenantId,
      selectedTenantCode,
      selectedTenantName,
      availableTenants,
      login,
      logout,
      switchTenant,
      refreshTenants,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
