import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, Paper, Grid, 
  TextField, MenuItem, Card, CardContent, CardActionArea, Avatar, 
  Stack, Chip, Divider, Alert, CircularProgress, Container, Backdrop 
} from '@mui/material';
import { 
  CalendarMonth, LocalHospital, History, CheckCircle 
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

// Ensure this points to the file we created in src/utils/axiosConfig.js
import axios from '../../api/axios'; 

const steps = ['Select Service & Dentist', 'Choose Date & Time', 'Payment & Confirm'];

const visitReasons = [
  'Routine Checkup', 'Tooth Pain', 'Cleaning / Scaling', 'Whitening', 
  'Root Canal Consultation', 'Extraction', 'Other'
];

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false); // <--- NEW: Fake Payment State
  const [appointments, setAppointments] = useState([]); 
  const [dentists, setDentists] = useState([]);

  // Form States
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]); 
  const [takenSlots, setTakenSlots] = useState([]); 
  
  const [bookingError, setBookingError] = useState('');

  // --- 1. FETCH DATA (Dentists & History) ---
  useEffect(() => {
    fetchMyAppointments();
    fetchDentists();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get('/patient/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchDentists = async () => {
    try {
      const res = await axios.get('/patient/dentists');
      setDentists(res.data);
    } catch (err) {
      console.error("Error fetching dentists:", err);
    }
  };

  const getDoctorImage = (id) => {
    const imgId = (id % 4) + 1; 
    if (imgId === 1) return 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg?w=200';
    if (imgId === 2) return 'https://img.freepik.com/free-photo/portrait-hansome-young-male-doctor-man_171337-5068.jpg?w=200';
    if (imgId === 3) return 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg?w=200';
    return 'https://img.freepik.com/free-photo/smiling-doctor-with-strethoscope-isolated-grey_651396-974.jpg?w=200';
  };

  // --- 2. GENERATE TIME SLOTS (With Past Time Validation) ---
  useEffect(() => {
    generateSlots(selectedDate);
    fetchTakenSlots(selectedDate);
  }, [selectedDate]);

  const generateSlots = (date) => {
    const day = date.day(); 
    let startHour, endHour, startMin = 0;

    // Clinic Hours
    if (day >= 1 && day <= 5) { // Mon-Fri: 4:30 PM - 9:00 PM
      startHour = 16; startMin = 30; endHour = 21;
    } else if (day === 6) { // Sat: 6:30 PM - 9:00 PM
      startHour = 18; startMin = 30; endHour = 21;
    } else if (day === 0) { // Sun: 9:00 AM - 12:00 PM
      startHour = 9; startMin = 0; endHour = 12;
    } else {
        setAvailableSlots([]); // Closed
        return;
    }

    const slots = [];
    let current = date.hour(startHour).minute(startMin).second(0);
    const end = date.hour(endHour).minute(0).second(0);
    
    // Get Current Time to filter past slots
    const now = dayjs();

    while (current.isBefore(end)) {
      // VALIDATION: If selected date is TODAY, filter out past times
      if (date.isSame(now, 'day')) {
         if (current.isAfter(now)) {
             slots.push(current.format('HH:mm')); 
         }
      } else {
         // Future date: Add all slots
         slots.push(current.format('HH:mm'));
      }
      current = current.add(30, 'minute');
    }
    setAvailableSlots(slots);
    setSelectedTime('');
  };

  const fetchTakenSlots = async (date) => {
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const res = await axios.get(`/patient/appointments/slots?date=${formattedDate}`);
      const taken = res.data.map(t => t.substring(0, 5)); 
      setTakenSlots(taken);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
  };

  // --- 3. SUBMIT BOOKING (With Fake Payment) ---
  const handleConfirmBooking = async () => {
    setBookingError('');
    setPaymentProcessing(true); // Start fake payment

    // Wait 2 seconds
    setTimeout(async () => {
        try {
            const payload = {
                dentistId: selectedDentist,
                reasonForVisit: reasonForVisit,
                additionalNotes: additionalNotes,
                date: selectedDate.format('YYYY-MM-DD'),
                time: selectedTime + ":00" 
            };
        
            await axios.post('/patient/appointments', payload);
            
            setPaymentProcessing(false);
            alert("Payment Successful! Appointment Confirmed.");
            
            // Reset
            setActiveStep(0);
            setReasonForVisit('');
            setAdditionalNotes('');
            fetchMyAppointments(); 

        } catch (err) {
            setPaymentProcessing(false);
            setBookingError(err.response?.data?.message || "Failed to book appointment.");
        }
    }, 2000); 
  };

  // --- 4. CANCEL APPOINTMENT ---
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/patient/appointments/${appointmentId}/cancel`);
      alert("Appointment Cancelled");
      fetchMyAppointments();
    } catch (err) {
      alert("Failed to cancel: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // --- RENDER STEPS ---
  
  const renderStep1 = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom fontWeight="bold">1. Reason for Visit</Typography>
        <TextField
          select fullWidth label="Select Reason"
          value={reasonForVisit}
          onChange={(e) => setReasonForVisit(e.target.value)}
        >
          {visitReasons.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>

        <TextField
          fullWidth multiline rows={3} label="Additional Notes (Optional)"
          value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)}
          sx={{ mt: 2 }}
        />
      </Grid>

      <Grid item xs={12} md={12}>
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>2. Choose Dentist (Optional)</Typography>
        {dentists.length === 0 ? (
           <Alert severity="info">No dentists found. You can proceed without selecting one.</Alert>
        ) : (
          <Grid container spacing={2}>
            {dentists.map((doctor) => (
              <Grid item xs={12} sm={4} key={doctor.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3, 
                    border: selectedDentist === doctor.id ? '2px solid #0E4C5C' : '1px solid #e0e0e0',
                    bgcolor: selectedDentist === doctor.id ? '#E0F2F1' : 'white'
                  }}
                >
                  <CardActionArea onClick={() => setSelectedDentist(doctor.id)} sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar src={getDoctorImage(doctor.id)} sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">{doctor.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{doctor.specialization}</Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );

  const renderStep2 = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom fontWeight="bold">Select Date</Typography>
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar 
              value={selectedDate} 
              onChange={(newValue) => setSelectedDate(newValue)}
              disablePast
            />
          </LocalizationProvider>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom fontWeight="bold">Available Time Slots</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {selectedDate.format('dddd, MMMM D, YYYY')} (30 min slots)
        </Typography>
        
        {availableSlots.length === 0 ? (
            <Alert severity="warning">Clinic is closed or all slots passed today.</Alert>
        ) : (
            <Grid container spacing={1}>
            {availableSlots.map((time) => {
                const isTaken = takenSlots.includes(time);
                const [h, m] = time.split(':');
                const displayTime = dayjs().hour(h).minute(m).format('h:mm A');

                return (
                <Grid item xs={4} key={time}>
                    <Chip 
                    label={displayTime} 
                    onClick={() => !isTaken && setSelectedTime(time)}
                    variant={selectedTime === time ? "filled" : "outlined"}
                    color={selectedTime === time ? "primary" : isTaken ? "default" : "default"}
                    disabled={isTaken}
                    sx={{ width: '100%', textDecoration: isTaken ? 'line-through' : 'none', opacity: isTaken ? 0.5 : 1 }}
                    />
                </Grid>
                );
            })}
            </Grid>
        )}
      </Grid>
    </Grid>
  );

  const renderStep3 = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={7}>
        <Typography variant="h6" gutterBottom fontWeight="bold">Booking Summary</Typography>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospital color="action" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Reason</Typography>
                <Typography variant="body1" fontWeight="bold">{reasonForVisit}</Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospital color="action" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Dentist</Typography>
                <Typography variant="body1" fontWeight="bold">
                    {selectedDentist 
                        ? dentists.find(d => d.id === selectedDentist)?.name 
                        : "Any Available Doctor"}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonth color="action" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedDate.format('MMM D, YYYY')} at {dayjs('2023-01-01 '+selectedTime).format('h:mm A')}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
        {bookingError && <Alert severity="error" sx={{ mb: 2 }}>{bookingError}</Alert>}
      </Grid>

      <Grid item xs={12} md={5}>
        <Card sx={{ bgcolor: 'primary.dark', color: 'white', borderRadius: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>Payment Details</Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Booking Fee</Typography>
            <Typography variant="body2">LKR 500.00</Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">Total</Typography>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">LKR 500</Typography>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              *Click confirm to pay securely.
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      
      {/* FAKE PAYMENT LOADING SCREEN */}
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column' }} open={paymentProcessing}>
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>Processing Payment...</Typography>
        <Typography variant="body1">Please do not close this window</Typography>
      </Backdrop>

      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="primary.dark" sx={{ mb: 4 }}>
        Book an Appointment
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 6 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 6 }} alternativeLabel>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        <Box sx={{ minHeight: 300 }}>
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Button disabled={activeStep === 0 || paymentProcessing} onClick={handleBack} sx={{ mr: 1, borderRadius: 50, px: 4 }}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleConfirmBooking : handleNext}
            sx={{ borderRadius: 50, px: 4 }}
            disabled={(activeStep === 0 && !reasonForVisit) || (activeStep === 1 && !selectedTime) || paymentProcessing}
          >
            {activeStep === steps.length - 1 ? (paymentProcessing ? 'Processing...' : 'Confirm & Pay') : 'Next'}
          </Button>
        </Box>
      </Paper>

      {/* HISTORY CARDS */}
      <Typography variant="h5" fontWeight="bold" color="primary.dark" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <History sx={{ mr: 1 }} /> Your Appointments
      </Typography>

      <Grid container spacing={3}>
        {appointments.length === 0 ? (
            <Grid item xs={12}><Alert severity="info">No upcoming appointments.</Alert></Grid>
        ) : (
            appointments.map((apt) => (
                <Grid item xs={12} sm={6} md={4} key={apt.appointmentId}>
                    <Card sx={{ borderRadius: 3, borderLeft: '5px solid #0E4C5C', boxShadow: 2 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{apt.appointmentDate}</Typography>
                                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                                        {dayjs('2023-01-01 ' + apt.appointmentTime).format('h:mm A')}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={apt.status} 
                                    color={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'PENDING' ? 'warning' : 'error'} 
                                    icon={apt.status === 'CONFIRMED' ? <CheckCircle /> : undefined}
                                    size="small" 
                                />
                            </Stack>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="body2" fontWeight="bold">{apt.reasonForVisit}</Typography>
                            {apt.additionalNotes && (
                                <Typography variant="caption" color="text.secondary" display="block">"{apt.additionalNotes}"</Typography>
                            )}
                            {apt.dentist && (
                                <Typography variant="caption" color="primary.dark" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                                    Dr. {apt.dentist.name}
                                </Typography>
                            )}
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                {apt.status !== 'CANCELLED' && (
                                    <Button size="small" variant="outlined" color="error" onClick={() => handleCancel(apt.appointmentId)}>Cancel</Button>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            ))
        )}
      </Grid>
    </Container>
  );
};

export default BookAppointment;