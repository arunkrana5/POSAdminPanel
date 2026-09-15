import React from 'react';
import { Chip } from '@mui/material';

export type StatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'TRIAL'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'PENDING_CREDIT'
  | 'ENABLED'
  | 'DISABLED'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'small' }) => {
  const normStatus = (status || '').toUpperCase();

  let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';
  let displayLabel = label || status;

  switch (normStatus) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'ENABLED':
      color = 'success';
      break;
    case 'TRIAL':
    case 'PENDING_CREDIT':
    case 'WARNING':
      color = 'warning';
      break;
    case 'SUSPENDED':
    case 'INACTIVE':
    case 'DISABLED':
    case 'ERROR':
      color = 'error';
      break;
    default:
      color = 'default';
      break;
  }

  return (
    <Chip
      label={displayLabel}
      size={size}
      color={color}
      sx={{
        fontWeight: 700,
        fontSize: '0.675rem',
        height: size === 'small' ? 20 : 24,
        borderRadius: '4px',
        textTransform: 'uppercase',
      }}
    />
  );
};
