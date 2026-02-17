import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Grid, Tooltip 
} from '@mui/material';
import { 
  Search, Edit, Cancel, EventAvailable, CheckCircle, Person 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 4)  ---
const initialAppointments = [
  { id: 1, patient: 'Sophia Clark', dentist: 'Dr. Emily Carter', date: '2024-03-15', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, patient: 'Ethan Miller', dentist: 'Dr. David Lee', date: '2024-03-15', time: '11:30 AM', status: 'Pending' },
  { id: 3, patient: 'Olivia Brown', dentist: 'Dr. Emily Carter', date: '2024-03-16', time: '09:00 AM', status: 'Confirmed' },
  { id: 4, patient: 'Liam Davis', dentist: 'Dr. David Lee', date: '2024-03-16', time: '10:30 AM', status: 'Cancelled' },
  { id: 5, patient: 'Ava Wilson', dentist: 'Dr. Emily Carter', date: '2024-03-17', time: '12:00 PM', status: 'Confirmed' },
];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);

  // --- HANDLERS ---

  // Open Edit Modal (For Reschedule / Reassign / Confirm)
  const handleEditClick = (appt) => {
    setCurrentAppt({ ...appt }); // Copy data to avoid direct mutation
    setOpenDialog(true);
  };

  // Quick Cancel Action
  const handleCancelClick = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.map(a => 
        a.id === id ? { ...a, status: 'Cancelled' } : a
      ));
    }
  };

  // Quick Confirm Action
  const handleConfirmClick = (id) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, status: 'Confirmed' } : a
    ));
  };

  // Save Changes from Dialog
  const handleSaveChanges = () => {
    setAppointments(appointments.map(a => 
      a.id === currentAppt.id ? currentAppt : a
    ));
    setOpenDialog(false);
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(a => 
    a.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.dentist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" sx={{ mb: 3 }}>
        Appointment Management
      </Typography>

      {/* 1. DISTRIBUTION CHART (Visual Mock)  */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Weekly Distribution</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 100, gap: 2, mt: 2 }}>
           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
             <Box key={day} sx={{ flex: 1, textAlign: 'center' }}>
               <Box 
                 sx={{ 
                   height: `${[40, 60, 80, 50, 90, 70, 30][i]}%`, 
                   bgcolor: '#5C6BC0', 
                   borderRadius: '4px 4px 0 0',
                   mx: 'auto',
                   width: '60%'
                 }} 
               />
               <Typography variant="caption" fontWeight="bold">{day}</Typography>
             </Box>
           ))}
        </Box>
      </Paper>

      {/* 2. SEARCH & FILTER [cite: 561] */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by Patient or Dentist..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ bgcolor: 'white' }}
        />
        {/* Add Date Filter here if needed */}
      </Stack>

      {/* 3. APPOINTMENT TABLE  */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#E8EAF6' }}>
              <TableRow>
                <TableCell><strong>Patient</strong></TableCell>
                <TableCell><strong>Dentist</strong></TableCell>
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                     <Stack direction="row" alignItems="center" spacing={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="500">{row.patient}</Typography>
                     </Stack>
                  </TableCell>
                  <TableCell>{row.dentist}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{row.time}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.date}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={row.status === 'Confirmed' ? 'success' : (row.status === 'Pending' ? 'warning' : 'error')}
                      variant={row.status === 'Pending' ? 'outlined' : 'filled'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={1}>
                      {/* Confirm Button (Only for Pending) */}
                      {row.status === 'Pending' && (
                        <Tooltip title="Confirm Appointment">
                          <IconButton size="small" color="success" onClick={() => handleConfirmClick(row.id)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Edit/Reschedule Button */}
                      <Tooltip title="Edit / Reschedule">
                         <IconButton size="small" color="primary" onClick={() => handleEditClick(row)}>
                           <Edit fontSize="small" />
                         </IconButton>
                      </Tooltip>

                      {/* Cancel Button */}
                      <Tooltip title="Cancel">
                        <IconButton size="small" color="error" onClick={() => handleCancelClick(row.id)}>
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 4. EDIT/RESCHEDULE DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" sx={{ bgcolor: '#1A237E', color: 'white' }}>
          Manage Appointment
        </DialogTitle>
        <DialogContent dividers>
          {currentAppt && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Patient Name" fullWidth value={currentAppt.patient} disabled />
              
              {/* Reassign Dentist */}
              <TextField 
                select 
                label="Assign Dentist" 
                fullWidth 
                value={currentAppt.dentist} 
                onChange={(e) => setCurrentAppt({...currentAppt, dentist: e.target.value})}
              >
                <MenuItem value="Dr. Emily Carter">Dr. Emily Carter</MenuItem>
                <MenuItem value="Dr. David Lee">Dr. David Lee</MenuItem>
                <MenuItem value="Dr. Sarah Smith">Dr. Sarah Smith</MenuItem>
              </TextField>

              {/* Reschedule Date & Time */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                   <TextField 
                     label="Date" 
                     type="date" 
                     fullWidth 
                     InputLabelProps={{ shrink: true }}
                     value={currentAppt.date} 
                     onChange={(e) => setCurrentAppt({...currentAppt, date: e.target.value})}
                   />
                </Grid>
                <Grid item xs={6}>
                   <TextField 
                     label="Time" 
                     type="time" 
                     fullWidth 
                     InputLabelProps={{ shrink: true }}
                     // Note: mock data uses "10:00 AM", input type="time" needs "10:00" format. 
                     // In real app, handle format conversion.
                   />
                </Grid>
              </Grid>

              {/* Update Status */}
              <TextField 
                select 
                label="Status" 
                fullWidth 
                value={currentAppt.status} 
                onChange={(e) => setCurrentAppt({...currentAppt, status: e.target.value})}
              >
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveChanges} 
            startIcon={<EventAvailable />}
            sx={{ bgcolor: '#1A237E' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAppointments;