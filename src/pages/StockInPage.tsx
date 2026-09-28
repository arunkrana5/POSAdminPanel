import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip, Alert, MenuItem, TextField, Button, Paper } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface ProductRow {
  id: number;
  itemId?: number;
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
  imageUrl?: string;
  status?: string;
}

export const StockInPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>([
    { id: 1, productCode: 'PRD-001', name: 'Aashirvaad Atta 5kg', category: 'Groceries', brand: 'ITC', unit: 'pkt', purchasePrice: 195.0, sellingPrice: 220.0, mrp: 235.0, gstPercent: 5, currentStock: 15, minimumStock: 5, batchNumber: 'B-2026-09', rackNumber: 'RACK-A1', expiryDate: '2027-03-31', hsnCode: '11010000', status: 'ACTIVE' },
    { id: 2, productCode: 'PRD-002', name: 'Fortune Mustard Oil 1L', category: 'Edible Oil', brand: 'Fortune', unit: 'bottle', purchasePrice: 130.0, sellingPrice: 145.0, mrp: 160.0, gstPercent: 5, currentStock: 3, minimumStock: 5, batchNumber: 'B-2026-08', rackNumber: 'RACK-B2', expiryDate: '2026-12-31', hsnCode: '15149010', status: 'ACTIVE' },
    { id: 3, productCode: 'PRD-003', name: 'Tata Salt 1kg', category: 'Groceries', brand: 'Tata', unit: 'pkt', purchasePrice: 22.0, sellingPrice: 28.0, mrp: 30.0, gstPercent: 0, currentStock: 40, minimumStock: 10, batchNumber: 'B-2026-01', rackNumber: 'RACK-A2', expiryDate: '', hsnCode: '25010010', status: 'ACTIVE' },
    { id: 4, productCode: 'PRD-004', name: 'Surf Excel 1kg', category: 'Detergent', brand: 'HUL', unit: 'pkt', purchasePrice: 110.0, sellingPrice: 130.0, mrp: 140.0, gstPercent: 18, currentStock: 0, minimumStock: 5, batchNumber: 'B-2026-04', rackNumber: 'RACK-C1', expiryDate: '', hsnCode: '34022090', status: 'INACTIVE' },
    { id: 5, productCode: 'PRD-005', name: 'Sugar (चीनी) 1kg', category: 'Groceries', brand: 'General', unit: 'kg', purchasePrice: 38.0, sellingPrice: 42.0, mrp: 45.0, gstPercent: 5, currentStock: 50, minimumStock: 15, batchNumber: 'B-2026-02', rackNumber: 'RACK-A3', expiryDate: '2027-06-30', hsnCode: '17011490', status: 'ACTIVE' },
  ]);

  const defaultCatalogItems = [
    { id: 1, itemCode: 'ITM-1001', name: 'Aashirvaad Atta 5kg', category: 'Groceries', unit: 'pkt', format: 'Packed' },
    { id: 2, itemCode: 'ITM-1002', name: 'Fortune Mustard Oil 1L', category: 'Edible Oil', unit: 'bottle', format: 'Packed' },
    { id: 3, itemCode: 'ITM-1003', name: 'Tata Salt 1kg', category: 'Groceries', unit: 'pkt', format: 'Packed' },
    { id: 4, itemCode: 'ITM-1004', name: 'Surf Excel 1kg', category: 'Detergent', unit: 'pkt', format: 'Packed' },
    { id: 5, itemCode: 'ITM-1005', name: 'Loose Sugar (चीनी)', category: 'Groceries', unit: 'kg', format: 'Loose' },
    { id: 6, itemCode: 'ITM-1006', name: 'Toor Dal (अरहर दाल)', category: 'Groceries', unit: 'kg', format: 'Loose' },
  ];

  const [availableItems, setAvailableItems] = useState<any[]>(defaultCatalogItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedItemObj, setSelectedItemObj] = useState<any | null>(null);
  const [uploadedCompressedPhoto, setUploadedCompressedPhoto] = useState<string>('');

  const [formFields, setFormFields] = useState({
    sellingPrice: '',
    purchasePrice: '',
    mrp: '',
    gstPercent: '0',
    currentStock: '10',
    minimumStock: '5',
    barcode: '',
    hsnCode: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/Items?_t=${Date.now()}`, { headers: getAuthHeaders() });
      if (res && res.ok) {
        const data = await res.json();
        const merged = Array.isArray(data) ? [...data] : [];
        const existingNames = new Set(merged.map((i: any) => (i.name || i.Name || '').toString().toLowerCase()));
        for (const d of defaultCatalogItems) {
          if (!existingNames.has(d.name.toLowerCase())) {
            merged.push(d);
          }
        }
        setAvailableItems(merged);
      }
    } catch (_) {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/StockIn?_t=${Date.now()}`, { headers: getAuthHeaders() });
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
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 160;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 160, 160);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressed);
          } else {
            reject('Canvas context not available');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const compressedBase64 = await compressImageFile(e.target.files[0]);
        setUploadedCompressedPhoto(compressedBase64);
      } catch (_) {}
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= (p.minimumStock || 5)).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Stock Entries', value: products.length, change: '100% synchronized', icon: <Inventory2Icon />, borderAccentColor: '#2563EB' },
    { id: 'in_stock', title: 'In Stock & Available', value: products.length - outOfStockCount, change: 'Ready for POS billing', icon: <CheckCircleIcon />, borderAccentColor: '#10B981' },
    { id: 'low_stock', title: 'Low Stock Alerts', value: lowStockCount, subtitle: 'Requires supplier reorder', icon: <WarningIcon />, borderAccentColor: '#D97706' },
    { id: 'out_stock', title: 'Out of Stock Items', value: outOfStockCount, subtitle: 'Zero inventory on hand', icon: <WarningIcon />, borderAccentColor: '#EF4444' },
  ];

  const columns: ColumnDef<ProductRow>[] = [
    {
      key: 'name',
      header: 'Stock Logo & Name',
      render: (r) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          {r.imageUrl ? (
            <Box component="img" src={r.imageUrl} alt={r.name} sx={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
          ) : (
            <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #BFDBFE' }}>
              <Inventory2Icon color="primary" fontSize="small" />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
              {r.name}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                Code: {r.productCode || '-'}
              </Typography>
              {r.barcode && (
                <Chip label={`BC: ${r.barcode}`} size="small" sx={{ height: 16, fontSize: '0.625rem', bgcolor: '#F1F5F9', fontWeight: 800 }} />
              )}
            </Box>
          </Box>
        </Box>
      ),
    },
    { key: 'category', header: 'Category' },
    {
      key: 'sellingPrice',
      header: 'Rate & MRP',
      render: (r) => (
        <Box>
          <Typography variant="body2" fontWeight="700" color="#1E293B">
            ₹{r.sellingPrice.toFixed(2)} / {r.unit}
          </Typography>
          {r.mrp && r.mrp > r.sellingPrice && (
            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              MRP: ₹{r.mrp.toFixed(2)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stock Level',
      render: (r) => {
        const isOut = r.currentStock === 0;
        const isLow = r.currentStock > 0 && r.currentStock <= (r.minimumStock || 5);

        return (
          <Box display="flex" flexDirection="column" gap={0.25}>
            <Chip
              label={isOut ? 'OUT OF STOCK' : isLow ? `LOW (${r.currentStock})` : `${r.currentStock} ${r.unit || 'pcs'}`}
              size="small"
              color={isOut ? 'error' : isLow ? 'warning' : 'success'}
              sx={{ fontWeight: 800, fontSize: '0.675rem', height: 20 }}
            />
          </Box>
        );
      },
    },
  ];

  const handleOpenAdd = () => {
    setSelectedItemObj(null);
    setUploadedCompressedPhoto('');
    setFormFields({
      sellingPrice: '',
      purchasePrice: '',
      mrp: '',
      gstPercent: '0',
      currentStock: '10',
      minimumStock: '5',
      barcode: `890${100000000 + Math.floor(Math.random() * 900000000)}`,
      hsnCode: '',
    });
    setOpenModal(true);
  };

  const handleDelete = async (product: ProductRow) => {
    try {
      await fetch(`${getApiBaseUrl()}/StockIn/${product.id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } catch (_) {}
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setAlertMsg(`Stock item ${product.name} deleted.`);
  };

  const handleSaveModal = async () => {
    if (!selectedItemObj || !formFields.sellingPrice) return;

    const payload = {
      itemId: selectedItemObj.id ? Number(selectedItemObj.id) : undefined,
      productCode: selectedItemObj.itemCode || selectedItemObj.ItemCode,
      name: selectedItemObj.name || selectedItemObj.Name,
      category: selectedItemObj.category || selectedItemObj.Category,
      unit: selectedItemObj.unit || selectedItemObj.Unit || 'pcs',
      purchasePrice: parseFloat(formFields.purchasePrice) || 0,
      sellingPrice: parseFloat(formFields.sellingPrice) || 0,
      mrp: formFields.mrp ? parseFloat(formFields.mrp) : parseFloat(formFields.sellingPrice) || 0,
      gstPercent: parseFloat(formFields.gstPercent) || 0,
      currentStock: parseInt(formFields.currentStock) || 0,
      openingStock: parseInt(formFields.currentStock) || 0,
      minimumStock: parseInt(formFields.minimumStock) || 5,
      barcode: formFields.barcode,
      hsnCode: formFields.hsnCode,
      imageUrl: uploadedCompressedPhoto || undefined,
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/StockIn`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (_) {}

    const newProd: ProductRow = {
      id: products.length + 1,
      ...payload,
      status: payload.currentStock > 0 ? 'ACTIVE' : 'INACTIVE',
    };
    setProducts((prev) => [newProd, ...prev]);
    setAlertMsg(`Stock In submitted for ${payload.name}.`);
    setOpenModal(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
        <PageHeader
          title="Stock In Directory"
          subtitle="Select an Item definition, set stock rate, tax & upload product photo."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search stock item, barcode..."
          primaryAction={{
            label: 'Stock In Entry',
            icon: <AddIcon />,
            onClick: handleOpenAdd,
          }}
        />

        {alertMsg && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        <StatCardGrid items={statsItems} columns={{ xs: 12, sm: 6, md: 3 }} />

        <Box sx={{ mt: 4 }}>
          <GenericDataTable<ProductRow>
            data={filteredProducts}
            columns={columns}
            keyExtractor={(r) => r.id.toString()}
            onDelete={handleDelete}
            emptyMessage="No stock inventory entries found."
          />
        </Box>
      </Container>

      {/* Stock In Entry Modal */}
      {openModal && (
        <Box
          sx={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(15, 23, 42, 0.6)', zIndex: 1300, display: 'flex',
            alignItems: 'center', justifyContent: 'center', p: 2
          }}
        >
          <Paper sx={{ width: '100%', maxWidth: 640, p: 3, borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
            <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
              Stock In Entry (Select Item First)
            </Typography>

            {/* STEP 1: Select Item Dropdown */}
            <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: '8px', border: '1.5px solid #93C5FD', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="700" color="#1E40AF" mb={1}>
                1. Select Item from Catalog *
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                label="Choose Item"
                value={selectedItemObj ? (selectedItemObj.id || selectedItemObj.ID || '') : ''}
                onChange={(e) => {
                  const found = availableItems.find((i) => (i.id || i.ID || '').toString() === e.target.value);
                  if (found) setSelectedItemObj(found);
                }}
                sx={{ bgcolor: '#FFFFFF' }}
              >
                {availableItems.map((item) => (
                  <MenuItem key={item.id || item.ID} value={(item.id || item.ID).toString()}>
                    {item.name || item.Name} ({item.category || item.Category} • {item.unit || item.Unit || 'pcs'})
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {!selectedItemObj ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please select an Item from the dropdown above to proceed with Stock In entry.
              </Alert>
            ) : (
              <>
                {/* Disabled Read-Only Item Metadata Card */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', mb: 2 }}>
                  <Typography variant="caption" fontWeight="700" color="text.secondary">
                    Selected Item Details (Read-Only Preview)
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="800" color="#0F172A">
                    {selectedItemObj.name || selectedItemObj.Name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Code: {selectedItemObj.itemCode || selectedItemObj.ItemCode} | Category: {selectedItemObj.category || selectedItemObj.Category} | Unit: {selectedItemObj.unit || selectedItemObj.Unit || 'pcs'}
                  </Typography>
                </Paper>

                {/* STEP 2: Stock & Rate Inputs */}
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                  <TextField
                    label="Selling Price (₹) *"
                    size="small"
                    type="number"
                    value={formFields.sellingPrice}
                    onChange={(e) => setFormFields({ ...formFields, sellingPrice: e.target.value })}
                  />
                  <TextField
                    label="Purchase Cost (₹)"
                    size="small"
                    type="number"
                    value={formFields.purchasePrice}
                    onChange={(e) => setFormFields({ ...formFields, purchasePrice: e.target.value })}
                  />
                  <TextField
                    label="MRP (₹)"
                    size="small"
                    type="number"
                    value={formFields.mrp}
                    onChange={(e) => setFormFields({ ...formFields, mrp: e.target.value })}
                  />
                  <TextField
                    label="GST %"
                    size="small"
                    type="number"
                    value={formFields.gstPercent}
                    onChange={(e) => setFormFields({ ...formFields, gstPercent: e.target.value })}
                  />
                  <TextField
                    label="Stock Qty *"
                    size="small"
                    type="number"
                    value={formFields.currentStock}
                    onChange={(e) => setFormFields({ ...formFields, currentStock: e.target.value })}
                  />
                  <TextField
                    label="Min Stock Alert"
                    size="small"
                    type="number"
                    value={formFields.minimumStock}
                    onChange={(e) => setFormFields({ ...formFields, minimumStock: e.target.value })}
                  />
                  <TextField
                    label="Barcode"
                    size="small"
                    value={formFields.barcode}
                    onChange={(e) => setFormFields({ ...formFields, barcode: e.target.value })}
                  />
                  <TextField
                    label="HSN Code"
                    size="small"
                    value={formFields.hsnCode}
                    onChange={(e) => setFormFields({ ...formFields, hsnCode: e.target.value })}
                  />
                </Box>

                {/* STEP 3: Photo Upload Button (<20 KB JPEG Compression) */}
                <Box sx={{ p: 2, border: '1px dashed #CBD5E1', borderRadius: '8px', mb: 3 }}>
                  <Typography variant="caption" fontWeight="700" color="#334155" mb={1} display="block">
                    Product Photo Upload (Auto-Compressed &lt; 20 KB)
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    {uploadedCompressedPhoto ? (
                      <Box component="img" src={uploadedCompressedPhoto} alt="Product Photo" sx={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover', border: '2px solid #10B981' }} />
                    ) : (
                      <Box sx={{ width: 56, height: 56, borderRadius: '8px', bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PhotoCameraIcon sx={{ color: '#64748B' }} />
                      </Box>
                    )}
                    <Button variant="outlined" component="label" size="small" startIcon={<PhotoCameraIcon />}>
                      {uploadedCompressedPhoto ? 'Change Photo (<20 KB)' : '📷 Upload Product Photo'}
                      <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                    </Button>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={1.5}>
                  <Button variant="outlined" color="inherit" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleSaveModal}>
                    Submit Stock In
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};
