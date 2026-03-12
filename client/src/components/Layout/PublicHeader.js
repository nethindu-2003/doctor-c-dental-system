import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { label: 'Services', path: '#services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' 
            : 'bg-white py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md group-hover:bg-primary-dark transition-colors">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <span className="text-xl md:text-2xl font-poppins font-bold text-primary-dark tracking-tight">
                Doctor C
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.label} 
                  onClick={() => handleNavigation(item.path)}
                  className="text-slate-600 hover:text-primary font-medium text-sm transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => navigate('/login')} 
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Portal Login
              </button>
            </nav>

            {/* Mobile Hamburger Icon */}
            <button 
              className="md:hidden p-2 text-primary hover:bg-slate-50 rounded-lg transition-colors"
              onClick={handleDrawerToggle}
            >
              <MenuIcon fontSize="medium" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-end">
          <button 
            onClick={handleDrawerToggle}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label} 
              onClick={() => handleNavigation(item.path)}
              className="w-full text-left px-4 py-3 text-lg font-semibold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors"
            >
              {item.label}
            </button>
          ))}
          
          <div className="mt-8 px-4 pt-6 border-t border-slate-100">
            <button 
              onClick={() => { navigate('/login'); handleDrawerToggle(); }}
              className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-colors"
            >
              Portal Login
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default PublicHeader;