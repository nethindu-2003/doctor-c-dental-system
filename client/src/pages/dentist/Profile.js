import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Avatar, 
  Divider, Alert, Stack, IconButton, Container, Card, CardContent, Chip, CircularProgress
} from '@mui/material';
import { 
  Edit, Save, Cancel, CameraAlt, Person, Email, Phone, 
  MedicalServices, VerifiedUser, Badge as BadgeIcon, AutoAwesome
} from '@mui/icons-material';
import axios from '../../api/axios'; // Adjust path if necessary

const DentistProfile = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', licenseId: '', bio: ''
  });

  const [originalData, setOriginalData] = useState({});

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/dentist/profile');
        setFormData(res.data);
        setOriginalData(res.data);
      } catch (err) {
        setStatus({ type: 'error', msg: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      setStatus({ type: 'error', msg: 'Name and Phone are required.' });
      return;
    }

    try {
        setStatus(null);
        const res = await axios.put('/dentist/profile', formData);
        setFormData(res.data);
        setOriginalData(res.data);
        setIsEditing(false);
        setStatus({ type: 'success', msg: 'Profile updated successfully!' });
        setTimeout(() => setStatus(null), 4000);
    } catch (err) {
        setStatus({ type: 'error', msg: 'Failed to update profile.' });
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setStatus(null);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 8 }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E">
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your clinical identity and contact credentials.
        </Typography>
      </Box>

      {status && (
        <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
          {status.msg}
        </Alert>
      )}

      <Grid container spacing={4}>
        
        {/* --- LEFT COLUMN: IDENTITY CARD --- */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              textAlign: 'center', 
              p: 3, 
              border: '1px solid #E0E4E8',
              bgcolor: '#F8FAFC', // Sleek ultra-light blue/grey
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Aesthetic Top Bar */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', bgcolor: '#1A237E', borderRadius: '16px 16px 0 0' }} />

            {/* Avatar Section */}
            <Box sx={{ position: 'relative', display: 'inline-block', mt: 2, mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 130, height: 130, mx: 'auto', 
                  bgcolor: '#ffffff', color: '#1A237E',
                  boxShadow: '0 8px 24px rgba(26, 35, 126, 0.15)',
                  border: '4px solid white',
                  fontSize: '3rem',
                  fontWeight: 'bold'
                }} 
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'D'}
              </Avatar>
              <IconButton 
                color="primary" 
                sx={{ 
                  position: 'absolute', bottom: 5, right: 5, 
                  bgcolor: 'white', boxShadow: 2, 
                  '&:hover': { bgcolor: '#f5f5f5' } 
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h5" fontWeight="900" color="#1A237E">
              Dr. {formData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
              {formData.specialization || 'General Dentistry'}
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2, mb: 3 }}>
              <Chip icon={<VerifiedUser sx={{ fontSize: 16 }} />} label="SLMC Verified" color="success" size="small" sx={{ fontWeight: 'bold' }} />
              <Chip label="Active Staff" color="primary" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Read-Only Stats */}
            <Box sx={{ textAlign: 'left', px: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                 <BadgeIcon color="action" fontSize="small" />
                 <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">CLINICAL LICENSE</Typography>
                    <Typography variant="body2" fontWeight="600">{formData.licenseId || 'Pending'}</Typography>
                 </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                 <AutoAwesome color="action" fontSize="small" />
                 <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">CLINIC STATUS</Typography>
                    <Typography variant="body2" fontWeight="600">Practicing</Typography>
                 </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COLUMN: DETAILS FORM --- */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4, 
              border: '1px solid #E0E4E8' 
            }}
          >
            {/* Header with Buttons */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#1A237E">
                  Professional Information
                </Typography>
              </Box>
              
              {!isEditing ? (
                <Button 
                  variant="contained" 
                  startIcon={<Edit />} 
                  onClick={() => setIsEditing(true)}
                  sx={{ borderRadius: 2, bgcolor: '#1A237E', px: 3, fontWeight: 'bold', textTransform: 'none' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Cancel</Button>
                  <Button variant="contained" color="success" onClick={handleSave} startIcon={<Save />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Save Changes</Button>
                </Stack>
              )}
            </Box>

            {/* The Form */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Full Name" name="name"
                  value={formData.name} onChange={handleChange} disabled={!isEditing}
                  InputProps={{ startAdornment: <Person color="action" sx={{ mr: 1 }} /> }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Specialization" name="specialization"
                  value={formData.specialization || ''} onChange={handleChange} disabled={!isEditing}
                  InputProps={{ startAdornment: <MedicalServices color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Email Address" name="email"
                  value={formData.email} disabled={true}
                  helperText="Contact admin to change system email."
                  InputProps={{ startAdornment: <Email color="action" sx={{ mr: 1 }} /> }}
                  sx={{ '& .MuiInputBase-root.Mui-disabled': { bgcolor: '#F8FAFC' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Contact Number" name="phone"
                  value={formData.phone} onChange={handleChange} disabled={!isEditing}
                  InputProps={{ startAdornment: <Phone color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth label="License ID" name="licenseId"
                  value={formData.licenseId || ''} onChange={handleChange} disabled={!isEditing}
                  placeholder="e.g. SLMC-12345"
                  InputProps={{ startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth label="Professional Biography" name="bio"
                  multiline rows={4}
                  value={formData.bio || ''} onChange={handleChange} disabled={!isEditing}
                  placeholder="Share a brief overview of your clinical experience and expertise..."
                />
              </Grid>
            </Grid>

          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default DentistProfile;