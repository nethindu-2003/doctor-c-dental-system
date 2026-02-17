import React from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button } from '@mui/material';
import { CalendarToday, CheckCircle, ChatBubbleOutline, Warning } from '@mui/icons-material';

const Dashboard = () => {
  // Mock Data from Prototype [cite: 34-54]
  const stats = [
    { label: "Today's Patients", value: 12, icon: <CalendarToday />, color: '#0288d1' },
    { label: "Today's Appointments", value: 5, icon: <CalendarToday />, color: '#7b1fa2' },
    { label: "Completed Treatments", value: 8, icon: <CheckCircle />, color: '#2e7d32' },
    { label: "Pending Messages", value: 3, icon: <ChatBubbleOutline />, color: '#ed6c02' },
  ];

  const ongoingTreatments = [
    { procedure: 'Root Canal - Patient: Sarah Miller', progress: 60 }, // [cite: 46]
    { procedure: 'Teeth Whitening - Patient: David Lee', progress: 30 }, // [cite: 49]
    { procedure: 'Braces Adjustment - Patient: Emily Chen', progress: 80 }, // [cite: 52]
  ];

  const notifications = [
    { title: 'New message from Sarah Miller', desc: 'Regarding appointment...', type: 'message' }, // [cite: 60]
    { title: 'Low stock of Dental Floss', desc: 'Current quantity: 15', type: 'alert' }, // [cite: 64]
    { title: 'Reminder for Emily Chen', desc: 'Appointment at 1:00 PM', type: 'reminder' }, // [cite: 67]
  ];

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C" gutterBottom>Dashboard</Typography>
      
      {/* 1. STATS CARDS [cite: 34-41] */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: stat.color + '20', color: stat.color, width: 50, height: 50 }}>
                {stat.icon}
              </Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 2. ONGOING TREATMENTS [cite: 47] */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Ongoing Treatments</Typography>
            <List>
              {ongoingTreatments.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight="500">{item.procedure}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.progress} 
                    sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#0E4C5C' } }} 
                  />
                </Box>
              ))}
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>View All Treatments</Button>
          </Paper>
        </Grid>

        {/* 3. NOTIFICATIONS [cite: 59-67] */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Notifications</Typography>
            <List>
              {notifications.map((notif, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: notif.type === 'alert' ? '#ffebee' : '#e3f2fd', 
                        color: notif.type === 'alert' ? 'error.main' : 'primary.main' 
                      }}>
                        {notif.type === 'alert' ? <Warning /> : <ChatBubbleOutline />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight="600">{notif.title}</Typography>}
                      secondary={notif.desc}
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;