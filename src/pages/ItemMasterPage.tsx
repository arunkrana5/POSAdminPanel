import React, { useState, useEffect } from 'react';
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
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface ItemMasterRow {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  uom: string;
  format: 'Packed' | 'Loose';
  description?: string;
}

export const ItemMasterPage: React.FC = () => {
  const [items, setItems] = useState<ItemMasterRow[]>([
    { id: '1', itemCode: 'ITM-1001', name: 'Aashirvaad Atta 5kg', category: 'Groceries', uom: 'pkt', format: 'Packed', description: 'Whole Wheat Atta 5kg Packet' },
    { id: '2', itemCode: 'ITM-1002', name: 'Fortune Mustard Oil 1L', category: 'Edible Oil', uom: 'bottle', format: 'Packed', description: 'Mustard Oil 1L Bottle' },
    { id: '3', itemCode: 'ITM-1003', name: 'Tata Salt 1kg', category: 'Groceries', uom: 'pkt', format: 'Packed', description: 'Iodized Salt 1kg Packet' },
    { id: '4', itemCode: 'ITM-1004', name: 'Surf Excel 1kg', category: 'Detergent', uom: 'pkt', format: 'Packed', description: 'Detergent Powder 1kg Packet' },
    { id: '5', itemCode: 'ITM-1005', name: 'Loose Sugar (चीनी)', category: 'Groceries', uom: 'kg', format: 'Loose', description: 'Refined White Sugar per kg' },
    { id: '6', itemCode: 'ITM-1006', name: 'Toor Dal (अरहर दाल)', category: 'Groceries', uom: 'kg', format: 'Loose', description: 'Unpolished Toor Dal per kg' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMasterRow | null>(null);

  useEffect(() => {
    fetchItemMasters();
  }, []);

  const fetchItemMasters = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/ItemMasters?_t=${Date.now()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ItemMasterRow[] = data.map((d: any) => ({
            id: (d.id || d.ID || '').toString(),
            itemCode: d.itemCode || d.ItemCode || '',
            name: d.name || d.Name || '',
            category: d.category || d.Category || 'General',
            uom: d.unit || d.Unit || 'pcs',
            format: (d.format || d.Format || 'Packed') === 'Loose' ? 'Loose' : 'Packed',
            description: d.description || d.Description || '',
          }));
          setItems(mapped);
        }
      }
    } catch (_) {}
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const looseCount = items.filter((i) => i.format === 'Loose').length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Item Definitions', value: items.length, change: '100% cataloged', icon: <AssignmentIcon />, borderAccentColor: '#2563EB' },
    { id: 'packed', title: 'Packed Items (Discrete)', value: items.length - looseCount, subtitle: 'Fixed unit packaging', icon: <Inventory2Icon />, borderAccentColor: '#10B981' },
    { id: 'loose', title: 'Loose / Bulk Items', value: looseCount, subtitle: 'Weight/Volume adjustable', icon: <ScaleIcon />, borderAccentColor: '#D97706' },
  ];

  const columns: ColumnDef<ItemMasterRow>[] = [
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
    { name: 'category', label: 'Category', type: 'select', options: [
      { label: 'Groceries', value: 'Groceries' },
      { label: 'Edible Oil', value: 'Edible Oil' },
      { label: 'Detergent & Soap', value: 'Detergent' },
      { label: 'Spices', value: 'Spices' },
      { label: 'Beverages', value: 'Beverages' },
      { label: 'Dairy', value: 'Dairy' },
      { label: 'Grains', value: 'Grains' },
      { label: 'General', value: 'General' },
    ], defaultValue: 'Groceries' },
    { name: 'uom', label: 'UOM (Unit of Measure)', type: 'select', options: [
      { label: 'Packet (pkt)', value: 'pkt' },
      { label: 'Bottle (bottle)', value: 'bottle' },
      { label: 'Kilogram (kg)', value: 'kg' },
      { label: 'Gram (gm)', value: 'gm' },
      { label: 'Litre (ltr)', value: 'ltr' },
      { label: 'Pieces (pcs)', value: 'pcs' },
      { label: 'Box (box)', value: 'box' },
    ], defaultValue: 'pkt' },
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

  const handleOpenEdit = (item: ItemMasterRow) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  const handleDelete = async (item: ItemMasterRow) => {
    try {
      await fetch(`${getApiBaseUrl()}/ItemMasters/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (_) {}
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setAlertMsg(`Item ${item.name} removed from Item Master.`);
  };

  const handleSaveModal = async (formValues: Record<string, any>) => {
    const payload = {
      itemCode: formValues.itemCode,
      name: formValues.name,
      category: formValues.category,
      unit: formValues.uom,
      format: formValues.format || 'Packed',
      description: formValues.description,
    };

    if (editingItem) {
      try {
        await fetch(`${getApiBaseUrl()}/ItemMasters/${editingItem.id}`, {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: Number(editingItem.id) }),
        });
      } catch (_) {}

      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                itemCode: formValues.itemCode,
                name: formValues.name,
                category: formValues.category,
                uom: formValues.uom,
                format: formValues.format,
                description: formValues.description,
              }
            : i
        )
      );
      setAlertMsg(`Master Item ${formValues.name} updated.`);
    } else {
      try {
        const res = await fetch(`${getApiBaseUrl()}/ItemMasters`, {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchItemMasters();
        }
      } catch (_) {}

      const newItem: ItemMasterRow = {
        id: `${items.length + 1}`,
        itemCode: formValues.itemCode || `ITM-${1000 + Math.floor(Math.random() * 9000)}`,
        name: formValues.name,
        category: formValues.category,
        uom: formValues.uom,
        format: formValues.format || 'Packed',
        description: formValues.description,
      };
      setItems((prev) => [newItem, ...prev]);
      setAlertMsg(`New Item ${formValues.name} added to Item Master.`);
    }
    setOpenModal(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
        <PageHeader
          title="Items Directory"
          subtitle="Core Item definitions (Item Code, Name, Category, UOM & Format). Pricing, Barcode & Stock Entry are managed separately under Stock In."
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
          <GenericDataTable<ItemMasterRow>
            data={filteredItems}
            columns={columns}
            keyExtractor={(r) => r.id}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            emptyMessage="No items defined."
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
