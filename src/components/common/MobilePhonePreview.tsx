import React from 'react';
import { Box, Typography, Avatar, Chip, Paper } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import WifiIcon from '@mui/icons-material/Wifi';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';

export interface MobilePreviewConfig {
  tenantName: string;
  appTitle: string;
  logoUrl?: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  accentColorHex: string;
  currencySymbol: string;
  fontFamily: string;
  fontSizeScale: number;
  textColorHex: string;
  pageBgColorHex: string;
  cardBgColorHex: string;
  amountColorHex: string;
  buttonBgColorHex: string;
  buttonTextColorHex: string;
  menuItems: Array<{
    id: string;
    titleEn: string;
    titleHi: string;
    icon: string;
    isEnabled: boolean;
    badgeText?: string;
  }>;
}

interface MobilePhonePreviewProps {
  config: MobilePreviewConfig;
}

export const MobilePhonePreview: React.FC<MobilePhonePreviewProps> = ({ config }) => {
  const primary = config.primaryColorHex || '#0F172A';
  const secondary = config.secondaryColorHex || '#D97706';
  const accent = config.accentColorHex || '#10B981';
  const pageBg = config.pageBgColorHex || '#F8FAFC';
  const cardBg = config.cardBgColorHex || '#FFFFFF';
  const textColor = config.textColorHex || '#0F172A';
  const amountColor = config.amountColorHex || '#16A34A';
  const buttonBg = config.buttonBgColorHex || '#2563EB';
  const buttonText = config.buttonTextColorHex || '#FFFFFF';
  const fontFam = config.fontFamily || 'Roboto';
  const scale = config.fontSizeScale || 1.0;

  const baseFont = (size: number) => `${size * scale}rem`;

  return (
    <Box
      sx={{
        width: 300,
        height: 600,
        borderRadius: '36px',
        bgcolor: '#1E293B',
        p: 1.5,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '4px solid #334155',
        position: 'relative',
        mx: 'auto',
        fontFamily: fontFam,
      }}
    >
      {/* Phone Camera Notch */}
      <Box
        sx={{
          width: 100,
          height: 18,
          bgcolor: '#0F172A',
          borderRadius: '0 0 12px 12px',
          mx: 'auto',
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      />

      {/* Screen Canvas */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: pageBg,
          borderRadius: '26px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: fontFam,
        }}
      >
        {/* Status Bar */}
        <Box
          sx={{
            bgcolor: primary,
            color: '#FFFFFF',
            px: 2,
            pt: 1.2,
            pb: 0.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: baseFont(0.65),
            fontWeight: 700,
          }}
        >
          <span>9:41</span>
          <Box display="flex" gap={0.5} alignItems="center">
            <SignalCellularAltIcon sx={{ fontSize: 10 }} />
            <WifiIcon sx={{ fontSize: 10 }} />
            <BatteryFullIcon sx={{ fontSize: 10 }} />
          </Box>
        </Box>

        {/* Mobile App Bar */}
        <Box
          sx={{
            bgcolor: primary,
            color: '#FFFFFF',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {config.logoUrl ? (
            <Avatar src={config.logoUrl} sx={{ width: 28, height: 28, border: '1px solid #FFFFFF' }} />
          ) : (
            <Avatar sx={{ width: 28, height: 28, bgcolor: secondary, fontSize: baseFont(0.75), fontWeight: 800 }}>
              {config.tenantName ? config.tenantName[0] : 'V'}
            </Avatar>
          )}
          <Box overflow="hidden">
            <Typography variant="body2" fontWeight="800" fontSize={baseFont(0.775)} noWrap color="#FFFFFF" fontFamily={fontFam}>
              {config.tenantName || 'Village Store'}
            </Typography>
            <Typography variant="caption" fontSize={baseFont(0.6)} sx={{ opacity: 0.8, color: '#FFFFFF', display: 'block' }} fontFamily={fontFam}>
              {config.appTitle || 'POS SYSTEM'}
            </Typography>
          </Box>
        </Box>

        {/* Dynamic Content Container */}
        <Box sx={{ flex: 1, p: 1.2, bgcolor: pageBg, overflowY: 'auto' }}>
          {/* Sample Store Balance Card */}
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              mb: 1.2,
              borderRadius: '10px',
              bgcolor: cardBg,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="caption" fontWeight="700" color={textColor} fontSize={baseFont(0.65)} display="block" fontFamily={fontFam}>
              Today's Udhaar & Collection
            </Typography>
            <Typography variant="h6" fontWeight="900" color={amountColor} fontSize={baseFont(1.1)} fontFamily={fontFam}>
              {config.currencySymbol || '₹'} 14,850.00
            </Typography>
          </Paper>

          <Typography variant="caption" fontWeight="800" color={textColor} fontSize={baseFont(0.65)} px={0.5} mb={0.5} display="block" fontFamily={fontFam} sx={{ opacity: 0.8 }}>
            DRAWER MENU PREVIEW ({fontFam})
          </Typography>

          <Box display="flex" flexDirection="column" gap={0.6}>
            {config.menuItems
              .filter((m) => m.isEnabled)
              .slice(0, 4)
              .map((item, idx) => (
                <Paper
                  key={item.id || idx}
                  elevation={0}
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    bgcolor: idx === 0 ? `${primary}15` : cardBg,
                    border: idx === 0 ? `1px solid ${primary}` : '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '6px',
                        bgcolor: idx === 0 ? primary : '#94A3B8',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: baseFont(0.65),
                        fontWeight: 800,
                      }}
                    >
                      {item.titleEn ? item.titleEn[0] : 'M'}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="700" fontSize={baseFont(0.725)} color={textColor} fontFamily={fontFam}>
                        {item.titleEn}
                      </Typography>
                      <Typography variant="caption" fontSize={baseFont(0.6)} color={textColor} display="block" fontFamily={fontFam} sx={{ opacity: 0.7 }}>
                        {item.titleHi}
                      </Typography>
                    </Box>
                  </Box>

                  {item.badgeText && (
                    <Chip
                      label={item.badgeText}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: baseFont(0.55),
                        fontWeight: 800,
                        bgcolor: accent,
                        color: '#FFFFFF',
                      }}
                    />
                  )}
                </Paper>
              ))}
          </Box>
        </Box>

        {/* Mobile Action Button Footer */}
        <Box sx={{ p: 1.2, bgcolor: pageBg, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Box
            sx={{
              bgcolor: buttonBg,
              color: buttonText,
              py: 0.8,
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: baseFont(0.725),
              fontFamily: fontFam,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              cursor: 'pointer',
            }}
          >
            + NEW SALE / POS ({config.currencySymbol || '₹'})
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
