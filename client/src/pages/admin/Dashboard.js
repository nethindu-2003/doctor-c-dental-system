import React from 'react';
import { 
  Box, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Divider, LinearProgress, Stack 
} from '@mui/material';
import { 
  People, CalendarToday, AttachMoney, Warning, TrendingUp, Inventory, 
  PersonAdd, EventAvailable, Payment 
} from '@mui/icons-material';

const AdminDashboard = () => {
  // --- MOCK DATA (Based on Prototype Page 2) ---
  const stats = [
    { label: "Total Patients", value: "1,250", icon: <People />, color: "#1976d2", bgcolor: "#e3f2fd" }, // [cite: 427-428]
    { label: "Total Appointments", value: "3,420", icon: <CalendarToday />, color: "#9c27b0", bgcolor: "#f3e5f5" }, // [cite: 429]
    { label: "Total Payments", value: "Rs.150,000", icon: <AttachMoney />, color: "#2e7d32", bgcolor: "#e8f5e9" }, // [cite: 430]
    { label: "Low Stock Items", value: "15", icon: <Warning />, color: "#d32f2f", bgcolor: "#ffebee" }, // [cite: 431]
  ];

  const inventoryUsage = [
    { label: "Jan", value: 60 }, { label: "Feb", value: 45 }, 
    { label: "Mar", value: 80 }, { label: "Apr", value: 50 },
    { label: "May", value: 90 }, { label: "Jun", value: 75 }
  ]; // [cite: 447-453]

  const activityLogs = [
    { 
      text: "New patient registered: Sarah Miller", 
      time: "2024-07-26 10:00 AM", 
      icon: <PersonAdd />, 
      color: "primary.main" 
    }, // [cite: 456-457]
    { 
      text: "Appointment scheduled for David Lee", 
      time: "2024-07-26 11:30 AM", 
      icon: <EventAvailable />, 
      color: "secondary.main" 
    }, // [cite: 458-459]
    { 
      text: "Payment received from Emily Chen ($250)", 
      time: "2024-07-26 02:00 PM", 
      icon: <Payment />, 
      color: "success.main" 
    }, // [cite: 460-461]
    { 
      text: "Inventory updated: Added 50 units of Floss", 
      time: "2024-07-26 04:45 PM", 
      icon: <Inventory />, 
      color: "warning.main" 
    } // [cite: 462]
  ];

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" sx={{ mb: 3 }}>
        Welcome back, Admin!
      </Typography>

      {/* 1. SUMMARY CARDS [cite: 426-431] */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
              <Avatar variant="rounded" sx={{ bgcolor: stat.bgcolor, color: stat.color, width: 56, height: 56, mr: 2 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        
        {/* 2. CHARTS SECTION (Mocking Visuals)  */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
             <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
               <Typography variant="h6" fontWeight="bold">Appointment & Financial Trends</Typography>
               <TrendingUp color="action" />
             </Stack>
             <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 2, pb: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                {/* Mock Bars for Visual Representation */}
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <Box key={i} sx={{ width: '8%', height: `${h}%`, bgcolor: i % 2 === 0 ? '#5C6BC0' : '#26A69A', borderRadius: '4px 4px 0 0' }} />
                ))}
             </Box>
             <Typography variant="caption" align="center" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Jan - Jul Performance Overview
             </Typography>
          </Paper>

          {/* Inventory Usage Progress Bars [cite: 447-454] */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Inventory Usage</Typography>
            <Stack spacing={2}>
              {inventoryUsage.map((item) => (
                <Box key={item.label}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">{item.label}</Typography>
                    <Typography variant="caption">{item.value}% Utilized</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.value} 
                    sx={{ height: 8, borderRadius: 5, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#EF5350' } }} 
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* 3. ACTIVITY LOGS  */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Activity Logs</Typography>
            <List>
              {activityLogs.map((log, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent', color: log.color, border: '1px solid', borderColor: log.color }}>
                        {log.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight="600">{log.text}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {log.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < activityLogs.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AdminDashboard;