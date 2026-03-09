import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Avatar, Tooltip, CircularProgress, Alert 
} from '@mui/material';
import { 
  Search, PersonAdd, Block, CheckCircle, Delete, FilterList, Warning, Send 
} from '@mui/icons-material';
import axios from '../../api/axios';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal States
  const [openAdd, setOpenAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Updated state: Only 'name', no password
  const [newPatient, setNewPatient] = useState({ 
      name: '', email: '', phone: '', gender: '', dob: '' 
  });

  // --- FETCH PATIENTS ---
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/admin/patients');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(`/admin/patients/${id}/status`);
      setPatients(patients.map(p => p.patientId === id ? res.data : p));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddSubmit = async () => {
    setAdding(true);
    setErrorMsg('');
    try {
      const res = await axios.post('/admin/patients', newPatient);
      setPatients([...patients, res.data]);
      setSuccessMsg(`Patient ${res.data.name} added. Invitation email sent successfully!`);
      setOpenAdd(false);
      setNewPatient({ name: '', email: '', phone: '', gender: '', dob: '' });
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add patient.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (id) => {
      setPatientToDelete(id);
      setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
      try {
          await axios.delete(`/admin/patients/${patientToDelete}`);
          setPatients(patients.filter(p => p.patientId !== patientToDelete));
          setDeleteConfirmOpen(false);
          setSuccessMsg("Patient deleted successfully.");
          setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
          alert("Failed to delete patient. They may have existing records.");
      }
  };

  // --- FILTER LOGIC ---
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusText = p.isActive ? 'Active' : 'Inactive';
    const matchesFilter = filterStatus === 'All' || statusText === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3, gap: 2 }}>
        <Box>
           <Typography variant="h4" fontWeight="bold" fontFamily="Playfair Display" color="#1A237E">Patient Management</Typography>
           <Typography variant="body2" color="text.secondary">Register walk-in patients and manage accounts.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />} 
          onClick={() => setOpenAdd(true)}
          sx={{ bgcolor: '#1A237E' }}
        >
          New Patient
        </Button>
      </Stack>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', border: '1px solid #e0e0e0' }}>
        <TextField
          placeholder="Search patients by name or email..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><FilterList /></InputAdornment> }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All">All Status</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        {loading ? (
            <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
            <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: '#F4F7F6' }}>
                <TableRow>
                    <TableCell><strong>Patient Details</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {filteredPatients.map((row) => (
                    <TableRow key={row.patientId} hover>
                    <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: row.isActive ? '#1A237E' : 'grey' }}>
                            {row.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold">{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">ID: PT-00{row.patientId}</Typography>
                        </Box>
                        </Stack>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                        <Chip 
                        label={row.isActive ? 'Active' : 'Inactive'} 
                        size="small"
                        color={row.isActive ? 'success' : 'default'}
                        variant={row.isActive ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 'bold' }}
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Stack direction="row" justifyContent="center">
                        <Tooltip title={row.isActive ? "Deactivate Account" : "Activate Account"}>
                            <IconButton 
                            size="small" 
                            color={row.isActive ? "warning" : "success"}
                            onClick={() => handleToggleStatus(row.patientId)}
                            >
                            {row.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(row.patientId)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        </Stack>
                    </TableCell>
                    </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No patients found.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </TableContainer>
        )}
      </Paper>

      {/* ADD PATIENT DIALOG */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Register Walk-In Patient</DialogTitle>
        <DialogContent dividers>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
             Fill in the patient's details below. An invitation email will be sent to them to set up their password.
           </Typography>

           {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
           <Stack spacing={2}>
              <TextField label="Full Name" fullWidth value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} />
              <TextField label="Email Address" fullWidth type="email" value={newPatient.email} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} />
              <TextField label="Phone Number" fullWidth value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} />
              <Stack direction="row" spacing={2}>
                 <TextField select label="Gender" fullWidth value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                 </TextField>
                 <TextField label="DOB" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newPatient.dob} onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})} />
              </Stack>
           </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
           <Button onClick={() => setOpenAdd(false)} color="inherit" disabled={adding}>Cancel</Button>
           <Button variant="contained" endIcon={<Send />} onClick={handleAddSubmit} sx={{ bgcolor: '#1A237E' }} disabled={adding}>
               {adding ? 'Sending Invite...' : 'Send Invite'}
           </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <Warning sx={{ mr: 1 }} /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
            <Typography>Are you sure you want to permanently delete this patient? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients;