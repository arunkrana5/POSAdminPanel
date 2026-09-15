import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  borderAccentColor?: string;
}

interface StatCardGridProps {
  items: StatItem[];
  columns?: { xs?: number; sm?: number; md?: number };
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  items,
  columns = { xs: 12, sm: 6, md: 3 },
}) => {
  return (
    <Grid container spacing={2} mb={3}>
      {items.map((stat) => {
        const accentColor = stat.borderAccentColor || '#2563EB';

        return (
          <Grid item xs={columns.xs} sm={columns.sm} md={columns.md} key={stat.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                borderLeft: `4px solid ${accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="700"
                  fontSize="0.675rem"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {stat.title}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="800"
                  color="#0F172A"
                  mt={0.3}
                  sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}
                >
                  {stat.value}
                </Typography>
                {stat.change && (
                  <Typography
                    variant="caption"
                    fontWeight="700"
                    fontSize="0.725rem"
                    sx={{
                      color:
                        stat.changeType === 'positive'
                          ? '#10B981'
                          : stat.changeType === 'negative'
                          ? '#EF4444'
                          : '#64748B',
                      display: 'block',
                      mt: 0.4,
                    }}
                  >
                    {stat.change}
                  </Typography>
                )}
                {stat.subtitle && !stat.change && (
                  <Typography variant="caption" color="text.secondary" fontSize="0.725rem" display="block" mt={0.4}>
                    {stat.subtitle}
                  </Typography>
                )}
              </Box>
              {stat.icon && (
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    backgroundColor: `${accentColor}10`,
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};
