import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, Stack } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import AndroidIcon from '@mui/icons-material/Android';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GetAppIcon from '@mui/icons-material/GetApp';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { useNavigate } from 'react-router-dom';

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
  const [searchQuery, setSearchQuery] = useState('');

  const recentTransactions: TransactionRow[] = [
    { id: 'INV-20260911-001', customer: 'Ramesh Kumar', mobile: '9876543210', village: 'Rampur', amount: '₹ 420.00', mode: 'Cash', status: 'COMPLETED', date: '2026-09-11 11:20 AM' },
    { id: 'INV-20260911-002', customer: 'Suresh Patel', mobile: '9876543211', village: 'Rampur', amount: '₹ 1,250.00', mode: 'Udhaar', status: 'PENDING_CREDIT', date: '2026-09-11 10:45 AM' },
    { id: 'INV-20260911-003', customer: 'Anita Devi', mobile: '9876543212', village: 'Meerut', amount: '₹ 380.00', mode: 'UPI', status: 'COMPLETED', date: '2026-09-11 09:15 AM' },
    { id: 'INV-20260911-004', customer: 'Vikas Verma', mobile: '9988776655', village: 'Kisan Nagar', amount: '₹ 880.00', mode: 'Udhaar', status: 'PENDING_CREDIT', date: '2026-09-10 04:30 PM' },
    { id: 'INV-20260911-005', customer: 'Walk-in Customer', mobile: 'N/A', village: 'Local', amount: '₹ 150.00', mode: 'Cash', status: 'COMPLETED', date: '2026-09-10 02:10 PM' },
  ];

  const filteredTx = recentTransactions.filter(
    (t) =>
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statsItems: StatItem[] = [
    { id: 'sales', title: "Today's Gross Sales", value: '₹ 12,450.00', change: '+18.2% vs yesterday', changeType: 'positive', icon: <ShoppingBagIcon />, borderAccentColor: '#2563EB' },
    { id: 'udhaar', title: 'Outstanding Market Udhaar', value: '₹ 8,200.00', change: '14 active ledgers', changeType: 'neutral', icon: <AccountBalanceWalletIcon />, borderAccentColor: '#D97706' },
    { id: 'stock', title: 'Catalog Items Managed', value: '142 Items', change: '5 low stock alerts', changeType: 'negative', icon: <Inventory2Icon />, borderAccentColor: '#10B981' },
    { id: 'cust', title: 'Registered Customers', value: '88 Clients', change: '+4 registered today', changeType: 'positive', icon: <PeopleAltIcon />, borderAccentColor: '#6366F1' },
  ];

  const columns: ColumnDef<TransactionRow>[] = [
    { key: 'id', header: 'Invoice Ref', render: (r) => <Typography variant="body2" fontFamily="monospace" fontWeight="700" color="#2563EB">{r.id}</Typography> },
    { key: 'customer', header: 'Customer & Mobile', render: (r) => <Box><Typography variant="subtitle2" fontWeight="700">{r.customer}</Typography><Typography variant="caption" color="text.secondary">{r.mobile} ({r.village})</Typography></Box> },
    { key: 'amount', header: 'Total Amount', render: (r) => <Typography variant="subtitle2" fontWeight="800" color="#0F172A">{r.amount}</Typography> },
    { key: 'mode', header: 'Payment Mode', render: (r) => <Chip label={r.mode} size="small" color={r.mode === 'Cash' ? 'success' : r.mode === 'UPI' ? 'info' : 'warning'} sx={{ fontWeight: 800, height: 20 }} /> },
    { key: 'status', header: 'Invoice Status' },
    { key: 'date', header: 'Date & Time' },
  ];

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="SaaS Store Performance & Financial Overview"
          subtitle="Real-time POS revenue streams, market credit ledgers, and invoice transactions across client stores"
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
          Recent Billing Transactions & Invoices Stream
        </Typography>

        <GenericDataTable<TransactionRow>
          columns={columns}
          data={filteredTx}
          keyExtractor={(row) => row.id}
          onView={(row) => alert(`Invoice Ref: ${row.id}\nCustomer: ${row.customer}\nAmount: ${row.amount}`)}
          emptyMessage="No recent transactions found."
        />
      </Container>
    </Box>
  );
};
