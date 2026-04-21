import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  CalendarMonth, LocalHospital, History, CheckCircle
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

import axios from '../../api/axios';
import { useClinic } from '../../context/ClinicContext';

const steps = ['Select Service & Dentist', 'Choose Date & Time', 'Payment & Confirm'];

const visitReasons = [
  'Routine Checkup', 'Tooth Pain', 'Cleaning / Scaling', 'Whitening',
  'Root Canal Consultation', 'Extraction', 'Other'
];

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState([]);

  // Pull clinic settings from global context
  const { config, getScheduleForDayIndex, clinicLoading } = useClinic();

  // Form States
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [takenSlots, setTakenSlots] = useState([]);
  const [clinicClosed, setClinicClosed] = useState(false);

  const [bookingError, setBookingError] = useState('');

  // --- 1. DATA FETCHING ---

  useEffect(() => {
    fetchMyAppointments();
    fetchDentists();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get('/patient/appointments');
      // Sort newest first
      const sortedAppointments = res.data.sort((a, b) => {
        const dateA = dayjs(`${a.appointmentDate} ${a.appointmentTime}`);
        const dateB = dayjs(`${b.appointmentDate} ${b.appointmentTime}`);
        return dateB.diff(dateA);
      });
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchDentists = async () => {
    try {
      const res = await axios.get('/patient/dentists');
      setDentists(res.data);
    } catch (err) {
      console.error("Error fetching dentists:", err);
    }
  };

  const fetchTakenSlots = async (date) => {
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const res = await axios.get(`/patient/appointments/slots?date=${formattedDate}`);
      const taken = res.data.map(t => t.substring(0, 5));
      setTakenSlots(taken);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
  };

  // --- 2. SLOT GENERATION ---

  /**
   * generateSlots – reads schedule from ClinicContext (via getScheduleForDayIndex)
   * instead of hardcoded hours.
   */
  const generateSlots = (date) => {
    const dayIndex = date.day(); // 0 = Sunday...
    const schedule = getScheduleForDayIndex(dayIndex);

    if (!schedule || schedule.isClosed) {
      setClinicClosed(true);
      setAvailableSlots([]);
      setSelectedTime('');
      return;
    }

    setClinicClosed(false);

    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return { hour: h, minute: m };
    };

    const open = parseTime(schedule.openTime || '08:00:00');
    const close = parseTime(schedule.closeTime || '20:00:00');

    const slots = [];
    let current = date.hour(open.hour).minute(open.minute).second(0);
    const end = date.hour(close.hour).minute(close.minute).second(0);
    const now = dayjs();

    while (current.isBefore(end)) {
      if (date.isSame(now, 'day')) {
        if (current.isAfter(now)) {
          slots.push(current.format('HH:mm'));
        }
      } else {
        slots.push(current.format('HH:mm'));
      }
      current = current.add(30, 'minute');
    }

    setAvailableSlots(slots);
    setSelectedTime('');
  };

  // Trigger slot generation whenever date or schedule availability changes
  // IMPORTANT: This effect is placed AFTER function definitions to avoid hoisting crashes.
  useEffect(() => {
    if (!clinicLoading) {
      generateSlots(selectedDate);
      fetchTakenSlots(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, getScheduleForDayIndex, clinicLoading]);

  // --- 3. EVENT HANDLERS ---

  const handleConfirmBooking = async () => {
    if (!selectedTime) {
        setBookingError("Please select a time slot.");
        return;
    }

    setBookingError('');
    setPaymentProcessing(true);

    setTimeout(async () => {
      try {
        const payload = {
          dentistId: selectedDentist,
          reasonForVisit: reasonForVisit,
          additionalNotes: additionalNotes,
          date: selectedDate.format('YYYY-MM-DD'),
          time: selectedTime + ":00"
        };

        const res = await axios.post('/patient/appointments', payload);
        setPaymentProcessing(false);
        alert("Payment Successful! Appointment Confirmed.");

        setActiveStep(0);
        setReasonForVisit('');
        setSelectedDentist(null);
        setAdditionalNotes('');
        setSelectedTime('');
        fetchMyAppointments();
        generateSlots(selectedDate); 
        fetchTakenSlots(selectedDate);

      } catch (err) {
        setPaymentProcessing(false);
        setBookingError(err.response?.data?.message || "Failed to book appointment. Please ensure all fields are filled.");
      }
    }, 2000);
  };

  const handleCancel = async (appointment) => {
    const aptDateTime = dayjs(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const now = dayjs();
    const diffInHours = aptDateTime.diff(now, 'hour', true);

    if (diffInHours <= 2) {
      alert("Appointments cannot be cancelled within 2 hours of the scheduled time.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/patient/appointments/${appointment.appointmentId}/cancel`);
      alert("Appointment Cancelled");
      fetchMyAppointments();
      fetchTakenSlots(selectedDate);
    } catch (err) {
      alert("Failed to cancel: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleNext = () => {
    setBookingError('');
    
    if (activeStep === 0) {
        if (!reasonForVisit || (selectedDentist === null || selectedDentist === undefined)) {
            setBookingError("Please select both a reason for visit and a dentist from the list.");
            return;
        }
    }
    
    if (activeStep === 1) {
        if (!selectedTime) {
            setBookingError("Please select a time slot to continue.");
            return;
        }
    }
    
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
      setBookingError('');
      setActiveStep((prev) => prev - 1);
  };

  const getDoctorImage = (id) => {
    const imgId = (id % 4) + 1;
    if (imgId === 1) return 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg?w=200';
    if (imgId === 2) return 'https://img.freepik.com/free-photo/portrait-hansome-young-male-doctor-man_171337-5068.jpg?w=200';
    if (imgId === 3) return 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg?w=200';
    return 'https://img.freepik.com/free-photo/smiling-doctor-with-strethoscope-isolated-grey_651396-974.jpg?w=200';
  };

  // --- 4. RENDERERS ---

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">1. Reason for Visit</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Reason</label>
          <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary/20"
            value={reasonForVisit}
            onChange={(e) => {
                setReasonForVisit(e.target.value);
                setBookingError('');
            }}
          >
            <option value="" disabled>Select a reason...</option>
            {visitReasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (Optional)</label>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all resize-none focus:ring-2 focus:ring-primary/20"
            rows="3"
            placeholder="Any special requests or symptoms?"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          ></textarea>
        </div>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-xl font-bold text-slate-800 mt-2 mb-4">2. Choose Your Dentist</h3>
        {dentists.length === 0 ? (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            Fetching dentists list...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dentists.map((doctor) => {
              const docId = doctor.dentistId || doctor.id;
              return (
                <div
                  key={`dentist-${docId}`}
                  onClick={() => {
                      setSelectedDentist(docId);
                      setBookingError('');
                  }}
                  className={`cursor-pointer rounded-2xl p-4 text-center border-2 transition-all duration-300 transform hover:-translate-y-1 ${selectedDentist === docId ? 'border-primary bg-primary/5 shadow-md scale-105' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                >
                  <img src={doctor.profilePicture || getDoctorImage(docId)} alt={doctor.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-white" />
                  <h4 className="font-bold text-slate-800">Dr. {doctor.name}</h4>
                  <p className="text-sm text-slate-500">{doctor.specialization}</p>
                  {selectedDentist === docId && <div className="mt-2 text-primary font-bold text-xs flex items-center justify-center gap-1"><CheckCircle sx={{ fontSize: 14 }} /> Selected</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Select Date</h3>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar value={selectedDate} onChange={(newValue) => setSelectedDate(newValue)} disablePast className="w-full" />
          </LocalizationProvider>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Available Time Slots</h3>
        <p className="text-sm text-slate-500 mb-6">{selectedDate.format('dddd, MMMM D, YYYY')}</p>
        
        {clinicLoading ? (
            <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : availableSlots.length === 0 ? (
          <div className="p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-200">
            {clinicClosed ? 'Clinic is closed on this day.' : 'No slots available for today.'}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {availableSlots.map((time) => {
              const isTaken = takenSlots.includes(time);
              const [h, m] = time.split(':');
              const displayTime = dayjs().hour(h).minute(m).format('h:mm A');
              return (
                <button
                  key={`slot-${time}`}
                  onClick={() => !isTaken && setSelectedTime(time)}
                  disabled={isTaken}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all
                     ${isTaken ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      selectedTime === time ? 'bg-primary text-white shadow-md' : 'bg-white border border-primary/30 text-primary hover:bg-primary/5'}
                  `}
                >
                  {displayTime}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
      <div className="md:col-span-7">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Booking Summary</h3>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4"><LocalHospital fontSize="small" /></div>
            <div>
              <p className="font-bold text-slate-800">
                Dr. {dentists.find(d => String(d.id) === String(selectedDentist))?.name || 'Selected Doctor'}
              </p>
            </div>
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4"><History fontSize="small" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</p><p className="font-bold text-slate-800">{reasonForVisit}</p></div>
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4"><CalendarMonth fontSize="small" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
              <p className="font-bold text-slate-800">
                {selectedDate.format('MMMM D, YYYY')} at {selectedTime ? dayjs().hour(selectedTime.split(':')[0]).minute(selectedTime.split(':')[1]).format('h:mm A') : 'Time not selected'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-5">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-6">Payment</h3>
          <div className="flex justify-between mb-4"><span>Booking Fee</span><span className="font-bold">LKR {Number(config.standardBookingFee || 500).toLocaleString()}</span></div>
          <div className="flex justify-between mb-8 text-slate-400 text-xs"><span>* Non-refundable platform fee</span></div>
          <button onClick={handleConfirmBooking} className="w-full bg-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg active:scale-95">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {paymentProcessing && (
        ReactDOM.createPortal(<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in"><div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div><h2 className="text-xl font-bold text-white">Processing Booking...</h2><p className="text-white/60 text-sm">Please do not refresh the page</p></div>, document.body)
      )}
      
      <div className="mb-10">
        <h1 className="text-3xl font-poppins font-bold text-slate-800">Book Appointment</h1>
        <p className="text-slate-500">Secure your dental care in three simple steps.</p>
      </div>

      {/* STEPPER UI */}
      <div className="mb-12 flex items-center justify-center max-w-4xl mx-auto">
        {steps.map((label, index) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 
                ${activeStep === index ? 'bg-primary text-white scale-110 shadow-lg' : 
                  activeStep > index ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                {activeStep > index ? <CheckCircle sx={{ fontSize: 20 }} /> : index + 1}
              </div>
              <span className={`absolute top-12 whitespace-nowrap text-xs font-bold uppercase tracking-tighter transition-colors
                ${activeStep === index ? 'text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: activeStep > index ? '100%' : activeStep === index ? '50%' : '0%' }}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 mb-12 relative overflow-hidden">
        {bookingError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="font-semibold text-sm">{bookingError}</span>
          </div>
        )}

        <div className="min-h-[350px]">
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </div>

        <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
          {activeStep > 0 && (
            <button 
              onClick={handleBack} 
              className="px-8 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          )}
          <button 
            type="button"
            onClick={activeStep === 2 ? handleConfirmBooking : handleNext} 
            className="bg-primary text-white px-10 py-2.5 rounded-full font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95"
          >
            {activeStep === 2 ? 'Confirm booking' : 'Next Step'}
          </button>
        </div>
      </div>

      <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <History className="text-primary" /> Your Appointment History
          </h2>
          <p className="text-slate-500 mb-8">View and manage your upcoming and past visits.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <History sx={{ fontSize: 48, opacity: 0.3 }} className="mb-2 mx-auto" />
                    <p className="italic">No appointments booked yet.</p>
                  </div>
              ) : (
                  appointments.map(apt => (
                      <div key={apt.appointmentId || `apt-${apt.appointmentDate}-${apt.appointmentTime}`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{apt.status === 'CANCELLED' && apt.cancelledByAdmin ? 'Canceled by admin' : apt.status}</span>
                                    <span className="font-black text-2xl text-slate-800">{dayjs('2000-01-01 ' + apt.appointmentTime).format('h:mm A')}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${apt.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                    {apt.status === 'CONFIRMED' ? <><CheckCircle sx={{ fontSize: 10, mr: 0.5 }} /> {apt.status}</> : (apt.status === 'CANCELLED' && apt.cancelledByAdmin ? 'Canceled by admin' : apt.status)}
                                  </span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-2xl mb-4">
                                <p className="text-slate-800 font-bold">{dayjs(apt.appointmentDate).format('dddd, MMM D, YYYY')}</p>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{apt.reasonForVisit}</p>
                              </div>
                          </div>
                          {(() => {
                            const aptDateTime = dayjs(`${apt.appointmentDate} ${apt.appointmentTime}`);
                            const diffInHours = aptDateTime.diff(dayjs(), 'hour', true);
                            const canBeCancelled = apt.status !== 'CANCELLED' && diffInHours > 2;

                            if (apt.status === 'CANCELLED') return null;

                            return canBeCancelled ? (
                              <button 
                                  onClick={() => handleCancel(apt)} 
                                  className="text-xs text-red-500 font-bold hover:bg-red-50 py-2 rounded-xl transition-colors border border-transparent hover:border-red-100"
                              >
                                  Cancel Appointment
                              </button>
                            ) : (
                              <div className="text-[10px] text-slate-400 font-bold py-2 text-center bg-slate-50 rounded-xl">
                                {diffInHours < 0 ? 'Past Appointment' : 'Cancellation period closed (2h)'}
                              </div>
                            );
                          })()}
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default BookAppointment;