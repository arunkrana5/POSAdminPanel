import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, Stack } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import AndroidIcon from '@mui/icons-material/Android';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GetAppIcon from '@mui/icons-material/GetApp';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface TransactionRow {
  id: string;
  customer: string;
  mobile: string;
  village: string;
  amount: string;
  mode: string;
  status: string;
  date: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [totalSales, setTotalSales] = useState(0);
  const [totalUdhaar, setTotalUdhaar] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRow[]>([]);

  const fetchDashboardMetrics = useCallback(async (tenantIdOverride?: number) => {
    const tid = tenantIdOverride ?? selectedTenantId;
    setIsLoading(true);
    try {
      // 1. Primary: Fast SQL Server aggregated endpoint
      const metricsRes = await apiClient.get(`/reports/dashboard-metrics?tenantId=${tid}`);
      if (metricsRes.data) {
        const d = metricsRes.data;
        setTotalSales(d.totalRevenue || 0);
        setTotalUdhaar(d.totalUdhaar || 0);
        setProductCount(d.totalProducts || 0);
        setCustomerCount(d.totalCustomers || 0);
        if (Array.isArray(d.recentSales)) {
          setRecentTransactions(d.recentSales.map((s: any) => ({
            id: s.invoiceNumber,
            customer: s.customerName || 'Customer',
            mobile: s.customerPhone || 'N/A',
            village: 'Store',
            amount: `₹ ${(s.totalAmount || 0).toFixed(2)}`,
            mode: s.paymentMode || 'Cash',
            status: s.status || 'COMPLETED',
            date: s.createdAt || 'Recent',
          })));
        }
        setIsLoading(false);
        return;
      }
    } catch (_) {
      // Fallback to legacy individual requests if needed
      try {
        const [salesRes, custRes, stockRes] = await Promise.all([
          apiClient.get(`/sales?tenantId=${tid}&page=1&pageSize=10&paged=true`),
          apiClient.get(`/customers?tenantId=${tid}&page=1&pageSize=10&paged=true`),
          apiClient.get(`/Stock?tenantId=${tid}&page=1&pageSize=10&paged=true`),
        ]);

        let salesSum = 0;
        let txRows: TransactionRow[] = [];
        if (salesRes.data) {
          const salesList = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.items || []);
          salesList.forEach((s: any) => { salesSum += (s.totalAmount || 0); });
          txRows = salesList.slice(0, 10).map((s: any) => ({
            id: s.id || `INV-${s.dbId}`,
            customer: s.customerName || 'Walk-in Customer',
            mobile: s.customerPhone || 'N/A',
            village: 'Store',
            amount: `₹ ${(s.totalAmount || 0).toFixed(2)}`,
            mode: s.paymentMode || 'Cash',
            status: s.status || 'COMPLETED',
            date: s.createdAt || 'Recent',
          }));
        }

        let udhaarSum = 0;
        let custTotal = 0;
        if (custRes.data) {
          const custs = Array.isArray(custRes.data) ? custRes.data : (custRes.data.items || []);
          custTotal = custRes.data.totalCount || custs.length;
          custs.forEach((c: any) => { udhaarSum += (c.udhaar || c.currentBalance || 0); });
        }

        let prodTotal = 0;
        if (stockRes.data) {
          prodTotal = stockRes.data.totalCount || (Array.isArray(stockRes.data) ? stockRes.data.length : (stockRes.data.items?.length || 0));
        }

        setTotalSales(salesSum);
        setTotalUdhaar(udhaarSum);
        setProductCount(prodTotal);
        setCustomerCount(custTotal);
        setRecentTransactions(txRows);
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId]);


  useEffect(() => {
    fetchDashboardMetrics(selectedTenantId);
  }, [selectedTenantId, fetchDashboardMetrics]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchDashboardMetrics(e.detail.tenantId);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchDashboardMetrics]);

  const filteredTx = recentTransactions.filter(
    (t) =>
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statsItems: StatItem[] = [
    { id: 'sales', title: "Live Gross Sales", value: `₹ ${totalSales.toFixed(2)}`, change: `Store #${selectedTenantId}`, changeType: 'positive', icon: <ShoppingBagIcon />, borderAccentColor: '#2563EB' },
    { id: 'udhaar', title: 'Market Udhaar Dues', value: `₹ ${totalUdhaar.toFixed(2)}`, change: 'Live Ledger Balance', changeType: 'neutral', icon: <AccountBalanceWalletIcon />, borderAccentColor: '#D97706' },
    { id: 'stock', title: 'Inventory Stock SKUs', value: `${productCount} Items`, change: 'Active Stock In Items', changeType: 'positive', icon: <Inventory2Icon />, borderAccentColor: '#10B981' },
    { id: 'cust', title: 'Registered Customers', value: `${customerCount} Clients`, change: 'Active Customer Directory', changeType: 'positive', icon: <PeopleAltIcon />, borderAccentColor: '#6366F1' },
  ];

  const columns: ColumnDef<TransactionRow>[] = [
    { key: 'id', header: 'Invoice Ref', render: (r) => <Typography variant="body2" fontFamily="monospace" fontWeight="700" color="#2563EB">{r.id}</Typography> },
    { key: 'customer', header: 'Customer Name', render: (r) => <Typography variant="subtitle2" fontWeight="700">{r.customer}</Typography> },
    { key: 'amount', header: 'Total Amount', render: (r) => <Typography variant="subtitle2" fontWeight="800" color="#0F172A">{r.amount}</Typography> },
    { key: 'mode', header: 'Payment Mode', render: (r) => <Chip label={r.mode} size="small" color={r.mode === 'Cash' ? 'success' : r.mode === 'UPI' ? 'info' : 'warning'} sx={{ fontWeight: 800, height: 20 }} /> },
    { key: 'status', header: 'Invoice Status' },
    { key: 'date', header: 'Date & Time' },
  ];

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <TenantFilterBar onTenantChange={(tId) => fetchDashboardMetrics(tId)} sx={{ mb: 2 }} />

        <PageHeader
          title="SaaS Store Performance & Financial Overview"
          subtitle={`Real-time overview for: ${selectedTenantName} (${selectedTenantCode || 'Store #' + selectedTenantId}). POS sales, market credit ledgers, and inventory.`}
          breadcrumbs={['Home', 'SaaS Control Center', 'Dashboard']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search invoices or customers..."
          primaryAction={{
            label: 'New POS Sale',
            onClick: () => navigate('/sales'),
            icon: <AddIcon />,
          }}
          secondaryActions={[
            {
              label: 'Masters (मास्टर डेटा)',
              onClick: () => navigate('/masters'),
              icon: <CategoryIcon />,
            },
            {
              label: 'Export CSV',
              onClick: () => alert('Exporting dashboard metrics to CSV...'),
              icon: <DownloadIcon />,
            },
          ]}
        />

        <StatCardGrid items={statsItems} />

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AndroidIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="800">
                VillageShop Android Mobile App (.apk)
              </Typography>
              <Typography variant="body2" color="#94A3B8">
                Direct Cloud APK download & WhatsApp sharing for store staff & field operators
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                '📱 *VillageShop POS App Download*\n\nDownload the latest VillageShop Android App to manage store billing, inventory, and Udhaar ledgers:\n\nhttps://villageshop-api.onrender.com/VillageShop.apk'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                backgroundColor: '#25D366',
                '&:hover': { backgroundColor: '#1EBE5D' },
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Share App on WhatsApp
            </Button>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              href="https://villageshop-api.onrender.com/VillageShop.apk"
              target="_blank"
              download="VillageShop.apk"
              sx={{
                backgroundColor: '#2563EB',
                '&:hover': { backgroundColor: '#1D4ED8' },
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Download APK (17.5 MB)
            </Button>
          </Stack>
        </Paper>

        <Typography variant="h6" fontWeight="800" color="#0F172A" mb={1.5}>
          Recent Billing Transactions & Invoices Stream (Live Database)
        </Typography>

        <GenericDataTable<TransactionRow>
          columns={columns}
          data={filteredTx}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          onView={(row) => alert(`Invoice Ref: ${row.id}\nCustomer: ${row.customer}\nAmount: ${row.amount}`)}
          emptyMessage={`No recent transactions found for ${selectedTenantName}.`}
        />
      </Container>
    </Box>
  );
};
