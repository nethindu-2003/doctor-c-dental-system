import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Save, History, ExpandMore, ExpandLess, MedicalServices, Event, Add, Delete, CheckCircle 
} from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Chip } from '@mui/material';
import api from '../../api/axios'; // Ensure this points to your identity_service axios instance
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const Treatments = () => {
  const { user } = useAuth();
  const dentistId = user?.id || 1;
  const [searchParams] = useSearchParams();
  
  // URL Params for external navigation (e.g., from Dashboard)
  const paramPatientId = searchParams.get('patientId');
  const paramPatientName = searchParams.get('patientName');
  const paramAppointmentId = searchParams.get('appointmentId');

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ONGOING'); // 'ONGOING' or 'COMPLETED'
  const [searchPatient, setSearchPatient] = useState('');

  // Form State: New Base Treatment
  const [treatmentForm, setTreatmentForm] = useState({
    patientId: '',
    diagnosis: '',
    treatmentName: '',
    totalSessionsPlanned: 4, 
    totalCost: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [activeTreatmentId, setActiveTreatmentId] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    sessionName: '',
    note: '',
    sessionDate: new Date().toISOString().split('T')[0],
    nextDate: '',
    cost: '',
    status: 'COMPLETED',
    equipmentUsed: [] // Array of { equipmentId, quantity }
  });

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(paramAppointmentId || null);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchInitialData();
  }, [dentistId]);

  useEffect(() => {
    fetchTreatments();
  }, [filterStatus, searchPatient]);

  // Handle URL parameters for pre-filling
  useEffect(() => {
    if (paramPatientId) {
      setTreatmentForm(prev => ({ ...prev, patientId: paramPatientId }));
    }
    if (paramPatientName) {
      setSearchPatient(paramPatientName);
    }
    if (paramAppointmentId) {
      setSelectedAppointmentId(paramAppointmentId);
    }
  }, [paramPatientId, paramPatientName, paramAppointmentId]);

  const fetchInitialData = async () => {
    try {
      // You need to ensure these endpoints exist in your backend!
      const [patientsRes, equipRes] = await Promise.all([
        api.get('/patients'), 
        api.get('/equipment')
      ]);
      setPatients(patientsRes.data);
      setEquipmentList(equipRes.data);
    } catch (err) {
      console.error("Failed to load dropdown data", err);
    }
  };

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      // Calls your new endpoint: GET /auth/treatments/dentist/{id}?status=ONGOING
      const res = await api.get(`/treatments/dentist/${dentistId}?status=${filterStatus}`);
      
      // Basic local filtering for patient name search
      let data = res.data;
      if (searchPatient) {
        data = data.filter(t => t.patient?.name.toLowerCase().includes(searchPatient.toLowerCase()));
      }
      setTreatments(data);
    } catch (err) {
      console.error("Failed to fetch treatments", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleCreateTreatment = async () => {
    try {
      if (!treatmentForm.patientId || !treatmentForm.treatmentName) return alert("Missing required fields");
      
      const payload = {
        patientId: treatmentForm.patientId,
        dentistId: dentistId,
        treatmentName: treatmentForm.treatmentName,
        diagnosis: treatmentForm.diagnosis,
        startDate: treatmentForm.startDate,
        totalCost: parseFloat(treatmentForm.totalCost) || 0,
        totalSessionsPlanned: parseInt(treatmentForm.totalSessionsPlanned) || 1
      };

      await api.post('/treatments', payload);
      alert("Treatment created successfully!");
      setTreatmentForm({ ...treatmentForm, treatmentName: '', diagnosis: '', totalCost: '' });
      if (filterStatus === 'ONGOING') fetchTreatments();
    } catch (err) {
      console.error(err);
      alert("Failed to create treatment.");
    }
  };

  const handleOpenSessionModal = async (treatmentId, sessionId, baseName, patientId) => {
    setActiveTreatmentId(treatmentId);
    setSessionForm({ 
      sessionId: sessionId || null,
      sessionName: baseName || '', 
      note: '', 
      sessionDate: new Date().toISOString().split('T')[0], 
      nextDate: '', 
      cost: '', 
      status: 'COMPLETED', 
      appointmentId: selectedAppointmentId || '',
      equipmentUsed: [] 
    });

    // Fetch patient appointments for the dropdown
    if (patientId) {
      try {
        const res = await api.get(`/appointments/patient/${patientId}`);
        // Filter to only confirmed or completed appointments
        setPatientAppointments(res.data.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED' || a.status === 'PENDING'));
      } catch (err) {
        console.error("Failed to fetch patient appointments", err);
      }
    }
    
    setSessionModalOpen(true);
  };

  const handleAddEquipmentToSession = () => {
    setSessionForm({
      ...sessionForm,
      equipmentUsed: [...sessionForm.equipmentUsed, { equipmentId: '', quantity: 1 }]
    });
  };

  const handleEquipmentChange = (index, field, value) => {
    const updated = [...sessionForm.equipmentUsed];
    updated[index][field] = value;
    setSessionForm({ ...sessionForm, equipmentUsed: updated });
  };

  const handleRemoveEquipment = (index) => {
    const updated = sessionForm.equipmentUsed.filter((_, i) => i !== index);
    setSessionForm({ ...sessionForm, equipmentUsed: updated });
  };

  const handleSaveSession = async () => {
    try {
      // Filter out empty equipment rows
      const validEquipment = sessionForm.equipmentUsed.filter(e => e.equipmentId !== '');
      const payload = {
        ...sessionForm,
        cost: parseFloat(sessionForm.cost) || 0,
        equipmentUsed: validEquipment
      };

      await api.post(`/treatments/${activeTreatmentId}/sessions`, payload);
      setSessionModalOpen(false);
      fetchTreatments(); // Refresh list to show new session and updated progress
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to save session. Check stock levels.");
    }
  };

  const handleToggleStatus = async (treatmentId, currentStatus) => {
    const isOngoing = currentStatus === 'ONGOING';
    const confirmMsg = isOngoing 
      ? "Mark this entire treatment as fully completed?" 
      : "Reopen this case for further sessions?";
    
    if(!window.confirm(confirmMsg)) return;

    try {
      const endpoint = isOngoing ? 'complete' : 'reopen';
      await api.put(`/treatments/${treatmentId}/${endpoint}`);
      fetchTreatments();
    } catch (err) {
      console.error(err);
      alert("Failed to update treatment status.");
    }
  };

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-6 md:mb-8">
        Treatment Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* --- LEFT: ADD NEW TREATMENT FORM --- */}
        <div className="w-full lg:w-5/12">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-[#E0F7FA] rounded-xl text-[#0E4C5C] shadow-sm"><MedicalServices /></div>
              <h2 className="text-xl font-bold font-poppins text-slate-800">Start New Treatment</h2>
            </div>
            <hr className="border-slate-100 mb-6" />

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Patient</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 transition-all text-sm"
                  value={treatmentForm.patientId}
                  onChange={e => setTreatmentForm({...treatmentForm, patientId: e.target.value})}
                >
                  <option value="">Select a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
                <input 
                    type="text" 
                    required minLength="3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] transition-all text-sm" 
                    placeholder="e.g. Gingivitis" 
                    value={treatmentForm.diagnosis}
                    onChange={e => setTreatmentForm({...treatmentForm, diagnosis: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Procedure Name</label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] text-sm" 
                     placeholder="e.g. Root Canal" 
                     value={treatmentForm.treatmentName}
                     onChange={e => setTreatmentForm({...treatmentForm, treatmentName: e.target.value})}
                   />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Planned Sessions</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] text-sm" 
                    value={treatmentForm.totalSessionsPlanned}
                    onChange={e => setTreatmentForm({...treatmentForm, totalSessionsPlanned: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Initial Est. Cost (Rs.)</label>
                  <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] transition-all text-sm" 
                      value={treatmentForm.totalCost}
                      onChange={e => setTreatmentForm({...treatmentForm, totalCost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                  <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] transition-all text-sm" 
                      value={treatmentForm.startDate}
                      onChange={e => setTreatmentForm({...treatmentForm, startDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleCreateTreatment}
                  className="w-full bg-[#0E4C5C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0a3541] transition-all shadow-md flex items-center justify-center"
                >
                  <Save className="mr-2" fontSize="small" /> Create Treatment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: TREATMENT HISTORY & SESSIONS --- */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-full flex flex-col">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold font-poppins text-slate-800">Treatment Records</h2>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setFilterStatus('ONGOING')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filterStatus === 'ONGOING' ? 'bg-white shadow text-[#0E4C5C]' : 'text-slate-500 hover:text-slate-700'}`}
                >Ongoing</button>
                <button 
                  onClick={() => setFilterStatus('COMPLETED')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filterStatus === 'COMPLETED' ? 'bg-white shadow text-[#2e7d32]' : 'text-slate-500 hover:text-slate-700'}`}
                >Completed</button>
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Filter by patient name..." 
              className="w-full mb-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={searchPatient}
              onChange={e => setSearchPatient(e.target.value)}
            />

            {/* List of Treatments */}
            <div className="space-y-4 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {loading ? <div className="text-center py-10"><CircularProgress size={30} /></div> : 
               treatments.length === 0 ? <p className="text-center text-slate-500 py-10">No treatments found.</p> :
               treatments.map((t) => {
                 // Fallback if backend doesn't have totalSessionsPlanned yet
                 const totalPlanned = t.totalSessionsPlanned || t.sessions?.length || 1; 
                 const completedCount = t.sessions?.length || 0;
                 const progress = Math.min((completedCount / totalPlanned) * 100, 100);

                 return (
                <div key={t.treatmentId} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${t.status === 'ONGOING' ? 'border-[#4DB6AC]' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{t.treatmentName}</h3>
                        <p className="text-sm font-medium text-slate-500">Patient: <span className="text-slate-700">{t.patient?.name}</span></p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                         <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${t.status === 'ONGOING' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                             {t.status}
                         </span>
                         <button 
                           onClick={() => handleToggleStatus(t.treatmentId, t.status)} 
                           className={`text-xs flex items-center font-bold transition-colors ${t.status === 'ONGOING' ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
                         >
                             {t.status === 'ONGOING' ? <><CheckCircle fontSize="inherit" className="mr-1"/> Mark Completed</> : <><History fontSize="inherit" className="mr-1"/> Reopen Case</>}
                         </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Progress</span>
                        <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{completedCount} Completed</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                        <div className="bg-[#0E4C5C] h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <button 
                      onClick={() => setExpandedId(expandedId === t.treatmentId ? null : t.treatmentId)}
                      className="text-[#0E4C5C] hover:bg-slate-50 px-2 py-1 -ml-2 rounded text-sm font-bold transition-colors flex items-center"
                    >
                      View Session Records {expandedId === t.treatmentId ? <ExpandLess fontSize="small" className="ml-1" /> : <ExpandMore fontSize="small" className="ml-1" />}
                    </button>

                    {/* COLLAPSIBLE SESSION TABLE */}
                    <div className={`overflow-hidden transition-all duration-300 ${expandedId === t.treatmentId ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[400px]">
                              <thead>
                                  <tr className="border-b-2 border-slate-200 text-slate-400 text-[10px] uppercase">
                                    <th className="pb-2 font-bold">Session</th>
                                    <th className="pb-2 font-bold text-[#0E4C5C]">Status</th>
                                    <th className="pb-2 font-bold">Date</th>
                                    <th className="pb-2 font-bold">Notes</th>
                                    <th className="pb-2 font-bold text-blue-600">Next Due</th>
                                    <th className="pb-2 font-bold">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {t.sessions?.length === 0 ? <tr><td colSpan="7" className="py-4 text-center text-sm text-slate-500">No sessions logs.</td></tr> :
                                   t.sessions?.map((session) => (
                                    <tr key={session.sessionId} className="hover:bg-slate-100/50 transition-colors">
                                      <td className="py-2 text-xs font-bold text-slate-700 pr-4">{session.sessionName}</td>
                                      <td className="py-2 text-[10px] pr-4">
                                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                              {session.status}
                                          </span>
                                      </td>
                                      <td className="py-2 text-xs font-medium text-slate-600 pr-4">{session.sessionDate || '-'}</td>
                                      <td className="py-2 text-xs text-slate-500 pr-4 italic max-w-[150px] truncate">{session.note || '-'}</td>
                                      <td className="py-2 text-xs font-bold text-blue-600 pr-4">{session.nextDate || '-'}</td>
                                      <td className="py-2 text-xs font-bold">
                                          {session.status !== 'COMPLETED' ? (
                                              <button 
                                                onClick={() => handleOpenSessionModal(t.treatmentId, session.sessionId, session.sessionName, t.patient?.id)}
                                                className="text-[#0E4C5C] hover:underline"
                                              >
                                                  Update Session
                                              </button>
                                          ) : (
                                              <span className="text-slate-400">Fixed</span>
                                          )}
                                      </td>
                                    </tr>
                                ))}
                              </tbody>
                            </table>
                        </div>
                      </div>
                    </div>

                </div>
              )})}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: LOG NEXT SESSION --- */}
      <Dialog open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0E4C5C' }}>Log New Session</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Session Name</label>
            <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={sessionForm.sessionName} onChange={e => setSessionForm({...sessionForm, sessionName: e.target.value})} placeholder="e.g. Wire Adjustment, Cleaning..." />
          </div>

           <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Associated Appointment (Optional but Recommended)</label>
            <select 
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={sessionForm.appointmentId}
              onChange={e => setSessionForm({...sessionForm, appointmentId: e.target.value})}
            >
              <option value="">No specific appointment</option>
              {patientAppointments.map(a => (
                <option key={a.appointmentId} value={a.appointmentId}>
                  {dayjs(a.appointmentDate).format('MMM D')} at {dayjs(`2000-01-01 ${a.appointmentTime}`).format('h:mm A')} - {a.reasonForVisit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Session Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg" value={sessionForm.sessionDate} onChange={e => setSessionForm({...sessionForm, sessionDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-700 mb-1">Next Recommendation</label>
              <input type="date" className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50/30" value={sessionForm.nextDate} onChange={e => setSessionForm({...sessionForm, nextDate: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea className="w-full px-3 py-2 border rounded-lg" rows="3" value={sessionForm.note} onChange={e => setSessionForm({...sessionForm, note: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Session Cost (Rs.)</label>
            <input type="number" required min="0" className="w-full px-3 py-2 border rounded-lg" value={sessionForm.cost} onChange={e => setSessionForm({...sessionForm, cost: e.target.value})} />
          </div>

          {/* DYNAMIC EQUIPMENT SELECTOR */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-[#0E4C5C]">Equipment Used (Auto-Deducts Stock)</label>
              <button onClick={handleAddEquipmentToSession} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded shadow-sm hover:bg-slate-100 flex items-center">
                <Add fontSize="small" /> Add Item
              </button>
            </div>
            
            {sessionForm.equipmentUsed.length === 0 && <p className="text-xs text-slate-500 italic">No equipment recorded.</p>}
            
            {sessionForm.equipmentUsed.map((equip, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <select 
                  className="flex-grow px-2 py-1 text-sm border rounded"
                  value={equip.equipmentId}
                  onChange={e => handleEquipmentChange(index, 'equipmentId', e.target.value)}
                >
                  <option value="">Select Item...</option>
                  {equipmentList.map(item => (
                    <option key={item.equipmentId} value={item.equipmentId}>{item.name} (In Stock: {item.stockQuantity})</option>
                  ))}
                </select>
                <input 
                  type="number" min="1" placeholder="Qty" className="w-20 px-2 py-1 text-sm border rounded"
                  value={equip.quantity} onChange={e => handleEquipmentChange(index, 'quantity', e.target.value)}
                />
                <button onClick={() => handleRemoveEquipment(index)} className="text-red-500 hover:text-red-700"><Delete fontSize="small"/></button>
              </div>
            ))}
          </div>

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSessionModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSaveSession} variant="contained" sx={{ bgcolor: '#0E4C5C' }}>Save Session</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Treatments;