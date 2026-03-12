import React, { useState } from 'react';
import { 
  Dashboard, CalendarMonth, MedicalServices, Chat, Receipt, Person, 
  Notifications, Menu as MenuIcon, Logout 
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORT AUTH CONTEXT ---
import { useAuth } from '../../context/AuthContext'; 

const PatientLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // --- GET USER & LOGOUT FROM CONTEXT ---
  const { user, logout } = useAuth(); 

  // Header User Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle Logout Action
  const handleLogout = () => {
    setIsMenuOpen(false); 
    logout();      // Call the context logout function (clears session & redirects)
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard fontSize="small" />, path: '/patient/dashboard' },
    { text: 'My Appointments', icon: <CalendarMonth fontSize="small" />, path: '/patient/appointments' },
    { text: 'Treatment History', icon: <MedicalServices fontSize="small" />, path: '/patient/treatments' },
    { text: 'Messages', icon: <Chat fontSize="small" />, path: '/patient/messages' },
    { text: 'Payments', icon: <Receipt fontSize="small" />, path: '/patient/payments' },
    { text: 'My Profile', icon: <Person fontSize="small" />, path: '/patient/profile' },
  ];

  const drawerContent = (
    <div className="h-full flex flex-col bg-slate-900 text-white shadow-xl border-r border-slate-800">
      {/* Brand Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-accent text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
          C
        </div>
        <span className="text-xl font-poppins font-bold tracking-wide">Doctor C</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-accent text-white font-semibold shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${isActive ? 'font-semibold' : 'font-normal'}`}>{item.text}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Sidebar Logout Button */}
      <div className="p-4 border-t border-slate-800">
         <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
         >
            <span className="flex items-center justify-center"><Logout fontSize="small" /></span>
            <span className="text-sm font-medium">Logout</span>
         </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 md:left-72 bg-white border-b border-slate-200 z-30 h-16 flex items-center px-4 shadow-sm transition-all duration-300">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="mr-4 p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden focus:outline-none"
        >
          <MenuIcon />
        </button>
        
        <div className="flex-grow">
          <h1 className="text-xl font-poppins font-semibold text-primary">Patient Portal</h1>
        </div>

        <div className="flex items-center space-x-4 relative">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <Notifications />
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
              3
            </span>
          </button>
          
          {/* User Profile Section */}
          <div className="pl-4 border-l border-slate-200 relative">
             <div 
               className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors"
               onClick={() => setIsMenuOpen(!isMenuOpen)}
             >
                <div className="w-9 h-9 flex items-center justify-center bg-accent text-white font-bold rounded-full shadow-sm">
                   {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-700 leading-tight">
                     {user?.name || 'Patient'}
                  </p>
                  <p className="text-xs text-slate-500">Patient ID: #{user?.id || '---'}</p>
                </div>
             </div>
             
             {/* Dropdown Menu */}
             {isMenuOpen && (
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                 <button 
                   onClick={() => { setIsMenuOpen(false); navigate('/patient/profile'); }}
                   className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                   My Profile
                 </button>
                 <button 
                   onClick={handleLogout}
                   className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                 >
                   Logout
                 </button>
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {drawerContent}
      </div>
      
      {/* Desktop Drawer */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 h-screen">
        {drawerContent}
      </div>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
         <div 
           className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
           onClick={() => setMobileOpen(false)}
         />
      )}

      <main className="flex-1 p-6 md:ml-72 mt-16 max-w-7xl mx-auto w-full overflow-hidden">
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
    </div>
  );
};

export default PatientLayout;