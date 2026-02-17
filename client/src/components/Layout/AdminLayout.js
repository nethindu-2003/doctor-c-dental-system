import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Stack, Badge } from '@mui/material';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth(); // Get admin user info
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#E8EAF6', minHeight: '100vh' }}>
      
      {/* Top App Bar */}
      <AppBar position="fixed" elevation={0} sx={{ 
        width: { md: `calc(100% - ${drawerWidth}px)` }, 
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'white', color: '#1A237E', borderBottom: '1px solid #e0e0e0'
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Admin Portal
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
             <IconButton>
                <Badge badgeContent={4} color="error">
                   <Notifications color="action" />
                </Badge>
             </IconButton>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#1A237E', color: 'white' }}>
                    {user?.name ? user.name.charAt(0) : 'A'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                   <Typography variant="subtitle2" fontWeight="bold">Admin</Typography>
                   <Typography variant="caption" color="text.secondary">{user?.name || 'Super Admin'}</Typography>
                </Box>
             </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <AdminSidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth} 
        handleLogout={logout}
      />

      {/* Main Content Area (Where pages like Dashboard, Patients, etc. will appear) */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default AdminLayout;