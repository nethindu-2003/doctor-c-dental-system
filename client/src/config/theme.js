import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0E4C5C', // Deep Professional Teal (Trust & Calm)
      light: '#3D8496',
      dark: '#062E38',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4AF37', // Muted Gold (Premium Accent)
      light: '#F3E5AB',
      contrastText: '#0E4C5C',
    },
    background: {
      default: '#F4F7F6', // Very subtle cool grey (Not boring white)
      paper: '#ffffff',
    },
    text: {
      primary: '#1A2027', // Soft Black
      secondary: '#58626E', // Slate Grey
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif", // High-end Serif for Headings
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // No all-caps
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Professional semi-rounded
          padding: '12px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0E4C5C 0%, #166D85 100%)', // Gradient Button
          '&:hover': {
            boxShadow: '0px 8px 20px rgba(14, 76, 92, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 10px 40px rgba(0,0,0,0.04)', // Expensive feeling shadow
          border: '1px solid rgba(0,0,0,0.03)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)', // Glass effect
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0px 1px 0px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;