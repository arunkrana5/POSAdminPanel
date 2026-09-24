import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Grid, Alert,
  Switch, FormControlLabel, Tabs, Tab, Divider, Select, MenuItem, FormControl, InputLabel,
  Chip, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import PaletteIcon from '@mui/icons-material/Palette';
import MenuIcon from '@mui/icons-material/Menu';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import BusinessIcon from '@mui/icons-material/Business';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { HeaderNav } from '../components/HeaderNav';
import { PageHeader } from '../components/common/PageHeader';
import { MobilePhonePreview, MobilePreviewConfig } from '../components/common/MobilePhonePreview';
import { GenericDataTable, ColumnDef } from '../components/common/GenericDataTable';
import { GenericFormModal, FormFieldDef } from '../components/common/GenericFormModal';
import { getApiBaseUrl, getAuthHeaders } from '../services/apiConfig';

interface MenuItemConfig {
  id: string;
  titleEn: string;
  titleHi: string;
  icon: string;
  route: string;
  isEnabled: boolean;
  badgeText?: string;
}

interface TenantClient {
  tenantId: string;
  id: number;
  name: string;
  code: string;
  plan: string;
  activeStatus: string;
  ownerName: string;
  ownerPhone: string;
  joinedDate: string;
  storesCount: number;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Client Selection State
  const [selectedTenantId, setSelectedTenantId] = useState<number>(1);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  const [clientList, setClientList] = useState<TenantClient[]>([
    { id: 1, tenantId: 'TNT-001', name: 'Sharma General Store', code: 'SHARMA_SHOP', plan: 'Enterprise SaaS', activeStatus: 'ACTIVE', ownerName: 'Ram Sharma', ownerPhone: '+91 98765 43210', joinedDate: '15 Jan 2026', storesCount: 3 },
    { id: 2, tenantId: 'TNT-002', name: 'Gupta Kirana & Provisions', code: 'GUPTA_KIRANA', plan: 'Pro Business', activeStatus: 'ACTIVE', ownerName: 'Suresh Gupta', ownerPhone: '+91 98123 45678', joinedDate: '02 Feb 2026', storesCount: 1 },
    { id: 3, tenantId: 'TNT-003', name: 'Verma Traders & Seeds', code: 'VERMA_TRADERS', plan: 'Basic Starter', activeStatus: 'TRIAL', ownerName: 'Vikas Verma', ownerPhone: '+91 97654 32109', joinedDate: '20 Aug 2026', storesCount: 1 },
    { id: 4, tenantId: 'TNT-004', name: 'Kisan Agro Store', code: 'KISAN_AGRO', plan: 'Pro Business', activeStatus: 'SUSPENDED', ownerName: 'Rajesh Kumar', ownerPhone: '+91 99887 76655', joinedDate: '10 Mar 2026', storesCount: 2 }
  ]);

  useEffect(() => {
    fetchAllTenants();
  }, []);

  const fetchAllTenants = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/settings/tenants?_t=${Date.now()}`, { headers: getAuthHeaders() });
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.status && data.additionalMessage) {
          const parsed = JSON.parse(data.additionalMessage);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped: TenantClient[] = parsed.map((t: any, idx: number) => {
              const numId = t.id || t.Id || parseInt(t.tenantId?.replace(/\D/g, '') || t.TenantId?.replace(/\D/g, ''), 10) || (idx + 1);
              return {
                id: numId,
                tenantId: t.tenantId || t.TenantId || `TNT-${numId}`,
                name: t.name || t.Name || t.tenantName || 'Store Client',
                code: t.code || t.Code || t.tenantCode || `TNT_${numId}`,
                plan: t.plan || t.Plan || 'Enterprise SaaS',
                activeStatus: t.activeStatus || t.ActiveStatus || 'ACTIVE',
                ownerName: t.ownerName || t.OwnerName || 'Store Owner',
                ownerPhone: t.ownerPhone || t.OwnerPhone || '+91 98765 43210',
                joinedDate: t.joinedDate || t.JoinedDate || 'Recently',
                storesCount: t.storesCount || t.StoresCount || 1,
              };
            });
            setClientList(mapped);
          }
        }
      }
    } catch (_) {}
  };

  const currentClient = clientList.find(c => c.id === selectedTenantId) || clientList[0];

  // App & Branding Config State
  const [tenantName, setTenantName] = useState(currentClient.name);
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&auto=format&fit=crop&q=80');
  const [logoIcon, setLogoIcon] = useState('storefront_rounded');
  const [primaryColorHex, setPrimaryColorHex] = useState('#0F172A');
  const [secondaryColorHex, setSecondaryColorHex] = useState('#D97706');
  const [accentColorHex, setAccentColorHex] = useState('#10B981');
  const [appTitle, setAppTitle] = useState('SHARMA POS');
  const [tagline, setTagline] = useState('Digital Store POS System');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Typography & Color Theme State
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);
  const [textColorHex, setTextColorHex] = useState('#0F172A');
  const [pageBgColorHex, setPageBgColorHex] = useState('#F8FAFC');
  const [cardBgColorHex, setCardBgColorHex] = useState('#FFFFFF');
  const [amountColorHex, setAmountColorHex] = useState('#16A34A');
  const [buttonBgColorHex, setButtonBgColorHex] = useState('#2563EB');
  const [buttonTextColorHex, setButtonTextColorHex] = useState('#FFFFFF');

  // 360-Degree Feature Controls State
  const [enableUdhaar, setEnableUdhaar] = useState(true);
  const [enableBarcodeScanner, setEnableBarcodeScanner] = useState(true);
  const [enableOnlinePayment, setEnableOnlinePayment] = useState(true);
  const [enableHindiLanguage, setEnableHindiLanguage] = useState(true);
  const [enableReceiptPrinting, setEnableReceiptPrinting] = useState(true);
  const [enablePOSDiscount, setEnablePOSDiscount] = useState(true);
  const [enableTaxCalculation, setEnableTaxCalculation] = useState(true);
  const [defaultTaxPercent, setDefaultTaxPercent] = useState<number>(5.0);
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Customer Support State
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [supportEmail, setSupportEmail] = useState('support@villageshop.in');
  const [supportWhatsapp, setSupportWhatsapp] = useState('+91 98765 43210');
  const [supportHours, setSupportHours] = useState('9:00 AM - 9:00 PM');

  // SaaS Account Subscription State
  const [saasPlan, setSaasPlan] = useState(currentClient.plan);
  const [accountStatus, setAccountStatus] = useState(currentClient.activeStatus);
  const [ownerName, setOwnerName] = useState(currentClient.ownerName);
  const [ownerPhone, setOwnerPhone] = useState(currentClient.ownerPhone);
  const [storesCount, setStoresCount] = useState<number>(currentClient.storesCount);

  // Menu Items List State
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>([
    { id: 'dashboard', titleEn: 'Dashboard', titleHi: 'डैशबोर्ड', icon: 'dashboard_rounded', route: '/home', isEnabled: true, badgeText: '' },
    { id: 'pos', titleEn: 'New Sale / POS', titleHi: 'नया बिल / POS', icon: 'point_of_sale_rounded', route: '/pos', isEnabled: true, badgeText: 'FAST' },
    { id: 'products', titleEn: 'Products & Stock', titleHi: 'सामान और स्टॉक', icon: 'inventory_2_rounded', route: '/products', isEnabled: true, badgeText: '' },
    { id: 'customers', titleEn: 'Customer Udhaar', titleHi: 'ग्राहक उधार खाता', icon: 'people_alt_rounded', route: '/customers', isEnabled: true, badgeText: '' },
    { id: 'reports', titleEn: 'Reports & Earnings', titleHi: 'रिपोर्ट और कमाई', icon: 'analytics_rounded', route: '/reports', isEnabled: true, badgeText: '' },
    { id: 'settings', titleEn: 'Settings', titleHi: 'सेटिंग्स', icon: 'settings_rounded', route: '/settings', isEnabled: true, badgeText: '' },
  ]);

  const [alertMsg, setAlertMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal State for Adding/Editing Menu Items
  const [openModal, setOpenModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemConfig | null>(null);

  useEffect(() => {
    fetchConfigForTenant(selectedTenantId);
  }, [selectedTenantId]);

  const fetchConfigForTenant = async (tenantId: number) => {
    setIsLoadingConfig(true);
    setAlertMsg('');
    try {
      const res = await fetch(`${getApiBaseUrl()}/settings/config?tenantId=${tenantId}`, {
        headers: getAuthHeaders(),
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.additionalMessage) {
          try {
            const config = JSON.parse(data.additionalMessage);
            setTenantName(config.tenantName || config.TenantName || currentClient.name);
            setLogoUrl(config.logoUrl || config.LogoUrl || '');
            setLogoIcon(config.logoIcon || config.LogoIcon || 'storefront_rounded');
            setPrimaryColorHex(config.primaryColorHex || config.PrimaryColorHex || '#0F172A');
            setSecondaryColorHex(config.secondaryColorHex || config.SecondaryColorHex || '#D97706');
            setAccentColorHex(config.accentColorHex || config.AccentColorHex || '#10B981');
            setAppTitle(config.appTitle || config.AppTitle || 'VILLAGE SHOP POS');
            setTagline(config.tagline || config.Tagline || 'Digital Store System');
            setCurrencySymbol(config.currencySymbol || config.CurrencySymbol || '₹');
            setFontFamily(config.fontFamily || config.FontFamily || 'Roboto');
            setFontSizeScale(config.fontSizeScale || config.FontSizeScale || 1.0);
            setTextColorHex(config.textColorHex || config.TextColorHex || '#0F172A');
            setPageBgColorHex(config.pageBgColorHex || config.PageBgColorHex || '#F8FAFC');
            setCardBgColorHex(config.cardBgColorHex || config.CardBgColorHex || '#FFFFFF');
            setAmountColorHex(config.amountColorHex || config.AmountColorHex || '#16A34A');
            setButtonBgColorHex(config.buttonBgColorHex || config.ButtonBgColorHex || '#2563EB');
            setButtonTextColorHex(config.buttonTextColorHex || config.ButtonTextColorHex || '#FFFFFF');

            setEnableUdhaar(config.enableUdhaar ?? config.EnableUdhaar ?? true);
            setEnableBarcodeScanner(config.enableBarcodeScanner ?? config.EnableBarcodeScanner ?? true);
            setEnableOnlinePayment(config.enableOnlinePayment ?? config.EnableOnlinePayment ?? true);
            setEnableHindiLanguage(config.enableHindiLanguage ?? config.EnableHindiLanguage ?? true);
            setEnableReceiptPrinting(config.enableReceiptPrinting ?? config.EnableReceiptPrinting ?? true);
            setEnablePOSDiscount(config.enablePOSDiscount ?? config.EnablePOSDiscount ?? true);
            setEnableTaxCalculation(config.enableTaxCalculation ?? config.EnableTaxCalculation ?? true);
            setDefaultTaxPercent(config.defaultTaxPercent ?? config.DefaultTaxPercent ?? 5.0);
            setAllowNegativeStock(config.allowNegativeStock ?? config.AllowNegativeStock ?? false);
            setLowStockThreshold(config.lowStockThreshold ?? config.LowStockThreshold ?? 5);

            setSupportPhone(config.supportPhone || config.SupportPhone || currentClient.ownerPhone);
            setSupportEmail(config.supportEmail || config.SupportEmail || 'support@villageshop.in');
            setSupportWhatsapp(config.supportWhatsapp || config.SupportWhatsapp || currentClient.ownerPhone);
            setSupportHours(config.supportHours || config.SupportHours || '9:00 AM - 9:00 PM');

            setSaasPlan(config.plan || currentClient.plan);
            setAccountStatus(config.activeStatus || currentClient.activeStatus);
            setOwnerName(config.ownerName || currentClient.ownerName);
            setOwnerPhone(config.ownerPhone || currentClient.ownerPhone);
            setStoresCount(config.storesCount || currentClient.storesCount);

            const items = config.menuItems || config.MenuItems;
            if (items && Array.isArray(items) && items.length > 0) {
              setMenuItems(items);
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
    setIsLoadingConfig(false);
  };

  const handlePublishAll = async () => {
    setIsSaving(true);
    setAlertMsg('');

    const payload = {
      selectedTenantId,
      tenantCode: currentClient.code,
      tenantName,
      appName: tenantName,
      logoUrl,
      logoIcon,
      primaryColorHex,
      primaryColor: primaryColorHex,
      secondaryColorHex,
      secondaryColor: secondaryColorHex,
      accentColorHex,
      appTitle,
      tagline,
      currencySymbol,
      fontFamily,
      fontSizeScale,
      textColorHex,
      textColor: textColorHex,
      pageBgColorHex,
      pageBgColor: pageBgColorHex,
      cardBgColorHex,
      cardBgColor: cardBgColorHex,
      amountColorHex,
      amountColor: amountColorHex,
      buttonBgColorHex,
      buttonBgColor: buttonBgColorHex,
      buttonTextColorHex,
      buttonTextColor: buttonTextColorHex,
      enableUdhaar,
      enableBarcodeScanner,
      enableOnlinePayment,
      enableHindiLanguage,
      enableReceiptPrinting,
      enablePOSDiscount,
      enableTaxCalculation,
      defaultTaxPercent,
      allowNegativeStock,
      lowStockThreshold,
      supportPhone,
      supportEmail,
      supportWhatsapp,
      supportHours,
      plan: saasPlan,
      activeStatus: accountStatus,
      ownerName,
      ownerPhone,
      storesCount,
      menuItems,
    };

    try {
      const endpoints = [
        `${getApiBaseUrl()}/settings/config?tenantId=${selectedTenantId}`,
        `${getApiBaseUrl()}/settings/mobile-config?tenantId=${selectedTenantId}`,
      ];

      let res: Response | null = null;
      for (const ep of endpoints) {
        try {
          const r = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(payload),
          });
          if (r.ok) {
            res = r;
            break;
          }
        } catch (_) {}
      }

      if (!res) {
        throw new Error('Could not reach backend API');
      }

      const data = await res.json();
      if (data && data.status) {
        setAlertMsg(`SUCCESS: All 360° Settings Published Live for Client "${tenantName}" (ID: ${selectedTenantId})! SQL DB & Mobile Sync Complete.`);
      } else {
        setAlertMsg('WARNING: Could not save to backend. Status: ' + (data?.message || 'Unknown response'));
      }
    } catch (err: any) {
      setAlertMsg('ERROR: Failed to connect to API server. Please check backend daemon.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMenuItem = (id: string) => {
    setMenuItems(menuItems.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m)));
  };

  const handleDeleteMenuItem = (item: MenuItemConfig) => {
    setMenuItems(menuItems.filter((m) => m.id !== item.id));
  };

  const handleOpenAddModal = () => {
    setEditingMenuItem(null);
    setOpenModal(true);
  };

  const handleSaveModalItem = (values: Record<string, any>) => {
    if (editingMenuItem) {
      setMenuItems(
        menuItems.map((m) =>
          m.id === editingMenuItem.id
            ? { ...m, titleEn: values.titleEn, titleHi: values.titleHi || values.titleEn, icon: values.icon, route: values.route, badgeText: values.badgeText }
            : m
        )
      );
    } else {
      const newItem: MenuItemConfig = {
        id: `item_${Date.now()}`,
        titleEn: values.titleEn,
        titleHi: values.titleHi || values.titleEn,
        icon: values.icon || 'storefront_rounded',
        route: values.route || '/home',
        isEnabled: true,
        badgeText: values.badgeText || '',
      };
      setMenuItems([...menuItems, newItem]);
    }
    setOpenModal(false);
  };

  const menuTableColumns: ColumnDef<MenuItemConfig>[] = [
    {
      key: 'titleEn',
      header: 'Menu Title (English / Hindi)',
      render: (r) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="#0F172A">
            {r.titleEn}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {r.titleHi}
          </Typography>
        </Box>
      ),
    },
    { key: 'icon', header: 'Icon Name', render: (r) => <Typography variant="caption" fontFamily="monospace">{r.icon}</Typography> },
    { key: 'route', header: 'Mobile Route', render: (r) => <Typography variant="caption" fontFamily="monospace">{r.route}</Typography> },
    {
      key: 'badgeText',
      header: 'Badge Tag',
      render: (r) =>
        r.badgeText ? (
          <Box component="span" sx={{ px: 1, py: 0.2, bgcolor: '#F59E0B', color: '#FFFFFF', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
            {r.badgeText}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        ),
    },
    {
      key: 'isEnabled',
      header: 'Visible',
      align: 'center',
      render: (r) => (
        <Switch checked={r.isEnabled} onChange={() => handleToggleMenuItem(r.id)} color="success" size="small" />
      ),
    },
  ];

  const modalFields: FormFieldDef[] = [
    { name: 'titleEn', label: 'Menu Item Title (English)', type: 'text', required: true, placeholder: 'e.g. Special Offers' },
    { name: 'titleHi', label: 'Title in Hindi (हिंदी नाम)', type: 'text', placeholder: 'e.g. खास ऑफर' },
    { name: 'icon', label: 'Icon Name', type: 'text', defaultValue: 'storefront_rounded', placeholder: 'e.g. local_offer, qr_code, point_of_sale_rounded' },
    { name: 'route', label: 'Mobile App Route', type: 'text', defaultValue: '/home', placeholder: 'e.g. /home, /pos, /products, /customers' },
    { name: 'badgeText', label: 'Badge Tag (Optional)', type: 'text', placeholder: 'e.g. FAST, NEW, 50% OFF' },
  ];

  const previewConfig: MobilePreviewConfig = {
    tenantName,
    appTitle,
    logoUrl,
    primaryColorHex,
    secondaryColorHex,
    accentColorHex,
    currencySymbol,
    fontFamily,
    fontSizeScale,
    textColorHex,
    pageBgColorHex,
    cardBgColorHex,
    amountColorHex,
    buttonBgColorHex,
    buttonTextColorHex,
    menuItems,
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <HeaderNav />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <PageHeader
          title="Enterprise SaaS 360° Client Control Center"
          subtitle="Isolate and configure branding, theme colors, font scaling, POS rules, tax rates, helpline, and menus per SaaS client tenant"
          breadcrumbs={['Home', 'SaaS Admin', 'Multi-Tenant Configurator']}
          primaryAction={{
            label: isSaving ? 'Publishing...' : 'Save & Publish Client Settings Live',
            onClick: handlePublishAll,
            icon: <SaveIcon />,
          }}
        />

        {/* Top High-Profile SaaS Client Selector Bar */}
        <Paper elevation={0} sx={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', p: 2.5, mb: 3, bgcolor: '#FFFFFF' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary" fontWeight="700" letterSpacing={0.5} textTransform="uppercase">
                Select Client Tenant (Multi-Tenant SaaS)
              </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 0.8 }}>
                <Select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(Number(e.target.value))}
                  sx={{ fontWeight: 800, color: '#0F172A', bgcolor: '#F1F5F9' }}
                >
                  {clientList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StorefrontIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight="800">{c.name}</Typography>
                        <Chip label={c.tenantId} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={2}>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block">Client Code</Typography>
                  <Chip label={currentClient.code} color="primary" variant="outlined" size="small" sx={{ fontWeight: 800 }} />
                </Box>

                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block">SaaS Plan Level</Typography>
                  <Chip label={saasPlan} color="secondary" size="small" sx={{ fontWeight: 800 }} />
                </Box>

                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                  <Chip
                    label={accountStatus}
                    color={accountStatus === 'ACTIVE' ? 'success' : accountStatus === 'TRIAL' ? 'warning' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block">Owner Contact</Typography>
                  <Typography variant="subtitle2" fontWeight="700" color="#0F172A">{ownerName} ({ownerPhone})</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {alertMsg && (
          <Alert severity={alertMsg.startsWith('ERROR') ? 'error' : 'success'} sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setAlertMsg('')}>
            {alertMsg}
          </Alert>
        )}

        {isLoadingConfig && (
          <Box display="flex" alignItems="center" gap={2} mb={3} p={2} bgcolor="#EFF6FF" borderRadius="8px">
            <CircularProgress size={20} />
            <Typography variant="body2" fontWeight="700" color="#1E40AF">
              Loading full 360° configuration for {currentClient.name}...
            </Typography>
          </Box>
        )}

        <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderBottom: '1px solid #E2E8F0', px: 2, bgcolor: '#FFFFFF' }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PaletteIcon fontSize="small" />} iconPosition="start" label="1. Branding, Typography & Theme Colors" />
            <Tab icon={<ToggleOnIcon fontSize="small" />} iconPosition="start" label="2. Feature Flags & Business Rules" />
            <Tab icon={<ContactSupportIcon fontSize="small" />} iconPosition="start" label="3. Customer Support Contact" />
            <Tab icon={<MenuIcon fontSize="small" />} iconPosition="start" label="4. Dynamic Drawer Menu Builder" />
            <Tab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label="5. SaaS Account & Plan Settings" />
          </Tabs>

          <Box p={3}>
            {/* Tab 0: Branding, Typography & Colors */}
            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
                    Store & Mobile App Identity Settings
                  </Typography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Client Tenant Name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="App Header Title" value={appTitle} onChange={(e) => setAppTitle(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Store Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Currency Symbol" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth size="small" label="Logo Image URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
                    Typography & Scaling Controls
                  </Typography>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Font Family</InputLabel>
                        <Select value={fontFamily} label="Font Family" onChange={(e) => setFontFamily(e.target.value)}>
                          <MenuItem value="Roboto">Roboto (Default Clean)</MenuItem>
                          <MenuItem value="Inter">Inter (Modern UI)</MenuItem>
                          <MenuItem value="Poppins">Poppins (Friendly Round)</MenuItem>
                          <MenuItem value="Lato">Lato (Professional)</MenuItem>
                          <MenuItem value="Montserrat">Montserrat (Bold Headings)</MenuItem>
                          <MenuItem value="Open Sans">Open Sans (Classic)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Font Size Scale</InputLabel>
                        <Select value={fontSizeScale} label="Font Size Scale" onChange={(e) => setFontSizeScale(Number(e.target.value))}>
                          <MenuItem value={0.85}>85% (Compact Small)</MenuItem>
                          <MenuItem value={0.9}>90% (Slightly Small)</MenuItem>
                          <MenuItem value={1.0}>100% (Standard Normal)</MenuItem>
                          <MenuItem value={1.1}>110% (Large Text)</MenuItem>
                          <MenuItem value={1.2}>120% (Extra Large)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
                    Full 10-Color Palette Control
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Primary Color (App Bar)" value={primaryColorHex} onChange={(e) => setPrimaryColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: primaryColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Secondary Color" value={secondaryColorHex} onChange={(e) => setSecondaryColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: secondaryColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Accent Color (Success)" value={accentColorHex} onChange={(e) => setAccentColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: accentColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Main Text Color" value={textColorHex} onChange={(e) => setTextColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: textColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Page Background Color" value={pageBgColorHex} onChange={(e) => setPageBgColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: pageBgColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Card Background Color" value={cardBgColorHex} onChange={(e) => setCardBgColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: cardBgColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Amount / Price Color" value={amountColorHex} onChange={(e) => setAmountColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: amountColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Button Background Color" value={buttonBgColorHex} onChange={(e) => setButtonBgColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: buttonBgColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Button Text Color" value={buttonTextColorHex} onChange={(e) => setButtonTextColorHex(e.target.value)} InputProps={{ startAdornment: <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: buttonTextColorHex, mr: 1, border: '1px solid #ccc' }} /> }} />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
                    Live Smartphone Preview ({currentClient.name})
                  </Typography>
                  <MobilePhonePreview config={previewConfig} />
                </Grid>
              </Grid>
            )}

            {/* Tab 1: Feature Flags & Business Rules */}
            {activeTab === 1 && (
              <Box maxWidth={800}>
                <Typography variant="h6" fontWeight="800" color="#0F172A" mb={1}>
                  Client Mobile Feature Toggles & POS Rules
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Control mobile app features and billing calculation rules specifically for {currentClient.name}.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enableUdhaar} onChange={(e) => setEnableUdhaar(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">Customer Udhaar Credit Ledger</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enableBarcodeScanner} onChange={(e) => setEnableBarcodeScanner(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">Camera Barcode Scanner Integration</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enableOnlinePayment} onChange={(e) => setEnableOnlinePayment(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">UPI Online Payment Integration</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enableHindiLanguage} onChange={(e) => setEnableHindiLanguage(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">Bilingual Hindi/English Switcher</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enableReceiptPrinting} onChange={(e) => setEnableReceiptPrinting(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">Bluetooth Thermal Receipt Printing</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enablePOSDiscount} onChange={(e) => setEnablePOSDiscount(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">POS Custom Discount Feature</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={enableTaxCalculation} onChange={(e) => setEnableTaxCalculation(e.target.checked)} color="success" />}
                        label={<Typography variant="subtitle2" fontWeight="700">Invoice Tax/GST Calculation</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                      <FormControlLabel
                        control={<Switch checked={allowNegativeStock} onChange={(e) => setAllowNegativeStock(e.target.checked)} color="warning" />}
                        label={<Typography variant="subtitle2" fontWeight="700">Allow Sale when Stock is Zero</Typography>}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" type="number" label="Default GST / Tax Rate %" value={defaultTaxPercent} onChange={(e) => setDefaultTaxPercent(Number(e.target.value))} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" type="number" label="Low Stock Warning Limit (Units)" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Tab 2: Customer Support Contact */}
            {activeTab === 2 && (
              <Box maxWidth={600}>
                <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
                  SaaS Helpline & Support Contacts ({currentClient.name})
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mb={3}>
                  <TextField fullWidth size="small" label="Support Phone Number" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
                  <TextField fullWidth size="small" label="Support Email Address" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                  <TextField fullWidth size="small" label="Support WhatsApp Helpline" value={supportWhatsapp} onChange={(e) => setSupportWhatsapp(e.target.value)} />
                  <TextField fullWidth size="small" label="Helpline Operating Hours" value={supportHours} onChange={(e) => setSupportHours(e.target.value)} />
                </Box>
              </Box>
            )}

            {/* Tab 3: Dynamic Drawer Menu Builder */}
            {activeTab === 3 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="800" color="#0F172A">
                      Dynamic Mobile Drawer Items ({currentClient.name})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customize menu titles in English and Hindi, icons, badges, and visibility.
                    </Typography>
                  </Box>
                  <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                    Add Custom Menu Item
                  </Button>
                </Box>

                <GenericDataTable
                  columns={menuTableColumns}
                  data={menuItems}
                  keyExtractor={(r) => r.id}
                  onEdit={(r) => {
                    setEditingMenuItem(r);
                    setOpenModal(true);
                  }}
                  onDelete={(r) => handleDeleteMenuItem(r)}
                  emptyMessage="No drawer menu items configured."
                />
              </Box>
            )}

            {/* Tab 4: SaaS Account & Plan Settings */}
            {activeTab === 4 && (
              <Box maxWidth={700}>
                <Typography variant="h6" fontWeight="800" color="#0F172A" mb={2}>
                  Client Subscription Plan & Account Status ({currentClient.name})
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>SaaS Subscription Plan</InputLabel>
                      <Select value={saasPlan} label="SaaS Subscription Plan" onChange={(e) => setSaasPlan(e.target.value)}>
                        <MenuItem value="Enterprise SaaS">Enterprise SaaS (Full Multi-Store)</MenuItem>
                        <MenuItem value="Pro Business">Pro Business (Standard POS)</MenuItem>
                        <MenuItem value="Basic Starter">Basic Starter (Single Store)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Account Status</InputLabel>
                      <Select value={accountStatus} label="Account Status" onChange={(e) => setAccountStatus(e.target.value)}>
                        <MenuItem value="ACTIVE">ACTIVE (Fully Functional)</MenuItem>
                        <MenuItem value="TRIAL">TRIAL (30 Days Active)</MenuItem>
                        <MenuItem value="SUSPENDED">SUSPENDED (Access Blocked)</MenuItem>
                        <MenuItem value="EXPIRED">EXPIRED (Renewal Due)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Shopkeeper Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Owner Mobile Number" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" type="number" label="Max Authorized Stores Count" value={storesCount} onChange={(e) => setStoresCount(Number(e.target.value))} />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={handlePublishAll}
                disabled={isSaving}
                startIcon={<SaveIcon />}
                sx={{ px: 4, py: 1.2, fontWeight: 700 }}
              >
                {isSaving ? `Publishing Settings for ${currentClient.name}...` : `Save & Publish Settings for ${currentClient.name}`}
              </Button>
            </Box>
          </Box>
        </Paper>

        <GenericFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={editingMenuItem ? `Edit Menu Item - ${editingMenuItem.titleEn}` : 'Add Custom Drawer Menu Item'}
          fields={modalFields}
          initialValues={editingMenuItem || {}}
          onSubmit={handleSaveModalItem}
          submitLabel={editingMenuItem ? 'Update Menu Item' : 'Add Item'}
        />
      </Container>
    </Box>
  );
};
