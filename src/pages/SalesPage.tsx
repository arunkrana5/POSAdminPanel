import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal } from '../components/common/GenericFormModal';

import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface SaleRow {
  id: string;
  customerName: string;
  totalAmount: number;
  paymentMode: string;
  createdAt: string;
  status: string;
  itemsCount: number;
}

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<SaleRow[]>([
    { id: 'INV-20260911-001', customerName: 'Ramesh Kumar', totalAmount: 420.0, paymentMode: 'Cash', createdAt: '2026-09-11 11:20 AM', status: 'COMPLETED', itemsCount: 3 },
    { id: 'INV-20260911-002', customerName: 'Suresh Patel', totalAmount: 1250.0, paymentMode: 'Udhaar', createdAt: '2026-09-11 10:45 AM', status: 'PENDING_CREDIT', itemsCount: 5 },
    { id: 'INV-20260911-003', customerName: 'Anita Devi', totalAmount: 380.0, paymentMode: 'UPI', createdAt: '2026-09-11 09:15 AM', status: 'COMPLETED', itemsCount: 2 },
    { id: 'INV-20260910-004', customerName: 'Vikas Verma', totalAmount: 880.0, paymentMode: 'Udhaar', createdAt: '2026-09-10 04:30 PM', status: 'PENDING_CREDIT', itemsCount: 4 },
  ]);

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
        if (Array.isArray(data) && data.length > 0) {
          setSales(data);
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filteredSales = sales.filter(
    (s) =>
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
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
          ₹ {r.totalAmount.toFixed(2)}
        </Typography>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Payment Mode',
      render: (r) => (
        <Chip
          label={r.paymentMode}
          size="small"
          color={r.paymentMode === 'Cash' ? 'success' : r.paymentMode === 'UPI' ? 'info' : 'warning'}
          sx={{ fontWeight: 800, height: 20 }}
        />
      ),
    },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Invoice Date' },
  ];

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

        {viewingSale && (
          <GenericFormModal
            open={Boolean(viewingSale)}
            onClose={() => setViewingSale(null)}
            title={`Invoice Details - ${viewingSale.id}`}
            fields={[
              { name: 'id', label: 'Invoice Reference', type: 'text', defaultValue: viewingSale.id },
              { name: 'customerName', label: 'Customer Name', type: 'text', defaultValue: viewingSale.customerName },
              { name: 'totalAmount', label: 'Total Amount (₹)', type: 'number', defaultValue: viewingSale.totalAmount },
              { name: 'paymentMode', label: 'Payment Mode', type: 'text', defaultValue: viewingSale.paymentMode },
              { name: 'createdAt', label: 'Timestamp', type: 'text', defaultValue: viewingSale.createdAt },
            ]}
            onSubmit={() => setViewingSale(null)}
            submitLabel="Close Receipt"
          />
        )}
      </Container>
    </Box>
  );
};
