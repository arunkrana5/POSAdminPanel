import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

interface CategoryReportRow {
  category: string;
  itemsSold: number;
  totalRevenue: string;
  profitMargin: string;
  sharePercent: string;
}

export const ReportsPage: React.FC = () => {
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [cashSales, setCashSales] = useState(0);
  const [upiSales, setUpiSales] = useState(0);
  const [udhaarSales, setUdhaarSales] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [categoryRows, setCategoryRows] = useState<CategoryReportRow[]>([]);

  const fetchReportData = useCallback(async (tenantIdOverride?: number) => {
    const tid = tenantIdOverride ?? selectedTenantId;
    setIsLoading(true);
    try {
      const headers = {
        ...getAuthHeaders(),
        'X-Tenant-Id': String(tid),
        ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
      };
      const [metricsRes, catRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/reports/dashboard-metrics?tenantId=${tid}`, { headers }),
        fetch(`${getApiBaseUrl()}/reports/category-summary?tenantId=${tid}`, { headers }),
      ]);

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setTotalRevenue(mData.totalRevenue || 0);
        setCashSales(mData.cashSales || 0);
        setUpiSales(mData.upiSales || 0);
        setUdhaarSales(mData.udhaarSales || 0);
        setTotalInvoices(mData.totalSales || 0);
      }

      if (catRes.ok) {
        const cData = await catRes.json();
        const rawList = Array.isArray(cData) ? cData : (cData?.value || []);
        const rows: CategoryReportRow[] = rawList.map((c: any) => ({
          category: c.category || 'General',
          itemsSold: c.itemsSold || 0,
          totalRevenue: c.revenueFormatted || `₹ ${(c.totalRevenue || 0).toFixed(2)}`,
          profitMargin: c.profitMargin || '15.0%',
          sharePercent: c.sharePercent || '0%',
        }));
        setCategoryRows(rows);
      } else {
        setCategoryRows([]);
      }
    } catch (_) {
      setCategoryRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId, selectedTenantCode]);

  useEffect(() => {
    fetchReportData(selectedTenantId);
  }, [selectedTenantId, fetchReportData]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchReportData(e.detail.tenantId);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchReportData]);

  const cashPercent = totalRevenue > 0 ? Math.round((cashSales / totalRevenue) * 100) : 0;
  const upiPercent = totalRevenue > 0 ? Math.round((upiSales / totalRevenue) * 100) : 0;

  const filtered = categoryRows.filter((c) => c.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const statsItems: StatItem[] = [
    { id: 'rev', title: 'Gross Revenue (Total Sales)', value: `₹ ${totalRevenue.toFixed(2)}`, change: `${totalInvoices} total invoices generated`, changeType: 'positive', icon: <AssessmentIcon />, borderAccentColor: '#2563EB' },
    { id: 'cash_vs_upi', title: 'Cash vs Online Share', value: `${cashPercent}% Cash / ${upiPercent}% UPI`, change: `Cash ₹${cashSales.toFixed(0)} | Online ₹${upiSales.toFixed(0)}`, icon: <PaymentsIcon />, borderAccentColor: '#10B981' },
    { id: 'credit', title: 'Udhaar Credit Extended', value: `₹ ${udhaarSales.toFixed(2)}`, change: 'Tracked in customer ledger', icon: <AccountBalanceWalletIcon />, borderAccentColor: '#D97706' },
  ];

  const columns: ColumnDef<CategoryReportRow>[] = [
    { key: 'category', header: 'Product Category Name', render: (r) => <Typography variant="subtitle2" fontWeight="700" color="#0F172A">{r.category}</Typography> },
    { key: 'itemsSold', header: 'Units Sold', align: 'center' },
    { key: 'totalRevenue', header: 'Category Revenue', render: (r) => <Typography variant="subtitle2" fontWeight="800" color="#0F172A">{r.totalRevenue}</Typography> },
    { key: 'profitMargin', header: 'Est. Profit Margin', render: (r) => <Typography variant="body2" fontWeight="700" color="#059669">{r.profitMargin}</Typography> },
    { key: 'sharePercent', header: 'Sales Contribution', align: 'center' },
  ];

  const handleDownloadCsv = () => {
    let csv = 'Category,Items Sold,Revenue,Profit Margin,Share %\n';
    categoryRows.forEach((r) => {
      csv += `"${r.category}",${r.itemsSold},"${r.totalRevenue}",${r.profitMargin},${r.sharePercent}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales_Report_${selectedTenantName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <TenantFilterBar onTenantChange={(tId) => fetchReportData(tId)} sx={{ mb: 2 }} />

        <PageHeader
          title="Financial Analytics & Revenue Reports (रिपोर्ट्स एवं विश्लेषण)"
          subtitle={`Analytics breakdown for store: ${selectedTenantName} (${selectedTenantCode || 'Store #' + selectedTenantId}). Earnings, category breakdowns, and payment modes.`}
          breadcrumbs={['Home', 'Analytics', 'Financial Reports']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search product category..."
          primaryAction={{
            label: 'Download CSV Report',
            onClick: handleDownloadCsv,
            icon: <DownloadIcon />,
          }}
          secondaryActions={[
            {
              label: 'Print Report',
              onClick: () => window.print(),
              icon: <PrintIcon />,
            },
          ]}
        />

        <StatCardGrid items={statsItems} columns={{ xs: 12, sm: 6, md: 4 }} />

        <Typography variant="h6" fontWeight="800" color="#0F172A" mb={1.5}>
          Category Performance & Revenue Contribution Breakdown
        </Typography>

        <GenericDataTable<CategoryReportRow>
          columns={columns}
          data={filtered}
          keyExtractor={(row) => row.category}
          isLoading={isLoading}
          emptyMessage={`No report data found for ${selectedTenantName}.`}
        />
      </Container>
    </Box>
  );
};
