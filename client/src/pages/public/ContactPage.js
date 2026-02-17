import React from 'react';
import { 
  Box, Container, Grid, Typography, TextField, Button, Paper, Stack, Avatar 
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Phone, Email, LocationOn, Send, 
} from '@mui/icons-material';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';

const ContactPage = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', overflowX: 'hidden' }}>
      
      {/* 1. Header */}
      <PublicHeader />

      {/* 2. Page Content Wrapper (Padded for fixed header) */}
      <Box sx={{ pt: 10, minHeight: '100vh' }}>
        
        {/* --- HERO / TITLE SECTION --- */}
        <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'primary.dark', color: 'white' }}>
          <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Typography variant="overline" letterSpacing={3} color="secondary.main" fontWeight="bold">
                WE ARE HERE FOR YOU
              </Typography>
              <Typography variant="h2" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, mt: 2 }}>
                Get in Touch
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 2, maxWidth: 600, mx: 'auto' }}>
                Have questions about our services or need to schedule an appointment? 
                Our team in Matara is ready to assist you.
              </Typography>
            </motion.div>
          </Container>
        </Box>

        {/* --- SPLIT CONTENT SECTION --- */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={6}>
            
            {/* LEFT: Contact Form */}
            <Grid item xs={12} md={7}>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h5" color="primary.dark" fontWeight="bold" gutterBottom sx={{ fontFamily: 'Playfair Display' }}>
                    Send us a Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Fill out the form below and we will get back to you within 24 hours.
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="First Name" variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Last Name" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Email Address" type="email" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Phone Number" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="Message" 
                        multiline 
                        rows={4} 
                        variant="outlined" 
                        placeholder="How can we help you?"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        size="large" 
                        endIcon={<Send />}
                        sx={{ 
                          py: 1.5, px: 5, borderRadius: 50, 
                          boxShadow: '0 10px 30px rgba(14, 76, 92, 0.2)' 
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>

            {/* RIGHT: Info & Map Visual */}
            <Grid item xs={12} md={5}>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                
                {/* Info Cards Stack */}
                <Stack spacing={3}>
                  
                  {/* Address Card */}
                  <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', bgcolor: '#F4F7F6' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><LocationOn /></Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">Visit Us</Typography>
                      <Typography variant="body2" color="text.secondary">
                        No. 20, Circular rd, <br /> Devinuwara, Sri Lanka <br /> 81000
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Contact Card */}
                  <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', bgcolor: '#F4F7F6' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.dark', mr: 2 }}><Phone /></Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">Call Us</Typography>
                      <Typography variant="body2" color="text.secondary">+94 70 513 9901</Typography>
                      <Typography variant="caption" color="text.secondary">Mon-Fri from 4pm to 9pm</Typography>
                    </Box>
                  </Paper>

                  {/* Email Card */}
                  <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', bgcolor: '#F4F7F6' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}><Email /></Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">Email Us</Typography>
                      <Typography variant="body2" color="text.secondary">doctorcdentalsurgery@gmaail.com</Typography>
                    </Box>
                  </Paper>

                  {/* Visual Map Placeholder (Matches visual style) */}
                  <Box sx={{ 
                    height: 200, 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    backgroundImage: 'url(https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)', // Abstract Map/City Look
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(14, 76, 92, 0.6)' }} />
                    <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', position: 'relative', zIndex: 2 }}>
                      <a href="https://maps.app.goo.gl/8jhfHCNLHC23iP648" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                    </Button>
                  </Box>

                </Stack>
              </motion.div>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* 3. Footer */}
      <Footer />
    </Box>
  );
};

export default ContactPage;