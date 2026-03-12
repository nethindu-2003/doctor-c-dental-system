import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowForward, VerifiedUser, Star, AutoFixHigh, MedicalServices, 
  HealthAndSafety, Construction, ContentCut, FaceRetouchingNatural, 
  InvertColors, ChildCare 
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

  const servicesList = [
    { 
      id: 'extraction',
      title: 'Extraction', 
      desc: 'Painless removal of decayed or impacted teeth.',
      icon: <ContentCut fontSize="small" />, 
      color: 'bg-red-50 text-red-600'
    },
    { 
      id: 'scaling',
      title: 'Scaling & Polishing', 
      desc: 'Deep cleaning to remove plaque and tartar.',
      icon: <InvertColors fontSize="small" />, 
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'root-filling',
      title: 'Root Filling (RCT)', 
      desc: 'Save your natural tooth with endodontic therapy.',
      icon: <HealthAndSafety fontSize="small" />, 
      color: 'bg-indigo-50 text-indigo-600'
    },
    { 
      id: 'denture',
      title: 'Dentures', 
      desc: 'Comfortable, natural-looking teeth replacements.',
      icon: <FaceRetouchingNatural fontSize="small" />, 
      color: 'bg-orange-50 text-orange-600'
    },
    { 
      id: 'orthodontic',
      title: 'Orthodontics', 
      desc: 'Braces and aligners for a perfect bite.',
      icon: <Construction fontSize="small" />, 
      color: 'bg-teal-50 text-teal-600'
    },
    { 
      id: 'surgery',
      title: 'Minor Oral Surgery', 
      desc: 'Wisdom teeth removal and soft tissue procedures.',
      icon: <MedicalServices fontSize="small" />, 
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'restoration',
      title: 'Restoration', 
      desc: 'Aesthetic composite fillings for cavities.',
      icon: <AutoFixHigh fontSize="small" />, 
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 'pediatric',
      title: 'Pediatric Dentistry', 
      desc: 'Gentle care and fluoride treatments for kids.',
      icon: <ChildCare fontSize="small" />, 
      color: 'bg-yellow-50 text-yellow-600'
    },
    { 
      id: 'implant-bridge',
      title: 'Implants & Bridges', 
      desc: 'Permanent fixed solutions for missing teeth.',
      icon: <VerifiedUser fontSize="small" />, 
      color: 'bg-slate-100 text-slate-600'
    },
    { 
      id: 'cosmetic',
      title: 'Cosmetic Dentistry', 
      desc: 'Veneers and whitening for a dream smile.',
      icon: <Star fontSize="small" />, 
      color: 'bg-cyan-50 text-cyan-600'
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 overflow-x-hidden">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-16 md:pt-40 md:pb-24 flex items-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <p className="text-accent font-bold tracking-widest text-sm mb-4 uppercase">
                ESTABLISHED 2023 • MATARA
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-poppins font-bold text-primary-dark leading-tight mb-6">
                Redefining the <br /> 
                <span className="text-primary">Art of Dentistry.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Experience world-class dental treatments in an environment designed for your comfort. Advanced technology meets compassionate care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                >
                  Book Appointment
                  <ArrowForward className="ml-2" fontSize="small" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white hover:bg-slate-50 text-primary border-2 border-primary/20 hover:border-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  View Services
                </button>
              </div>
            </motion.div>
            
            {/* Image Overlay */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1 }}
              className="relative w-full max-w-lg mx-auto lg:max-w-none lg:ml-auto"
            >
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Advanced Dental Clinic Interior"
                className="w-full h-auto rounded-3xl shadow-2xl object-cover border-4 border-white"
              />
              {/* Badge */}
              <div className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 animate-bounce-slow hidden sm:flex">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-inner">
                  <VerifiedUser />
                </div>
                <div>
                  <p className="font-poppins font-bold text-primary-dark text-sm">#1 Clinic in Matara</p>
                  <div className="flex text-yellow-400 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4" />)}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-poppins font-bold text-primary-dark mb-6">
              Our Services
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We offer a comprehensive range of dental treatments. From routine care to complex surgeries, your smile is in safe hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }} 
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/service/${item.id}`)}
                className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-slate-800 mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;