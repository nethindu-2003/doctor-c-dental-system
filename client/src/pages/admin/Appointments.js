import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Grid, Tooltip, CircularProgress, Alert
} from '@mui/material';
import { 
  Search, Edit, Cancel, EventAvailable, CheckCircle, Person 
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios'; 

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Edit Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const [apptsRes, dentistsRes] = await Promise.all([
              axios.get('/admin/appointments'),
              axios.get('/dentists')
          ]);
          setAppointments(apptsRes.data);
          setDentists(dentistsRes.data);
      } catch (err) {
          console.error("Error fetching data:", err);
      } finally {
          setLoading(false);
      }
  };

  // --- HANDLERS ---
  const handleEditClick = (appt) => {
    setCurrentAppt({
        ...appt,
        dentistId: appt.dentistId || '' // Uses the flat ID from the new DTO
    });
    setOpenDialog(true);
  };

  const handleCancelClick = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment? The patient will be notified via email.")) {
      try {
          const res = await axios.put(`/admin/appointments/${id}/cancel`);
          setAppointments(appointments.map(a => a.appointmentId === id ? res.data : a));
          showSuccess("Appointment cancelled and patient notified.");
      } catch (err) {
          alert("Failed to cancel appointment.");
      }
    }
  };

  const handleConfirmClick = async (appt) => {
      try {
          const payload = {
              appointmentDate: appt.appointmentDate,
              appointmentTime: appt.appointmentTime,
              status: 'CONFIRMED',
              dentistId: appt.dentistId || null
          };
          const res = await axios.put(`/admin/appointments/${appt.appointmentId}`, payload);
          setAppointments(appointments.map(a => a.appointmentId === appt.appointmentId ? res.data : a));
          showSuccess("Appointment Confirmed.");
      } catch (err) {
          alert("Failed to confirm.");
      }
  };

  const handleSaveChanges = async () => {
      try {
          const payload = {
              appointmentDate: currentAppt.appointmentDate,
              appointmentTime: currentAppt.appointmentTime,
              status: currentAppt.status,
              dentistId: currentAppt.dentistId || null
          };
          
          const res = await axios.put(`/admin/appointments/${currentAppt.appointmentId}`, payload);
          setAppointments(appointments.map(a => a.appointmentId === currentAppt.appointmentId ? res.data : a));
          setOpenDialog(false);
          showSuccess("Changes saved successfully. If rescheduled, the patient has been notified.");
      } catch (err) {
          alert("Failed to update appointment.");
      }
  };

  const showSuccess = (msg) => {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
  };

  // --- FILTER LOGIC ---
  const filteredAppointments = appointments.filter(a => {
    // Now we can easily search against the flat strings!
    const patientName = a.patientName?.toLowerCase() || '';
    const dentistName = a.dentistName?.toLowerCase() || '';
    return patientName.includes(searchTerm.toLowerCase()) || dentistName.includes(searchTerm.toLowerCase());
  });

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" sx={{ mb: 3 }}>
        Appointment Management
      </Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search by Patient or Dentist Name..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ bgcolor: 'white' }}
          />
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        {loading ? (
            <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
            <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: '#F4F7F6' }}>
                <TableRow>
                    <TableCell><strong>Patient</strong></TableCell>
                    <TableCell><strong>Dentist</strong></TableCell>
                    <TableCell><strong>Reason for Visit</strong></TableCell>
                    <TableCell><strong>Date & Time</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {filteredAppointments.map((row) => {
                    const apptDateTime = dayjs(`${row.appointmentDate}T${row.appointmentTime}`);
                    const isPast = apptDateTime.isBefore(dayjs());

                    return (
                    <TableRow key={row.appointmentId} hover>
                    <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="500">
                                {row.patientName || 'Walk-in Guest'} 
                            </Typography>
                        </Stack>
                    </TableCell>
                    <TableCell>
                        {row.dentistName ? `Dr. ${row.dentistName}` : 'Unassigned'}
                    </TableCell>
                    <TableCell>{row.reasonForVisit}</TableCell>
                    <TableCell>
                        <Typography variant="body2" fontWeight="bold" color={isPast ? 'text.disabled' : 'text.primary'}>
                            {dayjs('2023-01-01 ' + row.appointmentTime).format('h:mm A')}
                        </Typography>
                        <Typography variant="caption" color={isPast ? 'text.disabled' : 'text.secondary'}>
                            {dayjs(row.appointmentDate).format('MMM D, YYYY')}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Chip 
                        label={isPast && row.status !== 'CANCELLED' ? 'COMPLETED' : row.status} 
                        size="small"
                        color={row.status === 'CONFIRMED' ? 'success' : (row.status === 'PENDING' ? 'warning' : 'default')}
                        variant={row.status === 'PENDING' ? 'outlined' : 'filled'}
                        sx={{ fontWeight: 'bold' }}
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={1}>
                        
                        {/* Confirm Button */}
                        {row.status === 'PENDING' && (
                            <Tooltip title={isPast ? "Past appointment" : "Confirm Appointment"}>
                                <span>
                                    <IconButton size="small" color="success" onClick={() => handleConfirmClick(row)} disabled={isPast}>
                                        <CheckCircle fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        
                        {/* Edit Button */}
                        <Tooltip title={isPast ? "Cannot edit past appointments" : "Edit / Reschedule"}>
                            <span>
                                <IconButton size="small" color="primary" onClick={() => handleEditClick(row)} disabled={isPast}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        {/* Cancel Button */}
                        {row.status !== 'CANCELLED' && (
                            <Tooltip title={isPast ? "Cannot cancel past appointments" : "Cancel Appointment"}>
                                <span>
                                    <IconButton size="small" color="error" onClick={() => handleCancelClick(row.appointmentId)} disabled={isPast}>
                                        <Cancel fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        </Stack>
                    </TableCell>
                    </TableRow>
                    );
                })}
                {filteredAppointments.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No appointments found.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </TableContainer>
        )}
      </Paper>

      {/* 4. EDIT/RESCHEDULE DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" sx={{ bgcolor: '#1A237E', color: 'white' }}>
          Manage Appointment
        </DialogTitle>
        <DialogContent dividers>
          {currentAppt && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField label="Patient Name" fullWidth value={currentAppt.patientName || 'Walk-in Guest'} disabled />
              
              <TextField 
                select 
                label="Assign Dentist" 
                fullWidth 
                value={currentAppt.dentistId} 
                onChange={(e) => setCurrentAppt({...currentAppt, dentistId: e.target.value})}
              >
                <MenuItem value=""><em>Unassigned / Any Available</em></MenuItem>
                {dentists.map(d => (
                    <MenuItem key={d.dentistId} value={d.dentistId}>Dr. {d.name}</MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                   <TextField 
                     label="Date" 
                     type="date" 
                     fullWidth 
                     InputLabelProps={{ shrink: true }}
                     value={currentAppt.appointmentDate} 
                     onChange={(e) => setCurrentAppt({...currentAppt, appointmentDate: e.target.value})}
                   />
                </Grid>
                <Grid item xs={6}>
                   <TextField 
                     label="Time" 
                     type="time" 
                     fullWidth 
                     InputLabelProps={{ shrink: true }}
                     value={currentAppt.appointmentTime} 
                     onChange={(e) => setCurrentAppt({...currentAppt, appointmentTime: e.target.value})}
                   />
                </Grid>
              </Grid>

              <TextField 
                select 
                label="Status" 
                fullWidth 
                value={currentAppt.status} 
                onChange={(e) => setCurrentAppt({...currentAppt, status: e.target.value})}
              >
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveChanges} startIcon={<EventAvailable />} sx={{ bgcolor: '#1A237E' }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAppointments;