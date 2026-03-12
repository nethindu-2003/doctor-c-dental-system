import React from 'react';
import { 
  Dashboard, CalendarMonth, MedicalServices, AccountCircle, People, Inventory, Chat, Logout 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DentistSidebar = ({ mobileOpen, handleDrawerToggle, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard fontSize="small" />, path: '/dentist/dashboard' },
    { text: 'Appointments', icon: <CalendarMonth fontSize="small" />, path: '/dentist/appointments' },
    { text: 'Treatments', icon: <MedicalServices fontSize="small" />, path: '/dentist/treatments' },
    { text: 'Patients', icon: <People fontSize="small" />, path: '/dentist/patients' },
    { text: 'Inventory', icon: <Inventory fontSize="small" />, path: '/dentist/inventory' },
    { text: 'Messages', icon: <Chat fontSize="small" />, path: '/dentist/messages' },
    { text: 'Profile', icon: <AccountCircle fontSize="small" />, path: '/dentist/profile' },
  ];

  const drawerContent = (
    <div className="h-full flex flex-col bg-teal-900 text-white shadow-xl">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-teal-800">
        <div className="w-9 h-9 bg-teal-400 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xl font-bold text-teal-900">C</span>
        </div>
        <span className="text-xl font-poppins font-bold tracking-tight text-white">Doctor C</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-teal-200/50 uppercase tracking-wider mb-4 px-2">Menu</div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => { navigate(item.path); if(mobileOpen) handleDrawerToggle(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-teal-400 text-teal-950 shadow-md font-bold' 
                  : 'text-teal-100 hover:bg-teal-800 hover:text-white'
              }`}
            >
              <span className={`flex items-center justify-center ${isActive ? 'text-teal-900' : 'text-teal-300'}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-normal'}`}>{item.text}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-teal-800">
         <button 
           onClick={handleLogout} 
           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 transition-colors text-left"
         >
            <span className="flex items-center justify-center"><Logout fontSize="small" /></span>
            <span className="text-sm font-medium">Logout</span>
         </button>
      </div>
    </div>
  );

  return (
    <>
       {/* Mobile Drawer */}
       <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         {drawerContent}
       </div>
       {/* Desktop Drawer */}
       <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 h-screen border-r border-teal-900">
         {drawerContent}
       </div>
    </>
  );
};

export default DentistSidebar;