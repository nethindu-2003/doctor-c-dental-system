import React, { useState, useEffect } from 'react';
import { 
  People, CalendarToday, AttachMoney, Warning, TrendingUp, Inventory, 
  PersonAdd, EventAvailable, Payment 
} from '@mui/icons-material';
import axios from '../../api/axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

  // Map backend "type" to actual Material UI Icons and tailwind colors
  const getLogVisuals = (type) => {
    switch(type) {
      case 'APPOINTMENT': return { icon: <EventAvailable fontSize="small" className="text-purple-600" />, borderColor: "border-purple-600" };
      case 'PAYMENT': return { icon: <Payment fontSize="small" className="text-green-600" />, borderColor: "border-green-600" };
      case 'INVENTORY': return { icon: <Inventory fontSize="small" className="text-yellow-600" />, borderColor: "border-yellow-600" };
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

  // Map the dynamic data into the stats array
  const stats = [
    { label: "Total Patients", value: dashboardData?.totalPatients || "0", icon: <People fontSize="large" />, colorClass: "text-blue-600", bgClass: "bg-blue-100" },
    { label: "Total Appointments", value: dashboardData?.totalAppointments || "0", icon: <CalendarToday fontSize="large" />, colorClass: "text-purple-600", bgClass: "bg-purple-100" },
    { label: "Total Revenue", value: `LKR ${dashboardData?.totalRevenue?.toLocaleString() || "0"}`, icon: <AttachMoney fontSize="large" />, colorClass: "text-green-600", bgClass: "bg-green-100" },
    { label: "Low Stock Items", value: dashboardData?.lowStockItems || "0", icon: <Warning fontSize="large" />, colorClass: "text-red-600", bgClass: "bg-red-100" },
  ];

  // Mock data for visual charts until historical reporting is built
  const inventoryUsage = [
    { label: "Gloves", value: 60 }, { label: "Syringes", value: 45 }, 
    { label: "Anesthetics", value: 80 }
  ];

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
        
        {/* CHARTS & PROGRESS (Left Column, taking 2/3 space on md) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* 2. CHARTS SECTION (Mocking Visuals)  */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-800">Appointment & Financial Trends</h3>
               <TrendingUp className="text-slate-400" />
             </div>
             
             <div className="h-48 flex items-end justify-around px-4 pb-0 bg-slate-50 rounded-xl relative pt-8">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <div 
                    key={i} 
                    style={{ height: `${h}%` }} 
                    className={`w-[8%] rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 ${i % 2 === 0 ? 'bg-[#5C6BC0]' : 'bg-[#26A69A]'}`} 
                  />
                ))}
             </div>
             <p className="text-xs text-center text-slate-500 mt-4 font-medium uppercase tracking-wider">
                Jan - Jul Performance Overview
             </p>
          </div>

          {/* Inventory Usage Progress Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory Usage Tracker</h3>
            <div className="space-y-5">
              {inventoryUsage.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    <span className="text-xs font-semibold text-slate-500">{item.value}% Utilized</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-[#EF5350] h-2.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC ACTIVITY LOGS (Right Column, taking 1/3 space on md) */}
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