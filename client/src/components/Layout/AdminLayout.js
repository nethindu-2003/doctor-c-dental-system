import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Settings, AccessTime } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();

  // --- LIVE CLOCK STATE ---
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    // Update the clock every minute
    const timer = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex bg-slate-100 min-h-screen font-sans text-slate-800">
      
      {/* Top App Bar */}
      <header className="fixed top-0 right-0 left-0 md:left-72 bg-white border-b border-slate-200 z-30 h-16 flex items-center px-4 shadow-sm transition-all duration-300">
        <button 
          onClick={handleDrawerToggle} 
          className="mr-4 p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden focus:outline-none"
        >
          <MenuIcon />
        </button>
        
        <h1 className="text-xl font-poppins font-semibold text-[#1A237E] flex-grow">
          Admin Portal
        </h1>

        <div className="flex items-center space-x-3 sm:space-x-4">
           
           {/* FEATURE 1: Live Clinic Clock (Hidden on very small screens) */}
           <div className="hidden lg:flex items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
              <AccessTime fontSize="small" className="mr-2 text-[#1A237E]" />
              <span className="text-sm font-bold tracking-wide">{currentTime.format('MMM D, YYYY  •  h:mm A')}</span>
           </div>

           {/* FEATURE 2: Quick Settings */}
           <button 
              className="p-2 text-slate-400 hover:text-[#1A237E] transition-colors rounded-full hover:bg-slate-100 focus:outline-none"
              title="System Settings"
              onClick={() => navigate('/admin/settings')}
           >
              <Settings />
           </button>
           
           {/* Admin Profile Section */}
           <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200">
              <div className="flex items-center justify-center w-9 h-9 bg-[#1A237E] text-white font-bold rounded-full shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                 <p className="text-sm font-bold text-slate-700 leading-tight">Admin</p>
                 <p className="text-xs font-medium text-slate-500">{user?.name || 'Super Admin'}</p>
              </div>
           </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <AdminSidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        handleLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:ml-72 mt-16 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 min-h-[calc(100vh-8rem)] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet /> 
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={handleDrawerToggle}
        />
      )}
    </div>
  );
};

export default AdminLayout;