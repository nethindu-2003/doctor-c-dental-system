import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Divider, LinearProgress, Stack, CircularProgress 
} from '@mui/material';
import { 
  People, CalendarToday, AttachMoney, Warning, TrendingUp, Inventory, 
  PersonAdd, EventAvailable, Payment 
} from '@mui/icons-material';
import axios from '../../api/axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/admin/dashboard/summary');
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Map backend "type" to actual Material UI Icons and colors
  const getLogVisuals = (type) => {
    switch(type) {
      case 'APPOINTMENT': return { icon: <EventAvailable />, color: "secondary.main" };
      case 'PAYMENT': return { icon: <Payment />, color: "success.main" };
      case 'INVENTORY': return { icon: <Inventory />, color: "warning.main" };
      default: return { icon: <PersonAdd />, color: "primary.main" };
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  // Map the dynamic data into the stats array
  const stats = [
    { label: "Total Patients", value: dashboardData?.totalPatients || "0", icon: <People />, color: "#1976d2", bgcolor: "#e3f2fd" },
    { label: "Total Appointments", value: dashboardData?.totalAppointments || "0", icon: <CalendarToday />, color: "#9c27b0", bgcolor: "#f3e5f5" },
    { label: "Total Revenue", value: `LKR ${dashboardData?.totalRevenue?.toLocaleString() || "0"}`, icon: <AttachMoney />, color: "#2e7d32", bgcolor: "#e8f5e9" },
    { label: "Low Stock Items", value: dashboardData?.lowStockItems || "0", icon: <Warning />, color: "#d32f2f", bgcolor: "#ffebee" },
  ];

  // Mock data for visual charts until historical reporting is built
  const inventoryUsage = [
    { label: "Gloves", value: 60 }, { label: "Syringes", value: 45 }, 
    { label: "Anesthetics", value: 80 }
  ];

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" sx={{ mb: 3 }}>
        Welcome back, Admin!
      </Typography>

      {/* 1. DYNAMIC SUMMARY CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={0} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3, border: '1px solid #e0e0e0' }}>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #e0e0e0' }}>
             <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
               <Typography variant="h6" fontWeight="bold">Appointment & Financial Trends</Typography>
               <TrendingUp color="action" />
             </Stack>
             <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 2, pb: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <Box key={i} sx={{ width: '8%', height: `${h}%`, bgcolor: i % 2 === 0 ? '#5C6BC0' : '#26A69A', borderRadius: '4px 4px 0 0' }} />
                ))}
             </Box>
             <Typography variant="caption" align="center" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Jan - Jul Performance Overview
             </Typography>
          </Paper>

          {/* Inventory Usage Progress Bars */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Inventory Usage Tracker</Typography>
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

        {/* 3. DYNAMIC ACTIVITY LOGS  */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Activity</Typography>
            <List>
              {dashboardData?.recentActivities?.length > 0 ? (
                  dashboardData.recentActivities.map((log, index) => {
                    const visuals = getLogVisuals(log.type);
                    return (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'transparent', color: visuals.color, border: '1px solid', borderColor: visuals.color }}>
                              {visuals.icon}
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
                        {index < dashboardData.recentActivities.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    );
                  })
              ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                      No recent activity found.
                  </Typography>
              )}
            </List>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AdminDashboard;