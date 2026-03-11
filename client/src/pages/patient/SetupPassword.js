import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Alert, Stack, InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, LockOpen, CheckCircleOutline } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- VALIDATION LOGIC ---
  const validatePassword = (pass) => {
    // Regex: At least 8 characters, at least 1 letter, at least 1 number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check if token exists
    if (!token) {
      setError("Invalid setup link. Please use the link sent to your email.");
      return;
    }

    // 2. Check strict password rules
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    // 3. Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 4. Send to Backend
    setLoading(true);
    try {
      await axios.post('/patient/setup-password', {
        token: token,
        password: password
      });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set up password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  // If link is completely broken/missing token
  useEffect(() => {
      if (!token) {
          setError("No security token found in the URL. Please click the exact link from your email.");
      }
  }, [token]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f7f6', p: 2 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, maxWidth: 450, width: '100%', borderRadius: 3 }}>
        
        {success ? (
            // --- SUCCESS STATE ---
            <Box textAlign="center" py={4}>
                <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>Account Activated!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your password has been securely set. You are being redirected to the login page...
                </Typography>
                <CircularProgress size={24} />
            </Box>
        ) : (
            // --- SETUP FORM ---
            <Box>
                <Box textAlign="center" mb={4}>
                    <Avatar sx={{ bgcolor: '#1A237E', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                        <LockOpen />
                    </Avatar>
                    <Typography variant="h5" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E">
                        Secure Your Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Welcome to Doctor C Dental! Please create a strong password to access your patient portal.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField 
                            label="New Password" 
                            type={showPassword ? 'text' : 'password'} 
                            fullWidth 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="Must contain at least 8 characters, including letters and numbers."
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField 
                            label="Confirm Password" 
                            type={showPassword ? 'text' : 'password'} 
                            fullWidth 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large" 
                            fullWidth 
                            disabled={loading || !token}
                            sx={{ bgcolor: '#1A237E', py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Set Password & Login'}
                        </Button>
                    </Stack>
                </form>
            </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SetupPassword;