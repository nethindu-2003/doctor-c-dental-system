import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, MenuItem, 
  InputAdornment, Alert, Stack, Container, Avatar, Card, CardContent 
} from '@mui/material';
import { 
  PersonAdd, Email, Phone, MedicalServices, Send, 
  AdminPanelSettings, VerifiedUser 
} from '@mui/icons-material';
import api from '../../api/axios'; 
import { validateAddDentist } from '../../utils/validation'; 

const AddDentist = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-clear field-specific errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    setErrors({});

    // 1. RUN VALIDATION
    const validationErrors = validateAddDentist(formData);
    
    // If validation fails, stop and show errors on the specific fields
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/admin/add-dentist', formData);
      setStatus({ type: 'success', msg: 'Invitation sent successfully! The dentist will receive an email shortly.' });
      setFormData({ name: '', email: '', phone: '', specialization: '' }); 
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to invite dentist.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      
      {/* HEADER SECTION (Optional, can be removed if relying on Sidebar context) */}
      <Box mb={4}>
        <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" gutterBottom>
          Team Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Expand your clinic's capacity by inviting new specialists.
        </Typography>
      </Box>

      {/* MAIN CARD WITH SPLIT LAYOUT */}
      <Card 
        elevation={0} 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, row on desktop
          borderRadius: 4, 
          overflow: 'hidden', 
          border: '1px solid #e0e0e0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}
      >
        
        {/* --- LEFT PANEL: VISUAL CONTEXT --- */}
        <Box 
          sx={{ 
            width: { xs: '100%', md: '35%' }, 
            bgcolor: '#1A237E', // Brand Blue
            background: 'linear-gradient(135deg, #1A237E 0%, #0E4C5C 100%)',
            color: 'white',
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Avatar 
            sx={{ 
              width: 80, height: 80, mb: 3, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)' 
            }}
          >
            <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
          </Avatar>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Invite New Dentist
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 4, maxWidth: 250 }}>
            The new dentist will receive a secure link to set up their password and access their portal.
          </Typography>

          {/* Simple Stats or Trust Indicators */}
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 280 }}>
            <Paper sx={{ py: 1.5, px: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', borderRadius: 2 }}>
              <AdminPanelSettings fontSize="small" sx={{ mr: 2, opacity: 0.8 }} />
              <Typography variant="caption">Admin Approval Required</Typography>
            </Paper>
            <Paper sx={{ py: 1.5, px: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', borderRadius: 2 }}>
              <VerifiedUser fontSize="small" sx={{ mr: 2, opacity: 0.8 }} />
              <Typography variant="caption">Secure Invitation Link</Typography>
            </Paper>
          </Stack>
        </Box>


        {/* --- RIGHT PANEL: THE FORM --- */}
        <Box sx={{ width: { xs: '100%', md: '65%' }, p: 5, bgcolor: '#ffffff' }}>
          
          {status.msg && (
            <Alert severity={status.type} sx={{ mb: 4, borderRadius: 2 }}>
              {status.msg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              
              {/* Full Name */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1A237E' }}>Full Name</Typography>
                <TextField 
                  placeholder="e.g. Dr. Sarah Smith" 
                  name="name" 
                  fullWidth 
                  required
                  value={formData.name} 
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonAdd color="action" fontSize="small"/></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1A237E' }}>Email Address</Typography>
                <TextField 
                  placeholder="doctor@clinic.com" 
                  name="email" 
                  type="email" 
                  fullWidth 
                  required
                  value={formData.email} 
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" fontSize="small"/></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1A237E' }}>Phone Number</Typography>
                <TextField 
                  placeholder="077 123 4567" 
                  name="phone" 
                  fullWidth 
                  required
                  value={formData.phone} 
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" fontSize="small"/></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Specialization */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1A237E' }}>Specialization</Typography>
                <TextField 
                  select 
                  fullWidth 
                  required
                  value={formData.specialization} 
                  onChange={handleChange}
                  name="specialization"
                  error={!!errors.specialization}
                  helperText={errors.specialization}
                  InputProps={{ startAdornment: <InputAdornment position="start"><MedicalServices color="action" fontSize="small"/></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">-- Select Specialization --</MenuItem>
                  <MenuItem value="General Dentist">General Dentist</MenuItem>
                  <MenuItem value="Orthodontist">Orthodontist</MenuItem>
                  <MenuItem value="Periodontist">Periodontist</MenuItem>
                  <MenuItem value="Oral Surgeon">Oral Surgeon</MenuItem>
                  <MenuItem value="Pediatric Dentist">Pediatric Dentist</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 5 }}>
              <Button 
                variant="contained" 
                size="large" 
                type="submit" 
                disabled={loading}
                endIcon={<Send />}
                sx={{ 
                  bgcolor: '#1A237E', 
                  px: 5, py: 1.5, 
                  borderRadius: 3, 
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 16px rgba(26, 35, 126, 0.2)'
                }}
              >
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
            </Stack>
          </form>
        </Box>

      </Card>
    </Container>
  );
};

export default AddDentist;