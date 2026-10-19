import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Alert, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal } from '../components/common/GenericFormModal';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface UdhaarRow {
  id: string;
  customerName: string;
  phone: string;
  village: string;
  outstandingAmount: number;
  dueDate: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
}

export const UdhaarPage: React.FC = () => {
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [udhaarList, setUdhaarList] = useState<UdhaarRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalUdhaarSum, setTotalUdhaarSum] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<UdhaarRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = useCallback(async (tenantIdOverride?: number) => {
    const tid = tenantIdOverride ?? selectedTenantId;
    try {
      const res = await fetch(`${getApiBaseUrl()}/reports/dashboard-metrics?tenantId=${tid}`, {
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(tid),
        },
      });
      if (res.ok) {
        const d = await res.json();
        setTotalUdhaarSum(d.totalUdhaar || 0);
      }
    } catch (_) {}
  }, [selectedTenantId]);

  const fetchUdhaarCustomers = useCallback(async (tenantIdOverride?: number, pageOverride = page, rowsOverride = rowsPerPage, searchOverride = searchQuery) => {
    const tid = tenantIdOverride ?? selectedTenantId;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageOverride + 1),
        pageSize: String(rowsOverride),
        paged: 'true',
        udhaarOnly: 'true',
      });
      if (tid) params.append('tenantId', String(tid));
      if (selectedTenantCode) params.append('tenantCode', selectedTenantCode);
      if (searchOverride.trim()) params.append('search', searchOverride.trim());

      const res = await fetch(`${getApiBaseUrl()}/customers?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          'X-Tenant-Id': String(tid),
          ...(selectedTenantCode ? { 'X-Tenant-Code': selectedTenantCode } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data?.items || []);
        const debtors: UdhaarRow[] = rawList.map((c: any) => ({
          id: `UDH-${c.id}`,
          customerName: c.name,
          phone: c.phone || c.mobile || '',
          village: c.village || 'Rampur',
          outstandingAmount: c.udhaar || c.currentBalance || 0,
          dueDate: c.lastTx || 'End of Month',
          riskLevel: ((c.udhaar || c.currentBalance || 0) > 2000 ? 'HIGH' : (c.udhaar || c.currentBalance || 0) > 1000 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
          status: c.status || 'PENDING_CREDIT',
        }));
        setUdhaarList(debtors);
        setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : debtors.length);
      } else {
        setUdhaarList([]);
        setTotalCount(0);
      }
    } catch (_) {
      setUdhaarList([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId, selectedTenantCode, page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchUdhaarCustomers(selectedTenantId, 0, rowsPerPage, searchQuery);
    fetchMetrics(selectedTenantId);
  }, [selectedTenantId, searchQuery]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchUdhaarCustomers(e.detail.tenantId, 0, rowsPerPage, searchQuery);
        fetchMetrics(e.detail.tenantId);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchUdhaarCustomers, fetchMetrics, rowsPerPage, searchQuery]);

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Market Udhaar Credit', value: `₹ ${totalUdhaarSum.toFixed(2)}`, change: `${totalCount} outstanding accounts`, icon: <AccountBalanceWalletIcon />, borderAccentColor: '#EF4444' },
    { id: 'high_risk', title: 'High Risk / Overdue', value: udhaarList.filter((u) => u.riskLevel === 'HIGH').length, subtitle: 'Requires payment reminder', icon: <WarningAmberIcon />, borderAccentColor: '#D97706' },
    { id: 'avg', title: 'Average Credit Per Customer', value: `₹ ${(totalUdhaarSum / (totalCount || 1)).toFixed(2)}`, subtitle: 'Controlled credit limit', icon: <CheckCircleIcon />, borderAccentColor: '#2563EB' },
  ];

  const columns: ColumnDef<UdhaarRow>[] = [
    {
      key: 'customerName',
      header: 'Debtor Customer & Village',
      render: (r) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
            {r.customerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {r.phone} ({r.village})
          </Typography>
        </Box>
      ),
    },
    {
      key: 'outstandingAmount',
      header: 'Pending Credit (₹)',
      render: (r) => (
        <Typography variant="subtitle2" fontWeight="800" color="#DC2626">
          ₹ {r.outstandingAmount.toFixed(2)}
        </Typography>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Credit Risk Level',
      render: (r) => (
        <Chip
          label={r.riskLevel}
          size="small"
          color={r.riskLevel === 'HIGH' ? 'error' : r.riskLevel === 'MEDIUM' ? 'warning' : 'success'}
          sx={{ fontWeight: 800, height: 20 }}
        />
      ),
    },
    { key: 'dueDate', header: 'Promised Payment Date' },
    { key: 'status', header: 'Status' },
  ];

  const handleRecordPayment = async (values: Record<string, any>) => {
    if (!selectedRecord) return;
    const paid = parseFloat(values.amountPaid) || 0;
    if (paid > 0) {
      const remaining = Math.max(0, selectedRecord.outstandingAmount - paid);
      try {
        const res = await fetch(`${getApiBaseUrl()}/customers/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            'X-Tenant-Id': String(selectedTenantId),
          },
          body: JSON.stringify({
            tenantId: selectedTenantId,
            customerName: selectedRecord.customerName,
            amountPaid: paid,
            remainingUdhaar: remaining,
          }),
        });
        if (res.ok) {
          fetchUdhaarCustomers(selectedTenantId);
        }
      } catch (_) {}
      setAlertMsg(`Collected payment of ₹ ${paid.toFixed(2)} from ${selectedRecord.customerName}.`);
    }
    setSelectedRecord(null);
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <TenantFilterBar onTenantChange={(tId) => fetchUdhaarCustomers(tId)} sx={{ mb: 2 }} />

        <PageHeader
          title="Market Credit & Udhaar Risk Management (उधार खाता)"
          subtitle={`Managing market credit & debtors for: ${selectedTenantName} (${selectedTenantCode || 'Store #' + selectedTenantId}).`}
          breadcrumbs={['Home', 'Ledger', 'Udhaar Risk Portal']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search debtor customer, phone, village..."
        />

        {alertMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        <StatCardGrid items={statsItems} columns={{ xs: 12, sm: 6, md: 4 }} />

        <GenericDataTable<UdhaarRow>
          columns={columns}
          data={udhaarList}
          keyExtractor={(row) => row.id}
          onView={(row) => setSelectedRecord(row)}
          isLoading={isLoading}
          serverSide={true}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchUdhaarCustomers(selectedTenantId, newPage, rowsPerPage, searchQuery);
          }}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
            fetchUdhaarCustomers(selectedTenantId, 0, newRows, searchQuery);
          }}
          emptyMessage={`No pending udhaar credit accounts for ${selectedTenantName}.`}
        />

        {selectedRecord && (
          <GenericFormModal
            open={Boolean(selectedRecord)}
            onClose={() => setSelectedRecord(null)}
            title={`Collect Udhaar Payment - ${selectedRecord.customerName}`}
            fields={[
              { name: 'due', label: 'Total Outstanding Balance (₹)', type: 'number', defaultValue: selectedRecord.outstandingAmount },
              { name: 'amountPaid', label: 'Payment Amount Collected (₹)', type: 'number', required: true, placeholder: 'e.g. 1000' },
            ]}
            onSubmit={handleRecordPayment}
            submitLabel="Record Collection"
          />
        )}
      </Container>
    </Box>
  );
};
