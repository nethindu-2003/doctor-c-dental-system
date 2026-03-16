import React, { useState, useEffect } from 'react';
import { 
  People, CalendarToday, AttachMoney, Warning,
  PersonAdd, EventAvailable, Payment, Inventory2, 
  PointOfSale, MedicalInformation, LocalHospital,
  ArrowForwardIos, CheckCircle, Schedule, Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // NOTE: You can update your backend to return 'todaysStats' and 'lowStockList' in this summary payload later!
        const res = await axios.get('/admin/dashboard/summary');
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getLogVisuals = (type) => {
    switch(type) {
      case 'APPOINTMENT': return { icon: <EventAvailable fontSize="small" className="text-purple-600" />, borderColor: "border-purple-600" };
      case 'PAYMENT': return { icon: <Payment fontSize="small" className="text-green-600" />, borderColor: "border-green-600" };
      case 'INVENTORY': return { icon: <Inventory2 fontSize="small" className="text-yellow-600" />, borderColor: "border-yellow-600" };
      default: return { icon: <PersonAdd fontSize="small" className="text-blue-600" />, borderColor: "border-blue-600" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-24">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1A237E] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Patients", value: dashboardData?.totalPatients || "0", icon: <People fontSize="large" />, colorClass: "text-blue-600", bgClass: "bg-blue-100" },
    { label: "Total Appointments", value: dashboardData?.totalAppointments || "0", icon: <CalendarToday fontSize="large" />, colorClass: "text-purple-600", bgClass: "bg-purple-100" },
    { label: "Total Revenue", value: `LKR ${dashboardData?.totalRevenue?.toLocaleString() || "0"}`, icon: <AttachMoney fontSize="large" />, colorClass: "text-green-600", bgClass: "bg-green-100" },
    { label: "Low Stock Items", value: dashboardData?.lowStockItems || "0", icon: <Warning fontSize="large" />, colorClass: "text-red-600", bgClass: "bg-red-100" },
  ];

  // Fallback data if backend doesn't provide these yet
  const todaysStats = dashboardData?.todaysStats || { pending: 0, completed: 0, cancelled: 0 };
  const lowStockList = dashboardData?.lowStockList || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2">
          Welcome back, Admin!
        </h1>
      </div>

      {/* 1. DYNAMIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 flex items-center rounded-3xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${stat.bgClass} ${stat.colorClass} shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{stat.value}</h2>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CENTER COLUMN (Taking 2/3 space on md) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* FEATURE 1: Quick Actions Hub */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <button onClick={() => navigate('/admin/patients')} className="flex flex-col items-center p-4 bg-slate-50 hover:bg-[#1A237E]/5 border border-slate-100 hover:border-[#1A237E]/30 rounded-2xl transition-all focus:outline-none group">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A237E] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                         <PersonAdd />
                     </div>
                     <span className="text-sm font-bold text-slate-700 text-center leading-tight">Add<br/>Patient</span>
                 </button>

                 <button onClick={() => navigate('/admin/appointments')} className="flex flex-col items-center p-4 bg-slate-50 hover:bg-[#1A237E]/5 border border-slate-100 hover:border-[#1A237E]/30 rounded-2xl transition-all focus:outline-none group">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A237E] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                         <MedicalInformation />
                     </div>
                     <span className="text-sm font-bold text-slate-700 text-center leading-tight">Manage<br/>Bookings</span>
                 </button>

                 <button onClick={() => navigate('/admin/inventory')} className="flex flex-col items-center p-4 bg-slate-50 hover:bg-[#1A237E]/5 border border-slate-100 hover:border-[#1A237E]/30 rounded-2xl transition-all focus:outline-none group">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A237E] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                         <Inventory2 />
                     </div>
                     <span className="text-sm font-bold text-slate-700 text-center leading-tight">Update<br/>Stock</span>
                 </button>

                 <button onClick={() => navigate('/admin/financial')} className="flex flex-col items-center p-4 bg-slate-50 hover:bg-[#1A237E]/5 border border-slate-100 hover:border-[#1A237E]/30 rounded-2xl transition-all focus:outline-none group">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A237E] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                         <PointOfSale />
                     </div>
                     <span className="text-sm font-bold text-slate-700 text-center leading-tight">View<br/>Ledger</span>
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* FEATURE 2: Today's Clinic Overview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                    <LocalHospital fontSize="small" className="mr-2 text-[#1A237E]" /> Today's Clinic Status
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-3">
                            <Schedule className="text-blue-600" />
                            <span className="font-bold text-blue-900">Pending</span>
                        </div>
                        <span className="text-xl font-black text-blue-700">{todaysStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="text-green-600" />
                            <span className="font-bold text-green-900">Completed</span>
                        </div>
                        <span className="text-xl font-black text-green-700">{todaysStats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center space-x-3">
                            <Cancel className="text-red-500" />
                            <span className="font-bold text-red-900">Cancelled</span>
                        </div>
                        <span className="text-xl font-black text-red-700">{todaysStats.cancelled}</span>
                    </div>
                </div>
              </div>

              {/* FEATURE 3: Urgent Alerts / Low Stock */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Warning fontSize="small" className="mr-2 text-red-500" /> Low Stock Alerts
                  </h3>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                  {lowStockList.length > 0 ? (
                    lowStockList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div>
                              <p className="text-sm font-bold text-slate-700">{item.name}</p>
                              <p className="text-xs font-semibold text-red-500 mt-0.5">Only {item.quantity} left in stock</p>
                          </div>
                          <button 
                            onClick={() => navigate('/admin/inventory')}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-[#1A237E] rounded-lg transition-colors"
                          >
                              <ArrowForwardIos style={{ fontSize: 14 }} />
                          </button>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70 py-6">
                        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Inventory looks good!</p>
                        <p className="text-xs text-slate-400 mt-1">No items are critically low.</p>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

        {/* FEATURE 4: DYNAMIC ACTIVITY LOGS (Right Column, taking 1/3 space on md) */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-6 sticky top-0 bg-white z-10 py-1">Recent Activity</h3>
            
            <ul className="space-y-5">
              {dashboardData?.recentActivities?.length > 0 ? (
                  dashboardData.recentActivities.map((log, index) => {
                    const visuals = getLogVisuals(log.type);
                    return (
                      <li key={index} className="flex relative">
                        {/* Connecting Line (except last item) */}
                        {index < dashboardData.recentActivities.length - 1 && (
                            <div className="absolute top-10 bottom-[-20px] left-[19px] w-[2px] bg-slate-100"></div>
                        )}
                        
                        <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center shrink-0 mr-4 z-10 ${visuals.borderColor}`}>
                          {visuals.icon}
                        </div>
                        
                        <div className="pb-2">
                          <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">{log.text}</p>
                          <p className="text-xs font-medium text-slate-400">{log.time}</p>
                        </div>
                      </li>
                    );
                  })
              ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                      No recent activity found.
                  </p>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;