import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Notifications, Warning, EventAvailable } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

import DentistSidebar from './DentistSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios'; // Make sure this points to your configured axios instance

const DentistLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // --- DYNAMIC STATE ---
  const [profilePic, setProfilePic] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const dentistId = user?.id || 1;

  // --- FETCH HEADER DATA ---
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // 1. Fetch Profile Picture
        const profileRes = await api.get('/dentist/profile');
        if (profileRes.data?.profilePicture) {
          setProfilePic(profileRes.data.profilePicture);
        }

        // 2. Fetch Notifications from Dashboard Endpoint
        const dashRes = await api.get(`/dentist/${dentistId}/dashboard`);
        const data = dashRes.data;

        const now = dayjs();
        const todayStr = now.format('YYYY-MM-DD');

        // A. Upcoming Appointments — built from todaysPatients (has appointmentTime for auto-expiry)
        // NOTE: data.notifications also includes REMINDER type from backend, so we build
        //       appointment reminders *only* from todaysPatients to avoid duplicates.
        const upcomingAppts = (data.todaysPatients || [])
          .filter(p => {
            if (p.appointmentStatus === 'COMPLETED' || p.appointmentStatus === 'CANCELLED') return false;
            const apptTime = dayjs(`${todayStr}T${p.appointmentTime}`);
            return now.isBefore(apptTime); // Only future ones
          })
          .map(p => ({
            id: `appt-${p.patientId}`,
            title: `Upcoming Visit: ${p.name}`,
            desc: `Scheduled at ${dayjs(`${todayStr}T${p.appointmentTime}`).format('h:mm A')}`,
            type: 'REMINDER',
            timeObj: dayjs(`${todayStr}T${p.appointmentTime}`)
          }));

        // B. Ongoing Treatment Sessions — shown for today, auto-expire when the day ends
        const treatmentSessions = (data.ongoingTreatments || [])
          .map((t, idx) => ({
            id: `session-${t.treatmentId || idx}`,
            title: `Active Treatment: ${t.procedureName}`,
            desc: `Patient: ${t.patientName} — Treatment in progress`,
            type: 'SESSION',
            timeObj: now.endOf('day') // Expires at midnight (end of today)
          }));

        // C. Low Stock Alerts — from notifications list, type === 'ALERT' only
        //    (We explicitly skip REMINDER type here to avoid duplicates with section A)
        const lowStockAlerts = (data.notifications || [])
          .filter(n => n.type === 'ALERT')
          .map(n => ({
            id: `alert-${n.notificationId}`,
            title: n.title,
            desc: n.message,
            type: 'ALERT',
            timeObj: now.endOf('day') // Expires at midnight; re-fetch will update stock status
          }));

        // Combine: alerts first, then sessions, then appointments sorted by time
        const combined = [
          ...lowStockAlerts,
          ...treatmentSessions,
          ...upcomingAppts.sort((a, b) => a.timeObj - b.timeObj)
        ];
        setNotifications(combined);

      } catch (err) {
        console.error("Error fetching header data", err);
      }
    };

    fetchHeaderData();

    // --- AUTO-REMOVE PASSED NOTIFICATIONS EVERY 60 SECONDS ---
    // Appointments and sessions disappear once their timeObj is in the past.
    // Alerts use end-of-day as their timeObj, so they auto-clear at midnight.
    const expireInterval = setInterval(() => {
      setNotifications(prev => prev.filter(n => dayjs().isBefore(n.timeObj)));
    }, 60000);

    // --- RE-FETCH ALL NOTIFICATIONS EVERY 5 MINUTES ---
    // This refreshes low-stock alerts (in case stock is replenished) and
    // picks up any newly added appointments or sessions.
    const refreshInterval = setInterval(fetchHeaderData, 5 * 60 * 1000);

    return () => {
      clearInterval(expireInterval);
      clearInterval(refreshInterval);
    };
  }, [dentistId]);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">

      <header className="fixed top-0 right-0 left-0 md:left-72 bg-white border-b border-slate-200 z-30 h-16 flex items-center px-4 shadow-sm transition-all duration-300">
        <button
          onClick={handleDrawerToggle}
          className="mr-4 p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden focus:outline-none"
        >
          <MenuIcon />
        </button>

        <h1 className="text-xl font-poppins font-semibold text-[#0E4C5C] flex-grow">
          Dentist Portal
        </h1>

        <div className="flex items-center space-x-4 relative">

          {/* --- NOTIFICATIONS BELL --- */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 focus:outline-none"
            >
              <Notifications />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* --- NOTIFICATIONS DROPDOWN --- */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Alerts & Reminders</h3>
                  <span className="text-xs bg-[#E0F7FA] text-[#0E4C5C] font-bold px-2 py-0.5 rounded-full">
                    {notifications.length} Active
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">You're all caught up for today!</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                        <div className="mt-1">
                          {notif.type === 'ALERT' ? (
                            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                              <Warning fontSize="small" />
                            </div>
                          ) : notif.type === 'SESSION' ? (
                            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                              <EventAvailable fontSize="small" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                              <EventAvailable fontSize="small" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- PROFILE AVATAR --- */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer" onClick={() => navigate('/dentist/profile')}>
            <div className="flex items-center justify-center w-9 h-9 bg-[#0E4C5C] text-white font-semibold rounded-full shadow-sm overflow-hidden border border-slate-200">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'D'
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">Dr. {user?.name || 'Dentist'}</p>
            </div>
          </div>

        </div>
      </header>

      <DentistSidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        handleLogout={logout}
      />

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

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={handleDrawerToggle}
        />
      )}
    </div>
  );
};

export default DentistLayout;