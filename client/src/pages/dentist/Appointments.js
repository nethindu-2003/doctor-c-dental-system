import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  CheckCircle, Cancel, Visibility, Email, Phone, CalendarToday, AccessTime, Assignment, Close
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import axios from '../../api/axios'; 

const statusConfig = {
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  COMPLETED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusMsg, setStatusMsg] = useState(null);

  // Detail Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/dentist/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleConfirm = async (e, id) => {
    e.stopPropagation(); // Prevents row click modal from opening
    try {
      const res = await axios.put(`/dentist/appointments/${id}/confirm`);
      setAppointments(appointments.map(a => a.appointmentId === id ? res.data : a));
      showStatus('success', 'Appointment confirmed. Email sent to patient.');
    } catch (err) {
      showStatus('error', 'Failed to confirm appointment.');
    }
  };

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this appointment? The patient will be notified.")) {
      try {
        const res = await axios.put(`/dentist/appointments/${id}/cancel`);
        setAppointments(appointments.map(a => a.appointmentId === id ? res.data : a));
        showStatus('success', 'Appointment cancelled. Email sent to patient.');
      } catch (err) {
        showStatus('error', 'Failed to cancel appointment.');
      }
    }
  };

  const handleRowClick = (appt) => {
    setSelectedAppt(appt);
    setOpenModal(true);
  };

  const showStatus = (type, msg) => {
    setStatusMsg({ type, msg });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // --- FILTER BY CALENDAR DATE ---
  const filteredAppointments = appointments.filter(a => 
    dayjs(a.appointmentDate).isSame(selectedDate, 'day')
  );

  if (loading) return (
      <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
      </div>
  );

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-2">Daily Schedule</h1>
           <p className="text-slate-500 text-sm md:text-base">Select a date on the calendar to view and manage appointments.</p>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl mb-6 text-sm border flex items-center shadow-sm ${statusMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {statusMsg.type === 'success' ? <CheckCircle fontSize="small" className="mr-3 text-green-600" /> : <Cancel fontSize="small" className="mr-3 text-red-600" />}
            <span className="font-medium">{statusMsg.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: REAL CALENDAR --- */}
        <div className="lg:col-span-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar 
                value={selectedDate} 
                onChange={(newDate) => setSelectedDate(newDate)} 
                sx={{ 
                  width: '100%',
                  '& .Mui-selected': { bgcolor: '#0E4C5C !important' }
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* --- RIGHT: APPOINTMENT TABLE --- */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative h-full flex flex-col">
            
            <div className="bg-[#0E4C5C] px-6 py-4 flex justify-between items-center text-white shrink-0">
               <h2 className="font-bold text-lg font-poppins">
                  Appointments for {selectedDate.format('MMMM D, YYYY')}
               </h2>
            </div>

            <div className="overflow-x-auto flex-grow max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr className="text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Time</th>
                    <th className="p-4 font-bold">Patient</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((row) => {
                      const isPast = dayjs(`${row.appointmentDate}T${row.appointmentTime}`).isBefore(dayjs());
                      const statusStyles = statusConfig[row.status] || statusConfig.COMPLETED;

                      return (
                        <tr 
                          key={row.appointmentId} 
                          className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${isPast ? 'bg-slate-50/30' : ''}`}
                          onClick={() => handleRowClick(row)}
                        >
                          <td className="p-4 align-middle">
                             <p className={`font-bold ${isPast ? 'text-slate-400' : 'text-[#0E4C5C]'}`}>
                                {dayjs(`2024-01-01 ${row.appointmentTime}`).format('h:mm A')}
                             </p>
                          </td>
                          <td className={`p-4 align-middle font-bold ${isPast ? 'text-slate-500' : 'text-slate-800'}`}>
                              {row.patientName}
                          </td>
                          <td className="p-4 align-middle">
                            <span className={`inline-block px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-center">
                            <div className="flex justify-center items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                              {row.status === 'PENDING' && !isPast && (
                                <button 
                                   className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors focus:outline-none"
                                   onClick={(e) => handleConfirm(e, row.appointmentId)}
                                   title="Confirm & Send Email"
                                >
                                  <CheckCircle fontSize="small" />
                                </button>
                              )}
                              {row.status !== 'CANCELLED' && !isPast && (
                                <button 
                                   className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none"
                                   onClick={(e) => handleCancel(e, row.appointmentId)}
                                   title="Cancel & Send Email"
                                >
                                  <Cancel fontSize="small" />
                                </button>
                              )}
                              <button 
                                 className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
                                 onClick={() => handleRowClick(row)}
                                 title="View Details"
                              >
                                <Visibility fontSize="small" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-12 text-center">
                        <p className="text-slate-500 font-medium">No appointments scheduled for this date.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- APPOINTMENT DETAILS MODAL --- */}
      {openModal && selectedAppt && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="bg-[#0E4C5C] px-6 py-4 flex justify-between items-center text-white shrink-0">
                      <h2 className="font-bold font-poppins text-lg">Appointment Details</h2>
                      <button 
                         onClick={() => setOpenModal(false)}
                         className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all focus:outline-none"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto flex-grow space-y-6">
                      
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Name</p>
                        <p className="text-xl font-bold text-slate-800">{selectedAppt.patientName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center shrink-0">
                               <CalendarToday fontSize="small" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</p>
                             <p className="text-sm font-bold text-slate-800">{dayjs(selectedAppt.appointmentDate).format('MMM D, YYYY')}</p>
                           </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex justify-center items-center shrink-0">
                               <AccessTime fontSize="small" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</p>
                             <p className="text-sm font-bold text-slate-800">{dayjs(`2024-01-01 ${selectedAppt.appointmentTime}`).format('h:mm A')}</p>
                           </div>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contact Info</p>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-slate-600 font-medium text-sm">
                               <Email fontSize="small" className="text-slate-400" />
                               <span>{selectedAppt.patientEmail}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-600 font-medium text-sm">
                               <Phone fontSize="small" className="text-slate-400" />
                               <span>{selectedAppt.patientPhone || 'Not provided'}</span>
                            </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 rounded-2xl border-l-4 border-blue-500 text-sm">
                        <div className="flex items-center space-x-2 mb-1.5 text-blue-800">
                            <Assignment fontSize="small" />
                            <p className="font-bold text-xs uppercase tracking-wider">Reason For Visit</p>
                        </div>
                        <p className="font-medium text-slate-700 leading-relaxed pl-7">{selectedAppt.reasonForVisit}</p>
                      </div>

                      {selectedAppt.additionalNotes && (
                        <div className="p-4 bg-amber-50/50 rounded-2xl border-l-4 border-amber-500 text-sm">
                          <div className="flex items-center space-x-2 mb-1.5 text-amber-800">
                              <Assignment fontSize="small" />
                              <p className="font-bold text-xs uppercase tracking-wider">Additional Notes</p>
                          </div>
                          <p className="font-medium text-slate-700 leading-relaxed pl-7">{selectedAppt.additionalNotes}</p>
                        </div>
                      )}

                  </div>
                  
                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                      <button 
                          onClick={() => setOpenModal(false)}
                          className="px-6 py-2.5 rounded-xl bg-[#0E4C5C] text-white font-bold hover:bg-[#0a3541] transition-colors focus:outline-none shadow-md"
                      >
                          Close
                      </button>
                  </div>

              </div>
          </div>, document.body)
      )}
    </div>
  );
};

export default Appointments;