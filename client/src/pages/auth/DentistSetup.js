import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, Button, Alert, Container, Stack 
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import api from '../../api/axios';

const DentistSetup = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', msg: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      // Call the backend to set the password
      await api.post('/setup-dentist', { token, newPassword: passwords.new });
      
      setStatus({ type: 'success', msg: 'Account setup complete! Redirecting to login...' });
      
      // Redirect to Login Page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Setup failed. Link may be expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(14, 76, 92, 0.9) 0%, rgba(6, 46, 56, 0.85) 100%)'
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <LockReset sx={{ fontSize: 50, color: '#0E4C5C', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Set Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Welcome, Doctor. Please create a secure password to activate your account.
          </Typography>

          {status.msg && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField 
                label="New Password" type="password" fullWidth required 
                value={passwords.new} 
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              />
              <TextField 
                label="Confirm Password" type="password" fullWidth required 
                value={passwords.confirm} 
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              />
              <Button 
                type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{ bgcolor: '#0E4C5C', mt: 2 }}
              >
                {loading ? 'Activating...' : 'Activate Account'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default DentistSetup;