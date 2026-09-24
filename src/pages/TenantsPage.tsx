import React, { useState, useEffect } from 'react';
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
}

export const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<TenantRow[]>([
    { tenantId: 'TNT-001', name: 'Sharma General Store', code: 'SHARMA_SHOP', plan: 'Enterprise SaaS', activeStatus: 'ACTIVE', ownerName: 'Ram Sharma', ownerPhone: '+91 98765 43210', joinedDate: '15 Jan 2026', storesCount: 3 },
    { tenantId: 'TNT-002', name: 'Gupta Kirana & Provisions', code: 'GUPTA_KIRANA', plan: 'Pro Business', activeStatus: 'ACTIVE', ownerName: 'Suresh Gupta', ownerPhone: '+91 98123 45678', joinedDate: '02 Feb 2026', storesCount: 1 },
    { tenantId: 'TNT-003', name: 'Verma Traders & Seeds', code: 'VERMA_TRADERS', plan: 'Basic Starter', activeStatus: 'TRIAL', ownerName: 'Vikas Verma', ownerPhone: '+91 97654 32109', joinedDate: '20 Aug 2026', storesCount: 1 },
    { tenantId: 'TNT-004', name: 'Kisan Agro Store', code: 'KISAN_AGRO', plan: 'Pro Business', activeStatus: 'SUSPENDED', ownerName: 'Rajesh Kumar', ownerPhone: '+91 99887 76655', joinedDate: '10 Mar 2026', storesCount: 2 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/settings/tenants`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data && data.status && data.additionalMessage) {
        const parsed = JSON.parse(data.additionalMessage);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTenants(parsed);
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = tenants.filter((t) => t.activeStatus === 'ACTIVE').length;
  const totalStores = tenants.reduce((sum, t) => sum + (t.storesCount || 1), 0);

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Registered Client Stores', value: tenants.length, change: '100% active SaaS portfolio', icon: <BusinessIcon />, borderAccentColor: '#2563EB' },
    { id: 'active', title: 'Active Paid Subscriptions', value: activeCount, change: `${activeCount} active tenants`, icon: <VerifiedUserIcon />, borderAccentColor: '#10B981' },
    { id: 'stores', title: 'Total Managed Outlets', value: totalStores, subtitle: 'Multi-store expansion', icon: <StoreIcon />, borderAccentColor: '#D97706' },
    { id: 'trial', title: 'Trial & Suspended', value: tenants.length - activeCount, subtitle: 'Requires renewal follow-up', icon: <WarningAmberIcon />, borderAccentColor: '#EF4444' },
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
    { name: 'name', label: 'Client Store / Tenant Name', type: 'text', required: true, placeholder: 'e.g. Laxmi General Store' },
    { name: 'code', label: 'Tenant Code (Short)', type: 'text', required: true, placeholder: 'e.g. LAXMI_STORE' },
    { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
    { name: 'ownerPhone', label: 'Owner Mobile Phone', type: 'text', required: true },
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
      label: 'Status',
      type: 'select',
      options: [
        { label: 'ACTIVE', value: 'ACTIVE' },
        { label: 'TRIAL', value: 'TRIAL' },
        { label: 'SUSPENDED', value: 'SUSPENDED' },
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
        setAlertMsg(data.message || `Updated tenant ${formValues.name} successfully.`);
      } else {
        const res = await fetch(`${getApiBaseUrl()}/settings/tenants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        if (data && data.status) {
          setAlertMsg(data.message || `Added new client store tenant: ${formValues.name}`);
        } else {
          setAlertMsg(`Error: ${data.message || 'Could not register tenant'}`);
        }
      }
      fetchTenants();
      setOpenModal(false);
    } catch (err: any) {
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
          <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        <StatCardGrid items={statsItems} />

        <GenericDataTable<TenantRow>
          columns={columns}
          data={filteredTenants}
          keyExtractor={(row) => row.tenantId}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
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
