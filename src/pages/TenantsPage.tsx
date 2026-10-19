import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal, FormFieldDef } from '../components/common/GenericFormModal';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface TenantRow {
  tenantId: string;
  id?: number;
  name: string;
  code: string;
  plan: string;
  activeStatus: string;
  ownerName: string;
  ownerPhone: string;
  joinedDate: string;
  storesCount: number;
  adminUsername?: string;
  primaryColor?: string;
}

export const TenantsPage: React.FC = () => {
  const { switchTenant } = useAuth();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info'>('success');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);

  const fetchTenants = useCallback(async (pageOverride = page, rowsOverride = rowsPerPage, searchOverride = searchQuery) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageOverride + 1),
        pageSize: String(rowsOverride),
        paged: 'true',
      });
      if (searchOverride.trim()) params.append('search', searchOverride.trim());

      const res = await fetch(`${getApiBaseUrl()}/settings/tenants?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      let rawList: any[] = [];
      let total = 0;

      if (data && Array.isArray(data.items)) {
        rawList = data.items;
        total = data.totalCount || rawList.length;
      } else if (data && data.status && data.additionalMessage) {
        try {
          const parsed = JSON.parse(data.additionalMessage);
          if (Array.isArray(parsed)) {
            rawList = parsed;
            total = parsed.length;
          }
        } catch (_) {}
      }

      const mapped: TenantRow[] = rawList.map((t: any, idx: number) => ({
        id: t.id || t.Id || idx + 1,
        tenantId: t.tenantId || t.TenantId || `TNT-${t.id || t.Id || idx + 1}`,
        name: t.name || t.Name || t.tenantName || 'Store Client',
        code: t.code || t.Code || t.tenantCode || `TNT_${t.id || idx + 1}`,
        plan: t.plan || t.Plan || 'Enterprise SaaS',
        activeStatus: t.activeStatus || t.ActiveStatus || 'ACTIVE',
        ownerName: t.ownerName || t.OwnerName || 'Store Owner',
        ownerPhone: t.ownerPhone || t.OwnerPhone || '+91 98765 43210',
        joinedDate: t.joinedDate || t.JoinedDate || 'Recently',
        storesCount: t.storesCount || t.StoresCount || 1,
        adminUsername: t.adminUsername || t.AdminUsername || 'admin',
        primaryColor: t.primaryColor || t.PrimaryColor || '#DC2626',
      }));

      setTenants(mapped);
      setTotalCount(total);
    } catch (_) {
      setTenants([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchTenants(0, rowsPerPage, searchQuery);
  }, [searchQuery]);

  const activeCount = tenants.filter((t) => t.activeStatus === 'ACTIVE').length;
  const totalStores = tenants.reduce((sum, t) => sum + (t.storesCount || 1), 0);

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Registered Client Stores', value: totalCount, change: '100% active SaaS portfolio', icon: <BusinessIcon />, borderAccentColor: '#2563EB' },
    { id: 'active', title: 'Active Paid Subscriptions', value: activeCount, change: `${activeCount} active tenants`, icon: <VerifiedUserIcon />, borderAccentColor: '#10B981' },
    { id: 'stores', title: 'Total Managed Outlets', value: totalStores, subtitle: 'Multi-store expansion', icon: <StoreIcon />, borderAccentColor: '#D97706' },
    { id: 'trial', title: 'Trial & Suspended', value: Math.max(0, totalCount - activeCount), subtitle: 'Requires renewal follow-up', icon: <WarningAmberIcon />, borderAccentColor: '#EF4444' },
  ];

  const columns: ColumnDef<TenantRow>[] = [
    {
      key: 'name',
      header: 'Tenant Name & Code',
      render: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
            {row.code} ({row.tenantId})
          </Typography>
        </Box>
      ),
    },
    {
      key: 'ownerName',
      header: 'Store Owner Contact',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight="600">
            {row.ownerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.ownerPhone}
          </Typography>
        </Box>
      ),
    },
    { key: 'plan', header: 'Subscription Plan' },
    { key: 'storesCount', header: 'Outlets', align: 'center' },
    { key: 'activeStatus', header: 'Subscription Status' },
    { key: 'joinedDate', header: 'Registered On' },
  ];

  const modalFields: FormFieldDef[] = [
    { name: 'name', label: 'Client Store / Tenant Name', type: 'text', required: true, placeholder: 'e.g. Arun Digital Cafe' },
    { name: 'code', label: 'Tenant Code (Short)', type: 'text', required: true, placeholder: 'e.g. ARUNDC' },
    { name: 'ownerName', label: 'Owner Name', type: 'text', required: true, placeholder: 'e.g. Arun Rana' },
    { name: 'ownerPhone', label: 'Owner Mobile Phone', type: 'text', required: true, placeholder: 'e.g. 9876543210' },
    { name: 'adminUsername', label: 'Admin User ID / Username (Case-Insensitive Unique)', type: 'text', required: true, placeholder: 'e.g. arundc_admin' },
    { name: 'adminPassword', label: 'Admin Password', type: 'text', required: false, placeholder: 'Default: 12345 (Leave blank to keep current)' },
    { name: 'primaryColor', label: 'Primary Theme Color', type: 'text', required: false, placeholder: 'e.g. #DC2626 or red' },
    {
      name: 'plan',
      label: 'Subscription Plan',
      type: 'select',
      options: [
        { label: 'Enterprise SaaS (Unlimited)', value: 'Enterprise SaaS' },
        { label: 'Pro Business (Multi-Store)', value: 'Pro Business' },
        { label: 'Basic Starter (Single Store)', value: 'Basic Starter' },
      ],
      defaultValue: 'Enterprise SaaS',
    },
    {
      name: 'activeStatus',
      label: 'Lock / Unlock Account Status',
      type: 'select',
      options: [
        { label: 'ACTIVE (Unlocked / Normal Access)', value: 'ACTIVE' },
        { label: 'SUSPENDED (Locked / Login Blocked)', value: 'SUSPENDED' },
        { label: 'INACTIVE (Disabled)', value: 'INACTIVE' },
      ],
      defaultValue: 'ACTIVE',
    },
  ];

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (tenant: TenantRow) => {
    setEditingTenant(tenant);
    setOpenModal(true);
  };

  const handleDelete = async (tenant: TenantRow) => {
    try {
      const numericId = tenant.id || parseInt(tenant.tenantId.replace(/\D/g, ''), 10) || 1;
      await fetch(`${getApiBaseUrl()}/settings/tenants/${numericId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setAlertMsg(`Tenant ${tenant.name} removed successfully.`);
      fetchTenants();
    } catch (err: any) {
      setAlertMsg(`Error deleting tenant: ${err.message}`);
    }
  };

  const handleSaveModal = async (formValues: Record<string, any>) => {
    try {
      if (editingTenant) {
        const numericId = editingTenant.id || parseInt(editingTenant.tenantId.replace(/\D/g, ''), 10) || 1;
        const res = await fetch(`${getApiBaseUrl()}/settings/tenants/${numericId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        let msg = data.message || `Updated tenant ${formValues.name} successfully.`;
        if (msg.startsWith('{')) {
          try { msg = JSON.parse(msg).message || msg; } catch (_) {}
        }
        if (data && data.status === false) {
          setAlertSeverity('error');
          setAlertMsg(msg);
          return;
        }
        setAlertSeverity('success');
        setAlertMsg(msg);
      } else {
        const res = await fetch(`${getApiBaseUrl()}/settings/tenants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        let msg = data.message || `Added new client store tenant: ${formValues.name}`;
        if (msg.startsWith('{')) {
          try { msg = JSON.parse(msg).message || msg; } catch (_) {}
        }
        if (data && data.status === false) {
          setAlertSeverity('error');
          setAlertMsg(msg);
          return;
        }
        setAlertSeverity('success');
        setAlertMsg(msg);
      }
      fetchTenants();
      setOpenModal(false);
    } catch (err: any) {
      setAlertSeverity('error');
      setAlertMsg(`Error saving tenant: ${err.message}`);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Multi-Tenant Client Store Management"
          subtitle="SaaS Service Provider Portal for managing client stores, subscription plans, and account statuses"
          breadcrumbs={['Home', 'SaaS Provider', 'Tenants Directory']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search store name, code, or owner..."
          primaryAction={{
            label: 'Register New Client Store',
            onClick: handleOpenAdd,
            icon: <AddIcon />,
          }}
        />

        {alertMsg && (
          <Alert severity={alertSeverity} sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        <StatCardGrid items={statsItems} />

        <GenericDataTable<TenantRow>
          columns={columns}
          data={tenants}
          keyExtractor={(row) => row.tenantId}
          onView={(row) => {
            const numId = row.id || parseInt(row.tenantId.replace(/\D/g, ''), 10) || 1;
            switchTenant(numId, row.code, row.name);
            setAlertSeverity('success');
            setAlertMsg(`Active store context switched to "${row.name}" (${row.code}). All pages now display this store's data.`);
          }}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          serverSide={true}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchTenants(newPage, rowsPerPage, searchQuery);
          }}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
            fetchTenants(0, newRows, searchQuery);
          }}
          emptyMessage="No client store tenants found matching your query."
        />

        <GenericFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={editingTenant ? `Edit Client Store - ${editingTenant.name}` : 'Register New Client Store Tenant'}
          fields={modalFields}
          initialValues={editingTenant || {}}
          onSubmit={handleSaveModal}
          submitLabel={editingTenant ? 'Update Tenant' : 'Register Store'}
        />
      </Container>
    </Box>
  );
};
