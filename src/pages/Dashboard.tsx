import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid, IconButton,
  Tooltip, CircularProgress, Chip, Stack, Button, Skeleton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { HeaderNav } from '../components/HeaderNav';
import { TenantFilterBar } from '../components/common/TenantFilterBar';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import {
  DailyRevenueAreaChart,
  PaymentModeDonutChart,
  TopSellingHorizontalBarChart,
  CategoryValuationBarChart,
  SettlementRatioChart,
  CHART_COLORS,
} from '../components/analytics/AnalyticsCharts';

export const Dashboard: React.FC = () => {
  const { selectedTenantId, selectedTenantName, selectedTenantCode } = useAuth();
  const [days, setDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics Metrics State
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [settlementBreakdown, setSettlementBreakdown] = useState<any[]>([]);
  const [categorySummary, setCategorySummary] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);

  const fetchDashboardMetrics = useCallback(
    async (tenantIdOverride?: number, daysOverride = days) => {
      const tid = tenantIdOverride ?? selectedTenantId;
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient.get(
          `/reports/dashboard-metrics?tenantId=${tid}&days=${daysOverride}`
        );
        if (res.data) {
          const d = res.data;
          setDailyTrend(Array.isArray(d.dailyTrend) ? d.dailyTrend : []);
          setPaymentBreakdown(Array.isArray(d.paymentBreakdown) ? d.paymentBreakdown : []);
          setTopSellingProducts(Array.isArray(d.topSellingProducts) ? d.topSellingProducts : []);
          setSettlementBreakdown(Array.isArray(d.settlementBreakdown) ? d.settlementBreakdown : []);
          setCategorySummary(Array.isArray(d.categorySummary) ? d.categorySummary : []);
          setTotalRevenue(d.totalRevenue || 0);
          setTotalSales(d.totalSales || 0);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch analytics metrics from server');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTenantId, days]
  );

  useEffect(() => {
    fetchDashboardMetrics(selectedTenantId, days);
  }, [selectedTenantId, days, fetchDashboardMetrics]);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail?.tenantId) {
        fetchDashboardMetrics(e.detail.tenantId, days);
      }
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, [fetchDashboardMetrics, days]);

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 4 }}>
      {/* Global Application Navigation */}
      <HeaderNav />

      <Container maxWidth="xl" sx={{ mt: 1.5, px: { xs: 1.5, sm: 2 } }}>
        {/* Compact Tenant Bar */}
        <TenantFilterBar
          onTenantChange={(tId) => fetchDashboardMetrics(tId, days)}
          sx={{ mb: 1.5, p: 1.5 }}
        />

        {/* Compact Analytics Toolbar (No redundant cards or headers) */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
          mb={2}
          px={1}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={8}
                height={8}
                borderRadius="50%"
                bgcolor="#10B981"
                sx={{
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                  animation: 'pulse 2s infinite',
                }}
              />
              <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
                Store Analytics Workspace
              </Typography>
            </Box>
            <Chip
              label={`${selectedTenantName} (${selectedTenantCode || '#' + selectedTenantId})`}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: '1px solid #BFDBFE',
              }}
            />
            <Chip
              label={`Turnover: ₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} • ${totalSales} Bills`}
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: '1px solid #CBD5E1',
              }}
            />
          </Box>

          {/* Time Range Filter Chips & Refresh Action */}
          <Stack direction="row" spacing={1} alignItems="center">
            {[
              { label: '7 Days', val: 7 },
              { label: '30 Days', val: 30 },
              { label: 'All Time', val: 0 },
            ].map((period) => (
              <Chip
                key={period.val}
                label={period.label}
                size="small"
                clickable
                color={days === period.val ? 'primary' : 'default'}
                variant={days === period.val ? 'filled' : 'outlined'}
                onClick={() => setDays(period.val)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 26,
                  cursor: 'pointer',
                  borderColor: days === period.val ? '#2563EB' : '#CBD5E1',
                }}
              />
            ))}

            <Tooltip title="Refresh Real-time Chart Data">
              <IconButton
                size="small"
                onClick={() => fetchDashboardMetrics(selectedTenantId, days)}
                disabled={isLoading}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  p: 0.5,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon fontSize="small" sx={{ color: '#64748B' }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Error State with Retry Button */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '8px',
              bgcolor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" color="#B91C1C" fontWeight="600">
              {error}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => fetchDashboardMetrics(selectedTenantId, days)}
            >
              Retry Loading Charts
            </Button>
          </Paper>
        )}

        {/* Dense, Responsive Charts Grid */}
        <Grid container spacing={2}>
          {/* Chart 1: Revenue & Order Velocity Trend (Area Chart) */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: `1px solid ${CHART_COLORS.border}`,
                bgcolor: '#FFFFFF',
                height: '100%',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
                    Sales Revenue & Invoice Velocity Trend
                  </Typography>
                </Box>
                <Chip
                  label={days === 7 ? '7-Day Curve' : days === 30 ? '30-Day Curve' : 'Historical Curve'}
                  size="small"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F1F5F9' }}
                />
              </Box>

              {isLoading ? (
                <Skeleton variant="rounded" width="100%" height={220} animation="wave" />
              ) : (
                <DailyRevenueAreaChart data={dailyTrend} height={220} />
              )}
            </Paper>
          </Grid>

          {/* Chart 2: Payment Mode Breakdown (Donut Chart) */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: `1px solid ${CHART_COLORS.border}`,
                bgcolor: '#FFFFFF',
                height: '100%',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PieChartIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
                    Payment Mode Distribution
                  </Typography>
                </Box>
                <Typography variant="caption" color="#64748B" fontWeight="600">
                  Cash vs UPI vs Udhaar
                </Typography>
              </Box>

              {isLoading ? (
                <Skeleton variant="rounded" width="100%" height={220} animation="wave" />
              ) : (
                <PaymentModeDonutChart data={paymentBreakdown} height={220} />
              )}
            </Paper>
          </Grid>

          {/* Chart 3: Top 5 Fast Moving Items (Ranked Horizontal Bar Chart) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: `1px solid ${CHART_COLORS.border}`,
                bgcolor: '#FFFFFF',
                height: '100%',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LeaderboardIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
                    Top Selling Products by Revenue
                  </Typography>
                </Box>
                <Typography variant="caption" color="#64748B" fontWeight="600">
                  SQL Aggregate
                </Typography>
              </Box>

              {isLoading ? (
                <Skeleton variant="rounded" width="100%" height={220} animation="wave" />
              ) : (
                <TopSellingHorizontalBarChart data={topSellingProducts} height={220} />
              )}
            </Paper>
          </Grid>

          {/* Chart 4: Category Stock Valuation (Bar Chart) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: `1px solid ${CHART_COLORS.border}`,
                bgcolor: '#FFFFFF',
                height: '100%',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BarChartIcon sx={{ color: '#0D9488', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
                    Category Inventory Stock Valuation
                  </Typography>
                </Box>
                <Typography variant="caption" color="#64748B" fontWeight="600">
                  ₹ Asset Holdings
                </Typography>
              </Box>

              {isLoading ? (
                <Skeleton variant="rounded" width="100%" height={220} animation="wave" />
              ) : (
                <CategoryValuationBarChart data={categorySummary} height={220} />
              )}
            </Paper>
          </Grid>

          {/* Chart 5: Credit Recovery & Settlement Ratio */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: `1px solid ${CHART_COLORS.border}`,
                bgcolor: '#FFFFFF',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalanceWalletIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="800" color="#0F172A">
                    Settlement Health & Market Debt Exposure
                  </Typography>
                </Box>
                <Typography variant="caption" color="#64748B" fontWeight="600">
                  Fully Settled vs Outstanding Udhaar
                </Typography>
              </Box>

              {isLoading ? (
                <Skeleton variant="rounded" width="100%" height={120} animation="wave" />
              ) : (
                <SettlementRatioChart data={settlementBreakdown} height={130} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
