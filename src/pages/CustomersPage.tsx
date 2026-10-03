import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { StatCardGrid, StatItem } from '../components/common/StatCardGrid';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal, FormFieldDef } from '../components/common/GenericFormModal';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  village: string;
  udhaar: number;
  lastTx: string;
  status?: string;
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([
    { id: '1', name: 'Ramesh Kumar', phone: '+91 98765 43210', village: 'Rampur', udhaar: 2400.0, lastTx: '12 Sep 2026', status: 'PENDING_CREDIT' },
    { id: '2', name: 'Suresh Patel', phone: '+91 98123 45678', village: 'Rampur', udhaar: 1200.0, lastTx: '11 Sep 2026', status: 'PENDING_CREDIT' },
    { id: '3', name: 'Anita Sharma', phone: '+91 97654 32109', village: 'Meerut', udhaar: 0.0, lastTx: '10 Sep 2026', status: 'COMPLETED' },
    { id: '4', name: 'Vikas Verma', phone: '+91 99887 76655', village: 'Kisan Nagar', udhaar: 880.0, lastTx: '09 Sep 2026', status: 'PENDING_CREDIT' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null);

  // Payment Modal
  const [paymentCustomer, setPaymentCustomer] = useState<CustomerRow | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('tenantId') || '';
      const tenantCode = localStorage.getItem('tenant_code') || localStorage.getItem('tenantCode') || '';
      const params = new URLSearchParams();
      if (tenantId) params.append('tenantId', tenantId);
      if (tenantCode) params.append('tenantCode', tenantCode);

      const qStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${getApiBaseUrl()}/customers${qStr}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomers(data);
        }
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.village && c.village.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUdhaar = customers.reduce((sum, c) => sum + c.udhaar, 0);
  const zeroBalanceCount = customers.filter((c) => c.udhaar === 0).length;

  const statsItems: StatItem[] = [
    { id: 'total', title: 'Total Registered Customers', value: customers.length, change: '100% active accounts', icon: <PeopleAltIcon />, borderAccentColor: '#2563EB' },
    { id: 'udhaar', title: 'Total Outstanding Udhaar', value: `₹ ${totalUdhaar.toFixed(2)}`, change: `${customers.length - zeroBalanceCount} active debtors`, icon: <AccountBalanceWalletIcon />, borderAccentColor: '#EF4444' },
    { id: 'clear', title: 'Clear Balance Accounts', value: zeroBalanceCount, subtitle: 'Zero outstanding dues', icon: <CheckCircleIcon />, borderAccentColor: '#10B981' },
  ];

  const columns: ColumnDef<CustomerRow>[] = [
    {
      key: 'name',
      header: 'Customer Name & Village',
      render: (r) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
            {r.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Village: {r.village || 'Rampur'}
          </Typography>
        </Box>
      ),
    },
    { key: 'phone', header: 'Phone Number' },
    {
      key: 'udhaar',
      header: 'Outstanding Balance (₹)',
      render: (r) => (
        <Typography
          variant="subtitle2"
          fontWeight="800"
          color={r.udhaar > 0 ? '#DC2626' : '#059669'}
        >
          ₹ {r.udhaar.toFixed(2)}
        </Typography>
      ),
    },
    { key: 'status', header: 'Account Status' },
    { key: 'lastTx', header: 'Last Activity' },
  ];

  const modalFields: FormFieldDef[] = [
    { name: 'name', label: 'Customer Name (ग्राहक नाम)', type: 'text', required: true },
    { name: 'phone', label: 'Mobile Phone Number', type: 'text', required: true, placeholder: '+91 98765 43210' },
    { name: 'village', label: 'Village / Address', type: 'text', placeholder: 'e.g. Rampur' },
  ];

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (c: CustomerRow) => {
    setEditingCustomer(c);
    setOpenModal(true);
  };

  const handleDelete = async (c: CustomerRow) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${c.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (_) {}
    setCustomers(customers.filter((item) => item.id !== c.id));
    setAlertMsg(`Customer account ${c.name} deleted.`);
  };

  const handleSaveModal = async (formValues: Record<string, any>) => {
    const payload = {
      name: formValues.name,
      phone: formValues.phone,
      village: formValues.village || 'Rampur',
    };

    if (editingCustomer) {
      try {
        const res = await fetch(`${getApiBaseUrl()}/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchCustomers();
        }
      } catch (_) {}
      setAlertMsg(`Updated ${formValues.name} successfully.`);
    } else {
      try {
        const res = await fetch(`${getApiBaseUrl()}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchCustomers();
        }
      } catch (_) {}

      setAlertMsg(`Registered new customer ${formValues.name}!`);
    }
    setOpenModal(false);
  };

  const handleRecordPaymentSubmit = async (values: Record<string, any>) => {
    if (!paymentCustomer) return;
    const paidAmount = parseFloat(values.amountPaid) || 0;
    if (paidAmount > 0) {
      const newUdhaar = Math.max(0, paymentCustomer.udhaar - paidAmount);
      try {
        const res = await fetch(`${getApiBaseUrl()}/customers/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ customerName: paymentCustomer.name, amountPaid: paidAmount, remainingUdhaar: newUdhaar }),
        });
        if (res.ok) {
          fetchCustomers();
        }
      } catch (_) {}

      setAlertMsg(`Recorded payment of ₹ ${paidAmount.toFixed(2)} for ${paymentCustomer.name}. Remaining udhaar: ₹ ${newUdhaar.toFixed(2)}.`);
    }
    setPaymentCustomer(null);
  };

    // Ledger View Modal
  const [ledgerCustomer, setLedgerCustomer] = useState<CustomerRow | null>(null);
  const [ledgerTransactions, setLedgerTransactions] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  const handleOpenLedger = async (c: CustomerRow) => {
    setLedgerCustomer(c);
    setIsLoadingLedger(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${c.id || c.name}/ledger`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLedgerTransactions(data.transactions || []);
      }
    } catch (_) {}
    setIsLoadingLedger(false);
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Customer Directory & Udhaar Ledger System"
          subtitle="Manage customer contact directory, outstanding credit balances, and payment collections"
          breadcrumbs={['Home', 'Ledger', 'Customer Directory']}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search customer name, phone, village..."
          primaryAction={{
            label: 'Add New Customer',
            onClick: handleOpenAdd,
            icon: <AddIcon />,
          }}
        />

        {alertMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        <StatCardGrid items={statsItems} columns={{ xs: 12, sm: 6, md: 4 }} />

        <GenericDataTable<CustomerRow>
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(row) => row.id}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onView={(row) => handleOpenLedger(row)}
          isLoading={isLoading}
          emptyMessage="No customers found in directory."
        />

        <GenericFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={editingCustomer ? `Edit Customer - ${editingCustomer.name}` : 'Register New Customer'}
          fields={modalFields}
          initialValues={editingCustomer || {}}
          onSubmit={handleSaveModal}
          submitLabel={editingCustomer ? 'Save Customer' : 'Register Customer'}
        />

        {paymentCustomer && (
          <GenericFormModal
            open={Boolean(paymentCustomer)}
            onClose={() => setPaymentCustomer(null)}
            title={`Record Payment - ${paymentCustomer.name}`}
            fields={[
              { name: 'currentBalance', label: 'Current Outstanding Dues (₹)', type: 'number', defaultValue: paymentCustomer.udhaar },
              { name: 'amountPaid', label: 'Amount Received (₹)', type: 'number', required: true, placeholder: 'e.g. 500' },
            ]}
            onSubmit={handleRecordPaymentSubmit}
            submitLabel="Save Payment"
          />
        )}

        {/* Date-wise Udhaar Ledger Statement Modal */}
        {ledgerCustomer && (
          <React.Fragment>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  maxWidth: '850px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  p: 3,
                  boxShadow: 24,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="800" color="#0F172A">
                    Udhaar Ledger Statement - {ledgerCustomer.name}
                  </Typography>
                  <button
                    onClick={() => setLedgerCustomer(null)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
                  >
                    ✕
                  </button>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Phone: <strong>{ledgerCustomer.phone}</strong> | Village: <strong>{ledgerCustomer.village}</strong> | Current Balance: <span style={{ color: '#DC2626', fontWeight: 800 }}>₹ {ledgerCustomer.udhaar.toFixed(2)}</span>
                </Typography>

                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <button
                    onClick={() => {
                      const cust = ledgerCustomer;
                      setLedgerCustomer(null);
                      setPaymentCustomer(cust);
                    }}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    + Record Payment
                  </button>
                </Box>

                {isLoadingLedger ? (
                  <Typography variant="body2" color="text.secondary" align="center" py={4}>
                    Loading date-wise transactions...
                  </Typography>
                ) : ledgerTransactions.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: '8px' }}>
                    No date-wise ledger transactions found for this customer.
                  </Alert>
                ) : (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'left', height: '40px' }}>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>Date & Time</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>Transaction Details</th>
                          <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'right' }}>Debit (+)</th>
                          <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'right' }}>Credit (-)</th>
                          <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'right' }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerTransactions.map((tx: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', height: '42px' }}>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{tx.date}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 500 }}>{tx.description}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: tx.debit > 0 ? '#DC2626' : '#94A3B8', fontWeight: tx.debit > 0 ? 'bold' : 'normal' }}>
                              {tx.debit > 0 ? `₹ ${tx.debit.toFixed(2)}` : '-'}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: tx.credit > 0 ? '#059669' : '#94A3B8', fontWeight: tx.credit > 0 ? 'bold' : 'normal' }}>
                              {tx.credit > 0 ? `₹ ${tx.credit.toFixed(2)}` : '-'}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                              ₹ {tx.balance.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )}
              </Box>
            </div>
          </React.Fragment>
        )}
      </Container>
    </Box>
  );
};
