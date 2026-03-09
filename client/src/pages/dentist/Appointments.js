import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Grid, Stack, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Tooltip, CircularProgress, Alert, Divider
} from '@mui/material';
import { 
  CheckCircle, Cancel, Visibility, Email, Phone, CalendarToday, AccessTime, Assignment
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import axios from '../../api/axios'; // Adjust your path

const statusColors = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
  COMPLETED: 'default'
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusMsg, setStatusMsg] = useState(null);

  // Detail Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/dentist/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleConfirm = async (e, id) => {
    e.stopPropagation(); // Prevents row click modal from opening
    try {
      const res = await axios.put(`/dentist/appointments/${id}/confirm`);
      setAppointments(appointments.map(a => a.appointmentId === id ? res.data : a));
      showStatus('success', 'Appointment confirmed. Email sent to patient.');
    } catch (err) {
      showStatus('error', 'Failed to confirm appointment.');
    }
  };

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this appointment? The patient will be notified.")) {
      try {
        const res = await axios.put(`/dentist/appointments/${id}/cancel`);
        setAppointments(appointments.map(a => a.appointmentId === id ? res.data : a));
        showStatus('success', 'Appointment cancelled. Email sent to patient.');
      } catch (err) {
        showStatus('error', 'Failed to cancel appointment.');
      }
    }
  };

  const handleRowClick = (appt) => {
    setSelectedAppt(appt);
    setOpenModal(true);
  };

  const showStatus = (type, msg) => {
    setStatusMsg({ type, msg });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // --- FILTER BY CALENDAR DATE ---
  const filteredAppointments = appointments.filter(a => 
    dayjs(a.appointmentDate).isSame(selectedDate, 'day')
  );

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
           <Typography variant="h4" fontWeight="bold" fontFamily="Playfair Display" color="#0E4C5C">Daily Schedule</Typography>
           <Typography variant="body2" color="text.secondary">Select a date on the calendar to view and manage appointments.</Typography>
        </Box>
      </Stack>

      {statusMsg && <Alert severity={statusMsg.type} sx={{ mb: 3 }}>{statusMsg.msg}</Alert>}

      <Grid container spacing={3}>
        
        {/* --- LEFT: REAL CALENDAR --- */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E0E4E8', bgcolor: '#F8FAFC' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar 
                value={selectedDate} 
                onChange={(newDate) => setSelectedDate(newDate)} 
                sx={{ 
                  width: '100%',
                  '& .Mui-selected': { bgcolor: '#0E4C5C !important' }
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>

        {/* --- RIGHT: APPOINTMENT TABLE --- */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E4E8' }}>
            
            <Box sx={{ p: 2, bgcolor: '#0E4C5C', color: 'white' }}>
               <Typography variant="h6" fontWeight="bold">
                  Appointments for {selectedDate.format('MMMM D, YYYY')}
               </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Patient</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((row) => {
                      const isPast = dayjs(`${row.appointmentDate}T${row.appointmentTime}`).isBefore(dayjs());

                      return (
                        <TableRow 
                          key={row.appointmentId} 
                          hover 
                          onClick={() => handleRowClick(row)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                             <Typography fontWeight="bold" color={isPast ? 'text.disabled' : '#0E4C5C'}>
                                {dayjs(`2024-01-01 ${row.appointmentTime}`).format('h:mm A')}
                             </Typography>
                          </TableCell>
                          <TableCell fontWeight="500">{row.patientName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.status} 
                              color={statusColors[row.status] || 'default'} 
                              size="small" 
                              variant={row.status === 'PENDING' ? 'outlined' : 'filled'}
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" justifyContent="center" spacing={1}>
                              {row.status === 'PENDING' && !isPast && (
                                <Tooltip title="Confirm & Send Email">
                                  <IconButton size="small" color="success" onClick={(e) => handleConfirm(e, row.appointmentId)}>
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {row.status !== 'CANCELLED' && !isPast && (
                                <Tooltip title="Cancel & Send Email">
                                  <IconButton size="small" color="error" onClick={(e) => handleCancel(e, row.appointmentId)}>
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="View Details">
                                <IconButton size="small" color="primary" onClick={() => handleRowClick(row)}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No appointments scheduled for this date.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* --- APPOINTMENT DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        {selectedAppt && (
          <>
            <DialogTitle sx={{ bgcolor: '#0E4C5C', color: 'white', fontWeight: 'bold' }}>
               Appointment Details
            </DialogTitle>
            <DialogContent dividers sx={{ p: 4 }}>
               <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">PATIENT NAME</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedAppt.patientName}</Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                       <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarToday color="action" fontSize="small" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">DATE</Typography>
                            <Typography variant="body2" fontWeight="bold">{dayjs(selectedAppt.appointmentDate).format('MMM D, YYYY')}</Typography>
                          </Box>
                       </Stack>
                    </Grid>
                    <Grid item xs={6}>
                       <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTime color="action" fontSize="small" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">TIME</Typography>
                            <Typography variant="body2" fontWeight="bold">{dayjs(`2024-01-01 ${selectedAppt.appointmentTime}`).format('h:mm A')}</Typography>
                          </Box>
                       </Stack>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" sx={{ mb: 1 }}>CONTACT INFO</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                       <Email fontSize="small" color="action" />
                       <Typography variant="body2">{selectedAppt.patientEmail}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                       <Phone fontSize="small" color="action" />
                       <Typography variant="body2">{selectedAppt.patientPhone || 'Not provided'}</Typography>
                    </Stack>
                  </Box>

                  <Box p={2} sx={{ bgcolor: '#F1F5F9', borderRadius: 2, borderLeft: '4px solid #0E4C5C' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Assignment fontSize="small" color="primary" />
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">REASON FOR VISIT</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="500">{selectedAppt.reasonForVisit}</Typography>
                  </Box>

               </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenModal(false)} variant="contained" sx={{ bgcolor: '#0E4C5C' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Appointments;