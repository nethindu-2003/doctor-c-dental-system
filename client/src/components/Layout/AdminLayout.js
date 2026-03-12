import React, { useState } from 'react';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth(); // Get admin user info
  const location = useLocation();
  
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
        
        <h1 className="text-xl font-poppins font-semibold text-primary flex-grow">
          Admin Portal
        </h1>

        <div className="flex items-center space-x-4">
           <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Notifications />
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                 4
              </span>
           </button>
           
           <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex items-center justify-center w-9 h-9 bg-primary text-white font-semibold rounded-full shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="hidden sm:block">
                 <p className="text-sm font-semibold text-slate-700 leading-tight">Admin</p>
                 <p className="text-xs text-slate-500">{user?.name || 'Super Admin'}</p>
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
      <main className="flex-1 p-6 md:ml-72 mt-16 mt-16 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[calc(100vh-8rem)] w-full">
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