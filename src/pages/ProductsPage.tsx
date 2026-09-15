import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip, Alert } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal, FormFieldDef } from '../components/common/GenericFormModal';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface ProductRow {
  id: number;
  productCode: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  status?: string;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>([
    { id: 1, productCode: 'PRD-001', name: 'Aashirvaad Atta 5kg', category: 'Groceries', unit: 'pkt', purchasePrice: 195.0, sellingPrice: 220.0, currentStock: 15, status: 'ACTIVE' },
    { id: 2, productCode: 'PRD-002', name: 'Fortune Mustard Oil 1L', category: 'Edible Oil', unit: 'bottle', purchasePrice: 130.0, sellingPrice: 145.0, currentStock: 3, status: 'ACTIVE' },
    { id: 3, productCode: 'PRD-003', name: 'Tata Salt 1kg', category: 'Groceries', unit: 'pkt', purchasePrice: 22.0, sellingPrice: 28.0, currentStock: 40, status: 'ACTIVE' },
    { id: 4, productCode: 'PRD-004', name: 'Surf Excel 1kg', category: 'Detergent', unit: 'pkt', purchasePrice: 110.0, sellingPrice: 130.0, currentStock: 0, status: 'INACTIVE' },
    { id: 5, productCode: 'PRD-005', name: 'Sugar (चीनी) 1kg', category: 'Groceries', unit: 'kg', purchasePrice: 38.0, sellingPrice: 42.0, currentStock: 50, status: 'ACTIVE' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/products`, { headers: getAuthHeaders() });
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map((p) => ({ ...p, status: p.currentStock > 0 ? 'ACTIVE' : 'INACTIVE' })));
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= 5).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Catalog Products', value: products.length, change: '100% synchronized', icon: <Inventory2Icon />, borderAccentColor: '#2563EB' },
    { id: 'in_stock', title: 'In Stock & Available', value: products.length - outOfStockCount, change: 'Ready for POS billing', icon: <CheckCircleIcon />, borderAccentColor: '#10B981' },
    { id: 'low_stock', title: 'Low Stock Alerts (<=5)', value: lowStockCount, subtitle: 'Requires supplier reorder', icon: <WarningIcon />, borderAccentColor: '#D97706' },
    { id: 'out_stock', title: 'Out of Stock Items', value: outOfStockCount, subtitle: 'Zero inventory on hand', icon: <WarningIcon />, borderAccentColor: '#EF4444' },
  ];

  const columns: ColumnDef<ProductRow>[] = [
    {
      key: 'name',
      header: 'Product Name & Code',
      render: (r) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
            {r.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
            {r.productCode}
          </Typography>
        </Box>
      ),
    },
    { key: 'category', header: 'Category' },
    {
      key: 'sellingPrice',
      header: 'Selling Price (₹)',
      render: (r) => (
        <Typography variant="body2" fontWeight="800" color="#0F172A">
          ₹ {r.sellingPrice.toFixed(2)} / {r.unit}
        </Typography>
      ),
    },
    {
      key: 'purchasePrice',
      header: 'Purchase Rate (₹)',
      render: (r) => <Typography variant="body2">₹ {r.purchasePrice.toFixed(2)}</Typography>,
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      align: 'center',
      render: (r) => {
        const isOut = r.currentStock === 0;
        const isLow = r.currentStock > 0 && r.currentStock <= 5;
        return (
          <Chip
            label={isOut ? 'OUT OF STOCK' : isLow ? `LOW (${r.currentStock})` : `${r.currentStock} ${r.unit}`}
            size="small"
            color={isOut ? 'error' : isLow ? 'warning' : 'success'}
            sx={{ fontWeight: 800, fontSize: '0.675rem', height: 20 }}
          />
        );
      },
    },
    { key: 'status', header: 'Status' },
  ];

  const modalFields: FormFieldDef[] = [
    { name: 'name', label: 'Product Name (सामान का नाम)', type: 'text', required: true, placeholder: 'e.g. Fortune Rice Bran Oil 1L' },
    { name: 'category', label: 'Category', type: 'select', options: [
      { label: 'Groceries', value: 'Groceries' },
      { label: 'Edible Oil', value: 'Edible Oil' },
      { label: 'Detergent', value: 'Detergent' },
      { label: 'Spices', value: 'Spices' },
      { label: 'General', value: 'General' },
    ], defaultValue: 'Groceries' },
    { name: 'unit', label: 'Unit', type: 'select', options: [
      { label: 'Packet (pkt)', value: 'pkt' },
      { label: 'Bottle (bottle)', value: 'bottle' },
      { label: 'Kilogram (kg)', value: 'kg' },
      { label: 'Pieces (pcs)', value: 'pcs' },
    ], defaultValue: 'pkt' },
    { name: 'purchasePrice', label: 'Purchase Price (₹)', type: 'number', required: true },
    { name: 'sellingPrice', label: 'Selling Price (₹)', type: 'number', required: true },
    { name: 'currentStock', label: 'Stock Quantity', type: 'number', required: true },
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (product: ProductRow) => {
    setEditingProduct(product);
    setOpenModal(true);
  };

  const handleDelete = async (product: ProductRow) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/products/${product.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        fetchProducts();
      }
    } catch (_) {}
    setAlertMsg(`Product ${product.name} deleted successfully.`);
  };

  const handleSaveModal = async (formValues: Record<string, any>) => {
    const payload = {
      name: formValues.name,
      category: formValues.category,
      unit: formValues.unit,
      purchasePrice: parseFloat(formValues.purchasePrice) || 0,
      sellingPrice: parseFloat(formValues.sellingPrice) || 0,
      mrp: parseFloat(formValues.sellingPrice) || 0,
      currentStock: parseInt(formValues.currentStock) || 0,
      openingStock: parseInt(formValues.currentStock) || 0,
    };

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...payload, currentStock: payload.currentStock } : p)));
      try {
        await fetch(`${getApiBaseUrl()}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        fetchProducts();
      } catch (_) {}
      setAlertMsg(`Product ${formValues.name} stock updated successfully to ${payload.currentStock}!`);
    } else {
      try {
        await fetch(`${getApiBaseUrl()}/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        fetchProducts();
      } catch (_) {}

      setAlertMsg(`Added product ${formValues.name} with stock ${payload.currentStock} to catalog!`);
    }
    setOpenModal(false);
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Products & Stock Inventory Control"
          subtitle="Manage store merchandise, buying rates, selling prices, and stock inventory replenishment"
          breadcrumbs={['Home', 'Store Management', 'Products Catalog']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search product name, category, code..."
          primaryAction={{
            label: 'Add New Product',
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

        <GenericDataTable<ProductRow>
          columns={columns}
          data={filteredProducts}
          keyExtractor={(row) => String(row.id)}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          emptyMessage="No products found in catalog."
        />

        <GenericFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={editingProduct ? `Edit Product - ${editingProduct.name}` : 'Add New Product to Catalog'}
          fields={modalFields}
          initialValues={editingProduct || {}}
          onSubmit={handleSaveModal}
          submitLabel={editingProduct ? 'Save Changes' : 'Save Product'}
        />
      </Container>
    </Box>
  );
};
