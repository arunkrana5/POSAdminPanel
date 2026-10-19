import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  Divider,
  InputBase,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HeaderNav: React.FC = () => {
  const { user, logout, switchTenant, selectedTenantId, selectedTenantName, selectedTenantCode, availableTenants } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElTenant, setAnchorElTenant] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
    { label: 'Sales & Invoices', path: '/sales', icon: <ShoppingBagIcon sx={{ fontSize: 16 }} /> },
    { label: 'Items Directory', path: '/items', icon: <AssignmentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Stock Inventory', path: '/stock', icon: <Inventory2Icon sx={{ fontSize: 16 }} /> },
    { label: 'Masters (मास्टर डेटा)', path: '/masters', icon: <CategoryIcon sx={{ fontSize: 16 }} /> },
    { label: 'Customer Directory', path: '/customers', icon: <PeopleAltIcon sx={{ fontSize: 16 }} /> },
    { label: 'Udhaar Ledgers', path: '/udhaar', icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} /> },
    { label: 'Client Tenants', path: '/tenants', icon: <BusinessIcon sx={{ fontSize: 16 }} /> },
    { label: 'Financial Reports', path: '/reports', icon: <AssessmentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Store Settings', path: '/settings', icon: <SettingsIcon sx={{ fontSize: 16 }} /> },
  ];

  const currentTab = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tier 1: Ultra-Sleek 44px Enterprise Top Header */}
      <Box
        sx={{
          backgroundColor: '#0B0F19',
          color: '#FFFFFF',
          px: 2.5,
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left: Tenant Switcher & Environment Indicator */}
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            onClick={(e) => setAnchorElTenant(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              bgcolor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.25)' },
            }}
          >
            <BusinessIcon sx={{ fontSize: 18, color: '#60A5FA' }} />
            <Box textAlign="left">
              <Typography variant="caption" sx={{ color: '#93C5FD', fontSize: '0.625rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                CURRENT STORE
              </Typography>
              <Typography variant="body2" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: '0.825rem', lineHeight: 1.2 }}>
                {selectedTenantName || user?.tenantName || 'Laxmi Store'}
              </Typography>
            </Box>
            <Chip
              label={selectedTenantCode || user?.tenantCode || 'LAXMI'}
              size="small"
              sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800 }}
            />
            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
          </Box>

          <Menu
            anchorEl={anchorElTenant}
            open={Boolean(anchorElTenant)}
            onClose={() => setAnchorElTenant(null)}
            PaperProps={{ sx: { minWidth: 280, mt: 1, bgcolor: '#1E293B', color: '#FFFFFF' } }}
          >
            <Typography variant="caption" sx={{ px: 2, py: 1, color: '#94A3B8', fontWeight: 700, display: 'block' }}>
              Switch Client Store ({availableTenants.length || 7} Stores)
            </Typography>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            {availableTenants.map((t) => {
              const isSelected = selectedTenantId === t.id;
              return (
                <MenuItem
                  key={t.id}
                  selected={isSelected}
                  onClick={() => {
                    switchTenant(t.id, t.code, t.name);
                    setAnchorElTenant(null);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.2,
                    px: 2,
                    '&.Mui-selected': { bgcolor: 'rgba(37, 99, 235, 0.3)' },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {isSelected ? (
                      <CheckCircleIcon fontSize="small" sx={{ color: '#10B981' }} />
                    ) : (
                      <BusinessIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                    )}
                    <Typography variant="body2" fontWeight={isSelected ? '800' : '600'}>
                      {t.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={t.code}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#0F172A', color: '#93C5FD', fontWeight: 800 }}
                  />
                </MenuItem>
              );
            })}
          </Menu>

          <Chip
            label="PROD"
            size="small"
            sx={{ height: 16, fontSize: '0.575rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.25)' }}
          />

          <Box display={{ xs: 'none', md: 'flex' }} alignItems="center" gap={0.5} ml={0.5}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.675rem' }}>
              Connected
            </Typography>
          </Box>
        </Box>

        {/* Center: Search Input */}
        <Paper
          elevation={0}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            px: 1.2,
            py: 0.15,
            borderRadius: '4px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            width: 220,
            '&:focus-within': { borderColor: '#3B82F6', width: 280, bgcolor: 'rgba(255, 255, 255, 0.1)' },
            transition: 'all 0.2s',
          }}
        >
          <SearchIcon sx={{ color: '#94A3B8', fontSize: 14, mr: 0.8 }} />
          <InputBase
            placeholder="Search products, customers... (Ctrl+K)"
            sx={{ fontSize: '0.725rem', color: '#FFFFFF', width: '100%' }}
          />
        </Paper>

        {/* Right Controls */}
        <Box display="flex" alignItems="center" gap={1.2}>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={() => navigate('/sales')}
            sx={{
              fontWeight: 700,
              fontSize: '0.725rem',
              py: 0.3,
              px: 1.2,
              borderRadius: '4px',
              bgcolor: '#059669',
              '&:hover': { bgcolor: '#047857' },
            }}
          >
            + Invoice
          </Button>

          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setAnchorElNotif(e.currentTarget)}
              size="small"
              sx={{ color: '#94A3B8', p: 0.4, '&:hover': { color: '#FFFFFF' } }}
            >
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.575rem', height: 13, minWidth: 13 } }}>
                <NotificationsIcon sx={{ fontSize: 17 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElNotif}
            open={Boolean(anchorElNotif)}
            onClose={() => setAnchorElNotif(null)}
            PaperProps={{ sx: { width: 280, mt: 1, p: 1, bgcolor: '#1E293B', color: '#FFFFFF' } }}
          >
            <Typography variant="caption" fontWeight="bold" sx={{ px: 1, color: '#94A3B8' }}>System Alerts</Typography>
            <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem onClick={() => setAnchorElNotif(null)}>
              <Typography variant="caption">Low Stock: Basmati Rice (5kg) below 5 units.</Typography>
            </MenuItem>
          </Menu>

          <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />

          <Box
            onClick={(e) => setAnchorElUser(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              cursor: 'pointer',
              px: 0.6,
              py: 0.2,
              borderRadius: '4px',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <Avatar sx={{ width: 24, height: 24, bgcolor: '#2563EB', fontSize: '0.7rem', fontWeight: 800 }}>
              {user?.username ? user.username[0].toUpperCase() : 'A'}
            </Avatar>
            <Typography variant="body2" fontWeight="600" sx={{ color: '#FFFFFF', fontSize: '0.75rem' }}>
              {user?.username || 'admin'}
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
          </Box>

          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={() => setAnchorElUser(null)}
            PaperProps={{ sx: { minWidth: 180, mt: 1, bgcolor: '#1E293B', color: '#FFFFFF' } }}
          >
            <MenuItem onClick={() => { setAnchorElUser(null); navigate('/settings'); }}>
              <PersonIcon fontSize="small" sx={{ mr: 1, color: '#94A3B8' }} /> Settings
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem onClick={() => { setAnchorElUser(null); logout(); navigate('/login'); }} sx={{ color: '#F87171' }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1, color: '#F87171' }} /> Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Tier 2: Sub-Header Tab Bar (36px Height) */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          px: 2.5,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.01)',
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Tabs
            value={currentTab !== -1 ? currentTab : 0}
            onChange={(_, val) => navigate(navItems[val].path)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0,
                px: 1.8,
                fontWeight: 600,
                fontSize: '0.775rem',
                color: '#64748B',
                textTransform: 'none',
                '&.Mui-selected': {
                  color: '#2563EB',
                  fontWeight: 700,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563EB',
                height: 2.5,
              },
            }}
          >
            {navItems.map((item) => (
              <Tab key={item.path} icon={item.icon} iconPosition="start" label={item.label} />
            ))}
          </Tabs>
        </Container>
      </Box>
    </Box>
  );
};
