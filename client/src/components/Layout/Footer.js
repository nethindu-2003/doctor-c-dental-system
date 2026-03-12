import React from 'react';
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
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-4">
            <div 
              className="flex items-center mb-6 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3 shadow-md">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <span className="text-2xl font-poppins font-bold tracking-tight">
                Doctor C
              </span>
            </div>
            <p className="text-sm text-primary-light mb-8 leading-relaxed pr-8">
              Redefining the art of dentistry in Matara. We combine advanced technology with compassionate care to create lasting smiles.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Instagram, LinkedIn].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors duration-300">
                  <Icon fontSize="small" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">
              Explore
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => handleNavigation(item.path)}
                    className="text-sm text-primary-light hover:text-white hover:translate-x-1 transition-all duration-300 text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">
              Visit Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <LocationOn className="text-accent mt-0.5 shrink-0" fontSize="small" />
                <span className="text-sm text-primary-light leading-relaxed">
                 No. 20, Circular rd, <br /> Devinuwara, Sri Lanka <br /> 81000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-accent shrink-0" fontSize="small" />
                <span className="text-sm text-primary-light">+94 70 513 9901</span>
              </li>
              <li className="flex items-center gap-3">
                <Email className="text-accent shrink-0" fontSize="small" />
                <span className="text-sm text-primary-light">doctorcdentalsurgery@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">
              Opening Hours
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-sm text-primary-light">Mon - Fri</span>
                <span className="text-sm font-medium">4:30 PM - 9:00 PM</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-sm text-primary-light">Sat</span>
                <span className="text-sm font-medium">6:30 PM - 9:00 PM</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-primary-light">Sun</span>
                <span className="text-sm font-medium">9:00 AM - 12:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-light">
            © 2026 Doctor C Dental Surgery. All Rights Reserved.
          </p>
          <div className="flex space-x-6">
            {['Privacy Policy', 'Terms', 'Cookies'].map((text) => (
              <button key={text} className="text-xs text-primary-light hover:text-white transition-colors">
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;