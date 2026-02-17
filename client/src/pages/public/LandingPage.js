import React, { useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Button, Stack, Card, Avatar 
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ArrowForward, VerifiedUser, Star, AutoFixHigh, MedicalServices, 
  HealthAndSafety, Construction, ContentCut, FaceRetouchingNatural, 
  InvertColors, ChildCare // <--- Added ChildCare for Pediatric
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#services') {
      const element = document.getElementById('services');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // UPDATED 10 SERVICES LIST (Matches ServiceDetailPage IDs)
  const servicesList = [
    { 
      id: 'extraction',
      title: 'Extraction', 
      desc: 'Painless removal of decayed or impacted teeth.',
      icon: <ContentCut fontSize="small" />, 
      color: '#FFEBEE' // Light Red
    },
    { 
      id: 'scaling',
      title: 'Scaling & Polishing', 
      desc: 'Deep cleaning to remove plaque and tartar.',
      icon: <InvertColors fontSize="small" />, 
      color: '#E3F2FD' // Light Blue
    },
    { 
      id: 'root-filling',
      title: 'Root Filling (RCT)', 
      desc: 'Save your natural tooth with endodontic therapy.',
      icon: <HealthAndSafety fontSize="small" />, 
      color: '#E8EAF6' // Indigo
    },
    { 
      id: 'denture',
      title: 'Dentures', 
      desc: 'Comfortable, natural-looking teeth replacements.',
      icon: <FaceRetouchingNatural fontSize="small" />, 
      color: '#FFF3E0' // Orange
    },
    { 
      id: 'orthodontic',
      title: 'Orthodontics', 
      desc: 'Braces and aligners for a perfect bite.',
      icon: <Construction fontSize="small" />, 
      color: '#E0F2F1' // Teal
    },
    { 
      id: 'surgery',
      title: 'Minor Oral Surgery', 
      desc: 'Wisdom teeth removal and soft tissue procedures.',
      icon: <MedicalServices fontSize="small" />, 
      color: '#F3E5F5' // Purple
    },
    { 
      id: 'restoration',
      title: 'Restoration', 
      desc: 'Aesthetic composite fillings for cavities.',
      icon: <AutoFixHigh fontSize="small" />, 
      color: '#E8F5E9' // Green
    },
    { 
      id: 'pediatric',
      title: 'Pediatric Dentistry', 
      desc: 'Gentle care and fluoride treatments for kids.',
      icon: <ChildCare fontSize="small" />, 
      color: '#FFF8E1' // Yellow
    },
    { 
      id: 'implant-bridge',
      title: 'Implants & Bridges', 
      desc: 'Permanent fixed solutions for missing teeth.',
      icon: <VerifiedUser fontSize="small" />, 
      color: '#ECEFF1' // Blue Grey
    },
    { 
      id: 'cosmetic',
      title: 'Cosmetic Dentistry', 
      desc: 'Veneers and whitening for a dream smile.',
      icon: <Star fontSize="small" />, 
      color: '#E0F7FA' // Cyan
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', overflowX: 'hidden' }}>
      <PublicHeader />

      {/* Hero Section */}
      <Box sx={{ 
        minHeight: '100vh', 
        pt: { xs: 15, md: 12 }, 
        pb: { xs: 8, md: 0 },
        display: 'flex', 
        alignItems: 'center', 
        background: 'linear-gradient(180deg, #F4F7F6 0%, #FFFFFF 100%)' 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Typography variant="subtitle2" color="secondary.main" fontWeight={700} letterSpacing={2} sx={{ mb: 2 }}>
                  ESTABLISHED 2023 • MATARA
                </Typography>
                <Typography variant="h1" gutterBottom sx={{ 
                  color: 'primary.dark', mb: 3, fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.1
                }}>
                  Redefining the <br /> 
                  <span style={{ color: '#0E4C5C' }}>Art of Dentistry.</span>
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: 480, fontWeight: 400, lineHeight: 1.6 }}>
                  Experience world-class dental treatments in an environment designed for your comfort. Advanced technology meets compassionate care.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" size="large" onClick={() => navigate(`/login`)} endIcon={<ArrowForward />} sx={{ py: 1.5, px: 4 }}>
                    Book Appointment
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => document.getElementById('services').scrollIntoView({behavior: 'smooth'})} sx={{ py: 1.5, px: 4 }}>
                    View Services
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                <Box sx={{ position: 'relative', maxWidth: '100%' }}>
                  <Box 
                    component="img"
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                    alt="Advanced Dental Clinic Interior"
                    sx={{
                      width: '100%', maxWidth: 600, height: 'auto', borderRadius: '24px',
                      boxShadow: '0px 25px 50px -12px rgba(14, 76, 92, 0.25)', display: 'block'
                    }}
                  />
                  <Card sx={{ 
                    position: 'absolute', bottom: 30, left: -20, bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', 
                    p: 2, borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)', display: { xs: 'none', md: 'block' }, minWidth: 220
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}><VerifiedUser /></Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">#1 Clinic in Matara</Typography>
                        <Stack direction="row">{[1,2,3,4,5].map(i => <Star key={i} sx={{ fontSize: 12, color: '#FFD700' }} />)}</Stack>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- SERVICES DIVISION (Compact Boxes) --- */}
      <Box id="services" sx={{ py: 12, bgcolor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 2, color: 'primary.dark', fontFamily: 'Playfair Display', fontWeight: 700 }}>
            Our Services
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: 700, mx: 'auto' }}>
              We offer a comprehensive range of dental treatments. From routine care to complex surgeries, your smile is in safe hands.
          </Typography>

          <Grid container spacing={3}>
            {servicesList.map((item, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                  <Card 
                    onClick={() => navigate(`/service/${item.id}`)}
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      bgcolor: 'white', 
                      borderRadius: 3, 
                      display: 'flex', 
                      alignItems: 'center', // Horizontal Layout
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)', 
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s',
                      '&:hover': { 
                        borderColor: 'primary.main',
                        boxShadow: '0 10px 30px rgba(14, 76, 92, 0.1)' 
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: 50, height: 50, borderRadius: 2, bgcolor: item.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: 'primary.dark',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage;