import React, { useState, useEffect, useCallback } from 'react';
import { Box, Chip, Typography, Alert, Container } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScaleIcon from '@mui/icons-material/Scale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AddIcon from '@mui/icons-material/Add';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal, FormFieldDef } from '../components/common/GenericFormModal';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface ItemRow {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  uom: string;
  format: 'Packed' | 'Loose';
  description?: string;
}

export const ItemsPage: React.FC = () => {
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  const fetchItems = useCallback(async (tenantIdOverride?: number, pageOverride = page, rowsOverride = rowsPerPage, searchOverride = searchQuery) => {
    const tid = tenantIdOverride ?? selectedTenantId;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageOverride + 1),
        pageSize: String(rowsOverride),
        paged: 'true',
      });
      if (tid) params.append('tenantId', String(tid));
      if (selectedTenantCode) params.append('tenantCode', selectedTenantCode);
      if (searchOverride.trim()) params.append('search', searchOverride.trim());

      const res = await fetch(`${getApiBaseUrl()}/Items?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(tid),
          ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data?.items || []);
        const mapped: ItemRow[] = rawList.map((d: any) => ({
          id: (d.id || d.ID || '').toString(),
          itemCode: d.itemCode || d.ItemCode || '',
          name: d.name || d.Name || '',
          category: d.category || d.Category || 'General',
          uom: d.unit || d.Unit || 'pcs',
          format: (d.format || d.Format || 'Packed') === 'Loose' ? 'Loose' : 'Packed',
          description: d.description || d.Description || '',
        }));
        setItems(mapped);
        setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : mapped.length);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (_) {
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId, selectedTenantCode, page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchItems(selectedTenantId, 0, rowsPerPage, searchQuery);
  }, [selectedTenantId, searchQuery]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchItems(e.detail.tenantId, 0, rowsPerPage, searchQuery);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchItems, rowsPerPage, searchQuery]);

  const filteredItems = items;


  const looseCount = items.filter((i) => i.format === 'Loose').length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Item Definitions', value: items.length, change: '100% cataloged', icon: <AssignmentIcon />, borderAccentColor: '#2563EB' },
    { id: 'packed', title: 'Packed Items (Discrete)', value: items.length - looseCount, subtitle: 'Fixed unit packaging', icon: <Inventory2Icon />, borderAccentColor: '#10B981' },
    { id: 'loose', title: 'Loose / Bulk Items', value: looseCount, subtitle: 'Weight/Volume adjustable', icon: <ScaleIcon />, borderAccentColor: '#D97706' },
  ];

  const columns: ColumnDef<ItemRow>[] = [
    {
      key: 'itemCode',
      header: 'Item Code & Name',
      render: (r) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: r.format === 'Loose' ? '#FFFBEB' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${r.format === 'Loose' ? '#FDE68A' : '#BFDBFE'}` }}>
            {r.format === 'Loose' ? <ScaleIcon sx={{ color: '#D97706' }} fontSize="small" /> : <Inventory2Icon color="primary" fontSize="small" />}
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
              {r.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              Code: {r.itemCode}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'uom', header: 'UOM (Unit)' },
    {
      key: 'format',
      header: 'Item Format',
      render: (r) => (
        <Chip
          label={r.format === 'Loose' ? 'LOOSE BULK' : 'PACKED'}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            bgcolor: r.format === 'Loose' ? '#FEF3C7' : '#DBEAFE',
            color: r.format === 'Loose' ? '#92400E' : '#1E40AF',
          }}
        />
      ),
    },
    { key: 'description', header: 'Description / Notes' },
  ];

  const modalFields: FormFieldDef[] = [
    { name: 'itemCode', label: 'Item Code', type: 'text', required: true, placeholder: 'e.g. ITM-1001' },
    { name: 'name', label: 'Item Name', type: 'text', required: true, placeholder: 'e.g. Aashirvaad Atta 5kg' },
    {
      name: 'category',
      label: 'Category',
      type: 'server-select',
      fetchOptions: async ({ page, pageSize, search }) => {
        const params = new URLSearchParams({
          masterType: 'ItemCategory',
          page: String(page),
          pageSize: String(pageSize),
          paged: 'true',
        });
        if (search.trim()) params.append('search', search.trim());
        const res = await fetch(`${getApiBaseUrl()}/masters?${params.toString()}`, {
          headers: {
            ...getAuthHeaders(),
            'X-Tenant-Id': String(selectedTenantId),
            ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          return {
            items: data.items || [],
            hasMore: data.hasMore || false,
            totalCount: data.totalCount || 0,
          };
        }
        return { items: [], hasMore: false, totalCount: 0 };
      },
      itemLabel: (i: any) => i.name,
      itemValue: (i: any) => i.name,
      required: true,
      defaultValue: 'Groceries',
    },
    {
      name: 'uom',
      label: 'UOM (Unit of Measure)',
      type: 'server-select',
      fetchOptions: async ({ page, pageSize, search }) => {
        const params = new URLSearchParams({
          masterType: 'UnitOfMeasurement',
          page: String(page),
          pageSize: String(pageSize),
          paged: 'true',
        });
        if (search.trim()) params.append('search', search.trim());
        const res = await fetch(`${getApiBaseUrl()}/masters?${params.toString()}`, {
          headers: {
            ...getAuthHeaders(),
            'X-Tenant-Id': String(selectedTenantId),
            ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          return {
            items: data.items || [],
            hasMore: data.hasMore || false,
            totalCount: data.totalCount || 0,
          };
        }
        return { items: [], hasMore: false, totalCount: 0 };
      },
      itemLabel: (i: any) => i.name,
      itemValue: (i: any) => i.name,
      required: true,
      defaultValue: 'pkt',
    },
    { name: 'format', label: 'Item Format / Type', type: 'select', options: [
      { label: 'Packed Item (Discrete packaging)', value: 'Packed' },
      { label: 'Loose Bulk (Weight / Volume sold)', value: 'Loose' },
    ], defaultValue: 'Packed' },
    { name: 'description', label: 'Item Description / Notes', type: 'text', placeholder: 'Product details, packaging size, storage info' },
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (item: ItemRow) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  const handleDelete = async (item: ItemRow) => {
    if (!window.confirm(`Are you sure you want to delete item "${item.name}"?`)) return;
    try {
      await fetch(`${getApiBaseUrl()}/Items/${item.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(selectedTenantId),
        },
      });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setAlertMsg(`Item "${item.name}" deleted successfully.`);
    } catch (_) {
      setAlertMsg(`Failed to delete item "${item.name}".`);
    }
  };

  const handleSaveModal = async (formValues: Record<string, any>) => {
    const payload = {
      tenantId: selectedTenantId,
      tenantCode: selectedTenantCode,
      itemCode: formValues.itemCode,
      name: formValues.name,
      itemName: formValues.name,
      category: formValues.category,
      unit: formValues.uom,
      format: formValues.format || 'Packed',
      description: formValues.description,
    };

    if (editingItem) {
      try {
        const res = await fetch(`${getApiBaseUrl()}/Items/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            'X-Tenant-Id': String(selectedTenantId),
          },
          body: JSON.stringify({ ...payload, id: Number(editingItem.id) }),
        });
        if (res.ok) {
          fetchItems(selectedTenantId);
          setAlertMsg(`Item "${formValues.name}" updated successfully.`);
        }
      } catch (_) {}
    } else {
      try {
        const res = await fetch(`${getApiBaseUrl()}/Items`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            'X-Tenant-Id': String(selectedTenantId),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchItems(selectedTenantId);
          setAlertMsg(`New Item "${formValues.name}" created for ${selectedTenantName}.`);
        }
      } catch (_) {}
    }
    setOpenModal(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ pt: 2, pb: 6 }}>
        <TenantFilterBar onTenantChange={(tId) => fetchItems(tId)} sx={{ mb: 2 }} />

        <PageHeader
          title="Items Directory (आइटम मास्टर)"
          subtitle={`Managing master catalog for: ${selectedTenantName} (${selectedTenantCode || 'Store #' + selectedTenantId}). Core Item definitions with Edit/Delete options.`}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search Item Code, Name, Category..."
          primaryAction={{
            label: 'Define New Item',
            icon: <AddIcon />,
            onClick: handleOpenAdd,
          }}
        />

        {alertMsg && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        <StatCardGrid items={statsItems} columns={{ xs: 12, sm: 6, md: 4 }} />

        <Box sx={{ mt: 4 }}>
          <GenericDataTable<ItemRow>
            data={filteredItems}
            columns={columns}
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
              fetchItems(selectedTenantId, newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(newRows) => {
              setRowsPerPage(newRows);
              setPage(0);
              fetchItems(selectedTenantId, 0, newRows);
            }}
            emptyMessage={`No items found for ${selectedTenantName}. Click "Define New Item" above to add products to this store.`}
          />

        </Box>
      </Container>

      <GenericFormModal
        open={openModal}
        title={editingItem ? 'Edit Item Definition' : 'Define New Item'}
        fields={modalFields}
        initialValues={editingItem || {}}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSaveModal}
        submitLabel={editingItem ? 'Update Item' : 'Save Item'}
      />
    </Box>
  );
};
