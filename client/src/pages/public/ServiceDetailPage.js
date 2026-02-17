import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, ArrowBack } from '@mui/icons-material';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';

// Updated Data Dictionary with Real Services
const serviceData = {
  'extraction': {
    title: "Extraction",
    subtitle: "Painless Tooth Removal",
    desc: "While we always strive to save your natural teeth, extraction is sometimes necessary for severely decayed, damaged, or infected teeth. We perform both simple and surgical extractions using modern anesthesia techniques to ensure a comfortable and painless experience.",
    features: [
      "Safe removal of severely decayed teeth",
      "Removal of impacted wisdom teeth",
      "Preparation for orthodontic treatment",
      "Post-procedure care guidance"
    ]
  },
  'scaling': {
    title: "Scaling & Polishing",
    subtitle: "Professional Deep Cleaning",
    desc: "Routine brushing isn't always enough to remove stubborn plaque and tartar (calculus). Our professional scaling service removes these harmful deposits from your teeth and gum line, preventing gum disease (gingivitis) and bad breath, leaving your teeth smooth and clean.",
    features: [
      "Removes hard tartar and plaque buildup",
      "Prevents gum disease and bleeding",
      "Eliminates bad breath (halitosis)",
      "Polishing for a smooth, shiny finish"
    ]
  },
  'root-filling': {
    title: "Root Filling (RCT)",
    subtitle: "Endodontic Therapy",
    desc: "Save your natural tooth rather than extracting it. Root filling (Root Canal Treatment) treats the infection at the center of the tooth (the pulp). We remove the infected tissue, clean the canal, and seal it to stop pain and restore the tooth's function.",
    features: [
      "Relieves severe toothache and sensitivity",
      "Saves the natural tooth structure",
      "Prevents infection from spreading to the bone",
      "High-standard sealing materials"
    ]
  },
  'denture': {
    title: "Dentures",
    subtitle: "Removable Teeth Replacement",
    desc: "Regain your ability to eat and speak comfortably with our custom-made dentures. We offer both complete dentures (for all teeth) and partial dentures (for a few missing teeth). Our modern dentures are lightweight, natural-looking, and fit securely.",
    features: [
      "Full and Partial denture options",
      "Acrylic and metal framework choices",
      "Restores facial shape and smile",
      "Affordable tooth replacement solution"
    ]
  },
  'orthodontic': {
    title: "Orthodontic Treatment",
    subtitle: "Braces & Alignment",
    desc: "Correct crooked teeth, gaps, and bite issues with our orthodontic solutions. Whether you need traditional metal braces for complex corrections or modern clear aligners for a discreet look, we help you achieve a perfectly aligned and functional smile.",
    features: [
      "Correction of crowded or crooked teeth",
      "Fixes overbites, underbites, and crossbites",
      "Metal and Ceramic braces available",
      "Improves long-term jaw health"
    ]
  },
  'surgery': {
    title: "Minor Oral Surgery",
    subtitle: "Surgical Dental Procedures",
    desc: "Our clinic is equipped to handle minor surgical procedures safely. This includes the removal of impacted wisdom teeth, cyst removal, biopsies, and pre-prosthetic surgery to prepare your mouth for dentures or implants.",
    features: [
      "Surgical removal of impacted wisdom teeth",
      "Soft tissue surgery and biopsies",
      "Frenectomy (Tongue-tie release)",
      "Safe and sterile surgical environment"
    ]
  },
  'restoration': {
    title: "Restoration",
    subtitle: "Composite & GIC Fillings",
    desc: "Repair cavities and chipped teeth with our tooth-colored restorations. We use high-quality Composite (light-cured) resins that match your natural tooth shade for a seamless look, as well as Glass Ionomer Cement (GIC) for specific clinical needs.",
    features: [
      "Tooth-colored Composite fillings (Aesthetic)",
      "GIC fillings for fluoride release",
      "Repairs cavities, cracks, and chips",
      "Mercury-free and safe materials"
    ]
  },
  'pediatric': {
    title: "Pediatric Dental Treatments",
    subtitle: "Dentistry for Children",
    desc: "We create a friendly and fear-free environment for children. Our pediatric services focus on preventive care, including fluoride treatments, sealants, space maintainers, and gentle treatment of cavities in baby teeth to ensure a lifetime of healthy smiles.",
    features: [
      "Gentle checkups and cleaning",
      "Fluoride application for cavity prevention",
      "Pit and Fissure Sealants",
      "Habit breaking appliances (Thumb sucking)"
    ]
  },
  'implant-bridge': {
    title: "Implant, Crown & Bridges",
    subtitle: "Fixed Prosthodontics",
    desc: "For a permanent solution to missing or damaged teeth. Dental Implants replace the root, while Crowns (caps) restore damaged teeth. Bridges use adjacent teeth to support a replacement tooth. We use Zirconia and Ceramic for durable, natural-looking results.",
    features: [
      "Dental Implants for permanent replacement",
      "Zirconia and Porcelain Crowns",
      "Fixed Bridges to close gaps",
      "Restores full chewing power"
    ]
  },
  'cosmetic': {
    title: "Cosmetic Dental Treatment",
    subtitle: "Smile Makeovers",
    desc: "Enhance the beauty of your smile with our cosmetic solutions. From professional teeth whitening to correct discoloration, to dental veneers that fix gaps and shapes, we design the smile you have always wanted.",
    features: [
      "Professional Teeth Whitening",
      "Porcelain Veneers and Laminates",
      "Diastema Closure (Closing gaps)",
      "Smile Design and contouring"
    ]
  }
};

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Default to 'extraction' if ID not found, or handle 404
  const service = serviceData[id] || serviceData['extraction']; 

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <PublicHeader />

      {/* Hero Section */}
      <Box sx={{ 
        pt: 15, pb: 10, bgcolor: 'primary.dark', color: 'white', textAlign: 'center' 
      }}>
        <Container maxWidth="md">
            <Typography variant="overline" color="secondary.main" letterSpacing={2}>OUR SERVICES</Typography>
            <Typography variant="h2" fontFamily="Playfair Display" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>{service.title}</Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 300 }}>{service.subtitle}</Typography>
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            
            <Box>
                <Typography variant="h4" color="primary.dark" fontFamily="Playfair Display" fontWeight="bold" gutterBottom align="center">
                    Overview
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', textAlign: 'justify' }}>
                    {service.desc}
                </Typography>

                <Box sx={{ mt: 5, maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }} align="center">Key Benefits & Features:</Typography>
                    <List>
                        {service.features.map((feature, i) => (
                            <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckCircle sx={{ color: 'secondary.main' }} />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Stack direction="row" spacing={2} sx={{ mt: 6, justifyContent: 'center' }}>
                    <Button variant="contained" size="large" onClick={() => navigate('/login')} sx={{ borderRadius: 50, px: 5 }}>
                        Book Appointment
                    </Button>
                    <Button variant="outlined" size="large" onClick={() => navigate('/#services')} startIcon={<ArrowBack />} sx={{ borderRadius: 50, px: 5 }}>
                        Back to Services
                    </Button>
                </Stack>
            </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default ServiceDetailPage;