import React, { useState } from 'react';
import { 
  Save, History, ExpandMore, ExpandLess, MedicalServices, Event 
} from '@mui/icons-material';

// --- MOCK DATA: Treatment + Sessions Structure ---
const mockTreatments = [
  {
    id: 1,
    patientName: 'Sophia Clark',
    diagnosis: 'Malocclusion (Misaligned Teeth)',
    procedure: 'Braces Installation',
    totalSessions: 5,
    completedSessions: 3,
    status: 'Ongoing',
    cost: 1500,
    sessions: [ // <--- The "Sessions" Table you mentioned
      { id: 101, date: '2024-06-01', notes: 'Initial Consultation & X-Rays', dentist: 'Dr. Emily' },
      { id: 102, date: '2024-06-15', notes: 'Brackets bonded to teeth', dentist: 'Dr. Emily' },
      { id: 103, date: '2024-07-01', notes: 'Wire tightening and adjustment', dentist: 'Dr. Emily' }
    ]
  },
  {
    id: 2,
    patientName: 'David Lee',
    diagnosis: 'Dental Caries',
    procedure: 'Composite Filling',
    totalSessions: 1,
    completedSessions: 1,
    status: 'Completed',
    cost: 120,
    sessions: [
      { id: 201, date: '2024-06-20', notes: 'Cavity cleaned and filled', dentist: 'Dr. Emily' }
    ]
  }
];

const Treatments = () => {
  const [treatments, setTreatments] = useState(mockTreatments);
  const [expandedId, setExpandedId] = useState(null); // For toggling session details

  // Form State
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    procedure: '',
    sessions: 1,
    cost: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-6 md:mb-8">
        Treatment Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* --- LEFT: ADD NEW TREATMENT / SESSION FORM --- */}
        <div className="w-full lg:w-5/12">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-[#E0F7FA] rounded-xl text-[#0E4C5C] shadow-sm">
                 <MedicalServices />
              </div>
              <h2 className="text-xl font-bold font-poppins text-slate-800">Add New Treatment</h2>
            </div>
            
            <hr className="border-slate-100 mb-6" />

            <div className="space-y-5">
              {/* Patient Search */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Search Patient</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm"
                  placeholder="Name or ID" 
                />
                <p className="text-xs text-slate-500 mt-1.5 font-medium ml-1">Selected: Sophia Clark (ID: #12345)</p>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
                <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm" 
                    placeholder="e.g. Gingivitis" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Procedure</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm appearance-none">
                     <option value="" disabled selected>Select...</option>
                     <option value="Cleaning">Cleaning</option>
                     <option value="Filling">Filling</option>
                     <option value="Root Canal">Root Canal</option>
                     <option value="Braces">Braces</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Est. Cost (Rs.)</label>
                  <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm" 
                  />
                </div>
              </div>

              {/* Session Planning */}
              <div className="pt-2">
                  <h3 className="text-sm font-bold text-[#0E4C5C] mb-3 uppercase tracking-wider">Session Planning</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Total Sessions</label>
                        <input 
                            type="number" 
                            defaultValue={1} 
                            min={1}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Session Date</label>
                        <input 
                            type="date" 
                            defaultValue={formData.date} 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm text-slate-600" 
                        />
                    </div>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Clinical Notes</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm resize-none" 
                    placeholder="Details about today's procedure..." 
                  ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button className="flex-1 bg-[#0E4C5C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0a3541] focus:ring-4 focus:ring-[#0E4C5C]/30 transition-all shadow-md flex items-center justify-center">
                  <Save className="mr-2" fontSize="small" />
                  Save Treatment
                </button>
                <button className="sm:w-32 bg-white text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-50 focus:ring-4 focus:ring-red-500/20 transition-all flex items-center justify-center">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: TREATMENT HISTORY & SESSIONS --- */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold font-poppins text-slate-800">Patient History</h2>
              <button className="text-[#0E4C5C] hover:bg-[#E0F7FA] px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center focus:outline-none">
                  <History className="mr-1.5" fontSize="small" />
                  View All
              </button>
            </div>

            {/* List of Treatments */}
            <div className="space-y-4 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {treatments.map((t) => (
                <div 
                    key={t.id} 
                    className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
                        t.status === 'Ongoing' ? 'border-[#4DB6AC]' : 'border-slate-200'
                    }`}
                >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{t.procedure}</h3>
                        <p className="text-sm font-medium text-slate-500">Diagnosis: <span className="text-slate-700">{t.diagnosis}</span></p>
                      </div>
                      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border shrink-0 ml-4 ${
                          t.status === 'Ongoing' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                          {t.status}
                      </span>
                    </div>

                    {/* Progress Bar for Multi-Session Treatments */}
                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                        <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                           {t.completedSessions} / {t.totalSessions}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                        <div 
                            className="bg-[#0E4C5C] h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
                            style={{ width: `${(t.completedSessions / t.totalSessions) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20"></div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button for Sessions Table */}
                    <button 
                      onClick={() => handleExpandClick(t.id)}
                      className="text-[#0E4C5C] hover:text-[#0a3541] hover:bg-slate-50 px-2 py-1 -ml-2 rounded text-sm font-bold transition-colors flex items-center focus:outline-none"
                    >
                      View Session Records
                      {expandedId === t.id ? <ExpandLess fontSize="small" className="ml-1" /> : <ExpandMore fontSize="small" className="ml-1" />}
                    </button>

                    {/* --- COLLAPSIBLE SESSION TABLE --- */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === t.id ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[400px]">
                              <thead>
                                <tr className="border-b-2 border-slate-200 text-slate-400 text-[10px] uppercase tracking-wider">
                                  <th className="pb-2 font-bold">Date</th>
                                  <th className="pb-2 font-bold">Dentist</th>
                                  <th className="pb-2 font-bold">Notes</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {t.sessions.map((session) => (
                                  <tr key={session.id} className="hover:bg-slate-100/50 transition-colors">
                                    <td className="py-2 text-xs font-bold text-slate-600 whitespace-nowrap pr-4">{session.date}</td>
                                    <td className="py-2 text-xs font-medium text-slate-700 whitespace-nowrap pr-4">{session.dentist}</td>
                                    <td className="py-2 text-xs text-slate-500 leading-snug min-w-[150px]">{session.notes}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                        </div>
                        {/* Quick Add Session Button for Ongoing Treatments */}
                        {t.status === 'Ongoing' && (
                          <button className="mt-4 w-full bg-white border border-[#0E4C5C] text-[#0E4C5C] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#E0F7FA] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all flex items-center justify-center shadow-sm">
                            <Event className="mr-2" fontSize="small" />
                            Log Next Session
                          </button>
                        )}
                      </div>
                    </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Treatments;