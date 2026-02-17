import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  Avatar, Stack, Switch, FormControlLabel, Alert, IconButton, Chip, Paper, CircularProgress 
} from '@mui/material';
import { 
  Save, PhotoCamera, Lock, Person, MedicalServices, Notifications, Edit, 
  Bloodtype, Phone, Email, Cake 
} from '@mui/icons-material';
import axios from '../../api/axios';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password States
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    allergies: '',
    emailNotifications: true
  });

  // --- 1. FETCH PROFILE ---
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/patient/profile');
      const data = res.data;
      setUserData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        gender: data.gender || '',
        dob: data.dob || '',
        bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '',
        emailNotifications: data.emailNotifications !== false // Default to true if null
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile", err);
      setErrorMsg("Failed to load profile data.");
      setLoading(false);
    }
  };

  // --- 2. HANDLE INPUTS ---
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setUserData({ ...userData, emailNotifications: e.target.checked });
  };

  const handlePasswordChange = (e) => {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // --- 3. SAVE PROFILE ---
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await axios.put('/patient/profile', userData);
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // --- 4. UPDATE PASSWORD ---
  const handleUpdatePassword = async () => {
      setPassError('');
      setPassSuccess('');
      
      if (!passwords.currentPassword || !passwords.newPassword) {
          setPassError("Both password fields are required.");
          return;
      }
      if (passwords.newPassword.length < 6) {
          setPassError("New password must be at least 6 characters long.");
          return;
      }

      try {
          await axios.put('/patient/password', passwords);
          setPassSuccess("Password updated securely.");
          setPasswords({ currentPassword: '', newPassword: '' }); // Clear fields
          setTimeout(() => setPassSuccess(''), 4000);
      } catch (err) {
          setPassError(err.response?.data?.message || "Incorrect current password.");
      }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="primary.dark">
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal details and account settings.
        </Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      {/* --- SECTION 1: PROFILE HEADER --- */}
      <Card sx={{ borderRadius: 4, mb: 4, overflow: 'visible' }}>
        <Box sx={{ background: 'linear-gradient(90deg, #0E4C5C 0%, #166072 100%)', height: 100 }} />
        <CardContent sx={{ position: 'relative', pt: 0, pb: '24px !important' }}>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'center', sm: 'flex-end' }} spacing={3} sx={{ mt: -6, px: 2 }}>
            <Box sx={{ position: 'relative' }}>
               <Avatar sx={{ width: 130, height: 130, border: '4px solid white', bgcolor: 'secondary.main', fontSize: '3.5rem', color: 'primary.dark', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                 {userData.name.charAt(0)}
               </Avatar>
               <IconButton sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', border: '1px solid #eee', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }} component="label">
                 <PhotoCamera fontSize="small" color="primary" />
                 <input hidden accept="image/*" type="file" />
               </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold">
                {userData.name}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                   <Person fontSize="small" /> Verified Patient
                </Typography>
                <Chip label="Active Member" size="small" color="success" variant="outlined" sx={{ height: 20 }} />
              </Stack>
            </Box>
          </Stack>

        </CardContent>
      </Card>

      {/* --- SECTION 2: PERSONAL INFORMATION FORM --- */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e0e0e0', mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}><Person /></Avatar>
          <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Name" name="name" value={userData.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Date of Birth" type="date" name="dob" value={userData.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Cake color="action" sx={{ mr: 1, opacity: 0.5 }} /> }} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="Gender" name="gender" value={userData.gender} onChange={handleChange} SelectProps={{ native: true }}>
              <option value=""></option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Phone Number" name="phone" value={userData.phone} onChange={handleChange} InputProps={{ endAdornment: <Phone color="action" sx={{ mr: 1, opacity: 0.5 }} /> }} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Blood Group" name="bloodGroup" value={userData.bloodGroup} onChange={handleChange} InputProps={{ endAdornment: <Bloodtype color="action" sx={{ mr: 1, opacity: 0.5 }} /> }} />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Residential Address" name="address" value={userData.address} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
             <TextField fullWidth label="Email Address" value={userData.email} disabled InputProps={{ endAdornment: <Email color="action" sx={{ mr: 1, opacity: 0.5 }} /> }} helperText="Contact admin to change login email" />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Medical Conditions / Allergies" name="allergies" value={userData.allergies} onChange={handleChange} sx={{ '& .MuiInputBase-input': { color: 'error.main', fontWeight: 500 } }} />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button variant="contained" size="large" startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <Save />} onClick={handleSaveProfile} disabled={saving} sx={{ borderRadius: 50, px: 5 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      {/* --- SECTION 3: SECURITY & SETTINGS --- */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}><Lock /></Avatar>
              <Typography variant="h6" fontWeight="bold">Security</Typography>
            </Stack>
            
            {passError && <Alert severity="error" sx={{ mb: 2 }}>{passError}</Alert>}
            {passSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passSuccess}</Alert>}

            <Stack spacing={2}>
              <TextField fullWidth type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} label="Current Password" size="small" />
              <TextField fullWidth type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} label="New Password (Min 6 chars)" size="small" />
              <Button variant="outlined" onClick={handleUpdatePassword} sx={{ width: 'fit-content', borderRadius: 50, mt: 1 }}>
                Update Password
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
             <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}><Notifications /></Avatar>
              <Typography variant="h6" fontWeight="bold">System Notifications</Typography>
            </Stack>
            <Box sx={{ bgcolor: '#FAFAFA', p: 3, borderRadius: 3 }}>
              <FormControlLabel 
                control={<Switch checked={userData.emailNotifications} onChange={handleToggle} />} 
                label={<Typography fontWeight="bold">Email Notifications</Typography>} 
                sx={{ display: 'block', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mb: 2, ml: 4 }}>
                When enabled, you will automatically receive:
              </Typography>
              <ul style={{ color: '#666', fontSize: '0.875rem', marginTop: 0 }}>
                  <li>Instant booking confirmations and receipts.</li>
                  <li>Automated reminders 12 hours before appointments.</li>
                  <li>Automated reminders 24 hours before treatment sessions.</li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Paper>

    </Box>
  );
};

export default ProfileSettings;