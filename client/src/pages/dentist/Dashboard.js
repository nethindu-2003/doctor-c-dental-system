import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  CalendarToday, CheckCircle, Warning, NotificationsActive, 
  PersonOutline, AddCircleOutline, AccessTime, Close 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dentistId = user?.id || 1; 

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Holds the exact DTO structure from Spring Boot
  const [dashboardData, setDashboardData] = useState({
    todaysAppointmentsCount: 0,
    todaysPatients: [], 
    completedTreatmentsCount: 0,
    completedTreatments: [], 
    ongoingTreatments: [],
    notifications: []
  });

  const [patientsModalOpen, setPatientsModalOpen] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/dentist/${dentistId}/dashboard`);
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dentistId]);

  // --- FORMATTING UTILS ---
  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // --- STAT CARDS LOGIC ---
  const stats = [
    { 
      label: "Today's Patients", 
      value: dashboardData.todaysPatients?.length || 0, 
      icon: <PersonOutline fontSize="large" />, 
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'hover:border-blue-400',
      action: () => setPatientsModalOpen(true) 
    },
    { 
      label: "Today's Appointments", 
      value: dashboardData.todaysAppointmentsCount || 0, 
      icon: <CalendarToday fontSize="large" />, 
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
      borderClass: 'hover:border-purple-400',
      action: () => navigate('/dentist/appointments') 
    },
    { 
      label: "Completed Treatments", 
      value: dashboardData.completedTreatmentsCount || 0, 
      icon: <CheckCircle fontSize="large" />, 
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      borderClass: 'hover:border-green-400',
      action: () => setCompletedModalOpen(true) 
    }
  ];

  if (loading) return (
      <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
      </div>
  );
  
  if (error) return (
      <div className="mt-8 text-center p-6 bg-red-50 rounded-2xl border border-red-100 max-w-lg mx-auto">
          <p className="text-red-600 font-semibold">{error}</p>
      </div>
  );

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-2">
          Welcome back, Dr. {user?.name || 'Dentist'}
        </h1>
        <p className="text-slate-500 text-sm md:text-base">Here is your daily overview and pending tasks.</p>
      </div>
      
      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <button 
            key={index}
            onClick={stat.action}
            className={`flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left focus:outline-none ${stat.borderClass}`}
          >
            <div>
              <p className={`text-4xl font-bold mb-1 ${stat.colorClass}`}>{stat.value}</p>
              <p className="font-semibold text-slate-500">{stat.label}</p>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bgClass} ${stat.colorClass}`}>
              {stat.icon}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- ONGOING TREATMENTS --- */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#0E4C5C]">Ongoing Treatments</h2>
            </div>
            
            <div className="flex-grow space-y-6">
              {!dashboardData.ongoingTreatments || dashboardData.ongoingTreatments.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No ongoing treatments currently active.</p>
                 </div>
              ) : (
                dashboardData.ongoingTreatments.map((item, index) => (
                  <div key={`ongoing-${item.treatmentId || index}`} className="tracking-wide">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                          <p className="font-bold text-slate-800">{item.procedureName}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">Patient: {item.patientName}</p>
                      </div>
                      <p className="font-bold text-[#0E4C5C] text-sm">{item.progressPercentage}%</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-[#0E4C5C] h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${item.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
                className="mt-6 w-full py-3 text-[#0E4C5C] font-bold text-sm bg-[#0E4C5C]/5 hover:bg-[#0E4C5C]/10 rounded-xl transition-colors focus:outline-none" 
                onClick={() => navigate('/dentist/treatments')}
            >
              View All Treatments
            </button>
          </div>
        </div>

        {/* --- NOTIFICATIONS --- */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h2 className="text-xl font-bold text-[#0E4C5C] mb-6">Notifications & Alerts</h2>
            
            <div className="flex-grow">
              {!dashboardData.notifications || dashboardData.notifications.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full flex items-center justify-center">
                    <p className="text-slate-500 font-medium">You're all caught up!</p>
                 </div>
              ) : (
                <div className="space-y-4">
                    {dashboardData.notifications.map((notif, index) => (
                      <div key={`notif-${notif.notificationId || index}`} className="flex items-start space-x-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'ALERT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {notif.type === 'ALERT' ? <Warning fontSize="small" /> : <NotificationsActive fontSize="small" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm mb-1">{notif.title}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- POPUP 1: TODAY'S PATIENTS --- */}
      {patientsModalOpen && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                      <div>
                          <h2 className="text-xl font-bold font-poppins text-[#0E4C5C]">Today's Patients</h2>
                          <p className="text-sm font-semibold text-slate-500 mt-1">Manage your patient roster for today</p>
                      </div>
                      <button 
                         onClick={() => setPatientsModalOpen(false)}
                         className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all focus:outline-none"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto p-2 md:p-6 flex-grow bg-slate-50/30">
                      {!dashboardData.todaysPatients || dashboardData.todaysPatients.length === 0 ? (
                         <div className="text-center py-12">
                             <p className="text-slate-500 font-medium">No patients scheduled for today.</p>
                         </div>
                      ) : (
                          <div className="space-y-4">
                              {dashboardData.todaysPatients.map((patient, index) => (
                                  <div key={`patient-${patient.patientId || index}`} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                      <div className="flex items-center space-x-4">
                                          <div className="w-12 h-12 bg-[#0E4C5C] text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                                              {patient.name?.charAt(0).toUpperCase() || 'P'}
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-800 text-lg mb-1">{patient.name}</p>
                                              <div className="flex flex-wrap items-center gap-2">
                                                  <span className="text-xs font-semibold text-slate-500 border border-slate-200 px-2 py-1 rounded-md">ID: #{patient.patientId}</span>
                                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                      <AccessTime fontSize="inherit" className="mr-1" />
                                                      {formatTime(patient.appointmentTime)}
                                                  </span>
                                                  {patient.appointmentStatus && (
                                                      <span className={`px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${
                                                          patient.appointmentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                      }`}>
                                                          {patient.appointmentStatus}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                      {patient.appointmentStatus !== 'CANCELLED' && (
                                      <button 
                                          className="flex items-center justify-center sm:justify-start px-4 py-2.5 bg-[#0E4C5C] text-white hover:bg-[#0a3541] rounded-xl font-bold text-sm transition-all focus:outline-none shadow-md shadow-[#0E4C5C]/20 w-full sm:w-auto"
                                          onClick={() => {
                                              setPatientsModalOpen(false);
                                              navigate(`/dentist/treatments?patientId=${patient.patientId}&patientName=${encodeURIComponent(patient.name)}&appointmentId=${patient.appointmentId}`);
                                          }}
                                      >
                                          <AddCircleOutline fontSize="small" className="mr-2" />
                                          Add Treatment
                                      </button>
                                      )}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-white flex justify-end shrink-0">
                      <button 
                          onClick={() => setPatientsModalOpen(false)}
                          className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors focus:outline-none"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>, document.body)
      )}

      {/* --- POPUP 2: COMPLETED TREATMENTS --- */}
      {completedModalOpen && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                      <div>
                          <h2 className="text-xl font-bold font-poppins text-green-700 flex items-center">
                              <CheckCircle className="mr-2" />
                              Completed Treatments
                          </h2>
                      </div>
                      <button 
                         onClick={() => setCompletedModalOpen(false)}
                         className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all focus:outline-none"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto p-2 md:p-6 flex-grow bg-slate-50/30">
                      {!dashboardData.completedTreatments || dashboardData.completedTreatments.length === 0 ? (
                         <div className="text-center py-12">
                             <p className="text-slate-500 font-medium">No completed treatments yet.</p>
                         </div>
                      ) : (
                          <div className="space-y-4">
                              {dashboardData.completedTreatments.map((treatment, index) => (
                                  <div key={`completed-${treatment.treatmentId || index}`} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-50 text-green-600 border border-green-100 mt-1">
                                          <CheckCircle fontSize="small" />
                                      </div>
                                      <div className="flex-grow">
                                          <p className="font-bold text-slate-800 text-lg mb-2">{treatment.procedureName}</p>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                                              <p className="text-slate-600"><span className="font-semibold text-slate-800 mr-1">Patient:</span> {treatment.patientName}</p>
                                              <p className="text-slate-600"><span className="font-semibold text-slate-800 mr-1">Date:</span> {treatment.completionDate ? treatment.completionDate : 'N/A'}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-white flex justify-end shrink-0">
                      <button 
                          onClick={() => setCompletedModalOpen(false)}
                          className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors focus:outline-none"
                      >
                          Close Window
                      </button>
                  </div>
              </div>
          </div>, document.body)
      )}

    </div>
  );
};

export default Dashboard;
