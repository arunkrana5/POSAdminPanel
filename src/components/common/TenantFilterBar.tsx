import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../context/AuthContext';

interface TenantFilterBarProps {
  title?: string;
  onTenantChange?: (tenantId: number) => void;
  sx?: any;
}

export const TenantFilterBar: React.FC<TenantFilterBarProps> = ({
  title = 'Active Client Store Context',
  onTenantChange,
  sx,
}) => {
  const { selectedTenantId, availableTenants, switchTenant } = useAuth();

  const handleSelect = (e: any) => {
    const tid = Number(e.target.value);
    const tenant = availableTenants.find((t) => t.id === tid);
    if (tenant) {
      switchTenant(tenant.id, tenant.code, tenant.name);
      if (onTenantChange) {
        onTenantChange(tenant.id);
      }
    }
  };

  const current = availableTenants.find((t) => t.id === selectedTenantId) || availableTenants[0];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: '#FFFFFF',
        borderRadius: '10px',
        border: '1.5px solid #CBD5E1',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        ...sx,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '8px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #BFDBFE',
          }}
        >
          <StorefrontIcon sx={{ color: '#2563EB', fontSize: 24 }} />
        </Box>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Typography>
            <Chip
              label={current?.code || 'STORE'}
              size="small"
              sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#1E3A8A', color: '#93C5FD', fontWeight: 800 }}
            />
          </Box>
          <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#0F172A', lineHeight: 1.2 }}>
            {current?.name || 'Selected Client Store'}
          </Typography>
        </Box>
      </Box>

      {/* Dropdown Selector */}
      <Box display="flex" alignItems="center" gap={1.5} minWidth={{ xs: '100%', sm: 340 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="tenant-select-label" sx={{ fontWeight: 600 }}>Switch Client Store / Tenant</InputLabel>
          <Select
            labelId="tenant-select-label"
            label="Switch Client Store / Tenant"
            value={selectedTenantId || (availableTenants[0]?.id ?? 6)}
            onChange={handleSelect}
            sx={{
              fontWeight: 700,
              bgcolor: '#F8FAFC',
              borderRadius: '6px',
            }}
          >
            {availableTenants.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" gap={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon fontSize="small" sx={{ color: '#64748B' }} />
                    <Typography variant="body2" fontWeight="700">
                      {t.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={t.code}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#E2E8F0', color: '#334155', fontWeight: 700 }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};
