import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Chip, Tabs, Tab, Alert, Switch, FormControlLabel,
  Paper, TextField
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import StraightenIcon from '@mui/icons-material/Straighten';
import WidgetsIcon from '@mui/icons-material/Widgets';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal, FormFieldDef } from '../components/common/GenericFormModal';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface MasterRow {
  id: string;
  masterType: string;
  masterName: string;
  masterCode: string;
  description: string;
  priority: number;
  isActive: boolean;
  metaData?: string;
}

const MASTER_TYPES = [
  { key: 'ALL', label: 'All Masters', icon: <ListAltIcon fontSize="small" />, color: '#2563EB' },
  { key: 'ItemCategory', label: 'Categories', icon: <CategoryIcon fontSize="small" />, color: '#6366F1' },
  { key: 'UnitOfMeasurement', label: 'UOM / Units', icon: <StraightenIcon fontSize="small" />, color: '#F59E0B' },
  { key: 'ItemType', label: 'Item Types', icon: <WidgetsIcon fontSize="small" />, color: '#06B6D4' },
  { key: 'Brand', label: 'Brands', icon: <VerifiedIcon fontSize="small" />, color: '#3B82F6' },
  { key: 'PaymentMode', label: 'Payment Modes', icon: <PaymentsIcon fontSize="small" />, color: '#10B981' },
  { key: 'Tax', label: 'Tax & GST Rates', icon: <ReceiptIcon fontSize="small" />, color: '#EC4899' },
  { key: 'ExpenseCategory', label: 'Expense Categories', icon: <MoneyOffIcon fontSize="small" />, color: '#8B5CF6' },
];

export const MastersPage: React.FC = () => {
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [masters, setMasters] = useState<MasterRow[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingMaster, setEditingMaster] = useState<MasterRow | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMasters = useCallback(async (tenantIdOverride?: number, pageOverride = page, rowsOverride = rowsPerPage, searchOverride = searchQuery, typeOverride = selectedType, activeOverride = activeOnly) => {
    const tid = tenantIdOverride ?? selectedTenantId;
    setIsLoading(true);
    try {
      const qParams = new URLSearchParams({
        page: String(pageOverride + 1),
        pageSize: String(rowsOverride),
        paged: 'true',
      });
      if (typeOverride !== 'ALL') qParams.append('masterType', typeOverride);
      if (activeOverride) qParams.append('activeOnly', 'true');
      if (tid) qParams.append('tenantId', String(tid));
      if (selectedTenantCode) qParams.append('tenantCode', selectedTenantCode);
      if (searchOverride.trim()) qParams.append('search', searchOverride.trim());
      qParams.append('_t', Date.now().toString());

      const res = await fetch(`${getApiBaseUrl()}/masters?${qParams.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(tid),
          ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data?.items || []);
        setMasters(
          rawList.map((m: any) => ({
            id: (m.id ?? m.ID ?? '').toString(),
            masterType: m.masterType ?? m.MasterType ?? 'General',
            masterName: m.masterName ?? m.MasterName ?? '',
            masterCode: m.masterCode ?? m.MasterCode ?? '',
            description: m.description ?? m.Description ?? '',
            priority: m.priority ?? m.Priority ?? 0,
            isActive: m.isActive ?? m.IsActive ?? true,
            metaData: m.metaData ?? m.MetaData,
          }))
        );
        setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : rawList.length);
      } else {
        setMasters([]);
        setTotalCount(0);
      }
    } catch (_) {
      setMasters([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId, selectedTenantCode, page, rowsPerPage, searchQuery, selectedType, activeOnly]);

  useEffect(() => {
    fetchMasters(selectedTenantId, 0, rowsPerPage, searchQuery, selectedType, activeOnly);
  }, [selectedTenantId, selectedType, activeOnly, searchQuery]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchMasters(e.detail.tenantId, 0, rowsPerPage, searchQuery, selectedType, activeOnly);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchMasters, rowsPerPage, searchQuery, selectedType, activeOnly]);

  const activeCount = masters.filter((m) => m.isActive).length;
  const categoriesCount = masters.filter((m) => m.masterType.toLowerCase() === 'itemcategory').length;
  const uomCount = masters.filter((m) => m.masterType.toLowerCase() === 'unitofmeasurement').length;
  const brandsCount = masters.filter((m) => m.masterType.toLowerCase() === 'brand').length;
  const paymentsCount = masters.filter((m) => m.masterType.toLowerCase() === 'paymentmode').length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Master Records', value: masters.length, change: 'Across all 7 modules', icon: <ListAltIcon />, borderAccentColor: '#2563EB' },
    { id: 'active', title: 'Active Live Masters', value: activeCount, subtitle: 'Synced to POS & App', icon: <CheckCircleIcon />, borderAccentColor: '#10B981' },
    { id: 'categories', title: 'Categories & Units', value: `${categoriesCount} Cat / ${uomCount} UOM`, subtitle: 'Item classification', icon: <CategoryIcon />, borderAccentColor: '#6366F1' },
    { id: 'brands_payments', title: 'Brands & Payments', value: `${brandsCount} Brands / ${paymentsCount} Modes`, subtitle: 'Checkout options', icon: <PaymentsIcon />, borderAccentColor: '#F59E0B' },
  ];

  const getTypeColor = (type: string) => {
    const found = MASTER_TYPES.find((t) => t.key.toLowerCase() === type.toLowerCase());
    return found?.color || '#64748B';
  };

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('category')) return <CategoryIcon sx={{ fontSize: 16 }} />;
    if (t.includes('unit') || t.includes('uom')) return <StraightenIcon sx={{ fontSize: 16 }} />;
    if (t.includes('itemtype')) return <WidgetsIcon sx={{ fontSize: 16 }} />;
    if (t.includes('brand')) return <VerifiedIcon sx={{ fontSize: 16 }} />;
    if (t.includes('payment')) return <PaymentsIcon sx={{ fontSize: 16 }} />;
    if (t.includes('tax')) return <ReceiptIcon sx={{ fontSize: 16 }} />;
    if (t.includes('expense')) return <MoneyOffIcon sx={{ fontSize: 16 }} />;
    return <ListAltIcon sx={{ fontSize: 16 }} />;
  };

  const handleToggleStatus = async (master: MasterRow) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/masters/${master.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(selectedTenantId),
        },
      });
      if (res.ok) {
        setMasters((prev) =>
          prev.map((m) => (m.id === master.id ? { ...m, isActive: !m.isActive } : m))
        );
        setAlertMsg(`Master "${master.masterName}" status toggled.`);
      }
    } catch (_) {}
  };

  const handleDelete = async (master: MasterRow) => {
    if (!window.confirm(`Are you sure you want to delete master "${master.masterName}"?`)) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/masters/${master.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(selectedTenantId),
        },
      });
      if (res.ok) {
        setMasters((prev) => prev.filter((m) => m.id !== master.id));
        setAlertMsg(`Master "${master.masterName}" deleted.`);
      }
    } catch (_) {}
  };

  const handleOpenAdd = () => {
    setEditingMaster(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (master: MasterRow) => {
    setEditingMaster(master);
    setOpenModal(true);
  };

  const handleSaveModal = async (formValues: Record<string, any>) => {
    const payload = {
      tenantId: selectedTenantId,
      tenantCode: selectedTenantCode,
      masterType: formValues.masterType,
      masterName: formValues.masterName,
      masterCode: formValues.masterCode,
      description: formValues.description,
      priority: parseInt(formValues.priority, 10) || 0,
      isActive: formValues.isActive !== undefined ? formValues.isActive : true,
    };

    if (editingMaster) {
      try {
        const res = await fetch(`${getApiBaseUrl()}/masters/${editingMaster.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            'X-Tenant-Id': String(selectedTenantId),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchMasters(selectedTenantId);
          setAlertMsg(`Master "${payload.masterName}" updated successfully.`);
        }
      } catch (_) {}
    } else {
      try {
        const res = await fetch(`${getApiBaseUrl()}/masters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            'X-Tenant-Id': String(selectedTenantId),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchMasters(selectedTenantId);
          setAlertMsg(`New master "${payload.masterName}" registered for ${selectedTenantName}.`);
        }
      } catch (_) {}
    }
    setOpenModal(false);
  };

  const modalFields: FormFieldDef[] = [
    {
      name: 'masterType',
      label: 'Master Category / Type',
      type: 'select',
      required: true,
      defaultValue: selectedType !== 'ALL' ? selectedType : 'ItemCategory',
      options: MASTER_TYPES.filter((t) => t.key !== 'ALL').map((t) => ({ label: t.label, value: t.key })),
    },
    { name: 'masterName', label: 'Master Name', type: 'text', required: true, placeholder: 'e.g. Edible Oil, Kilogram, Amul, UPI' },
    { name: 'masterCode', label: 'Code / Symbol / Identifier', type: 'text', placeholder: 'e.g. kg, pkt, BRD-001, GST-5' },
    { name: 'priority', label: 'Display Order / Priority', type: 'number', defaultValue: 0, placeholder: '0 for default' },
    { name: 'description', label: 'Description / Notes', type: 'text', placeholder: 'Optional notes for store staff' },
    { name: 'isActive', label: 'Active in Mobile & POS Dropdowns', type: 'switch', defaultValue: true },
  ];

  const columns: ColumnDef<MasterRow>[] = [
    {
      key: 'masterName',
      header: 'Master Name & Code',
      render: (r) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: `${getTypeColor(r.masterType)}15`,
              color: getTypeColor(r.masterType),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${getTypeColor(r.masterType)}30`,
            }}
          >
            {getTypeIcon(r.masterType)}
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
              {r.masterName}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              Code: {r.masterCode || '-'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'masterType',
      header: 'Master Type',
      render: (r) => (
        <Chip
          icon={getTypeIcon(r.masterType)}
          label={r.masterType}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.7rem',
            bgcolor: `${getTypeColor(r.masterType)}15`,
            color: getTypeColor(r.masterType),
            border: `1px solid ${getTypeColor(r.masterType)}30`,
          }}
        />
      ),
    },
    {
      key: 'priority',
      header: 'Sort Order',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" fontWeight="600" color="#64748B">
          #{r.priority}
        </Typography>
      ),
    },
    {
      key: 'isActive',
      header: 'Live Status',
      render: (r) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Switch
            checked={r.isActive}
            size="small"
            color="success"
            onChange={() => handleToggleStatus(r)}
          />
          <Chip
            label={r.isActive ? 'ACTIVE' : 'INACTIVE'}
            size="small"
            color={r.isActive ? 'success' : 'default'}
            sx={{ fontWeight: 800, height: 20, fontSize: '0.625rem' }}
          />
        </Box>
      ),
    },
    { key: 'description', header: 'Description / Remarks' },
  ];

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <TenantFilterBar onTenantChange={(tId) => fetchMasters(tId)} sx={{ mb: 2 }} />

        <PageHeader
          title="Master Data & Taxonomy Engine (मास्टर डेटा)"
          subtitle={`Centrally manage Categories, UOM Units, Item Types, Brands, Payment Modes, and Tax Rates for: ${selectedTenantName} (${selectedTenantCode || 'Store #' + selectedTenantId}).`}
          breadcrumbs={['Home', 'Configuration', 'Master Taxonomy']}
          primaryAction={{
            label: '+ Add Master Record',
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

        {/* Master Types Tab Navigation */}
        <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', mb: 3, overflow: 'hidden' }}>
          <Tabs
            value={selectedType}
            onChange={(_, val) => setSelectedType(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 48 },
            }}
          >
            {MASTER_TYPES.map((t) => (
              <Tab
                key={t.key}
                value={t.key}
                icon={t.icon}
                iconPosition="start"
                label={t.label}
              />
            ))}
          </Tabs>

          {/* Search & Active-Only Filters */}
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <TextField
              size="small"
              placeholder="Search master name, code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 320 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2" fontWeight="600">Active Live Only</Typography>}
            />
          </Box>
        </Paper>

        <GenericDataTable<MasterRow>
          columns={columns}
          data={masters}
          keyExtractor={(r) => r.id}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          serverSide={true}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchMasters(selectedTenantId, newPage, rowsPerPage, searchQuery, selectedType, activeOnly);
          }}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
            fetchMasters(selectedTenantId, 0, newRows, searchQuery, selectedType, activeOnly);
          }}
          emptyMessage={`No master records found for ${selectedTenantName} (${selectedType === 'ALL' ? 'All Types' : selectedType}). Click "+ Add Master Record" above to create.`}
        />

        <GenericFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={editingMaster ? `Edit Master - ${editingMaster.masterName}` : '+ Register New Master Record'}
          fields={modalFields}
          initialValues={
            editingMaster
              ? {
                  masterType: editingMaster.masterType,
                  masterName: editingMaster.masterName,
                  masterCode: editingMaster.masterCode,
                  priority: editingMaster.priority,
                  description: editingMaster.description,
                  isActive: editingMaster.isActive,
                }
              : {
                  masterType: selectedType !== 'ALL' ? selectedType : 'ItemCategory',
                  isActive: true,
                  priority: 0,
                }
          }
          onSubmit={handleSaveModal}
          submitLabel={editingMaster ? 'Update Master' : 'Create Master'}
        />
      </Container>
    </Box>
  );
};
export default MastersPage;
