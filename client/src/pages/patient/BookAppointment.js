import React, { useState, useEffect } from 'react';
import { 
  CalendarMonth, LocalHospital, History, CheckCircle 
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

// Ensure this points to the file we created in src/utils/axiosConfig.js
import axios from '../../api/axios'; 

const steps = ['Select Service & Dentist', 'Choose Date & Time', 'Payment & Confirm'];

const visitReasons = [
  'Routine Checkup', 'Tooth Pain', 'Cleaning / Scaling', 'Whitening', 
  'Root Canal Consultation', 'Extraction', 'Other'
];

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false); // <--- NEW: Fake Payment State
  const [appointments, setAppointments] = useState([]); 
  const [dentists, setDentists] = useState([]);

  // Form States
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]); 
  const [takenSlots, setTakenSlots] = useState([]); 
  
  const [bookingError, setBookingError] = useState('');

  // --- 1. FETCH DATA (Dentists & History) ---
  useEffect(() => {
    fetchMyAppointments();
    fetchDentists();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get('/patient/appointments');
      setAppointments(res.data);
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

  const getDoctorImage = (id) => {
    const imgId = (id % 4) + 1; 
    if (imgId === 1) return 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg?w=200';
    if (imgId === 2) return 'https://img.freepik.com/free-photo/portrait-hansome-young-male-doctor-man_171337-5068.jpg?w=200';
    if (imgId === 3) return 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg?w=200';
    return 'https://img.freepik.com/free-photo/smiling-doctor-with-strethoscope-isolated-grey_651396-974.jpg?w=200';
  };

  // --- 2. GENERATE TIME SLOTS (With Past Time Validation) ---
  useEffect(() => {
    generateSlots(selectedDate);
    fetchTakenSlots(selectedDate);
  }, [selectedDate]);

  const generateSlots = (date) => {
    const day = date.day(); 
    let startHour, endHour, startMin = 0;

    // Clinic Hours
    if (day >= 1 && day <= 5) { // Mon-Fri: 4:30 PM - 9:00 PM
      startHour = 16; startMin = 30; endHour = 21;
    } else if (day === 6) { // Sat: 6:30 PM - 9:00 PM
      startHour = 18; startMin = 30; endHour = 21;
    } else if (day === 0) { // Sun: 9:00 AM - 12:00 PM
      startHour = 9; startMin = 0; endHour = 12;
    } else {
        setAvailableSlots([]); // Closed
        return;
    }

    const slots = [];
    let current = date.hour(startHour).minute(startMin).second(0);
    const end = date.hour(endHour).minute(0).second(0);
    
    // Get Current Time to filter past slots
    const now = dayjs();

    while (current.isBefore(end)) {
      // VALIDATION: If selected date is TODAY, filter out past times
      if (date.isSame(now, 'day')) {
         if (current.isAfter(now)) {
             slots.push(current.format('HH:mm')); 
         }
      } else {
         // Future date: Add all slots
         slots.push(current.format('HH:mm'));
      }
      current = current.add(30, 'minute');
    }
    setAvailableSlots(slots);
    setSelectedTime('');
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

  // --- 3. SUBMIT BOOKING (With Fake Payment) ---
  const handleConfirmBooking = async () => {
    setBookingError('');
    setPaymentProcessing(true); // Start fake payment

    // Wait 2 seconds
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
            
            // Reset
            setActiveStep(0);
            setReasonForVisit('');
            setAdditionalNotes('');
            fetchMyAppointments(); 

        } catch (err) {
            setPaymentProcessing(false);
            setBookingError(err.response?.data?.message || "Failed to book appointment.");
        }
    }, 2000); 
  };

  // --- 4. CANCEL APPOINTMENT ---
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/patient/appointments/${appointmentId}/cancel`);
      alert("Appointment Cancelled");
      fetchMyAppointments();
    } catch (err) {
      alert("Failed to cancel: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // --- RENDER STEPS ---
  
  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">1. Reason for Visit</h3>
        
        <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Reason</label>
            <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
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
                  className={`cursor-pointer rounded-2xl p-4 text-center border-2 transition-all duration-300 transform hover:-translate-y-1 ${selectedDentist === doctor.id ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}
              >
                  <img 
                      src={getDoctorImage(doctor.id)} 
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-white shadow-sm"
                  />
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
            <DateCalendar 
              value={selectedDate} 
              onChange={(newValue) => setSelectedDate(newValue)}
              disablePast
              className="w-full"
            />
          </LocalizationProvider>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Available Time Slots</h3>
        <p className="text-sm text-slate-500 mb-6">
          {selectedDate.format('dddd, MMMM D, YYYY')} (30 min slots)
        </p>
        
        {availableSlots.length === 0 ? (
            <div className="p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-200">
                Clinic is closed on this date or all slots have passed. Please select another date.
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
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 text-center
                     ${isTaken ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through' : 
                       selectedTime === time ? 'bg-primary text-white shadow-md transform scale-105' : 
                       'bg-white border text-primary border-primary/30 hover:bg-primary/5 hover:border-primary'}
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
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mr-4 mt-1">
                  <LocalHospital fontSize="small" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for Visit</p>
                <p className="font-bold text-slate-800 text-lg">{reasonForVisit}</p>
                {additionalNotes && <p className="text-sm text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">"{additionalNotes}"</p>}
              </div>
            </div>
            
            <hr className="border-slate-100"/>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mr-4">
                  <LocalHospital fontSize="small" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attending Dentist</p>
                <p className="font-bold text-slate-800">
                    {selectedDentist 
                        ? dentists.find(d => d.id === selectedDentist)?.name 
                        : "Any Available Doctor"}
                </p>
              </div>
            </div>
            
            <hr className="border-slate-100"/>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mr-4">
                  <CalendarMonth fontSize="small" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date &amp; Time</p>
                <p className="font-bold text-slate-800">
                  {selectedDate.format('MMMM D, YYYY')} at {dayjs('2023-01-01 '+selectedTime).format('h:mm A')}
                </p>
              </div>
            </div>
            
        </div>
        {bookingError && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center">
                <span className="font-bold mr-2">Error:</span> {bookingError}
            </div>
        )}
      </div>

      <div className="md:col-span-5">
        <div className="bg-primary-dark text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -tr-translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 translate-x-1/4 translate-y-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                  Payment Details
              </h3>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/80 font-medium">Booking Fee</span>
                <span className="font-semibold text-lg">LKR 500.00</span>
              </div>
              
              <hr className="border-white/20 my-4" />
              
              <div className="flex justify-between items-end mb-6">
                <div>
                   <span className="text-white/60 text-sm uppercase tracking-wider font-bold">Total Amount</span>
                   <h4 className="text-3xl font-poppins font-bold text-white leading-none mt-1">LKR 500</h4>
                </div>
              </div>
              
              <p className="text-xs text-white/60 text-center italic">
                  *Click confirm to process securely via our payment gateway.
              </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto relative">
      
      {/* FAKE PAYMENT LOADING SCREEN */}
      {paymentProcessing && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
             <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
             <h2 className="text-2xl font-bold text-white tracking-wide">Processing Payment...</h2>
             <p className="text-white/70 mt-2">Please do not close or refresh this window.</p>
          </div>
      )}

      <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-2">
            Book an Appointment
          </h1>
          <p className="text-slate-500 text-lg">
              Schedule your next visit in three easy steps.
          </p>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-12">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 relative">
           {/* Progress Line */}
           <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"></div>
           <div 
               className="absolute top-1/2 left-0 h-1 bg-primary transition-all duration-500 -translate-y-1/2 z-0 hidden sm:block"
               style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
           ></div>

           {steps.map((label, index) => (
              <div key={label} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      index < activeStep ? 'bg-primary text-white scale-95' :
                      index === activeStep ? 'bg-primary text-white shadow-lg ring-4 ring-primary/20 scale-110' :
                      'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                      {index < activeStep ? <CheckCircle fontSize="small" /> : index + 1}
                  </div>
                  <span className={`mt-3 text-xs font-bold uppercase tracking-wider hidden sm:block ${
                      index <= activeStep ? 'text-primary-dark' : 'text-slate-400'
                  }`}>
                      {label}
                  </span>
              </div>
           ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[350px] py-4">
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between md:justify-end items-center mt-8 pt-6 border-t border-slate-100 gap-4">
          <button 
              disabled={activeStep === 0 || paymentProcessing} 
              onClick={handleBack} 
              className={`px-6 py-2.5 rounded-full font-bold transition-colors ${
                  activeStep === 0 || paymentProcessing ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            Back
          </button>
          <button
            onClick={activeStep === steps.length - 1 ? handleConfirmBooking : handleNext}
            disabled={(activeStep === 0 && !reasonForVisit) || (activeStep === 1 && !selectedTime) || paymentProcessing}
            className={`px-8 py-2.5 rounded-full font-bold shadow-md transition-all ${
                (activeStep === 0 && !reasonForVisit) || (activeStep === 1 && !selectedTime) || paymentProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5'
            }`}
          >
            {activeStep === steps.length - 1 ? (paymentProcessing ? 'Processing...' : 'Confirm & Pay') : 'Next'}
          </button>
        </div>
      </div>

      {/* HISTORY CARDS */}
      <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-secondary/20 text-primary-dark rounded-xl flex items-center justify-center">
              <History />
          </div>
          <h2 className="text-2xl font-bold text-primary-dark">
              Your Upcoming Appointments
          </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length === 0 ? (
            <div className="col-span-full p-6 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500">
                You have no upcoming appointments. Find a slot and book one above!
            </div>
        ) : (
            appointments.map((apt) => {
                let statusColor = 'bg-slate-100 text-slate-700';
                if(apt.status === 'CONFIRMED') statusColor = 'bg-green-100 text-green-700 border-green-200';
                if(apt.status === 'PENDING') statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                if(apt.status === 'CANCELLED') statusColor = 'bg-red-50 text-red-600 border-red-200';
                
                return (
                <div key={apt.appointmentId} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary group-hover:bg-secondary transition-colors"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-lg text-slate-800">{dayjs(apt.appointmentDate).format('MMM D, YYYY')}</p>
                            <p className="text-xl font-poppins font-bold text-primary">
                                {dayjs('2023-01-01 ' + apt.appointmentTime).format('h:mm A')}
                            </p>
                        </div>
                        <span className={`px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold rounded-lg border ${statusColor} flex items-center`}>
                            {apt.status === 'CONFIRMED' && <CheckCircle style={{ fontSize: 12, marginRight: 4 }} />}
                            {apt.status}
                        </span>
                    </div>
                    
                    <hr className="border-slate-100 mb-4" />
                    
                    <div className="mb-4">
                        <p className="text-sm font-bold text-slate-800">{apt.reasonForVisit}</p>
                        {apt.additionalNotes && (
                            <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">"{apt.additionalNotes}"</p>
                        )}
                        {apt.dentist && (
                            <div className="flex items-center mt-3 text-sm text-slate-600">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] mr-2">
                                    <LocalHospital fontSize="inherit" />
                                </div>
                                <span className="font-semibold text-primary-dark">Dr. {apt.dentist.name}</span>
                            </div>
                        )}
                    </div>
                    
                    {apt.status !== 'CANCELLED' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleCancel(apt.appointmentId)}
                                className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl text-sm transition-colors focus:outline-none"
                            >
                                Cancel Appointment
                            </button>
                        </div>
                    )}
                </div>
            )})
        )}
      </div>
    </div>
  );
};

export default BookAppointment;