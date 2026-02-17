import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Stack, Badge, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import DentistSidebar from './DentistSidebar';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const DentistLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth(); // [cite: 4]
  
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F4F7F6', minHeight: '100vh' }}>
      
      <AppBar position="fixed" elevation={0} sx={{ 
        width: { md: `calc(100% - ${drawerWidth}px)` }, 
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'white', color: '#0E4C5C', borderBottom: '1px solid #e0e0e0'
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Dentist Portal
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton>
              <Badge badgeContent={2} color="error"> {/* Mocking 'Low Stock' alert [cite: 64] */}
                <Notifications color="action" />
              </Badge>
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Avatar sx={{ bgcolor: '#0E4C5C', color: 'white' }}>D</Avatar>
               <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                 <Typography variant="subtitle2" fontWeight="bold">Dr. {user?.name || 'Dentist'}</Typography>
               </Box>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <DentistSidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth} 
        handleLogout={logout} 
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default DentistLayout;