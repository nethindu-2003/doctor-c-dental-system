import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box, Typography } from '@mui/material';
import { 
  Dashboard, CalendarMonth, MedicalServices, AccountCircle, People, Inventory, Chat, Logout 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DentistSidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dentist/dashboard' },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/dentist/appointments' },
    { text: 'Treatments', icon: <MedicalServices />, path: '/dentist/treatments' },
    { text: 'Patients', icon: <People />, path: '/dentist/patients' },
    { text: 'Inventory', icon: <Inventory />, path: '/dentist/inventory' }, // 
    { text: 'Messages', icon: <Chat />, path: '/dentist/messages' }, // 
    { text: 'Profile', icon: <AccountCircle />, path: '/dentist/profile' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0E4C5C', color: 'white' }}> {/* Teal Theme */}
      {/* Brand Logo */}
      <Toolbar sx={{ display: 'flex', gap: 2, px: 3, py: 1 }}>
        <Box sx={{ width: 35, height: 35, bgcolor: '#4DB6AC', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="#0E4C5C">C</Typography>
        </Box>
        <Typography variant="h6" fontFamily="Playfair Display" fontWeight="bold">Doctor C</Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => { navigate(item.path); if(mobileOpen) handleDrawerToggle(); }}
                sx={{ 
                  borderRadius: 2, 
                  bgcolor: isActive ? '#4DB6AC' : 'transparent',
                  color: isActive ? '#0E4C5C' : 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: isActive ? '#4DB6AC' : 'rgba(255,255,255,0.1)' }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* Logout */}
      <Box sx={{ p: 2 }}>
         <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#FFCDD2', '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' } }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
         </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
       {/* Mobile Drawer */}
       <Drawer
         variant="temporary"
         open={mobileOpen}
         onClose={handleDrawerToggle}
         ModalProps={{ keepMounted: true }}
         sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
       >
         {drawerContent}
       </Drawer>
       {/* Desktop Drawer */}
       <Drawer
         variant="permanent"
         sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}
         open
       >
         {drawerContent}
       </Drawer>
    </Box>
  );
};

export default DentistSidebar;