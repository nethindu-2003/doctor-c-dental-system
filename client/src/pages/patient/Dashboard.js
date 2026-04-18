import React, { useState, useEffect } from 'react';
import { 
  CalendarMonth, ArrowForward, MedicalServices, AttachMoney, NotificationsActive 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from '../../api/axios'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data States
  const [profile, setProfile] = useState({});
  const [nextAppointment, setNextAppointment] = useState(null);
  const [activeTreatment, setActiveTreatment] = useState(null);
  const [paymentStats, setPaymentStats] = useState({ outstanding: 0, paidCount: 0, pendingCount: 0 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch everything concurrently to load the dashboard fast
      const [profileRes, apptsRes, treatmentsRes, paymentsRes] = await Promise.all([
        axios.get('/patient/profile'),
        axios.get('/patient/appointments'),
        axios.get('/patient/treatments'),
        axios.get('/patient/payments')
      ]);

      // 1. Set Profile
      setProfile(profileRes.data);

      // 2. Composite Upcoming Events (Appointments + Treatment Sessions)
      const now = dayjs();
      const upcomingEvents = [];

      // Add Formal Appointments
      apptsRes.data.forEach(a => {
        if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
          const apptDateTime = dayjs(`${a.appointmentDate}T${a.appointmentTime}`);
          if (apptDateTime.isAfter(now)) {
            upcomingEvents.push({
              date: apptDateTime,
              type: 'APPOINTMENT',
              title: a.reasonForVisit,
              subtitle: a.dentist ? `Dr. ${a.dentist.name}` : 'Clinic Admin',
              displayTime: dayjs('2023-01-01 ' + a.appointmentTime).format('h:mm A'),
              id: a.appointmentId
            });
          }
        }
      });

      // Add Treatment Sessions (Planned slots or Next Recommendations)
      treatmentsRes.data.forEach(t => {
        // Only process sessions for treatments that are NOT completed yet
        if (t.status !== 'COMPLETED') {
          (t.sessions || []).forEach(s => {
            // If a session is already scheduled for a future date
            if (s.sessionDate && (s.status === 'PLANNED' || s.status === 'PENDING')) {
              const sessionDT = dayjs(s.sessionDate).set('hour', 9).set('minute', 0);
              if (sessionDT.isAfter(now)) {
                upcomingEvents.push({
                  date: sessionDT,
                  type: 'SESSION',
                  title: s.sessionName || 'Treatment Session',
                  subtitle: `Process: ${t.treatmentName}`,
                  displayTime: 'Morning (9:00 AM)',
                  id: s.sessionId
                });
              }
            }
            // If a dentist set a "Next Recommendation" date in a completed session
            else if (s.nextDate && s.status === 'COMPLETED') {
              const nextDT = dayjs(s.nextDate).set('hour', 9).set('minute', 0);
              if (nextDT.isAfter(now)) {
                upcomingEvents.push({
                  date: nextDT,
                  type: 'RECOMMENDATION',
                  title: 'Follow-up Recommended',
                  subtitle: `For: ${t.treatmentName}`,
                  displayTime: 'Recommended Date',
                  id: s.sessionId
                });
              }
            }
          });
        }
      });

      // Sort by date and take the earliest
      upcomingEvents.sort((a, b) => a.date.diff(b.date));
      setNextAppointment(upcomingEvents.length > 0 ? upcomingEvents[0] : null);

      // 3. Calculate Active Treatment Progress
      const active = treatmentsRes.data.find(t => t.status === 'ONGOING');
      if (active) {
        const sessions = active.sessions || [];
        const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;
        const totalCount = sessions.length;
        const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        
        const nextSession = sessions.find(s => s.status === 'PENDING' || s.status === 'PLANNED');

        setActiveTreatment({
          name: active.treatmentName,
          progress: progress,
          completed: completedCount,
          total: totalCount,
          nextStep: nextSession 
            ? `${nextSession.sessionName}${nextSession.sessionDate ? ` (Scheduled: ${dayjs(nextSession.sessionDate).format('MMM D')})` : ''}` 
            : 'Awaiting Schedule'
        });
      }

      // 4. Calculate True Payment Stats (Total Plan Gap)
      const payments = paymentsRes.data || [];
      const treatments = treatmentsRes.data || [];
      
      const treatmentPayments = payments.filter(p => p.status === 'COMPLETED' && p.paymentType === 'TREATMENT_PAYMENT');
      const totalPaidOnTreatments = treatmentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const totalTreatmentValue = treatments.reduce((sum, t) => sum + (t.totalCost || 0), 0);
      const trueOutstanding = Math.max(0, totalTreatmentValue - totalPaidOnTreatments);
      
      const pendingInvoices = payments.filter(p => p.status === 'PENDING');
      
      setPaymentStats({
          outstanding: trueOutstanding,
          pendingCount: pendingInvoices.length,
          paidCount: payments.filter(p => p.status === 'COMPLETED').length
      });

      setLoading(false);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
      return (
        <div className="flex justify-center mt-24">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8">
      {/* 1. Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-2">
          Welcome back, {profile.name || 'Patient'}!
        </h1>
        <p className="text-slate-500 text-lg">
          Here is an overview of your dental health status today.
        </p>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Next Appointment Card */}
        <div className="bg-primary-dark text-white p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col justify-between group">
          <div className="absolute -top-6 -right-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <CalendarMonth style={{ fontSize: 180 }} />
          </div>
          
          <div>
              <p className="text-primary-light font-bold text-xs tracking-widest uppercase mb-4">
                UPCOMING APPOINTMENT
              </p>
              
              {nextAppointment ? (
                  <>
                      <h2 className="text-3xl font-bold mb-1">
                          {nextAppointment.date.format('MMM D, YYYY')}
                      </h2>
                      <h3 className="text-2xl font-bold text-accent mb-4">
                          {nextAppointment.displayTime}
                      </h3>
                      <p className="text-slate-300 text-sm">
                          {nextAppointment.subtitle} • {nextAppointment.title}
                      </p>
                  </>
              ) : (
                  <div className="my-6">
                      <h3 className="text-xl font-bold mb-1">No upcoming visits</h3>
                      <p className="text-slate-300 text-sm">Time for a checkup?</p>
                  </div>
              )}
          </div>

          <div className="mt-8 relative z-10">
              <button 
                onClick={() => navigate('/patient/appointments')}
                className="bg-accent hover:bg-yellow-400 text-primary-dark w-full py-3 rounded-xl font-bold shadow-md transition-colors"
              >
                {nextAppointment ? 'Manage Appointment' : 'Book Now'}
              </button>
          </div>
        </div>

        {/* Treatment Progress Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-light text-white rounded-2xl flex items-center justify-center mr-4 shadow-sm">
                  <MedicalServices />
                </div>
                <h3 className="text-xl font-bold text-primary-dark">Treatment Progress</h3>
              </div>
              
              {activeTreatment ? (
                  <>
                      <h4 className="font-bold text-slate-800 mb-2">{activeTreatment.name}</h4>
                      <div className="flex justify-between items-end mb-2">
                          <span className="text-sm text-slate-500 font-medium">Session {activeTreatment.completed} of {activeTreatment.total}</span>
                          <span className="text-lg font-bold text-primary">{activeTreatment.progress}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${activeTreatment.progress}%` }}
                          ></div>
                      </div>
                      
                      <p className="text-sm text-slate-500 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700">Next Step:</span> {activeTreatment.nextStep}
                      </p>
                  </>
              ) : (
                  <div className="text-center py-6">
                      <p className="text-slate-500 font-medium text-sm">No ongoing complex treatments.</p>
                      <p className="text-slate-400 text-xs mt-2">Your smile is looking great!</p>
                  </div>
              )}
          </div>
          
          <button 
            onClick={() => navigate('/patient/treatments')}
            className={`flex items-center justify-center w-full py-3 text-sm font-semibold text-primary hover:text-primary-dark hover:bg-slate-50 rounded-xl transition-colors ${!activeTreatment ? 'mt-4 border border-slate-200' : 'mt-4'}`}
          >
            View History <ArrowForward fontSize="small" className="ml-2" />
          </button>
        </div>

        {/* Payments Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-sm">
                <AttachMoney />
              </div>
              <h3 className="text-xl font-bold text-primary-dark">Payments</h3>
            </div>

            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Outstanding</p>
            <h2 className={`text-4xl font-bold mb-6 ${paymentStats.outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                LKR {paymentStats.outstanding.toLocaleString()}
            </h2>
            
            <div className="flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold">
                 {paymentStats.paidCount} Paid
               </span>
               {paymentStats.pendingCount > 0 && (
                   <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold">
                     {paymentStats.pendingCount} Pending
                   </span>
               )}
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/patient/payments')}
            className={`flex items-center justify-center w-full py-3 mt-6 text-sm font-semibold rounded-xl transition-colors ${
              paymentStats.outstanding > 0 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'text-primary hover:text-primary-dark hover:bg-slate-50 border border-slate-200'
            }`}
          >
              {paymentStats.outstanding > 0 ? 'Pay Now' : 'View History'} <ArrowForward fontSize="small" className="ml-2" />
          </button>
        </div>

      </div>

      {/* 3. Recent Notifications / Reminders */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-primary-dark mb-4">Notifications &amp; Reminders</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            
          {/* Dynamic Appointment Reminder Notification */}
          {nextAppointment && nextAppointment.date.diff(dayjs(), 'day') <= 2 && (
             <div className="p-5 border-b border-slate-100 flex items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors flex-col sm:flex-row">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                  <NotificationsActive />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Upcoming Visit Reminder</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                      You have an {nextAppointment.type.toLowerCase().replace('_', ' ')} scheduled for <span className="font-semibold text-slate-700">{nextAppointment.date.format('MMM D')}</span> at <span className="font-semibold text-slate-700">{nextAppointment.displayTime}</span>.
                  </p>
                </div>
                <div className="shrink-0 mt-2 sm:mt-0">
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">Urgent</span>
                </div>
             </div>
          )}

          {/* Dynamic Payment Reminder Notification */}
          {paymentStats.outstanding > 0 && (
              <div className="p-5 border-b border-slate-100 flex items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors flex-col sm:flex-row">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                  <AttachMoney />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Outstanding Balance</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                      You have an outstanding balance of <span className="font-bold text-red-500">LKR {paymentStats.outstanding.toLocaleString()}</span>. Please clear it before your next visit.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/patient/payments')}
                  className="shrink-0 mt-2 sm:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Pay Now
                </button>
             </div>
          )}

          {/* System Welcome Notification */}
          <div className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <MedicalServices />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-slate-800 text-sm mb-1">Welcome to Doctor C Dental</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Thank you for choosing us for your dental care. Don't forget to update your profile with relevant medical history.</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-400 self-center hidden sm:block">System</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;