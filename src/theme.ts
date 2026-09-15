import { createTheme } from '@mui/material/styles';

export const getTenantTheme = (primaryColor = '#2563EB', secondaryColor = '#059669') => {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: primaryColor,
        light: '#3B82F6',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: secondaryColor,
        light: '#10B981',
        dark: '#047857',
      },
      background: {
        default: '#F8FAFC',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#0F172A',
        secondary: '#64748B',
      },
      divider: '#E2E8F0',
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 12,
      h4: { fontWeight: 800, letterSpacing: '-0.025em', fontSize: '1.35rem' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em', fontSize: '1.15rem' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em', fontSize: '0.95rem' },
      subtitle1: { fontWeight: 600, fontSize: '0.85rem' },
      subtitle2: { fontWeight: 600, fontSize: '0.75rem' },
      body1: { fontSize: '0.8125rem' },
      body2: { fontSize: '0.75rem' },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.775rem' },
    },
    shape: {
      borderRadius: 6,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '5px 12px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            },
          },
          containedPrimary: {
            backgroundColor: '#2563EB',
            '&:hover': { backgroundColor: '#1D4ED8' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: '#CBD5E1',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '6px 10px',
            fontSize: '0.775rem',
            borderColor: '#F1F5F9',
          },
          head: {
            backgroundColor: '#F8FAFC',
            fontWeight: 700,
            color: '#64748B',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 600,
            fontSize: '0.675rem',
            height: 20,
          },
        },
      },
    },
  });
};
