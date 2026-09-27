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
      const tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('tenantId') || '';
      const tenantCode = localStorage.getItem('tenant_code') || localStorage.getItem('tenantCode') || '';
      const params = new URLSearchParams();
      if (tenantId) params.append('tenantId', tenantId);
      if (tenantCode) params.append('tenantCode', tenantCode);

      const qStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${getApiBaseUrl()}/sales${qStr}`, { headers: getAuthHeaders() });
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

  const handlePrint = (sale: SaleRow) => {
    const printWin = window.open('', '_blank', 'width=850,height=1000');
    if (!printWin) return;

    let itemsRows = '';
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((it, idx) => {
        const name = it.productName || it.name || 'Product Item';
        const qty = it.quantity || it.qty || 1;
        const price = it.unitPrice || it.price || 0;
        const tot = it.totalPrice || (qty * price);
        itemsRows += `
          <tr>
            <td style="text-align: center; font-size: 13px; padding: 10px; border: 1px solid #E2E8F0;">${idx + 1}</td>
            <td style="font-size: 13px; font-weight: 600; padding: 10px; border: 1px solid #E2E8F0;">${name}</td>
            <td style="text-align: center; font-size: 13px; padding: 10px; border: 1px solid #E2E8F0;">${qty}</td>
            <td style="text-align: right; font-size: 13px; padding: 10px; border: 1px solid #E2E8F0;">₹ ${price.toFixed(2)}</td>
            <td style="text-align: right; font-size: 13px; font-weight: 700; padding: 10px; border: 1px solid #E2E8F0;">₹ ${tot.toFixed(2)}</td>
          </tr>
        `;
      });
    } else {
      itemsRows = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 16px; font-size: 13px; color: #64748B;">Total Bill Amount: ₹ ${(sale.totalAmount || 0).toFixed(2)}</td>
        </tr>
      `;
    }

    const isUdhaar = (sale.paymentMode || '').toLowerCase() === 'udhaar';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${sale.id}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #0F172A; margin: 0; padding: 24px; background: #FFFFFF; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #0F172A; border-radius: 8px; padding: 32px; box-sizing: border-box; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .store-brand { font-size: 24px; font-weight: 900; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; }
    .store-sub { font-size: 13px; color: #475569; margin-top: 4px; }
    .invoice-badge { font-size: 24px; font-weight: 900; color: #2563EB; text-align: right; letter-spacing: 1px; }
    .invoice-meta-text { font-size: 13px; color: #334155; text-align: right; margin-top: 4px; }
    .customer-box { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table th { background: #0F172A; color: #FFFFFF; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 12px 10px; border: 1px solid #0F172A; }
    .summary-box { width: 320px; margin-left: auto; margin-bottom: 30px; }
    .summary-table { width: 100%; border-collapse: collapse; }
    .summary-table td { padding: 8px 12px; font-size: 14px; }
    .total-row { font-size: 18px !important; font-weight: 900; color: #16A34A; background: #F0FDF4; border-top: 2px solid #0F172A; border-bottom: 2px solid #0F172A; }
    .footer-note { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="store-brand">VILLAGE POS STORE</div>
          <div class="store-sub">Official Retail Point of Sale & Billing System</div>
        </td>
        <td style="vertical-align: top;">
          <div class="invoice-badge">TAX INVOICE</div>
          <div class="invoice-meta-text"><b>Invoice Ref:</b> <span style="font-family: monospace; font-size: 14px;">${sale.id}</span></div>
          <div class="invoice-meta-text"><b>Date & Time:</b> ${sale.createdAt}</div>
          <div class="invoice-meta-text"><b>Payment Mode:</b> <span style="color: ${isUdhaar ? '#DC2626' : '#16A34A'}; font-weight: bold;">${(sale.paymentMode || 'Cash').toUpperCase()}</span></div>
        </td>
      </tr>
    </table>

    <div class="customer-box">
      <table style="width: 100%;">
        <tr>
          <td>
            <div style="font-size: 11px; color: #64748B; font-weight: 700;">BILL TO (CUSTOMER):</div>
            <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin-top: 4px;">${sale.customerName || 'Walk-in Customer'}</div>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <div style="font-size: 11px; color: #64748B; font-weight: 700;">BILLING STATUS:</div>
            <div style="display: inline-block; padding: 4px 12px; margin-top: 4px; border-radius: 4px; font-size: 12px; font-weight: 800; background: ${isUdhaar ? '#FEE2E2' : '#DCFCE7'}; color: ${isUdhaar ? '#991B1B' : '#166534'};">
              ${isUdhaar ? 'CREDIT / UNPAID' : 'PAID IN FULL'}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="text-align: left;">Product Description</th>
          <th style="width: 60px; text-align: center;">Qty</th>
          <th style="width: 110px; text-align: right;">Unit Price</th>
          <th style="width: 120px; text-align: right;">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-box">
      <table class="summary-table">
        <tr class="total-row">
          <td>NET GRAND TOTAL:</td>
          <td style="text-align: right;">₹ ${(sale.totalAmount || 0).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      <b>Thank you for shopping with us! 🙏</b><br>
      This is an official computer-generated Tax Invoice issued by VillageShop POS System.
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 400);
    };
  </script>
</body>
</html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
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
              <Button variant="contained" startIcon={<PrintIcon />} onClick={() => handlePrint(viewingSale)} sx={{ bgcolor: '#2563EB' }}>
                Print A4 Invoice
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
};
