import React from 'react';
import { Box, Container, Grid, Typography, Stack, IconButton, Divider } from '@mui/material';
import { Facebook, Instagram, LinkedIn, Phone, Email, LocationOn } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    // 1. Handle "Services" Scroll Logic
    if (path === '#services') {
      if (location.pathname === '/') {
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#services');
      }
    } 
    // 2. Handle Standard Page Navigation
    else {
      navigate(path);
      window.scrollTo(0, 0); // Ensure page starts at top
    }
  };

  const footerLinks = [
    { label: 'Home', path: '/' },
    { label: 'Our Services', path: '#services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Patient Portal', path: '/login' },
  ];

  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          
          {/* Column 1: Brand & Identity */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box sx={{ 
                width: 32, height: 32, bgcolor: 'secondary.main', borderRadius: 1, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">C</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                Doctor C
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.8 }}>
              Redefining the art of dentistry in Matara. We combine advanced technology with compassionate care to create lasting smiles.
            </Typography>
            <Stack direction="row" spacing={1}>
              {[Facebook, Instagram, LinkedIn].map((Icon, i) => (
                <IconButton key={i} size="small" sx={{ color: 'secondary.main', bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Column 2: Quick Links (UPDATED) */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Playfair Display', color: 'secondary.main' }}>
              Explore
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.map((item) => (
                <Typography 
                  key={item.label} 
                  variant="body2" 
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    color: 'white', 
                    opacity: 0.7, 
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { color: 'secondary.main', opacity: 1, transform: 'translateX(5px)' } 
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Playfair Display', color: 'secondary.main' }}>
              Visit Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <LocationOn sx={{ color: 'secondary.main', fontSize: 20, mt: 0.5 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                 No. 20, Circular rd, <br /> Devinuwara, Sri Lanka <br /> 81000
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Phone sx={{ color: 'secondary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>+94 70 513 9901</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Email sx={{ color: 'secondary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>doctorcdentalsurgery@gmaail.com</Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Column 4: Hours */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Playfair Display', color: 'secondary.main' }}>
              Opening Hours
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                <Typography variant="body2">Mon - Fri</Typography>
                <Typography variant="body2">4:30 PM - 9:00 PM</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                <Typography variant="body2">Sat</Typography>
                <Typography variant="body2">6:30 PM - 9:00 PM</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                <Typography variant="body2">Sun</Typography>
                <Typography variant="body2">9:00 AM - 12:00 PM</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            © 2026 Doctor C Dental Surgery. All Rights Reserved.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: { xs: 2, md: 0 } }}>
            {['Privacy Policy', 'Terms', 'Cookies'].map((text) => (
              <Typography key={text} variant="caption" sx={{ opacity: 0.6, cursor: 'pointer', '&:hover': { color: 'secondary.main' } }}>
                {text}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;