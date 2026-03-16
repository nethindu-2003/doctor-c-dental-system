import React from 'react';
import { Facebook, Instagram, LinkedIn, Phone, Email, LocationOn } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import dayjs from 'dayjs';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, schedules } = useClinic();

  const handleNavigation = (path) => {
    if (path === '#services') {
      if (location.pathname === '/') {
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#services');
      }
    } else {
      navigate(path);
      window.scrollTo(0, 0);
    }
  };

  const footerLinks = [
    { label: 'Home', path: '/' },
    { label: 'Our Services', path: '#services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Patient Portal', path: '/login' },
  ];

  /**
   * Format a time string like "16:30:00" → "4:30 PM"
   */
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return dayjs(`2000-01-01 ${timeStr}`).format('h:mm A');
  };

  /**
   * Group consecutive open days with identical hours into a single row,
   * e.g. Mon-Fri 4:30 PM – 9:00 PM.
   */
  const buildHoursDisplay = () => {
    if (!schedules || schedules.length === 0) return [];

    const dayAbbr = {
      MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
      THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
    };

    const groups = [];
    let i = 0;

    while (i < schedules.length) {
      const current = schedules[i];

      if (current.isClosed) {
        groups.push({
          label: dayAbbr[current.dayOfWeek],
          hours: 'Closed',
          key: current.dayOfWeek,
        });
        i++;
        continue;
      }

      // Try to merge with consecutive days that have the SAME open/close times
      let j = i + 1;
      while (
        j < schedules.length &&
        !schedules[j].isClosed &&
        schedules[j].openTime === current.openTime &&
        schedules[j].closeTime === current.closeTime
      ) {
        j++;
      }

      const rangeLabel =
        j - i > 1
          ? `${dayAbbr[schedules[i].dayOfWeek]} - ${dayAbbr[schedules[j - 1].dayOfWeek]}`
          : dayAbbr[current.dayOfWeek];

      groups.push({
        label: rangeLabel,
        hours: `${formatTime(current.openTime)} - ${formatTime(current.closeTime)}`,
        key: current.dayOfWeek,
      });

      i = j;
    }

    return groups;
  };

  const hoursDisplay = buildHoursDisplay();
  const currentYear = new Date().getFullYear();

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
              {config.clinicLogo ? (
                <img
                  src={config.clinicLogo}
                  alt={config.clinicName}
                  className="w-10 h-10 rounded-lg mr-3 object-contain shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <span className="text-xl font-bold text-white">
                    {config.clinicName?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
              <span className="text-2xl font-poppins font-bold tracking-tight">
                {config.clinicName}
              </span>
            </div>
            <p className="text-sm text-primary-light mb-8 leading-relaxed pr-8">
              Redefining the art of dentistry. We combine advanced technology with
              compassionate care to create lasting smiles.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Instagram, LinkedIn].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors duration-300"
                >
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
                  {config.clinicAddress}
                </span>
              </li>
              {config.clinicPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="text-accent shrink-0" fontSize="small" />
                  <span className="text-sm text-primary-light">{config.clinicPhone}</span>
                </li>
              )}
              {config.clinicEmail && (
                <li className="flex items-center gap-3">
                  <Email className="text-accent shrink-0" fontSize="small" />
                  <span className="text-sm text-primary-light">{config.clinicEmail}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Dynamic Hours */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-poppins font-semibold text-white mb-6">
              Opening Hours
            </h3>
            {hoursDisplay.length > 0 ? (
              <ul className="space-y-3">
                {hoursDisplay.map((row, idx) => (
                  <li
                    key={row.key}
                    className={`flex justify-between items-center pb-2 ${
                      idx < hoursDisplay.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <span className="text-sm text-primary-light">{row.label}</span>
                    <span className={`text-sm font-medium ${row.hours === 'Closed' ? 'text-red-400' : ''}`}>
                      {row.hours}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-primary-light">Hours not available.</p>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-light">
            © {currentYear} {config.clinicName}. All Rights Reserved.
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