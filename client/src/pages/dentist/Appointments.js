import React, { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Grid, Stack, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, MenuItem 
} from '@mui/material';
import { 
  Add, ChevronLeft, ChevronRight, MoreVert, CalendarMonth 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype ) ---
const initialAppointments = [
  { id: 1, patient: 'Sophia Clark', date: '2024-07-15', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, patient: 'Ethan Bennett', date: '2024-07-16', time: '2:00 PM', status: 'Pending' },
  { id: 3, patient: 'Olivia Carter', date: '2024-07-17', time: '11:30 AM', status: 'Confirmed' },
  { id: 4, patient: 'Liam Foster', date: '2024-07-18', time: '9:00 AM', status: 'Cancelled' },
  { id: 5, patient: 'Ava Harper', date: '2024-07-19', time: '3:30 PM', status: 'Confirmed' },
];

const statusColors = {
  Confirmed: 'success', // Green [cite: 90]
  Pending: 'warning',   // Amber [cite: 90]
  Cancelled: 'error'    // Red [cite: 90]
};

const Appointments = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [openAdd, setOpenAdd] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('July 2024'); // [cite: 73]

  // --- HANDLERS ---
  const handleAddOpen = () => setOpenAdd(true);
  const handleAddClose = () => setOpenAdd(false);

  return (
    <Box>
      {/* --- HEADER SECTION [cite: 71-75] --- */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" fontFamily="Playfair Display" color="#0E4C5C">Appointments</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleAddOpen}
          sx={{ bgcolor: '#0E4C5C', '&:hover': { bgcolor: '#083642' } }}
        >
          Add Appointment
        </Button>
      </Stack>

      {/* --- CALENDAR NAVIGATION [cite: 72-74] --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <IconButton><ChevronLeft /></IconButton>
          <Typography variant="h6" fontWeight="bold">{currentMonth}</Typography>
          <IconButton><ChevronRight /></IconButton>
        </Stack>

        {/* --- SIMPLE CALENDAR VISUALIZATION  --- */}
        {/* (A simplified 7-day view for visual representation as per prototype) */}
        <Grid container spacing={1} sx={{ textAlign: 'center' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid item xs={12 / 7} key={day}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">{day}</Typography>
            </Grid>
          ))}
          {/* Mock Calendar Days */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Grid item xs={12 / 7} key={i}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1, 
                  height: 60, 
                  bgcolor: i === 2 ? '#E0F2F1' : 'transparent', // Highlight one day
                  borderColor: i === 2 ? '#0E4C5C' : 'divider'
                }}
              >
                <Typography variant="body2">{15 + i}</Typography>
                {i === 0 && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mx: 'auto', mt: 1 }} />}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* --- APPOINTMENT TABLE  --- */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F5F5F5' }}>
              <TableRow>
                <TableCell><strong>Patient Name</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.patient}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={statusColors[row.status]} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" sx={{ mr: 1 }}>View</Button>
                    <Button size="small" color="error">Cancel</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- PAGINATION [cite: 87-89] --- */}
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ p: 2 }}>
          <Button disabled startIcon={<ChevronLeft />}>Prev</Button>
          <Button variant="outlined" sx={{ minWidth: 40 }}>1</Button>
          <Button variant="text" sx={{ minWidth: 40 }}>2</Button>
          <Button variant="text" sx={{ minWidth: 40 }}>3</Button>
          <Button endIcon={<ChevronRight />}>Next</Button>
        </Stack>
      </Paper>

      {/* --- ADD APPOINTMENT MODAL [cite: 85] --- */}
      <Dialog open={openAdd} onClose={handleAddClose} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Add New Appointment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Patient Name" fullWidth variant="outlined" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6}>
                 <TextField label="Time" type="time" fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <TextField select label="Type" fullWidth defaultValue="Checkup">
              <MenuItem value="Checkup">Routine Checkup</MenuItem>
              <MenuItem value="Cleaning">Cleaning</MenuItem>
              <MenuItem value="Surgery">Surgery</MenuItem>
            </TextField>
            <TextField label="Notes" multiline rows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleAddClose} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleAddClose} sx={{ bgcolor: '#0E4C5C' }}>Schedule</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Appointments;