import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box, Typography } from '@mui/material';
import { 
  Dashboard, 
  People, 
  CalendarToday, 
  Inventory, 
  AttachMoney, 
  Assessment, 
  PersonAdd, 
  Logout 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items based on PDF [cite: 424-425] + Your "Add Dentist" requirement
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Patients', icon: <People />, path: '/admin/patients' },
    { text: 'Appointments', icon: <CalendarToday />, path: '/admin/appointments' },
    { text: 'Inventory', icon: <Inventory />, path: '/admin/inventory' },
    { text: 'Financial', icon: <AttachMoney />, path: '/admin/financial' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
    { text: 'Add Dentist', icon: <PersonAdd />, path: '/admin/add-dentist' }, // User Requirement
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1A237E', color: 'white' }}> {/* Indigo Admin Theme */}
      {/* Brand Logo [cite: 416] */}
      <Toolbar sx={{ display: 'flex', gap: 2, px: 3, py: 1 }}>
        <Box sx={{ width: 35, height: 35, bgcolor: '#5C6BC0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="white">C</Typography>
        </Box>
        <Typography variant="h6" fontFamily="Playfair Display" fontWeight="bold">Doctor C</Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation List */}
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => { navigate(item.path); if(mobileOpen) handleDrawerToggle(); }}
                sx={{ 
                  borderRadius: 2, 
                  bgcolor: isActive ? '#5C6BC0' : 'transparent',
                  '&:hover': { bgcolor: isActive ? '#5C6BC0' : 'rgba(255,255,255,0.1)' }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* Logout Button */}
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
       {/* Mobile Drawer (Temporary) */}
       <Drawer
         variant="temporary"
         open={mobileOpen}
         onClose={handleDrawerToggle}
         ModalProps={{ keepMounted: true }}
         sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
       >
         {drawerContent}
       </Drawer>
       
       {/* Desktop Drawer (Permanent) */}
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

export default AdminSidebar;