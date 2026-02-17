import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Avatar, Tooltip 
} from '@mui/material';
import { 
  Search, PersonAdd, Edit, Block, CheckCircle, Delete, FilterList 
} from '@mui/icons-material';
import api from '../../api/axios'; // Use your configured axios

// --- MOCK DATA (Based on Prototype Page 3) ---
const initialPatients = [
  { id: '1', patientId: 'PT12345', name: 'Sophia Clark', email: 'sophia.clark@example.com', phone: '(555) 123-4567', status: 'Active' }, // [cite: 484-488]
  { id: '2', patientId: 'PT67890', name: 'Ethan Bennett', email: 'ethan.bennett@example.com', phone: '(555) 987-6543', status: 'Inactive' }, // [cite: 490-494]
  { id: '3', patientId: 'PT24680', name: 'Olivia Reed', email: 'olivia.reed@example.com', phone: '(555) 246-8013', status: 'Active' }, // [cite: 499-504]
];

const Patients = () => {
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal State for "Add Patient"
  const [openAdd, setOpenAdd] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', gender: '', dob: '', password: '' });

  // --- HANDLERS ---

  // Toggle Status (Active/Inactive) 
  const handleToggleStatus = (id) => {
    setPatients(patients.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return p;
    }));
  };

  // Add Walk-in Patient 
  const handleAddSubmit = async () => {
    // In a real app, call your backend API here:
    // await api.post('/register', { ...newPatient, role: 'patient' });
    
    // For UI Demo:
    const id = (patients.length + 1).toString();
    setPatients([...patients, { 
      id, 
      patientId: `PT${Math.floor(Math.random()*90000)}`, 
      name: newPatient.name, 
      email: newPatient.email, 
      phone: newPatient.phone, 
      status: 'Active' 
    }]);
    setOpenAdd(false);
    setNewPatient({ name: '', email: '', phone: '', gender: '', dob: '', password: '' });
  };

  // Filter Logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box>
      {/* HEADER & CONTROLS */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3, gap: 2 }}>
        <Box>
           <Typography variant="h4" fontWeight="bold" fontFamily="Playfair Display" color="#1A237E">Patient Management</Typography>
           <Typography variant="body2" color="text.secondary">View, manage, and register patients</Typography>
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

      {/* FILTERS & SEARCH [cite: 476] */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search patients..."
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

      {/* PATIENT TABLE [cite: 478-547] */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#E8EAF6' }}>
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
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: row.status === 'Active' ? '#1A237E' : 'grey' }}>{row.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {row.patientId}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={row.status === 'Active' ? 'success' : 'default'}
                      variant={row.status === 'Active' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center">
                      <Tooltip title="Edit">
                         <IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title={row.status === 'Active' ? "Deactivate" : "Activate"}>
                        <IconButton 
                          size="small" 
                          color={row.status === 'Active' ? "warning" : "success"}
                          onClick={() => handleToggleStatus(row.id)}
                        >
                          {row.status === 'Active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD PATIENT DIALOG (For Walk-ins) */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Register New Patient</DialogTitle>
        <DialogContent dividers>
           <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField 
                label="Full Name" fullWidth 
                value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} 
              />
              <TextField 
                label="Email" fullWidth type="email"
                value={newPatient.email} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} 
              />
              <TextField 
                label="Phone" fullWidth 
                value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} 
              />
              <Stack direction="row" spacing={2}>
                 <TextField select label="Gender" fullWidth value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                 </TextField>
                 <TextField label="DOB" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newPatient.dob} onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})} />
              </Stack>
              <TextField 
                label="Initial Password" type="password" fullWidth 
                value={newPatient.password} onChange={(e) => setNewPatient({...newPatient, password: e.target.value})} 
              />
           </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
           <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
           <Button variant="contained" onClick={handleAddSubmit} sx={{ bgcolor: '#1A237E' }}>Register Patient</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients;