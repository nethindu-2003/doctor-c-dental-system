import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Box, Typography, Button, Stack, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText 
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    if (path === '#services') {
      if (location.pathname === '/') {
        // If already on home, just scroll
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If elsewhere, go home with a hash to trigger scroll
        navigate('/#services');
      }
    } else {
      navigate(path);
    }
    setMobileOpen(false); // Close drawer on mobile
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '#services' }, // Updated Path
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.9)', 
          backdropFilter: 'blur(20px)', 
          boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          height: 80,
          justifyContent: 'center'
        }}
      >
        <Box sx={{ maxWidth: 'lg', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{ 
                width: 40, height: 40, bgcolor: 'primary.main', borderRadius: 1, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 
              }}>
                <Typography variant="h5" color="white" fontWeight="bold">C</Typography>
              </Box>
              <Typography variant="h5" color="primary.dark" sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                Doctor C
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Stack direction="row" spacing={5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Typography 
                  key={item.label} 
                  variant="body1" 
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    cursor: 'pointer', fontWeight: 500, color: 'text.secondary', 
                    transition: '0.2s', '&:hover': { color: 'primary.main' } 
                  }}
                >
                  {item.label}
                </Typography>
              ))}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/login')} 
                sx={{ borderRadius: 50, px: 4, fontWeight: 'bold' }}
              >
                Portal Login
              </Button>
            </Stack>

            {/* Mobile Hamburger Icon */}
            <IconButton 
              color="primary" 
              edge="start" 
              onClick={handleDrawerToggle} 
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>

          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 280, bgcolor: 'background.default' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '1.2rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
          <Box sx={{ p: 2, mt: 2 }}>
            <Button fullWidth variant="contained" size="large" onClick={() => { navigate('/login'); handleDrawerToggle(); }}>
              Portal Login
            </Button>
          </Box>
        </List>
      </Drawer>
    </>
  );
};

export default PublicHeader;