import React, { useState } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  AppBar, Toolbar, Typography, Avatar, Stack, IconButton, Badge, Menu, MenuItem, Divider, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Dashboard, CalendarMonth, MedicalServices, Chat, Receipt, Person, 
  Notifications, Menu as MenuIcon, Logout 
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

// --- IMPORT AUTH CONTEXT ---
import { useAuth } from '../../context/AuthContext'; 

const drawerWidth = 280;

const PatientLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // --- GET USER & LOGOUT FROM CONTEXT ---
  const { user, logout } = useAuth(); 

  // Header User Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Handle Logout Action
  const handleLogout = () => {
    handleClose(); // Close menu if open
    logout();      // Call the context logout function (clears session & redirects)
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/patient/dashboard' },
    { text: 'My Appointments', icon: <CalendarMonth />, path: '/patient/appointments' },
    { text: 'Treatment History', icon: <MedicalServices />, path: '/patient/treatments' },
    { text: 'Messages', icon: <Chat />, path: '/patient/messages' },
    { text: 'Payments', icon: <Receipt />, path: '/patient/payments' },
    { text: 'My Profile', icon: <Person />, path: '/patient/profile' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: 'white' }}>
      {/* Brand Logo Area */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, bgcolor: 'secondary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="primary.dark">C</Typography>
        </Box>
        <Typography variant="h6" fontFamily="Playfair Display" fontWeight="bold">Doctor C</Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Links */}
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{ 
                  borderRadius: 2, 
                  bgcolor: isActive ? 'secondary.main' : 'transparent',
                  color: isActive ? 'primary.dark' : 'rgba(255,255,255,0.7)',
                  '&:hover': { bgcolor: isActive ? 'secondary.main' : 'rgba(255,255,255,0.05)' }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.dark' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* Sidebar Logout Button */}
      <Box sx={{ p: 2 }}>
         <ListItemButton 
            onClick={handleLogout} // <--- UPDATED HERE
            sx={{ borderRadius: 2, color: '#ffcdd2', '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' } }}
         >
            <ListItemIcon sx={{ color: '#ffcdd2', minWidth: 40 }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
         </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F4F7F6', minHeight: '100vh' }}>
      {/* Top Header */}
      <AppBar position="fixed" elevation={0} sx={{ 
        width: { md: `calc(100% - ${drawerWidth}px)` }, 
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'white', borderBottom: '1px solid #e0e0e0', color: 'text.primary'
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.dark">Patient Portal</Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications color="action" />
              </Badge>
            </IconButton>
            
            {/* User Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }} onClick={handleMenu}>
               <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 'bold' }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
               </Avatar>
               <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                 <Typography variant="subtitle2" fontWeight="bold">
                    {user?.name || 'Patient'} {/* <--- Dynamic Name */}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">Patient ID: #{user?.id || '---'}</Typography>
               </Box>
            </Box>
            
            {/* Dropdown Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => { handleClose(); navigate('/patient/profile'); }}>My Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem> {/* <--- UPDATED HERE */}
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Render Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default PatientLayout;