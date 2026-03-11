import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, LinearProgress, List, ListItem, ListItemText, 
  ListItemAvatar, Avatar, Divider, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, Chip, Stack
} from '@mui/material';
import { 
  CalendarToday, CheckCircle, Warning, NotificationsActive, 
  PersonOutline, AddCircleOutline, AccessTime 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Make sure this points to your identity_service axios instance
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dentistId = user?.id || 1; 

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Holds the exact DTO structure from Spring Boot
  const [dashboardData, setDashboardData] = useState({
    todaysAppointmentsCount: 0,
    todaysPatients: [], 
    completedTreatmentsCount: 0,
    completedTreatments: [], 
    ongoingTreatments: [],
    notifications: []
  });

  const [patientsModalOpen, setPatientsModalOpen] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // api instance already has baseURL: 'http://localhost:8080/auth'
        // So this calls: http://localhost:8080/auth/dentist/{id}/dashboard
        const response = await api.get(`/dentist/${dentistId}/dashboard`);
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dentistId]);

  // --- FORMATTING UTILS ---
  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    // Assuming backend sends "HH:MM:SS"
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // --- STAT CARDS LOGIC ---
  const stats = [
    { 
      label: "Today's Patients", 
      value: dashboardData.todaysPatients?.length || 0, 
      icon: <PersonOutline />, 
      color: '#0288d1',
      action: () => setPatientsModalOpen(true) 
    },
    { 
      label: "Today's Appointments", 
      value: dashboardData.todaysAppointmentsCount || 0, 
      icon: <CalendarToday />, 
      color: '#7b1fa2',
      action: () => navigate('/dentist/appointments') 
    },
    { 
      label: "Completed Treatments", 
      value: dashboardData.completedTreatmentsCount || 0, 
      icon: <CheckCircle />, 
      color: '#2e7d32',
      action: () => setCompletedModalOpen(true) 
    }
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: '#0E4C5C' }} /></Box>;
  if (error) return <Box sx={{ mt: 5, textAlign: 'center' }}><Typography color="error" variant="h6">{error}</Typography></Box>;

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C" gutterBottom>
        Welcome back, Dr. {user?.name || 'Dentist'}
      </Typography>
      
      {/* --- STATS CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper 
              elevation={2} 
              onClick={stat.action} 
              sx={{ 
                p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, border: '1px solid #e0e0e0',
                cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(14, 76, 92, 0.15)', borderColor: stat.color }
              }}
            >
              <Box>
                <Typography variant="h3" fontWeight="bold" color={stat.color}>{stat.value}</Typography>
                <Typography variant="subtitle1" color="text.secondary" fontWeight="500">{stat.label}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: stat.color + '15', color: stat.color, width: 60, height: 60 }}>{stat.icon}</Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* --- ONGOING TREATMENTS --- */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#0E4C5C">Ongoing Treatments</Typography>
            </Box>
            
            <List sx={{ p: 0 }}>
              {!dashboardData.ongoingTreatments || dashboardData.ongoingTreatments.length === 0 ? (
                 <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Typography color="text.secondary">No ongoing treatments currently active.</Typography>
                 </Box>
              ) : (
                dashboardData.ongoingTreatments.map((item, index) => (
                  <Box key={`ongoing-${item.treatmentId || index}`} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight="600">{item.procedureName}</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#0E4C5C">{item.progressPercentage}%</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Patient: {item.patientName}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.progressPercentage || 0} 
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#0E4C5C', borderRadius: 4 } }} 
                    />
                  </Box>
                ))
              )}
            </List>
            <Button variant="text" fullWidth sx={{ mt: 2, color: '#0E4C5C', fontWeight: 'bold' }} onClick={() => navigate('/dentist/treatments')}>
              View All Treatments
            </Button>
          </Paper>
        </Grid>

        {/* --- NOTIFICATIONS --- */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" color="#0E4C5C" gutterBottom>Notifications & Alerts</Typography>
            <List sx={{ p: 0 }}>
              {!dashboardData.notifications || dashboardData.notifications.length === 0 ? (
                 <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Typography color="text.secondary">You're all caught up!</Typography>
                 </Box>
              ) : (
                dashboardData.notifications.map((notif, index) => (
                  <React.Fragment key={`notif-${notif.notificationId || index}`}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: notif.type === 'ALERT' ? '#ffebee' : '#e8f5e9', 
                          color: notif.type === 'ALERT' ? '#d32f2f' : '#2e7d32' 
                        }}>
                          {notif.type === 'ALERT' ? <Warning /> : <NotificationsActive />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight="bold" color="text.primary">{notif.title}</Typography>}
                        secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{notif.message}</Typography>}
                      />
                    </ListItem>
                    {index < dashboardData.notifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* --- POPUP 1: TODAY'S PATIENTS --- */}
      <Dialog open={patientsModalOpen} onClose={() => setPatientsModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #eee', pb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#0E4C5C">Today's Patients</Typography>
          <Typography variant="body2" color="text.secondary">Manage your patient roster for today</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {!dashboardData.todaysPatients || dashboardData.todaysPatients.length === 0 ? (
             <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No patients scheduled for today.</Typography></Box>
          ) : (
            <List sx={{ p: 0 }}>
              {dashboardData.todaysPatients.map((patient, index) => (
                <ListItem key={`patient-${patient.patientId || index}`} sx={{ borderBottom: '1px solid #eee', p: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Avatar sx={{ bgcolor: '#0E4C5C', mr: 2, width: 50, height: 50 }}>{patient.name?.charAt(0) || 'P'}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{patient.name}</Typography>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Patient ID: #{patient.patientId}</Typography>
                        <Chip size="small" icon={<AccessTime fontSize="small"/>} label={formatTime(patient.appointmentTime)} sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold' }} />
                        {patient.appointmentStatus && (
                          <Chip size="small" label={patient.appointmentStatus} color={patient.appointmentStatus === 'COMPLETED' ? 'success' : 'default'} variant="outlined" />
                        )}
                      </Stack>
                    </Box>
                  </Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddCircleOutline />}
                    sx={{ bgcolor: '#0E4C5C', '&:hover': { bgcolor: '#083642' }, borderRadius: 2, textTransform: 'none', px: 3 }}
                    onClick={() => {
                        setPatientsModalOpen(false);
                        navigate(`/dentist/treatments?patientId=${patient.patientId}`);
                    }}
                  >
                    Add Treatment
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button onClick={() => setPatientsModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* --- POPUP 2: COMPLETED TREATMENTS --- */}
      <Dialog open={completedModalOpen} onClose={() => setCompletedModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #eee', pb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#2e7d32">Completed Treatments</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {!dashboardData.completedTreatments || dashboardData.completedTreatments.length === 0 ? (
             <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No completed treatments yet.</Typography></Box>
          ) : (
            <List sx={{ p: 0 }}>
              {dashboardData.completedTreatments.map((treatment, index) => (
                <ListItem key={`completed-${treatment.treatmentId || index}`} sx={{ borderBottom: '1px solid #eee', p: 3 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}><CheckCircle /></Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography variant="h6" fontWeight="bold">{treatment.procedureName}</Typography>}
                    secondary={
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary"><strong>Patient:</strong> {treatment.patientName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong> {treatment.completionDate ? treatment.completionDate : 'N/A'}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button onClick={() => setCompletedModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Close Window</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Dashboard;