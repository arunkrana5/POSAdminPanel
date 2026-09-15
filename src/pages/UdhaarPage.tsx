import React, { useState } from 'react';
import { Box, Container, Typography, Alert, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal } from '../components/common/GenericFormModal';
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
  const [udhaarList, setUdhaarList] = useState<UdhaarRow[]>([
    { id: 'UDH-001', customerName: 'Ramesh Kumar', phone: '+91 98765 43210', village: 'Rampur', outstandingAmount: 2400.0, dueDate: '20 Sep 2026', riskLevel: 'HIGH', status: 'PENDING_CREDIT' },
    { id: 'UDH-002', customerName: 'Suresh Patel', phone: '+91 98123 45678', village: 'Rampur', outstandingAmount: 1200.0, dueDate: '25 Sep 2026', riskLevel: 'MEDIUM', status: 'PENDING_CREDIT' },
    { id: 'UDH-003', customerName: 'Vikas Verma', phone: '+91 99887 76655', village: 'Kisan Nagar', outstandingAmount: 880.0, dueDate: '30 Sep 2026', riskLevel: 'LOW', status: 'PENDING_CREDIT' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<UdhaarRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    fetchUdhaarCustomers();
  }, []);

  const fetchUdhaarCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const debtors: UdhaarRow[] = data
            .filter((c: any) => c.udhaar > 0)
            .map((c: any) => ({
              id: `UDH-${c.id}`,
              customerName: c.name,
              phone: c.phone,
              village: c.village || 'Rampur',
              outstandingAmount: c.udhaar,
              dueDate: c.lastTx || 'End of Month',
              riskLevel: (c.udhaar > 2000 ? 'HIGH' : c.udhaar > 1000 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
              status: c.status || 'PENDING_CREDIT',
            }));
          if (debtors.length > 0) {
            setUdhaarList(debtors);
          }
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filtered = udhaarList.filter(
    (u) =>
      u.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = udhaarList.reduce((sum, u) => sum + u.outstandingAmount, 0);

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Market Udhaar Credit', value: `₹ ${totalOutstanding.toFixed(2)}`, change: `${udhaarList.length} outstanding accounts`, icon: <AccountBalanceWalletIcon />, borderAccentColor: '#EF4444' },
    { id: 'high_risk', title: 'High Risk / Overdue', value: udhaarList.filter((u) => u.riskLevel === 'HIGH').length, subtitle: 'Requires payment reminder', icon: <WarningAmberIcon />, borderAccentColor: '#D97706' },
    { id: 'avg', title: 'Average Credit Per Customer', value: `₹ ${(totalOutstanding / (udhaarList.length || 1)).toFixed(2)}`, subtitle: 'Controlled credit limit', icon: <CheckCircleIcon />, borderAccentColor: '#2563EB' },
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
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            customerName: selectedRecord.customerName,
            amountPaid: paid,
            remainingUdhaar: remaining,
          }),
        });
        if (res.ok) {
          fetchUdhaarCustomers();
        }
      } catch (_) {}
      setAlertMsg(`Collected payment of ₹ ${paid.toFixed(2)} from ${selectedRecord.customerName}.`);
    }
    setSelectedRecord(null);
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Market Credit & Udhaar Risk Management"
          subtitle="Track outstanding market credit, payment promises, risk scores, and collection records"
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
          data={filtered}
          keyExtractor={(row) => row.id}
          onView={(row) => setSelectedRecord(row)}
          isLoading={isLoading}
          emptyMessage="No pending udhaar credit accounts."
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
