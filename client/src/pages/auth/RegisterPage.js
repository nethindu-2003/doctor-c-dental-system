import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, InputAdornment, IconButton, Link, Container, Stack, Paper, MenuItem, Grid, Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack, Phone, Person, CalendarToday } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { validateRegistration } from '../../utils/validation'; // <--- IMPORT VALIDATION

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); 

  // --- 1. STATE MANAGEMENT ---
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '', 
    dob: '',
    password: '',
    confirmPassword: '' // <--- Added Confirm Password
  });

  const [errors, setErrors] = useState({}); // Stores field-specific errors
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  // --- 2. HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Auto-clear error when user types to improve UX
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleRegister = async () => {
    setServerError('');
    setSuccess('');

    // 1. RUN VALIDATION LOGIC
    const validationErrors = validateRegistration(formData);
    
    // If validation fails, stop and show errors on the specific fields
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; 
    }

    try {
      // 2. Call Backend API (Only if valid)
      // Note: We do NOT send confirmPassword to the backend
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password
      });

      setSuccess('Registration successful! Please check your email to verify.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflowX: 'hidden',
      py: 4 
    }}>
      
      {/* 1. DARK TEAL OVERLAY */}
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'linear-gradient(135deg, rgba(14, 76, 92, 0.9) 0%, rgba(6, 46, 56, 0.85) 100%)',
        zIndex: 1
      }} />

      {/* 2. CENTERED REGISTER CARD */}
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          
          <Paper elevation={24} sx={{ 
            p: { xs: 4, md: 5 }, 
            borderRadius: 4, 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>

            {/* Back to Home Link */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer', color: 'text.secondary' }} 
              onClick={() => navigate('/')}
            >
               <ArrowBack sx={{ fontSize: 18, mr: 1 }} />
               <Typography variant="caption" fontWeight="bold">Back to Home</Typography>
            </Box>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" color="primary.dark" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join Doctor C Dental Clinic as a new patient.
              </Typography>
            </Box>

            {/* Global Alerts */}
            {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}


            {/* FORM FIELDS */}
            <Stack spacing={2.5}>
              
              <TextField 
                label="Full Name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth 
                variant="outlined" 
                error={!!errors.name}      // <--- Turn Red on Error
                helperText={errors.name}   // <--- Show Error Message
                InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} 
              />

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
                label="Phone Number" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth 
                variant="outlined" 
                error={!!errors.phone}
                helperText={errors.phone}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} 
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField 
                      select 
                      label="Gender" 
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      fullWidth 
                      defaultValue=""
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField 
                      label="Date of Birth" 
                      name="dob"
                      type="date" 
                      value={formData.dob}
                      onChange={handleChange}
                      fullWidth 
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday color="action" fontSize="small" /></InputAdornment> }} 
                    />
                </Grid>
              </Grid>

              {/* PASSWORD FIELD */}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) 
                }} 
              />

              {/* CONFIRM PASSWORD FIELD (NEW) */}
              <TextField 
                label="Confirm Password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type="password" 
                fullWidth 
                variant="outlined" 
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> 
                }} 
              />

            </Stack>

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleRegister} 
              sx={{ 
                mt: 4,
                py: 1.5, 
                borderRadius: 50, 
                fontSize: '1.1rem',
                fontWeight: 700,
                boxShadow: '0 10px 30px rgba(14, 76, 92, 0.2)',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 40px rgba(14, 76, 92, 0.4)' }
              }}
            >
              Register
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
              Already have an account? 
              <Link 
                component="button" 
                onClick={() => navigate('/login')} 
                sx={{ ml: 1, fontWeight: 'bold', color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }}
              >
                Login here
              </Link>
            </Typography>

          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterPage;