import React from 'react';
import { 
  Dashboard, 
  People, 
  CalendarToday, 
  Inventory, 
  AttachMoney, 
  Assessment, 
  PersonAdd, 
  Logout 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useClinic();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard fontSize="small" />, path: '/admin/dashboard' },
    { text: 'Patients', icon: <People fontSize="small" />, path: '/admin/patients' },
    { text: 'Appointments', icon: <CalendarToday fontSize="small" />, path: '/admin/appointments' },
    { text: 'Inventory', icon: <Inventory fontSize="small" />, path: '/admin/inventory' },
    { text: 'Financial', icon: <AttachMoney fontSize="small" />, path: '/admin/financial' },
    { text: 'Reports', icon: <Assessment fontSize="small" />, path: '/admin/reports' },
    { text: 'Add Dentist', icon: <PersonAdd fontSize="small" />, path: '/admin/add-dentist' },
  ];

  const drawerContent = (
    <div className="h-full flex flex-col bg-slate-900 text-white shadow-xl">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        {config.clinicLogo ? (
          <img src={config.clinicLogo} alt={config.clinicName} className="w-9 h-9 rounded-lg object-contain shadow-sm" />
        ) : (
          <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xl font-bold text-white">{config.clinicName?.charAt(0) || 'C'}</span>
          </div>
        )}
        <span className="text-xl font-poppins font-bold tracking-tight text-white">{config.clinicName}</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => { navigate(item.path); if(mobileOpen) handleDrawerToggle(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>{item.text}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
         <button 
           onClick={handleLogout} 
           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
         >
            <span className="flex items-center justify-center"><Logout fontSize="small" /></span>
            <span className="text-sm font-medium">Logout</span>
         </button>
      </div>
    </div>
  );

  return (
    <>
       {/* Mobile Sidebar */}
       <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         {drawerContent}
       </div>
       
       {/* Desktop Sidebar */}
       <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 h-screen">
         {drawerContent}
       </div>
    </>
  );
};

export default AdminSidebar;