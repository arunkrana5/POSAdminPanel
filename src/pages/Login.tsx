import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { PostResponse, TokenResponse } from '../types/api';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [tenantCode, setTenantCode] = useState('SHARMA_SHOP');
  const [username, setUsername] = useState('admin');
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
            <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 3 }}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
