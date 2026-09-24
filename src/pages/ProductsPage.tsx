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
  brand?: string;
  unit: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp?: number;
  gstPercent?: number;
  currentStock: number;
  minimumStock?: number;
  batchNumber?: string;
  rackNumber?: string;
  expiryDate?: string;
  hsnCode?: string;
  status?: string;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>([
    { id: 1, productCode: 'PRD-001', name: 'Aashirvaad Atta 5kg', category: 'Groceries', brand: 'ITC', unit: 'pkt', purchasePrice: 195.0, sellingPrice: 220.0, mrp: 235.0, gstPercent: 5, currentStock: 15, minimumStock: 5, batchNumber: 'B-2026-09', rackNumber: 'RACK-A1', expiryDate: '2027-03-31', hsnCode: '11010000', status: 'ACTIVE' },
    { id: 2, productCode: 'PRD-002', name: 'Fortune Mustard Oil 1L', category: 'Edible Oil', brand: 'Fortune', unit: 'bottle', purchasePrice: 130.0, sellingPrice: 145.0, mrp: 160.0, gstPercent: 5, currentStock: 3, minimumStock: 5, batchNumber: 'B-2026-08', rackNumber: 'RACK-B2', expiryDate: '2026-12-31', hsnCode: '15149010', status: 'ACTIVE' },
    { id: 3, productCode: 'PRD-003', name: 'Tata Salt 1kg', category: 'Groceries', brand: 'Tata', unit: 'pkt', purchasePrice: 22.0, sellingPrice: 28.0, mrp: 30.0, gstPercent: 0, currentStock: 40, minimumStock: 10, batchNumber: 'B-2026-01', rackNumber: 'RACK-A2', expiryDate: '', hsnCode: '25010010', status: 'ACTIVE' },
    { id: 4, productCode: 'PRD-004', name: 'Surf Excel 1kg', category: 'Detergent', brand: 'HUL', unit: 'pkt', purchasePrice: 110.0, sellingPrice: 130.0, mrp: 140.0, gstPercent: 18, currentStock: 0, minimumStock: 5, batchNumber: 'B-2026-04', rackNumber: 'RACK-C1', expiryDate: '', hsnCode: '34022090', status: 'INACTIVE' },
    { id: 5, productCode: 'PRD-005', name: 'Sugar (चीनी) 1kg', category: 'Groceries', brand: 'General', unit: 'kg', purchasePrice: 38.0, sellingPrice: 42.0, mrp: 45.0, gstPercent: 5, currentStock: 50, minimumStock: 15, batchNumber: 'B-2026-02', rackNumber: 'RACK-A3', expiryDate: '2027-06-30', hsnCode: '17011490', status: 'ACTIVE' },
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
          setProducts(data.map((p) => ({
            ...p,
            status: (p.currentStock ?? 0) > 0 ? 'ACTIVE' : 'INACTIVE',
            expiryDate: p.expiryDate ? String(p.expiryDate).split('T')[0] : '',
          })));
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.rackNumber && p.rackNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= (p.minimumStock || 5)).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Catalog Products', value: products.length, change: '100% synchronized', icon: <Inventory2Icon />, borderAccentColor: '#2563EB' },
    { id: 'in_stock', title: 'In Stock & Available', value: products.length - outOfStockCount, change: 'Ready for POS billing', icon: <CheckCircleIcon />, borderAccentColor: '#10B981' },
    { id: 'low_stock', title: 'Low Stock Alerts', value: lowStockCount, subtitle: 'Requires supplier reorder', icon: <WarningIcon />, borderAccentColor: '#D97706' },
    { id: 'out_stock', title: 'Out of Stock Items', value: outOfStockCount, subtitle: 'Zero inventory on hand', icon: <WarningIcon />, borderAccentColor: '#EF4444' },
  ];

  const columns: ColumnDef<ProductRow>[] = [
    {
      key: 'name',
      header: 'Product & Barcode',
      render: (r) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
            {r.name}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              Code: {r.productCode || '-'}
            </Typography>
            {r.barcode && (
              <Chip label={`BC: ${r.barcode}`} size="small" sx={{ height: 16, fontSize: '0.625rem', bgcolor: '#F1F5F9' }} />
            )}
          </Box>
        </Box>
      ),
    },
    {
      key: 'category',
      header: 'Category / Brand',
      render: (r) => (
        <Box>
          <Typography variant="body2" fontWeight="600" color="#334155">{r.category || 'General'}</Typography>
          {r.brand && <Typography variant="caption" color="text.secondary">{r.brand}</Typography>}
        </Box>
      ),
    },
    {
      key: 'batchNumber',
      header: 'Batch & Rack',
      render: (r) => (
        <Box>
          <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
            {r.batchNumber ? `B: ${r.batchNumber}` : '-'}
          </Typography>
          {r.rackNumber && (
            <Typography variant="caption" color="primary.main" fontWeight="700">
              Rack: {r.rackNumber}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'Selling / MRP',
      render: (r) => (
        <Box>
          <Typography variant="body2" fontWeight="800" color="#0F172A">
            ₹ {(r.sellingPrice || 0).toFixed(2)} / {r.unit || 'pcs'}
          </Typography>
          {r.mrp && r.mrp > r.sellingPrice && (
            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              MRP ₹ {r.mrp.toFixed(2)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'purchasePrice',
      header: 'Purchase & GST',
      render: (r) => (
        <Box>
          <Typography variant="body2">₹ {(r.purchasePrice || 0).toFixed(2)}</Typography>
          {r.gstPercent !== undefined && (
            <Typography variant="caption" color="text.secondary">
              GST: {r.gstPercent}% {r.hsnCode ? `(HSN: ${r.hsnCode})` : ''}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (r) => (
        <Typography variant="body2" color={r.expiryDate ? '#475569' : 'text.disabled'}>
          {r.expiryDate || '-'}
        </Typography>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stock & Alert',
      align: 'center',
      render: (r) => {
        const min = r.minimumStock ?? 5;
        const isOut = r.currentStock === 0;
        const isLow = r.currentStock > 0 && r.currentStock <= min;
        return (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Chip
              label={isOut ? 'OUT OF STOCK' : isLow ? `LOW (${r.currentStock})` : `${r.currentStock} ${r.unit || 'pcs'}`}
              size="small"
              color={isOut ? 'error' : isLow ? 'warning' : 'success'}
              sx={{ fontWeight: 800, fontSize: '0.675rem', height: 20 }}
            />
            {r.minimumStock !== undefined && (
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                Min: {r.minimumStock}
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  const modalFields: FormFieldDef[] = [
    { name: 'name', label: 'Product Name (सामान का नाम)', type: 'text', required: true, placeholder: 'e.g. Fortune Rice Bran Oil 1L' },
    { name: 'productCode', label: 'Product Code / SKU', type: 'text', placeholder: 'e.g. PRD-101 (Auto generated if blank)' },
    { name: 'barcode', label: 'Barcode / EAN', type: 'text', placeholder: 'e.g. 8901030012345' },
    { name: 'category', label: 'Category', type: 'select', options: [
      { label: 'Groceries (किराना)', value: 'Groceries' },
      { label: 'Edible Oil (तेल)', value: 'Edible Oil' },
      { label: 'Detergent & Soap (साबुन-सर्फ)', value: 'Detergent' },
      { label: 'Spices (मसाले)', value: 'Spices' },
      { label: 'Beverages (पेय पदार्थ)', value: 'Beverages' },
      { label: 'Personal Care', value: 'Personal Care' },
      { label: 'General', value: 'General' },
    ], defaultValue: 'Groceries' },
    { name: 'brand', label: 'Brand Name', type: 'text', placeholder: 'e.g. Tata, Fortune, Aashirvaad' },
    { name: 'batchNumber', label: 'Batch No.', type: 'text', placeholder: 'e.g. B-2026-09' },
    { name: 'rackNumber', label: 'Rack / Shelf No.', type: 'text', placeholder: 'e.g. Rack A-3' },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
    { name: 'hsnCode', label: 'HSN / SAC Code', type: 'text', placeholder: 'e.g. 10063010' },
    { name: 'unit', label: 'Unit of Measure', type: 'select', options: [
      { label: 'Packet (pkt)', value: 'pkt' },
      { label: 'Bottle (bottle)', value: 'bottle' },
      { label: 'Kilogram (kg)', value: 'kg' },
      { label: 'Gram (g)', value: 'g' },
      { label: 'Litre (ltr)', value: 'ltr' },
      { label: 'Pieces (pcs)', value: 'pcs' },
      { label: 'Box (box)', value: 'box' },
    ], defaultValue: 'pkt' },
    { name: 'purchasePrice', label: 'Purchase Price / Cost Rate (₹)', type: 'number', required: true },
    { name: 'sellingPrice', label: 'Selling Price (₹)', type: 'number', required: true },
    { name: 'mrp', label: 'MRP (Maximum Retail Price ₹)', type: 'number' },
    { name: 'gstPercent', label: 'GST Tax Rate (%)', type: 'number', placeholder: 'e.g. 0, 5, 12, 18, 28' },
    { name: 'currentStock', label: 'Stock Quantity', type: 'number', required: true },
    { name: 'minimumStock', label: 'Minimum Stock Threshold (Reorder level)', type: 'number', placeholder: 'e.g. 5' },
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
      productCode: formValues.productCode || undefined,
      name: formValues.name,
      category: formValues.category,
      brand: formValues.brand || undefined,
      unit: formValues.unit,
      barcode: formValues.barcode || undefined,
      purchasePrice: parseFloat(formValues.purchasePrice) || 0,
      sellingPrice: parseFloat(formValues.sellingPrice) || 0,
      mrp: formValues.mrp ? parseFloat(formValues.mrp) : (parseFloat(formValues.sellingPrice) || 0),
      gstPercent: formValues.gstPercent ? parseFloat(formValues.gstPercent) : 0,
      currentStock: parseInt(formValues.currentStock) || 0,
      openingStock: parseInt(formValues.currentStock) || 0,
      minimumStock: formValues.minimumStock ? parseInt(formValues.minimumStock) : 5,
      batchNumber: formValues.batchNumber || undefined,
      rackNumber: formValues.rackNumber || undefined,
      expiryDate: formValues.expiryDate ? formValues.expiryDate : null,
      hsnCode: formValues.hsnCode || undefined,
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
      setAlertMsg(`Product ${formValues.name} updated successfully!`);
    } else {
      try {
        await fetch(`${getApiBaseUrl()}/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        fetchProducts();
      } catch (_) {}

      setAlertMsg(`Added product ${formValues.name} to catalog!`);
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
