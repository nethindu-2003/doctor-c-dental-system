import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Avatar, 
  Divider, Alert, Stack, IconButton, Container, Card, CardContent, Chip
} from '@mui/material';
import { 
  Edit, Save, Cancel, CameraAlt, Person, Email, Phone, 
  MedicalServices, LocalHospital, VerifiedUser 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DentistProfile = () => {
  const { user } = useAuth(); 

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Alex Martin',
    email: user?.email || 'alex.martin@dental.com',
    phone: user?.phone || '077 123 4567',
    specialization: 'Orthodontist',
    license: 'SLMC-8921', // Added extra field for realism
    bio: 'Senior specialist with 10+ years of experience in reconstructive dentistry.',
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => { setOriginalData(formData); }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      setStatus({ type: 'error', msg: 'Name and Phone are required.' });
      return;
    }
    console.log("Saving...", formData);
    setOriginalData(formData);
    setIsEditing(false);
    setStatus({ type: 'success', msg: 'Profile updated successfully!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setStatus(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      
      {/* STATUS ALERT */}
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
              border: '1px solid #e0e0e0',
              bgcolor: '#ffffff'
            }}
          >
            {/* Avatar Section */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar 
                src="https://source.unsplash.com/random/200x200/?doctor" // Placeholder Image
                sx={{ 
                  width: 120, height: 120, mx: 'auto', 
                  boxShadow: '0 8px 24px rgba(14, 76, 92, 0.2)',
                  border: '4px solid white'
                }} 
              >
                {formData.name.charAt(0)}
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

            <Typography variant="h5" fontWeight="bold" color="#0E4C5C">
              {formData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formData.specialization}
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1, mb: 3 }}>
              <Chip icon={<VerifiedUser sx={{ fontSize: 16 }} />} label="Verified" color="success" size="small" variant="outlined" />
              <Chip label="Active" color="primary" size="small" variant="outlined" />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Quick Stats (Optional Visuals) */}
            <Box sx={{ textAlign: 'left', px: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">LICENSE ID</Typography>
              <Typography variant="body2" fontWeight="500" gutterBottom>{formData.license}</Typography>
              
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mt: 1, display: 'block' }}>JOINED</Typography>
              <Typography variant="body2" fontWeight="500">January 2024</Typography>
            </Box>
          </Card>
        </Grid>


        {/* --- RIGHT COLUMN: DETAILS FORM --- */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              border: '1px solid #e0e0e0' 
            }}
          >
            {/* Header with Buttons */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#0E4C5C">
                  Profile Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your personal information and contact details.
                </Typography>
              </Box>
              
              {!isEditing ? (
                <Button 
                  variant="contained" 
                  startIcon={<Edit />} 
                  onClick={() => setIsEditing(true)}
                  sx={{ borderRadius: 2, bgcolor: '#0E4C5C', px: 3 }}
                >
                  Edit
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" color="inherit" onClick={handleCancel}>Cancel</Button>
                  <Button variant="contained" color="success" onClick={handleSave} startIcon={<Save />}>Save Changes</Button>
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
                  value={formData.specialization} onChange={handleChange} disabled={!isEditing}
                  InputProps={{ startAdornment: <MedicalServices color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Email Address" name="email"
                  value={formData.email} disabled={true}
                  helperText="Email cannot be changed manually"
                  InputProps={{ startAdornment: <Email color="action" sx={{ mr: 1 }} /> }}
                  sx={{ bgcolor: '#f9fafb' }} // Slight grey bg for disabled
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Phone Number" name="phone"
                  value={formData.phone} onChange={handleChange} disabled={!isEditing}
                  InputProps={{ startAdornment: <Phone color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth label="Professional Bio" name="bio"
                  multiline rows={3}
                  value={formData.bio} onChange={handleChange} disabled={!isEditing}
                  placeholder="Write a short bio..."
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