import React from 'react';
import { 
  Box, Container, Grid, Typography, Paper, Stack, Avatar, Button, Card, Divider, Chip 
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  VerifiedUser, EmojiEvents, Groups, MedicalServices, FormatQuote, School, WorkHistory 
} from '@mui/icons-material';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflowX: 'hidden' }}>
      <PublicHeader />

      {/* --- 1. HERO SECTION: WHO WE ARE --- */}
      <Box sx={{ 
        pt: { xs: 15, md: 20 }, pb: 10, 
        bgcolor: 'primary.dark', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{ 
          position: 'absolute', top: -100, right: -100, width: 400, height: 400, 
          bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '50%' 
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Typography variant="overline" letterSpacing={3} color="secondary.main" fontWeight="bold">
                  ESTABLISHED 2023 • MATARA
                </Typography>
                <Typography variant="h2" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, mt: 1, mb: 3 }}>
                  Who We Are
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 300, lineHeight: 1.6, mb: 4 }}>
                  Doctor C Dental Surgery is Matara's premier destination for advanced dental care. 
                  Owned and led by Dr. Chasika Waduge, we combine clinical expertise from Sri Lanka's leading 
                  hospitals with a gentle, patient-first approach.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  size="large" 
                  onClick={() => navigate('/contact')}
                  sx={{ borderRadius: 50, px: 4, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                  Contact Us
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Clinic Interior"
                sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- 2. MEET DR. CHASIKA WADUGE --- */}
      <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            

            {/* Text Side */}
            <Grid item xs={12} md={7}>
              <Typography variant="overline" color="secondary.main" fontWeight="bold" letterSpacing={2}>
                LEAD DENTAL SURGEON
              </Typography>
              <Typography variant="h2" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, mb: 2, color: 'primary.dark' }}>
                Dr. Chasika Waduge
              </Typography>
              
              {/* Credentials Badges */}
              <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Chip icon={<School sx={{ color: 'white !important' }} />} label="University of Peradeniya" sx={{ bgcolor: 'primary.light', color: 'white' }} />
                <Chip icon={<MedicalServices sx={{ color: 'white !important' }} />} label="BDS (Sri Lanka)" sx={{ bgcolor: 'primary.light', color: 'white' }} />
              </Stack>

              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary' }}>
                Dr. Chasika Waduge is a highly experienced dental surgeon with a strong background in restorative dentistry and oral surgery. 
                A graduate of the prestigious <strong>University of Peradeniya</strong>, she brings years of hospital-based experience to her private practice.
              </Typography>

              {/* Experience List */}
              <Box sx={{ mt: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="primary.dark" gutterBottom>
                  <WorkHistory sx={{ verticalAlign: 'middle', mr: 1, mb: 0.5 }} /> Professional Experience
                </Typography>
                <Stack spacing={2}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F4F7F6', borderLeft: '4px solid #0E4C5C' }}>
                    <Typography variant="subtitle2" fontWeight="bold">SHO / Restorative Dentistry</Typography>
                    <Typography variant="body2" color="text.secondary">New District General Hospital, Matara (Current)</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F4F7F6', borderLeft: '4px solid #D4AF37' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Former SHO / Oral & Maxillo-Facial Surgery</Typography>
                    <Typography variant="body2" color="text.secondary">District General Hospital, Monaragala</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F4F7F6', borderLeft: '4px solid #D4AF37' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Former HO / Oral & Maxillo-Facial Surgery</Typography>
                    <Typography variant="body2" color="text.secondary">District General Hospital, Hambantota</Typography>
                  </Paper>
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Stack direction="row" spacing={1} alignItems="center">
                 <FormatQuote sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.5 }} />
                 <Typography variant="body1" fontStyle="italic" color="text.primary" fontWeight="500">
                   "My extensive training in hospital settings allows me to handle complex cases with confidence. 
                   At Doctor C, I strive to bring that same level of clinical excellence to every patient I treat."
                 </Typography>
              </Stack>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* --- 3. MISSION & VISION --- */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 5, height: '100%', bgcolor: '#E0F2F1', borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mb: 3 }}>
                <VerifiedUser fontSize="large" />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: 'primary.dark' }}>
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                To provide accessible, pain-free, and world-class dental services to the community of Matara, 
                empowering every patient with the confidence that comes from a healthy smile.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 5, height: '100%', bgcolor: '#FFF8E1', borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60, mb: 3, color: 'primary.dark' }}>
                <EmojiEvents fontSize="large" />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: 'primary.dark' }}>
                Our Vision
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                To be the leading dental healthcare provider in the Southern Province, recognized for 
                clinical excellence, technological innovation, and compassionate patient care.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* --- 4. WHY CHOOSE US --- */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography variant="h3" align="center" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: 'primary.dark', mb: 8 }}>
          Why Choose Us?
        </Typography>

        <Grid container spacing={4}>
          {[
            { title: "Hospital-Grade Expertise", desc: "Led by a specialist with extensive experience in government hospitals.", icon: <MedicalServices /> },
            { title: "Comprehensive Care", desc: "From Restorative Dentistry to Oral Surgery, all under one roof.", icon: <Groups /> },
            { title: "Patient Comfort", desc: "A relaxing environment designed to reduce anxiety.", icon: <VerifiedUser /> },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div whileHover={{ y: -10 }}>
                <Card sx={{ 
                  p: 4, textAlign: 'center', height: '100%', borderRadius: 6,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(14, 76, 92, 0.05)', color: 'primary.main', 
                    width: 70, height: 70, mx: 'auto', mb: 3 
                  }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="h5" gutterBottom fontWeight="bold">{item.title}</Typography>
                  <Typography variant="body1" color="text.secondary">{item.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default AboutPage;