import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Search, Edit, Cancel, EventAvailable, CheckCircle, Person, Close, FilterList
} from '@mui/icons-material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import axios from '../../api/axios'; 

dayjs.extend(isBetween);

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDays, setFilterDays] = useState('All'); // All, Today, Tomorrow, This Week, Past
  const [successMsg, setSuccessMsg] = useState('');
  
  // Edit Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const [apptsRes, dentistsRes] = await Promise.all([
              axios.get('/admin/appointments'),
              axios.get('/dentists')
          ]);
          setAppointments(apptsRes.data);
          setDentists(dentistsRes.data);
      } catch (err) {
          console.error("Error fetching data:", err);
      } finally {
          setLoading(false);
      }
  };

  // --- HANDLERS ---
  const handleEditClick = (appt) => {
    setCurrentAppt({
        ...appt,
        dentistId: appt.dentistId || '' 
    });
    setOpenDialog(true);
  };

  const handleCancelClick = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment? The patient will be notified via email.")) {
      try {
          const res = await axios.put(`/admin/appointments/${id}/cancel`);
          setAppointments(appointments.map(a => a.appointmentId === id ? res.data : a));
          showSuccess("Appointment cancelled and patient notified.");
      } catch (err) {
          alert("Failed to cancel appointment.");
      }
    }
  };

  const handleConfirmClick = async (appt) => {
      try {
          const payload = {
              appointmentDate: appt.appointmentDate,
              appointmentTime: appt.appointmentTime,
              status: 'CONFIRMED',
              dentistId: appt.dentistId || null
          };
          const res = await axios.put(`/admin/appointments/${appt.appointmentId}`, payload);
          setAppointments(appointments.map(a => a.appointmentId === appt.appointmentId ? res.data : a));
          showSuccess("Appointment Confirmed.");
      } catch (err) {
          alert("Failed to confirm.");
      }
  };

  const handleSaveChanges = async () => {
      try {
          const payload = {
              appointmentDate: currentAppt.appointmentDate,
              appointmentTime: currentAppt.appointmentTime,
              status: currentAppt.status,
              dentistId: currentAppt.dentistId || null
          };
          
          const res = await axios.put(`/admin/appointments/${currentAppt.appointmentId}`, payload);
          setAppointments(appointments.map(a => a.appointmentId === currentAppt.appointmentId ? res.data : a));
          setOpenDialog(false);
          showSuccess("Changes saved successfully. If rescheduled, the patient has been notified.");
      } catch (err) {
          alert("Failed to update appointment.");
      }
  };

  const handleMarkCompleted = async (appt) => {
      try {
          const payload = {
              appointmentDate: appt.appointmentDate,
              appointmentTime: appt.appointmentTime,
              status: 'COMPLETED',
              dentistId: appt.dentistId || null
          };
          const res = await axios.put(`/admin/appointments/${appt.appointmentId}`, payload);
          setAppointments(appointments.map(a => a.appointmentId === appt.appointmentId ? res.data : a));
          showSuccess("Appointment marked as Completed.");
      } catch (err) {
          alert("Failed to update status.");
      }
  };

  const showSuccess = (msg) => {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
  };

  // --- FILTER LOGIC ---
  const filteredAppointments = appointments.filter(a => {
    // 1. Search Filter
    const patientName = a.patientName?.toLowerCase() || '';
    const dentistName = a.dentistName?.toLowerCase() || '';
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || dentistName.includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    
    // 3. Days Filter
    let matchesDays = true;
    const apptDate = dayjs(a.appointmentDate);
    const today = dayjs().startOf('day');
    
    if (filterDays === 'Today') {
        matchesDays = apptDate.isSame(today, 'day');
    } else if (filterDays === 'Tomorrow') {
        matchesDays = apptDate.isSame(today.add(1, 'day'), 'day');
    } else if (filterDays === 'This Week') {
        matchesDays = apptDate.isBetween(today, today.add(7, 'day'), 'day', '[]');
    } else if (filterDays === 'Past') {
        matchesDays = apptDate.isBefore(today, 'day');
    }

    return matchesSearch && matchesStatus && matchesDays;
  });

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2">
             Appointment Management
           </h1>
           <p className="text-slate-500 text-sm md:text-base">View, manage, and schedule patient appointments.</p>
        </div>
      </div>

      {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center shadow-sm animate-fade-in">
              <CheckCircle fontSize="small" className="mr-2" />
              <span className="font-semibold">{successMsg}</span>
          </div>
      )}

      {/* FILTERS SECTION */}
      <div className="bg-white p-4 mb-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Search by Patient or Dentist..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FilterList fontSize="small" />
            </div>
            <select
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="All">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
            </div>
        </div>

        {/* Days Filter */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <EventAvailable fontSize="small" />
            </div>
            <select
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium appearance-none"
                value={filterDays}
                onChange={(e) => setFilterDays(e.target.value)}
            >
                <option value="All">Any Date</option>
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Week">Next 7 Days</option>
                <option value="Past">Past Dates</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
            </div>
        </div>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
        {loading ? (
            <div className="p-12 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1A237E] rounded-full animate-spin"></div>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold rounded-tl-3xl">Patient</th>
                            <th className="p-4 font-bold">Dentist</th>
                            <th className="p-4 font-bold">Reason for Visit</th>
                            <th className="p-4 font-bold">Date & Time</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-center rounded-tr-3xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">No appointments found matching your filters.</td>
                            </tr>
                        ) : (
                            filteredAppointments.map((row) => {
                                const apptDate = dayjs(row.appointmentDate);
                                const today = dayjs().startOf('day');
                                const isPast = apptDate.isBefore(today);
                                const isToday = apptDate.isSame(today, 'day');
                                const isFuture = apptDate.isAfter(today);
                                const status = row.status;

                                let statusClasses = 'bg-slate-100 text-slate-700';
                                if (status === 'CONFIRMED') statusClasses = 'bg-green-100 text-green-700 border-green-200';
                                else if (status === 'PENDING') statusClasses = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
                                else if (status === 'CANCELLED') statusClasses = 'bg-red-50 text-red-600 border border-red-200';
                                else if (status === 'COMPLETED') statusClasses = 'bg-blue-100 text-blue-700 border border-blue-200';

                                return (
                                <tr key={row.appointmentId} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 w-1/6 align-middle">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                                <Person fontSize="small" />
                                            </div>
                                            <span className="font-semibold text-slate-800 break-words whitespace-normal text-sm group-hover:text-[#1A237E] transition-colors">
                                                {row.patientName || 'Walk-in Guest'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 w-1/6 align-middle text-sm font-medium text-slate-600 break-words">
                                        {row.dentistName ? `Dr. ${row.dentistName}` : <span className="text-slate-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="p-4 w-1/5 align-middle text-sm text-slate-600 break-words whitespace-normal">
                                        {row.reasonForVisit}
                                    </td>
                                    <td className="p-4 w-1/6 align-middle">
                                        <p className={`font-bold text-sm whitespace-nowrap ${isPast ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {dayjs('2023-01-01 ' + row.appointmentTime).format('h:mm A')}
                                        </p>
                                        <p className={`text-xs whitespace-nowrap mt-0.5 ${isPast ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {dayjs(row.appointmentDate).format('MMM D, YYYY')}
                                        </p>
                                    </td>
                                    <td className="p-4 w-1/6 align-middle text-center md:text-left">
                                        <span className={`inline-block px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg ${statusClasses}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="p-4 w-1/6 align-middle text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            {/* 1. Mark Completed (Allowed on Appointment Day or Past if Confirmed) */}
                                            {(row.status === 'CONFIRMED' && (isToday || isPast)) && (
                                                <button 
                                                    className="p-1.5 rounded-lg transition-colors focus:outline-none text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleMarkCompleted(row)}
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle fontSize="small" />
                                                </button>
                                            )}

                                            {/* 2. Confirm (Allowed Today or Future) */}
                                            {(row.status === 'PENDING' && (isToday || isFuture)) && (
                                                <button 
                                                    className={`p-1.5 rounded-lg transition-colors focus:outline-none text-green-600 hover:bg-green-50`}
                                                    onClick={() => handleConfirmClick(row)}
                                                    title="Confirm Appointment"
                                                >
                                                    <CheckCircle fontSize="small" />
                                                </button>
                                            )}
                                            
                                            {/* 3. Edit/Reschedule (Only Future) */}
                                            {isFuture && (
                                                <button 
                                                    className={`p-1.5 rounded-lg transition-colors focus:outline-none text-blue-600 hover:bg-blue-50`}
                                                    onClick={() => handleEditClick(row)}
                                                    title="Edit / Reschedule"
                                                >
                                                    <Edit fontSize="small" />
                                                </button>
                                            )}

                                            {/* 4. Cancel (Today or Future) */}
                                            {(row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && (isToday || isFuture)) && (
                                                <button 
                                                    className={`p-1.5 rounded-lg transition-colors focus:outline-none text-red-500 hover:bg-red-50`}
                                                    onClick={() => handleCancelClick(row.appointmentId)}
                                                    title="Cancel Appointment"
                                                >
                                                    <Cancel fontSize="small" />
                                                </button>
                                            )}
                                            
                                            {/* 5. Restricted Placeholder for Past */}
                                            {(isPast && !isToday && row.status !== 'CONFIRMED') && (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Locked</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* EDIT/RESCHEDULE DIALOG */}
      {openDialog && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="bg-[#1A237E] p-5 flex justify-between items-center shrink-0">
                      <h2 className="text-white font-bold font-poppins text-lg">Manage Appointment</h2>
                      <button 
                         onClick={() => setOpenDialog(false)}
                         className="text-white/70 hover:text-white transition-colors focus:outline-none"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto flex-grow">
                      {currentAppt && (
                          <div className="space-y-5">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Name</label>
                                  <input 
                                      type="text" 
                                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed outline-none" 
                                      value={currentAppt.patientName || 'Walk-in Guest'} 
                                      disabled 
                                  />
                              </div>
                              
                              <div>
                                  <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Assign Dentist</label>
                                  <div className="relative">
                                      <select 
                                          className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all appearance-none"
                                          value={currentAppt.dentistId} 
                                          onChange={(e) => setCurrentAppt({...currentAppt, dentistId: e.target.value})}
                                      >
                                          <option value="">Unassigned / Any Available</option>
                                          {dentists.map(d => (
                                              <option key={d.dentistId} value={d.dentistId}>Dr. {d.name}</option>
                                          ))}
                                      </select>
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                          </svg>
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Date</label>
                                      <input 
                                          type="date"
                                          required
                                          min={new Date().toISOString().split('T')[0]}
                                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all uppercase"
                                          value={currentAppt.appointmentDate} 
                                          onChange={(e) => setCurrentAppt({...currentAppt, appointmentDate: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Time</label>
                                      <input 
                                          type="time"
                                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all uppercase"
                                          value={currentAppt.appointmentTime} 
                                          onChange={(e) => setCurrentAppt({...currentAppt, appointmentTime: e.target.value})}
                                      />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Status</label>
                                  <div className="relative">
                                      <select 
                                          className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all appearance-none"
                                          value={currentAppt.status} 
                                          onChange={(e) => setCurrentAppt({...currentAppt, status: e.target.value})}
                                      >
                                          <option value="CONFIRMED">Confirmed</option>
                                          <option value="PENDING">Pending</option>
                                          <option value="CANCELLED">Cancelled</option>
                                          <option value="COMPLETED">Completed</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
                      <button 
                          onClick={() => setOpenDialog(false)}
                          className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors focus:outline-none"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveChanges}
                          className="px-5 py-2.5 rounded-xl bg-[#1A237E] text-white font-bold flex items-center hover:bg-[#12185c] hover:-translate-y-0.5 transition-all focus:outline-none shadow-md"
                      >
                          <EventAvailable fontSize="small" className="mr-2 -ml-1" />
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>, document.body)
      )}
    </div>
  );
};

export default AdminAppointments;