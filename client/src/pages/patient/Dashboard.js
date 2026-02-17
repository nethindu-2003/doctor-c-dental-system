import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Card, Stack, Avatar, Button, LinearProgress, Chip, CircularProgress 
} from '@mui/material';
import { 
  CalendarMonth, ArrowForward, MedicalServices, AttachMoney, NotificationsActive 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from '../../api/axios'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data States
  const [profile, setProfile] = useState({});
  const [nextAppointment, setNextAppointment] = useState(null);
  const [activeTreatment, setActiveTreatment] = useState(null);
  const [paymentStats, setPaymentStats] = useState({ outstanding: 0, paidCount: 0, pendingCount: 0 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch everything concurrently to load the dashboard fast
      const [profileRes, apptsRes, treatmentsRes, paymentsRes] = await Promise.all([
        axios.get('/patient/profile'),
        axios.get('/patient/appointments'),
        axios.get('/patient/treatments'),
        axios.get('/patient/payments')
      ]);

      // 1. Set Profile
      setProfile(profileRes.data);

      // 2. Calculate Next Appointment
      const futureAppts = apptsRes.data.filter(a => 
          (a.status === 'PENDING' || a.status === 'CONFIRMED') && 
          dayjs(a.appointmentDate).isAfter(dayjs().subtract(1, 'day')) // Today or future
      );
      // Sort to find the closest one
      futureAppts.sort((a, b) => dayjs(a.appointmentDate).diff(dayjs(b.appointmentDate)));
      setNextAppointment(futureAppts.length > 0 ? futureAppts[0] : null);

      // 3. Calculate Active Treatment
      const active = treatmentsRes.data.find(t => t.status === 'IN_PROGRESS');
      if (active) {
          const sessions = active.sessions || [];
          const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;
          const totalCount = sessions.length;
          const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
          
          // Find the name of the next pending session
          const nextSession = sessions.find(s => s.status === 'PENDING');

          setActiveTreatment({
              name: active.treatmentName,
              progress: progress,
              completed: completedCount,
              total: totalCount,
              nextStep: nextSession ? nextSession.sessionName : 'Awaiting Schedule'
          });
      }

      // 4. Calculate Payment Stats
      const payments = paymentsRes.data || [];
      const pendingList = payments.filter(p => p.status === 'PENDING');
      const paidList = payments.filter(p => p.status === 'COMPLETED');
      
      const totalOutstanding = pendingList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      
      setPaymentStats({
          outstanding: totalOutstanding,
          pendingCount: pendingList.length,
          paidCount: paidList.length
      });

      setLoading(false);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
      return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
  }

  return (
    <Box>
      {/* 1. Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="primary.dark">
          Welcome back, {profile.name || 'Patient'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is an overview of your dental health status today.
        </Typography>
      </Box>

      {/* 2. Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Next Appointment Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 4, bgcolor: 'primary.dark', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}><CalendarMonth sx={{ fontSize: 150 }} /></Box>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>UPCOMING APPOINTMENT</Typography>
            
            {nextAppointment ? (
                <>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
                        {dayjs(nextAppointment.appointmentDate).format('MMM D, YYYY')}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                        {dayjs('2023-01-01 ' + nextAppointment.appointmentTime).format('h:mm A')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                        {nextAppointment.dentist ? `Dr. ${nextAppointment.dentist.name}` : 'Clinic Admin'} • {nextAppointment.reasonForVisit}
                    </Typography>
                </>
            ) : (
                <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6">No upcoming appointments</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Time for a checkup?</Typography>
                </Box>
            )}

            <Button 
              variant="contained" color="secondary" size="small" sx={{ mt: 3, borderRadius: 20, color: 'primary.dark', fontWeight: 'bold' }}
              onClick={() => navigate('/patient/appointments')}
            >
              {nextAppointment ? 'Manage' : 'Book Now'}
            </Button>
          </Card>
        </Grid>

        {/* Treatment Progress Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: '#E0F2F1', color: 'primary.main' }}><MedicalServices /></Avatar>
              <Typography variant="h6" fontWeight="bold" color="primary.dark">Treatment Progress</Typography>
            </Stack>
            
            {activeTreatment ? (
                <>
                    <Typography variant="subtitle2" fontWeight="bold">{activeTreatment.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Session {activeTreatment.completed} of {activeTreatment.total}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">{activeTreatment.progress}%</Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={activeTreatment.progress} 
                        sx={{ height: 8, borderRadius: 5, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Next Step: {activeTreatment.nextStep}
                    </Typography>
                </>
            ) : (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No ongoing complex treatments.</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Your smile is looking great!
                    </Typography>
                </Box>
            )}
            <Button endIcon={<ArrowForward />} sx={{ mt: activeTreatment ? 0 : 3 }} onClick={() => navigate('/patient/treatments')}>View History</Button>
          </Card>
        </Grid>

        {/* Payments Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 4 }}>
             <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: '#FFF8E1', color: '#F57C00' }}><AttachMoney /></Avatar>
              <Typography variant="h6" fontWeight="bold" color="primary.dark">Payments</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Total Outstanding</Typography>
            <Typography variant="h4" fontWeight="bold" color={paymentStats.outstanding > 0 ? "error.main" : "success.main"} sx={{ mb: 1 }}>
                LKR {paymentStats.outstanding.toLocaleString()}
            </Typography>
            
            <Stack direction="row" spacing={1}>
               <Chip label={`${paymentStats.paidCount} Paid`} size="small" color="success" variant="outlined" />
               {paymentStats.pendingCount > 0 && (
                   <Chip label={`${paymentStats.pendingCount} Pending`} size="small" color="error" variant="outlined" />
               )}
            </Stack>
            
            <Button endIcon={<ArrowForward />} sx={{ mt: 2 }} onClick={() => navigate('/patient/payments')}>
                {paymentStats.outstanding > 0 ? 'Pay Now' : 'View History'}
            </Button>
          </Card>
        </Grid>

      </Grid>

      {/* 3. Recent Notifications / Reminders (Static for now, could be wired to a Notification table later) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary.dark" sx={{ mb: 2 }}>Notifications & Reminders</Typography>
        <Card sx={{ borderRadius: 3 }}>
            
          {/* Dynamic Appointment Reminder Notification */}
          {nextAppointment && dayjs(nextAppointment.appointmentDate).diff(dayjs(), 'day') <= 2 && (
             <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'start', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ffebee', color: 'error.main', width: 40, height: 40 }}>
                  <NotificationsActive fontSize="small" />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Upcoming Appointment Reminder</Typography>
                  <Typography variant="body2" color="text.secondary">
                      Your {nextAppointment.reasonForVisit} is scheduled for {dayjs(nextAppointment.appointmentDate).format('MMM D')} at {dayjs('2023-01-01 ' + nextAppointment.appointmentTime).format('h:mm A')}.
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold" color ="error">Urgent</Typography>
             </Box>
          )}

          {/* Dynamic Payment Reminder Notification */}
          {paymentStats.outstanding > 0 && (
              <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'start', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', color: 'warning.main', width: 40, height: 40 }}>
                  <AttachMoney fontSize="small" />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Outstanding Balance</Typography>
                  <Typography variant="body2" color="text.secondary">
                      You have an outstanding balance of LKR {paymentStats.outstanding.toLocaleString()}. Please clear it before your next visit.
                  </Typography>
                </Box>
                <Button size="small" onClick={() => navigate('/patient/payments')}>Pay</Button>
             </Box>
          )}

          {/* System Welcome Notification */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'start', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#e3f2fd', color: 'primary.main', width: 40, height: 40 }}>
              <MedicalServices fontSize="small" />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Welcome to Doctor C Dental</Typography>
              <Typography variant="body2" color="text.secondary">Thank you for choosing us for your dental care. Don't forget to update your profile.</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">System</Typography>
          </Box>
          
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;