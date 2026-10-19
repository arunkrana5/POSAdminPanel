import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Chip, Alert, MenuItem, TextField, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';
import { PaginatedServerSelect } from '../components/common/PaginatedServerSelect';

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

export const StockPage: React.FC = () => {
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

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

  const [openQuickItemModal, setOpenQuickItemModal] = useState(false);
  const [quickItemForm, setQuickItemForm] = useState({
    itemCode: `ITM-${1000 + Math.floor(Math.random() * 8999)}`,
    name: '',
    category: 'Groceries',
    unit: 'pcs',
    format: 'Packed',
  });

  const fetchProducts = useCallback(async (tenantIdOverride?: number, pageOverride = page, rowsOverride = rowsPerPage, searchOverride = searchQuery) => {
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

      const res = await fetch(`${getApiBaseUrl()}/Stock?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(tid),
          ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
        },
      });
      if (res && res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.items || []);
        setProducts(list.map((p: any) => ({
          ...p,
          status: (p.currentStock ?? 0) > 0 ? 'ACTIVE' : 'INACTIVE',
          expiryDate: p.expiryDate ? String(p.expiryDate).split('T')[0] : '',
        })));
        setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : list.length);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (_) {
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId, selectedTenantCode, page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchProducts(selectedTenantId, 0, rowsPerPage, searchQuery);
  }, [selectedTenantId, searchQuery]);


  const handleQuickCreateItem = async () => {
    if (!quickItemForm.name.trim()) return;
    const payload = {
      tenantId: selectedTenantId,
      tenantCode: selectedTenantCode,
      itemCode: quickItemForm.itemCode,
      name: quickItemForm.name.trim(),
      itemName: quickItemForm.name.trim(),
      category: quickItemForm.category.trim(),
      unit: quickItemForm.unit.trim(),
      format: quickItemForm.format,
      description: 'Quick Item created in Stock In',
    };
    let createdItem: any = { id: Date.now(), ...payload };
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
        const data = await res.json();
        createdItem = { ...createdItem, id: data.id || data.ID || createdItem.id };
      }
    } catch (_) {}

    setSelectedItemObj(createdItem);
    setOpenQuickItemModal(false);
    setQuickItemForm({
      itemCode: `ITM-${1000 + Math.floor(Math.random() * 8999)}`,
      name: '',
      category: 'Groceries',
      unit: 'pcs',
      format: 'Packed',
    });
  };

  useEffect(() => {
    fetchProducts(selectedTenantId);
  }, [selectedTenantId, fetchProducts]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchProducts(e.detail.tenantId);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchProducts]);

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
    if (!window.confirm(`Are you sure you want to delete stock entry for "${product.name}"?`)) return;
    try {
      await fetch(`${getApiBaseUrl()}/Stock/${product.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(selectedTenantId),
        },
      });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setAlertMsg(`Stock item "${product.name}" deleted successfully.`);
    } catch (_) {
      setAlertMsg(`Failed to delete stock item "${product.name}".`);
    }
  };

  const handleSaveModal = async () => {
    if (!selectedItemObj || !formFields.sellingPrice) return;

    const payload = {
      tenantId: selectedTenantId,
      tenantCode: selectedTenantCode,
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
      const res = await fetch(`${getApiBaseUrl()}/Stock`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
          'X-Tenant-Id': String(selectedTenantId),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchProducts(selectedTenantId);
        setAlertMsg(`Stock In submitted successfully for ${payload.name} (${selectedTenantName}).`);
      }
    } catch (_) {}

    setOpenModal(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ pt: 2, pb: 6 }}>
        <TenantFilterBar onTenantChange={(tId) => fetchProducts(tId)} sx={{ mb: 2 }} />

        <PageHeader
          title="Stock In Directory (स्टॉक प्रबंधन)"
          subtitle={`Managing stock & inventory for store: ${selectedTenantName} (${selectedTenantCode || 'Store #' + selectedTenantId}). Set stock rates, quantities, barcode & photos.`}
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
            data={products}
            columns={columns}
            keyExtractor={(r) => r.id.toString()}
            onDelete={handleDelete}
            isLoading={isLoading}
            serverSide={true}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchProducts(selectedTenantId, newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(newRows) => {
              setRowsPerPage(newRows);
              setPage(0);
              fetchProducts(selectedTenantId, 0, newRows);
            }}
            emptyMessage={`No stock inventory entries found for ${selectedTenantName}. Click "Stock In Entry" above to add inventory.`}
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight="700" color="#1E40AF">
                  1. Select Item from Catalog (Server Paginated) *
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenQuickItemModal(true)}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', py: 0.5 }}
                >
                  + Create New Item
                </Button>
              </Box>

              <PaginatedServerSelect
                label="Choose Item"
                value={selectedItemObj ? (selectedItemObj.id || selectedItemObj.ID || '') : ''}
                selectedDisplayLabel={selectedItemObj ? `${selectedItemObj.name || selectedItemObj.Name} (${selectedItemObj.category || selectedItemObj.Category || 'General'} • ${selectedItemObj.unit || selectedItemObj.Unit || 'pcs'})` : undefined}
                onChange={(_, item) => {
                  setSelectedItemObj(item || null);
                }}
                fetchOptions={async ({ page, pageSize, search }) => {
                  const params = new URLSearchParams({
                    page: String(page),
                    pageSize: String(pageSize),
                    paged: 'true',
                    tenantId: String(selectedTenantId),
                  });
                  if (search.trim()) params.append('search', search.trim());
                  const res = await fetch(`${getApiBaseUrl()}/Items?${params.toString()}`, {
                    headers: { ...getAuthHeaders(), 'X-Tenant-Id': String(selectedTenantId) },
                  });
                  if (res.ok) {
                    const data = await res.json();
                    return {
                      items: Array.isArray(data) ? data : (data?.items || []),
                      hasMore: data?.hasMore || false,
                      totalCount: data?.totalCount || 0,
                    };
                  }
                  return { items: [], hasMore: false, totalCount: 0 };
                }}
                itemLabel={(i) => `${i.name || i.Name}`}
                itemValue={(i) => (i.id || i.ID).toString()}
                itemSubtitle={(i) => `${i.itemCode || ''} • ${i.category || i.Category || 'General'} • ${i.unit || i.Unit || 'pcs'}`}
              />
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

      {/* Quick Item Creation Modal */}
      <Dialog open={openQuickItemModal} onClose={() => setOpenQuickItemModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>+ Create New Catalog Item</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Item Code"
              size="small"
              fullWidth
              value={quickItemForm.itemCode}
              onChange={(e) => setQuickItemForm({ ...quickItemForm, itemCode: e.target.value })}
            />
            <TextField
              label="Item Name *"
              size="small"
              fullWidth
              required
              value={quickItemForm.name}
              onChange={(e) => setQuickItemForm({ ...quickItemForm, name: e.target.value })}
            />
            <TextField
              label="Category"
              size="small"
              fullWidth
              value={quickItemForm.category}
              onChange={(e) => setQuickItemForm({ ...quickItemForm, category: e.target.value })}
            />
            <TextField
              label="Unit of Measurement (UOM)"
              size="small"
              fullWidth
              placeholder="e.g. kg, pkt, bottle, pcs"
              value={quickItemForm.unit}
              onChange={(e) => setQuickItemForm({ ...quickItemForm, unit: e.target.value })}
            />
            <TextField
              select
              label="Format"
              size="small"
              fullWidth
              value={quickItemForm.format}
              onChange={(e) => setQuickItemForm({ ...quickItemForm, format: e.target.value })}
            >
              <MenuItem value="Packed">Packed Item</MenuItem>
              <MenuItem value="Loose">Loose / Adjustable Item</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenQuickItemModal(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleQuickCreateItem} variant="contained" color="primary" disabled={!quickItemForm.name.trim()}>
            Save & Select Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
