import React, { useState, useEffect } from 'react';
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

        await axios.post('/patient/appointments', payload);
        setPaymentProcessing(false);
        alert("Payment Successful! Appointment Confirmed.");

        setActiveStep(0);
        setReasonForVisit('');
        setAdditionalNotes('');
        fetchMyAppointments();
        generateSlots(selectedDate); 
        fetchTakenSlots(selectedDate);

      } catch (err) {
        setPaymentProcessing(false);
        setBookingError(err.response?.data?.message || "Failed to book appointment.");
      }
    }, 2000);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/patient/appointments/${appointmentId}/cancel`);
      alert("Appointment Cancelled");
      fetchMyAppointments();
      fetchTakenSlots(selectedDate);
    } catch (err) {
      alert("Failed to cancel: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all"
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
          >
            <option value="" disabled>Select a reason...</option>
            {visitReasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (Optional)</label>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all resize-none"
            rows="3"
            placeholder="Any special requests or symptoms?"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          ></textarea>
        </div>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-xl font-bold text-slate-800 mt-2 mb-4">2. Choose Dentist (Optional)</h3>
        {dentists.length === 0 ? (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            No dentists found. You can proceed without selecting one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dentists.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDentist(doctor.id)}
                className={`cursor-pointer rounded-2xl p-4 text-center border-2 transition-all duration-300 transform hover:-translate-y-1 ${selectedDentist === doctor.id ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300'}`}
              >
                <img src={getDoctorImage(doctor.id)} alt={doctor.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-white" />
                <h4 className="font-bold text-slate-800">Dr. {doctor.name}</h4>
                <p className="text-sm text-slate-500">{doctor.specialization}</p>
              </div>
            ))}
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
                  key={time}
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
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</p><p className="font-bold text-slate-800">{reasonForVisit}</p></div>
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4"><CalendarMonth fontSize="small" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</p><p className="font-bold text-slate-800">{selectedDate.format('MMMM D, YYYY')} at {selectedTime}</p></div>
          </div>
        </div>
      </div>
      <div className="md:col-span-5">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-6">Payment</h3>
          <div className="flex justify-between mb-4"><span>Booking Fee</span><span className="font-bold">LKR {Number(config.standardBookingFee).toLocaleString()}</span></div>
          <button onClick={handleConfirmBooking} className="w-full bg-primary py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {paymentProcessing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in"><div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div><h2 className="text-xl font-bold text-white">Processing...</h2></div>
      )}
      <div className="mb-10"><h1 className="text-3xl font-poppins font-bold text-slate-800">Book Appointment</h1><p className="text-slate-500">Choose your preferred slot below.</p></div>
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-12">
        <div className="min-h-[350px]">{activeStep === 0 && renderStep1()}{activeStep === 1 && renderStep2()}{activeStep === 2 && renderStep3()}</div>
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">{activeStep > 0 && <button onClick={handleBack} className="px-6 py-2 rounded-full border">Back</button>}<button onClick={activeStep === 2 ? handleConfirmBooking : handleNext} className="bg-primary text-white px-8 py-2 rounded-full font-bold">{activeStep === 2 ? 'Confirm' : 'Next'}</button></div>
      </div>
      <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 rounded-2xl italic">No appointments booked yet.</div>
              ) : (
                  appointments.map(apt => (
                      <div key={apt.appointmentId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between mb-2">
                                  <span className="font-bold text-primary">{dayjs('2000-01-01 ' + apt.appointmentTime).format('h:mm A')}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${apt.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>{apt.status}</span>
                              </div>
                              <p className="text-slate-800 font-bold">{dayjs(apt.appointmentDate).format('MMM D, YYYY')}</p>
                              <p className="text-sm text-slate-500 mb-4">{apt.reasonForVisit}</p>
                          </div>
                          {apt.status !== 'CANCELLED' && <button onClick={() => handleCancel(apt.appointmentId)} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>}
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default BookAppointment;