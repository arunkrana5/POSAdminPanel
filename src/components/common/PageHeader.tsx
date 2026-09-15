import React from 'react';
import { Box, Typography, Button, Paper, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'inherit';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = ['Home', 'SaaS Control Center'],
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  primaryAction,
  secondaryActions = [],
}) => {
  return (
    <Box mb={3}>
      {/* Breadcrumb Trail */}
      <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            <Typography
              variant="caption"
              color={idx === breadcrumbs.length - 1 ? 'primary' : 'text.secondary'}
              fontWeight={idx === breadcrumbs.length - 1 ? '700' : '500'}
              fontSize="0.725rem"
            >
              {crumb}
            </Typography>
            {idx < breadcrumbs.length - 1 && (
              <Typography variant="caption" color="text.secondary" fontSize="0.725rem">
                /
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Main Title & Action Bar */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" color="#0F172A" letterSpacing="-0.02em">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.2} fontSize="0.825rem">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Right Section: Search & Buttons */}
        <Box display="flex" alignItems="center" gap={1.2} flexWrap="wrap">
          {onSearchChange !== undefined && (
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.4,
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                bgcolor: '#FFFFFF',
                width: { xs: '100%', sm: 220 },
                '&:focus-within': { borderColor: '#2563EB', width: { xs: '100%', sm: 280 } },
                transition: 'all 0.2s',
              }}
            >
              <SearchIcon sx={{ color: '#64748B', fontSize: 18, mr: 1 }} />
              <InputBase
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                sx={{ fontSize: '0.8rem', color: '#0F172A', width: '100%' }}
              />
            </Paper>
          )}

          {secondaryActions.map((btn, i) => (
            <Button
              key={i}
              variant={btn.variant || 'outlined'}
              color={btn.color || 'inherit'}
              size="small"
              startIcon={btn.icon}
              onClick={btn.onClick}
              sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.8rem', py: 0.7, px: 1.6 }}
            >
              {btn.label}
            </Button>
          ))}

          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'contained'}
              color={primaryAction.color || 'primary'}
              size="small"
              startIcon={primaryAction.icon}
              onClick={primaryAction.onClick}
              sx={{
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '0.8rem',
                py: 0.7,
                px: 2,
                boxShadow: '0 2px 4px 0 rgba(37, 99, 235, 0.2)',
              }}
            >
              {primaryAction.label}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
