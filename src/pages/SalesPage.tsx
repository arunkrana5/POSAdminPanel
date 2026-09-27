import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface SaleRow {
  id: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMode: string;
  createdAt: string;
  status: string;
  itemsCount: number;
  items?: Array<{ productName?: string; name?: string; quantity?: number; qty?: number; unitPrice?: number; price?: number; totalPrice?: number }>;
}

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewingSale, setViewingSale] = useState<SaleRow | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/sales`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSales(data);
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filteredSales = sales.filter(
    (s) =>
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.paymentMode && s.paymentMode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const cashSales = sales.filter((s) => s.paymentMode === 'Cash').reduce((sum, s) => sum + s.totalAmount, 0);
  const udhaarSales = sales.filter((s) => s.paymentMode === 'Udhaar').reduce((sum, s) => sum + s.totalAmount, 0);

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Sales Revenue', value: `₹ ${totalRevenue.toFixed(2)}`, change: `${sales.length} invoices generated`, icon: <ShoppingBagIcon />, borderAccentColor: '#2563EB' },
    { id: 'cash', title: 'Cash Collections', value: `₹ ${cashSales.toFixed(2)}`, change: 'Liquid cash in counter', icon: <PaymentsIcon />, borderAccentColor: '#10B981' },
    { id: 'udhaar', title: 'Udhaar / Credit Sales', value: `₹ ${udhaarSales.toFixed(2)}`, change: 'Added to customer ledger', icon: <AccountBalanceWalletIcon />, borderAccentColor: '#D97706' },
  ];

  const columns: ColumnDef<SaleRow>[] = [
    {
      key: 'id',
      header: 'Invoice No.',
      render: (r) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight="700" color="#2563EB">
          {r.id}
        </Typography>
      ),
    },
    { key: 'customerName', header: 'Customer Name' },
    {
      key: 'totalAmount',
      header: 'Bill Amount (₹)',
      render: (r) => (
        <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
          ₹ {(r.totalAmount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Payment Mode',
      render: (r) => (
        <Chip
          label={r.paymentMode || 'Cash'}
          size="small"
          color={r.paymentMode === 'Cash' ? 'success' : r.paymentMode === 'UPI' ? 'info' : 'warning'}
          sx={{ fontWeight: 800, height: 20 }}
        />
      ),
    },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Invoice Date' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Sales & Invoicing Transaction History"
          subtitle="Audit all billing receipts, payment mode breakdowns, and customer purchases"
          breadcrumbs={['Home', 'Billing', 'Sales Transactions']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search customer, invoice ref, payment mode..."
        />

        <StatCardGrid items={statsItems} columns={{ xs: 12, sm: 6, md: 4 }} />

        <GenericDataTable<SaleRow>
          columns={columns}
          data={filteredSales}
          keyExtractor={(row) => row.id}
          onView={(row) => setViewingSale(row)}
          isLoading={isLoading}
          emptyMessage="No sales transactions found."
        />

        {/* Detailed Tax Invoice Modal with Close 'X' Cut Icon & Print A4 */}
        {viewingSale && (
          <Dialog open={Boolean(viewingSale)} onClose={() => setViewingSale(null)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1E293B', color: '#FFFFFF' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <ReceiptLongIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Tax Invoice Receipt - {viewingSale.id}
                </Typography>
              </Box>
              <IconButton onClick={() => setViewingSale(null)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Store & Customer Info Header */}
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="800" color="#0F172A">
                    VILLAGE POS STORE
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Official Tax Invoice & Sales Receipt
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="subtitle2" fontFamily="monospace" fontWeight="bold" color="#2563EB">
                    {viewingSale.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Date: {viewingSale.createdAt}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" bgcolor="#F1F5F9" p={1.5} borderRadius={2} mb={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CUSTOMER DETAILS
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {viewingSale.customerName || 'Walk-in Customer'}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">
                    PAYMENT METHOD
                  </Typography>
                  <Box>
                    <Chip label={viewingSale.paymentMode || 'Cash'} size="small" color={viewingSale.paymentMode === 'Udhaar' ? 'warning' : 'success'} sx={{ fontWeight: 800 }} />
                  </Box>
                </Box>
              </Box>

              {/* Itemized Table */}
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Purchased Items Line Breakdown:
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell><strong>Item Description</strong></TableCell>
                      <TableCell align="center"><strong>Qty</strong></TableCell>
                      <TableCell align="right"><strong>Unit Rate (₹)</strong></TableCell>
                      <TableCell align="right"><strong>Line Total (₹)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewingSale.items && viewingSale.items.length > 0 ? (
                      viewingSale.items.map((item, idx) => {
                        const name = item.productName || item.name || 'Product';
                        const qty = item.quantity || item.qty || 1;
                        const price = item.unitPrice || item.price || 0;
                        const tot = item.totalPrice || (qty * price);
                        return (
                          <TableRow key={idx}>
                            <TableCell>{name}</TableCell>
                            <TableCell align="center">{qty}</TableCell>
                            <TableCell align="right">₹ {price.toFixed(2)}</TableCell>
                            <TableCell align="right"><strong>₹ {tot.toFixed(2)}</strong></TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="caption" color="text.secondary">Total Bill Amount: ₹ {viewingSale.totalAmount.toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">
                    NET GRAND TOTAL
                  </Typography>
                  <Typography variant="h5" fontWeight="900" color="#10B981">
                    ₹ {(viewingSale.totalAmount || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
              <Button variant="outlined" color="inherit" onClick={() => setViewingSale(null)}>
                Close
              </Button>
              <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: '#2563EB' }}>
                Print A4 Invoice
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
};
