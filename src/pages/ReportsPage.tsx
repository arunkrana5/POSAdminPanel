import React, { useState } from 'react';
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

interface CategoryReportRow {
  category: string;
  itemsSold: number;
  totalRevenue: string;
  profitMargin: string;
  sharePercent: string;
}

export const ReportsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categoryData: CategoryReportRow[] = [
    { category: 'Groceries & Staples', itemsSold: 420, totalRevenue: '₹ 45,200.00', profitMargin: '14.5%', sharePercent: '42%' },
    { category: 'Edible Oils & Ghee', itemsSold: 180, totalRevenue: '₹ 28,400.00', profitMargin: '11.2%', sharePercent: '26%' },
    { category: 'Detergents & Soaps', itemsSold: 110, totalRevenue: '₹ 14,300.00', profitMargin: '18.0%', sharePercent: '13%' },
    { category: 'Spices & Condiments', itemsSold: 95, totalRevenue: '₹ 9,800.00', profitMargin: '22.5%', sharePercent: '9%' },
    { category: 'General Merchandise', itemsSold: 150, totalRevenue: '₹ 11,250.00', profitMargin: '16.0%', sharePercent: '10%' },
  ];

  const filtered = categoryData.filter((c) => c.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const statsItems: StatItem[] = [
    { id: 'rev', title: 'Monthly Gross Revenue', value: '₹ 1,08,950.00', change: '+24.5% vs last month', changeType: 'positive', icon: <AssessmentIcon />, borderAccentColor: '#2563EB' },
    { id: 'cash_vs_upi', title: 'Cash vs UPI Online Share', value: '72% Cash / 28% UPI', change: 'Digital adoption growing', icon: <PaymentsIcon />, borderAccentColor: '#10B981' },
    { id: 'credit', title: 'Udhaar Recovery Rate', value: '88.4%', change: 'High collection efficiency', icon: <AccountBalanceWalletIcon />, borderAccentColor: '#D97706' },
  ];

  const columns: ColumnDef<CategoryReportRow>[] = [
    { key: 'category', header: 'Product Category Name', render: (r) => <Typography variant="subtitle2" fontWeight="700" color="#0F172A">{r.category}</Typography> },
    { key: 'itemsSold', header: 'Units Sold', align: 'center' },
    { key: 'totalRevenue', header: 'Category Revenue', render: (r) => <Typography variant="subtitle2" fontWeight="800" color="#0F172A">{r.totalRevenue}</Typography> },
    { key: 'profitMargin', header: 'Est. Profit Margin', render: (r) => <Typography variant="body2" fontWeight="700" color="#059669">{r.profitMargin}</Typography> },
    { key: 'sharePercent', header: 'Sales Contribution', align: 'center' },
  ];

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Financial Analytics & Revenue Performance Reports"
          subtitle="Comprehensive store earnings, category breakdowns, profit margins, and payment mode analytics"
          breadcrumbs={['Home', 'Analytics', 'Financial Reports']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search product category..."
          primaryAction={{
            label: 'Download Full PDF Report',
            onClick: () => alert('Generating full PDF report...'),
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
          emptyMessage="No report data found."
        />
      </Container>
    </Box>
  );
};
