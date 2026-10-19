import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';

// --- Color Palette ---
export const CHART_COLORS = {
  primary: '#2563EB',   // Royal Blue
  success: '#10B981',   // Emerald Green
  warning: '#F59E0B',   // Amber
  danger: '#EF4444',    // Rose
  purple: '#8B5CF6',    // Indigo/Purple
  teal: '#06B6D4',      // Cyan/Teal
  gray: '#94A3B8',      // Slate Gray
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  textMain: '#0F172A',
  textMuted: '#64748B',
};

// --- Chart 1: Daily Revenue & Invoices Area Chart ---
interface DailyTrendPoint {
  date: string;
  day: string;
  total: number;
  count: number;
}

export const DailyRevenueAreaChart: React.FC<{
  data: DailyTrendPoint[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" color={CHART_COLORS.textMuted}>
          No revenue activity recorded in this period
        </Typography>
      </Box>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 100);
  const width = 600;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
    const y = paddingTop + plotHeight - (d.total / maxTotal) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

  const yTicks = [0, 0.33, 0.66, 1].map((pct) => ({
    val: Math.round(maxTotal * pct),
    y: paddingTop + plotHeight - pct * plotHeight,
  }));

  return (
    <Box position="relative" width="100%" sx={{ userSelect: 'none' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
            <stop offset="90%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Grid lines and Y-axis labels */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={t.y}
              x2={width - paddingRight}
              y2={t.y}
              stroke="#F1F5F9"
              strokeDasharray={idx === 0 ? 'none' : '3,3'}
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={t.y + 4}
              fontSize="10"
              fill={CHART_COLORS.textMuted}
              textAnchor="end"
              fontWeight="600"
            >
              {t.val >= 1000 ? `₹${(t.val / 1000).toFixed(1)}k` : `₹${t.val}`}
            </text>
          </g>
        ))}

        {/* Shaded Area and Trend Line */}
        <path d={areaD} fill="url(#areaGradient)" />
        <path
          d={pathD}
          fill="none"
          stroke={CHART_COLORS.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis ticks & labels */}
        {points.map((p, i) => (
          <g key={i}>
            <line
              x1={p.x}
              y1={paddingTop + plotHeight}
              x2={p.x}
              y2={paddingTop + plotHeight + 4}
              stroke="#CBD5E1"
            />
            <text
              x={p.x}
              y={paddingTop + plotHeight + 16}
              fontSize="10"
              fill={hoveredIdx === i ? CHART_COLORS.primary : CHART_COLORS.textMuted}
              fontWeight={hoveredIdx === i ? '700' : '500'}
              textAnchor="middle"
            >
              {p.day || p.date.slice(5)}
            </text>
          </g>
        ))}

        {/* Interactive hover points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: 'pointer' }}
          >
            {/* Transparent hit area */}
            <rect
              x={p.x - plotWidth / (points.length * 2)}
              y={paddingTop}
              width={plotWidth / points.length}
              height={plotHeight}
              fill="transparent"
            />
            {/* Visible dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 6 : 4}
              fill="#FFFFFF"
              stroke={CHART_COLORS.primary}
              strokeWidth={hoveredIdx === i ? 3 : 2}
              style={{ transition: 'all 0.2s ease' }}
            />
          </g>
        ))}

        {/* Hover vertical guideline */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <line
            x1={points[hoveredIdx].x}
            y1={paddingTop}
            x2={points[hoveredIdx].x}
            y2={paddingTop + plotHeight}
            stroke={CHART_COLORS.primary}
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.8"
          />
        )}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 10,
            right: 15,
            px: 1.5,
            py: 0.8,
            borderRadius: '6px',
            bgcolor: 'rgba(15, 23, 42, 0.92)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.1)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
            {points[hoveredIdx].date} ({points[hoveredIdx].day})
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8' }}>
            ₹ {points[hoveredIdx].total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" sx={{ color: '#E2E8F0' }}>
            {points[hoveredIdx].count} Bill{points[hoveredIdx].count === 1 ? '' : 's'} Processed
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// --- Chart 2: Payment Mode Donut Chart ---
interface PaymentModeItem {
  mode: string;
  count: number;
  total: number;
}

export const PaymentModeDonutChart: React.FC<{
  data: PaymentModeItem[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const colors = [CHART_COLORS.success, CHART_COLORS.primary, CHART_COLORS.danger, CHART_COLORS.warning, CHART_COLORS.purple];
  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

  if (!data || data.length === 0 || grandTotal === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" color={CHART_COLORS.textMuted}>
          No payment transaction data available
        </Typography>
      </Box>
    );
  }

  const size = 180;
  const radius = 68;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = data.map((d, i) => {
    const percent = d.total / grandTotal;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;
    return {
      ...d,
      percent: (percent * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
      color: colors[i % colors.length],
    };
  });

  const activeItem = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-around" height={height} px={1}>
      <Box position="relative" width={size} height={size} flexShrink={0}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                transition: 'stroke-width 0.25s ease, opacity 0.25s ease',
                cursor: 'pointer',
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.6,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center Summary Label */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ pointerEvents: 'none' }}
        >
          <Typography variant="caption" color={CHART_COLORS.textMuted} fontWeight="700" textTransform="uppercase">
            {activeItem ? activeItem.mode : 'Total Volume'}
          </Typography>
          <Typography variant="subtitle2" fontWeight="800" color={activeItem ? activeItem.color : CHART_COLORS.textMain}>
            {activeItem
              ? `₹${activeItem.total >= 1000 ? (activeItem.total / 1000).toFixed(1) + 'k' : activeItem.total.toFixed(0)}`
              : `₹${grandTotal >= 1000 ? (grandTotal / 1000).toFixed(1) + 'k' : grandTotal.toFixed(0)}`}
          </Typography>
          {activeItem && (
            <Typography variant="caption" fontWeight="700" color={activeItem.color}>
              {activeItem.percent}%
            </Typography>
          )}
        </Box>
      </Box>

      {/* Compact Interactive Legend */}
      <Stack spacing={0.8} sx={{ minWidth: 140, mt: { xs: 1, sm: 0 } }}>
        {segments.map((seg, idx) => (
          <Box
            key={idx}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={0.5}
            borderRadius="6px"
            bgcolor={hoveredIdx === idx ? '#F1F5F9' : 'transparent'}
            sx={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={10} height={10} borderRadius="50%" bgcolor={seg.color} flexShrink={0} />
              <Typography variant="body2" fontWeight={hoveredIdx === idx ? '700' : '600'} fontSize="0.75rem" color={CHART_COLORS.textMain}>
                {seg.mode}
              </Typography>
            </Box>
            <Typography variant="caption" fontWeight="800" color={CHART_COLORS.textMuted}>
              {seg.percent}%
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// --- Chart 3: Top Selling Fast Movers (Ranked Horizontal Bar Chart) ---
interface TopProductItem {
  name: string;
  quantity: number;
  revenue: number;
}

export const TopSellingHorizontalBarChart: React.FC<{
  data: TopProductItem[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" color={CHART_COLORS.textMuted}>
          No fast moving items recorded yet
        </Typography>
      </Box>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const rankColors = ['#F59E0B', '#94A3B8', '#D97706', '#2563EB', '#64748B'];

  return (
    <Box height={height} display="flex" flexDirection="column" justifyContent="space-around" px={1} py={0.5}>
      {data.slice(0, 5).map((item, idx) => {
        const pct = Math.max((item.revenue / maxRevenue) * 100, 6);
        const isHovered = hoveredIdx === idx;

        return (
          <Box
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: isHovered ? '#F8FAFC' : 'transparent',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
            }}
          >
            {/* Top labels: Rank, Name, Qty, and Revenue */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={`#${idx + 1}`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: rankColors[idx] || '#E2E8F0',
                    color: idx === 0 || idx >= 3 ? '#FFFFFF' : '#0F172A',
                  }}
                />
                <Typography variant="body2" fontWeight="700" fontSize="0.75rem" noWrap sx={{ maxWidth: { xs: 140, sm: 220 } }}>
                  {item.name}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography variant="caption" color={CHART_COLORS.textMuted} fontWeight="600">
                  {item.quantity} units
                </Typography>
                <Typography variant="body2" fontWeight="800" color="#2563EB" fontSize="0.75rem">
                  ₹ {item.revenue.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>

            {/* Horizontal Fill Bar */}
            <Box width="100%" height={6} bgcolor="#EEF2F6" borderRadius={3} overflow="hidden">
              <Box
                width={`${pct}%`}
                height="100%"
                sx={{
                  background: isHovered
                    ? 'linear-gradient(90deg, #3B82F6, #1D4ED8)'
                    : 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  borderRadius: 3,
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// --- Chart 4: Category Inventory Valuation Bar Chart ---
interface CategorySummaryItem {
  category: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
}

export const CategoryValuationBarChart: React.FC<{
  data: CategorySummaryItem[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" color={CHART_COLORS.textMuted}>
          No category stock valuation data available
        </Typography>
      </Box>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.totalValue), 100);
  const width = 500;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const barWidth = Math.min(plotWidth / (data.length * 1.6), 38);

  return (
    <Box position="relative" width="100%" sx={{ userSelect: 'none' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} onMouseLeave={() => setHoveredIdx(null)}>
        {/* Baseline */}
        <line
          x1={paddingLeft}
          y1={paddingTop + plotHeight}
          x2={width - paddingRight}
          y2={paddingTop + plotHeight}
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />

        {data.map((cat, i) => {
          const x = paddingLeft + (i + 0.5) * (plotWidth / data.length) - barWidth / 2;
          const barHeight = Math.max((cat.totalValue / maxVal) * plotHeight, 4);
          const y = paddingTop + plotHeight - barHeight;
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={isHovered ? '#0D9488' : '#14B8A6'}
                style={{ transition: 'all 0.25s ease' }}
              />
              <text
                x={x + barWidth / 2}
                y={paddingTop + plotHeight + 16}
                fontSize="9.5"
                fill={isHovered ? '#0F172A' : '#64748B'}
                fontWeight={isHovered ? '700' : '600'}
                textAnchor="middle"
              >
                {cat.category.length > 9 ? `${cat.category.slice(0, 8)}…` : cat.category}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIdx !== null && data[hoveredIdx] && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 10,
            right: 15,
            px: 1.5,
            py: 0.8,
            borderRadius: '6px',
            bgcolor: 'rgba(15, 23, 42, 0.92)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.1)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <Typography variant="caption" sx={{ color: '#5EEAD4', fontWeight: 700, display: 'block' }}>
            {data[hoveredIdx].category}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            ₹ {data[hoveredIdx].totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" sx={{ color: '#E2E8F0' }}>
            {data[hoveredIdx].productCount} SKUs • {data[hoveredIdx].totalStock.toFixed(0)} units in stock
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// --- Chart 5: Credit Recovery & Settlement Ratio (Radial Meter) ---
interface SettlementItem {
  status: string;
  count: number;
  total: number;
  color: string;
}

export const SettlementRatioChart: React.FC<{
  data: SettlementItem[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

  if (!data || data.length === 0 || grandTotal === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" color={CHART_COLORS.textMuted}>
          No settlement metrics available
        </Typography>
      </Box>
    );
  }

  const paidItem = data.find((d) => d.status.includes('Paid')) || data[0];
  const creditItem = data.find((d) => d.status.includes('Credit')) || data[1];

  const paidPct = grandTotal > 0 ? ((paidItem?.total || 0) / grandTotal) * 100 : 0;
  const creditPct = grandTotal > 0 ? ((creditItem?.total || 0) / grandTotal) * 100 : 0;

  return (
    <Box height={height} display="flex" flexDirection="column" justifyContent="center" px={2}>
      {/* Visual Dual Distribution Bar */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.8}>
          <Typography variant="caption" fontWeight="700" color="#10B981">
            Settled (Cash + UPI): {paidPct.toFixed(1)}%
          </Typography>
          <Typography variant="caption" fontWeight="700" color="#EF4444">
            Outstanding Udhaar: {creditPct.toFixed(1)}%
          </Typography>
        </Box>

        <Box width="100%" height={12} borderRadius={6} bgcolor="#F1F5F9" display="flex" overflow="hidden">
          <Box
            width={`${paidPct}%`}
            height="100%"
            bgcolor="#10B981"
            sx={{ transition: 'width 0.8s ease' }}
          />
          <Box
            width={`${creditPct}%`}
            height="100%"
            bgcolor="#EF4444"
            sx={{ transition: 'width 0.8s ease' }}
          />
        </Box>
      </Box>

      {/* Metric comparison cards */}
      <Box display="flex" gap={2}>
        <Box flex={1} p={1.5} borderRadius="8px" bgcolor="#ECFDF5" border="1px solid #A7F3D0">
          <Typography variant="caption" color="#047857" fontWeight="700">
            Recovered Real Cash/UPI
          </Typography>
          <Typography variant="subtitle1" fontWeight="800" color="#065F46">
            ₹ {(paidItem?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" color="#047857">
            {paidItem?.count || 0} Bills Cleared
          </Typography>
        </Box>

        <Box flex={1} p={1.5} borderRadius="8px" bgcolor="#FEF2F2" border="1px solid #FECACA">
          <Typography variant="caption" color="#B91C1C" fontWeight="700">
            Pending Market Dues
          </Typography>
          <Typography variant="subtitle1" fontWeight="800" color="#991B1B">
            ₹ {(creditItem?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" color="#B91C1C">
            {creditItem?.count || 0} Credit Invoices
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
