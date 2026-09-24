import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { PostResponse, TokenResponse } from '../types/api';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [tenantCode, setTenantCode] = useState('SUPERADMIN');
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post<PostResponse>('/auth/login', {
        tenantCode,
        username,
        password,
      });

      if (response.data.status) {
        const tokenData: TokenResponse = JSON.parse(response.data.additionalMessage);
        login(tokenData);
        navigate('/dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to VillageShop API.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="primary" fontWeight="bold">
            VillageShop SaaS
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" mb={3}>
            Shopkeeper & Admin Portal
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
            <Typography variant="caption" display="block" color="#1E40AF" fontWeight="700" mb={1}>
              ⚡ Quick Credentials Auto-Fill
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  setTenantCode('SUPERADMIN');
                  setUsername('superadmin');
                  setPassword('admin123');
                }}
                sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'none' }}
              >
                SuperAdmin
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => {
                  setTenantCode('SHARMA_SHOP');
                  setUsername('sharma_admin');
                  setPassword('admin123');
                }}
                sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}
              >
                Sharma Shop
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => {
                  setTenantCode('GUPTA_KIRANA');
                  setUsername('gupta_admin');
                  setPassword('admin123');
                }}
                sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}
              >
                Gupta Kirana
              </Button>
            </Box>
          </Box>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Tenant Code"
              variant="outlined"
              margin="dense"
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="dense"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 3, fontWeight: 700 }}>
              Sign In to SaaS Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
