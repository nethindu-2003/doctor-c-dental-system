import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Tabs, Tab, InputAdornment, IconButton, Link, Container, Stack, Paper, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios'; 
import { EMAIL_REGEX, PASSWORD_REGEX, validateLogin, validateForgotPasswordEmail, validatePasswordUpdate } from '../../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || searchParams.get('resetToken');

  // --- STATES ---
  const [role, setRole] = useState(0); // 0=Patient, 1=Dentist, 2=Admin
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  
  // POPUP 1: Forgot Password
  const [openForgot, setOpenForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetRole, setResetRole] = useState(0); // 0=Patient, 1=Dentist (No Admin)
  const [resetStatus, setResetStatus] = useState({ msg: '', type: '' });
  const [resetErrors, setResetErrors] = useState('');
  const [isSending, setIsSending] = useState(false);

  // POPUP 2: Reset Password
  const [openReset, setOpenReset] = useState(false);
  const [newPasswords, setNewPasswords] = useState({ new: '', confirm: '' });
  const [updateStatus, setUpdateStatus] = useState({ msg: '', type: '' });
  const [updateErrors, setUpdateErrors] = useState({});

  useEffect(() => {
    if (urlToken) {
      setOpenReset(true); 
    }
  }, [urlToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-clear field-specific errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // 1. RUN VALIDATION
    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const roleMap = ['patient', 'dentist', 'admin'];
    const selectedRole = roleMap[role]; 

    try {
      await login(formData.email, formData.password, selectedRole);
      
      if (selectedRole === 'patient') navigate('/patient/dashboard');
      else if (selectedRole === 'dentist') navigate('/dentist/dashboard');
      else if (selectedRole === 'admin') navigate('/admin/dashboard'); 

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // --- HANDLER FOR POPUP 1 (SEND LINK) ---
  const handleSendLink = async () => {
    setResetErrors('');
    setResetStatus({ msg: '', type: '' });

    // Validate email
    const emailError = validateForgotPasswordEmail(resetEmail);
    if (emailError) {
      setResetErrors(emailError);
      return;
    }

    try {
      setIsSending(true);
      setResetStatus({ msg: '', type: '' });

      // Only allow Patient (0) and Dentist (1)
      const roleMap = ['patient', 'dentist']; 
      const selectedResetRole = roleMap[resetRole];

      await axios.post('/forgot-password', { 
        email: resetEmail, 
        role: selectedResetRole 
      });

      setResetStatus({ msg: `Reset link sent to your ${selectedResetRole} email!`, type: 'success' });
      
      setTimeout(() => {
        setOpenForgot(false);
        setResetEmail('');
        setResetStatus({ msg: '', type: '' });
        setResetErrors('');
      }, 3000);

    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? `No ${['patient', 'dentist'][resetRole]} account found with this email.` 
        : (err.response?.data?.message || 'Error sending email.');
      
      setResetStatus({ msg: errorMsg, type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdatePassword = async () => {
    setUpdateStatus({ msg: '', type: '' });
    setUpdateErrors({});

    // Validate passwords
    const validationErrors = validatePasswordUpdate(newPasswords.new, newPasswords.confirm);
    if (Object.keys(validationErrors).length > 0) {
      setUpdateErrors(validationErrors);
      return;
    }

    try {
      await axios.post('/reset-password', { 
        token: urlToken, 
        newPassword: newPasswords.new 
      });

      setUpdateStatus({ msg: 'Password updated successfully! Please login.', type: 'success' });
      
      setTimeout(() => {
        setOpenReset(false);
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err) {
      setUpdateStatus({ msg: err.response?.data?.message || 'Failed to update password.', type: 'error' });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
      backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflowX: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(14, 76, 92, 0.9) 0%, rgba(6, 46, 56, 0.85) 100%)', zIndex: 1 }} />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper elevation={24} sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer', color: 'text.secondary' }} onClick={() => navigate('/')}>
               <ArrowBack sx={{ fontSize: 18, mr: 1 }} />
               <Typography variant="caption" fontWeight="bold">Back to Home</Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" color="primary.dark" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, mb: 1 }}>Welcome Back</Typography>
              <Typography variant="body2" color="text.secondary">Login to access your dashboard.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* MAIN LOGIN TABS (All 3 Roles) */}
            <Tabs value={role} onChange={(e, v) => setRole(v)} variant="fullWidth" sx={{ mb: 4, borderBottom: '1px solid #e0e0e0' }}>
              <Tab label="Patient" />
              <Tab label="Dentist" />
              <Tab label="Admin" />
            </Tabs>

            <form onSubmit={handleLogin}>
              <Stack spacing={2.5}>
                <TextField 
                  label="Email Address" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  fullWidth 
                  variant="outlined"
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} 
                />
                <TextField 
                  label="Password" 
                  name="password"
                  value={formData.password} 
                  onChange={handleChange} 
                  type={showPassword ? 'text' : 'password'} 
                  fullWidth 
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>, 
                    endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) 
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link 
                    component="button" type="button" variant="body2" 
                    onClick={() => {
                        // If Admin (2) is selected, switch resetRole to Patient (0) because Admin can't reset
                        setResetRole(role === 2 ? 0 : role); 
                        setOpenForgot(true);
                    }} 
                    sx={{ color: 'text.secondary', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </Stack>
              
              <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 4, py: 1.5, borderRadius: 50, fontSize: '1.1rem', fontWeight: 700 }}>
                Login as {['Patient', 'Dentist', 'Admin'][role]}
              </Button>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
              Don't have an account? <Link component="button" onClick={() => navigate('/register')} sx={{ ml: 1, fontWeight: 'bold', color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }}>Register here</Link>
            </Typography>

          </Paper>
        </motion.div>
      </Container>

      {/* --- POPUP 1: FORGOT PASSWORD (NO ADMIN) --- */}
      <Dialog open={openForgot} onClose={() => setOpenForgot(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select your account type and enter your email.
          </DialogContentText>
          
          {/* RESET TABS (Only Patient & Dentist) */}
          <Tabs 
            value={resetRole} 
            onChange={(e, v) => setResetRole(v)} 
            variant="fullWidth" 
            sx={{ mb: 2, borderBottom: '1px solid #e0e0e0' }}
          >
            <Tab label="Patient" />
            <Tab label="Dentist" />
          </Tabs>

          {resetErrors && <Alert severity="error" sx={{ mb: 2 }}>{resetErrors}</Alert>}
          {resetStatus.msg && <Alert severity={resetStatus.type} sx={{ mb: 2 }}>{resetStatus.msg}</Alert>}
          
          <TextField
            autoFocus margin="dense" label="Email Address" type="email" fullWidth variant="outlined"
            value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} disabled={isSending}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenForgot(false)} color="inherit" disabled={isSending}>Cancel</Button>
          <Button onClick={handleSendLink} variant="contained" disabled={!resetEmail || isSending}>
            {isSending ? 'Sending...' : 'Send Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- POPUP 2: UPDATE PASSWORD --- */}
      <Dialog open={openReset} onClose={() => {}} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Set New Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Please enter your new password below.</DialogContentText>
          {updateStatus.msg && <Alert severity={updateStatus.type} sx={{ mb: 2 }}>{updateStatus.msg}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="New Password" 
              type="password" 
              fullWidth 
              variant="outlined" 
              value={newPasswords.new} 
              onChange={(e) => setNewPasswords({...newPasswords, new: e.target.value})}
              error={!!updateErrors.new}
              helperText={updateErrors.new}
            />
            <TextField 
              label="Confirm Password" 
              type="password" 
              fullWidth 
              variant="outlined" 
              value={newPasswords.confirm} 
              onChange={(e) => setNewPasswords({...newPasswords, confirm: e.target.value})}
              error={!!updateErrors.confirm}
              helperText={updateErrors.confirm}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleUpdatePassword} variant="contained" fullWidth>Update Password</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default LoginPage;