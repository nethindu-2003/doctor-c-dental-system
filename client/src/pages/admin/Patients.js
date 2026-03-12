import React, { useState, useEffect } from 'react';
import { 
  Search, PersonAdd, Block, CheckCircle, Delete, FilterList, Warning, Send, Close
} from '@mui/icons-material';
import axios from '../../api/axios';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal States
  const [openAdd, setOpenAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Updated state: Only 'name', no password
  const [newPatient, setNewPatient] = useState({ 
      name: '', email: '', phone: '', gender: '', dob: '' 
  });

  // --- FETCH PATIENTS ---
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/admin/patients');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(`/admin/patients/${id}/status`);
      setPatients(patients.map(p => p.patientId === id ? res.data : p));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddSubmit = async (e) => {
    if(e) e.preventDefault();
    setAdding(true);
    setErrorMsg('');
    try {
      const res = await axios.post('/admin/patients', newPatient);
      setPatients([...patients, res.data]);
      setSuccessMsg(`Patient ${res.data.name} added. Invitation email sent successfully!`);
      setOpenAdd(false);
      setNewPatient({ name: '', email: '', phone: '', gender: '', dob: '' });
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add patient.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (id) => {
      setPatientToDelete(id);
      setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
      try {
          await axios.delete(`/admin/patients/${patientToDelete}`);
          setPatients(patients.filter(p => p.patientId !== patientToDelete));
          setDeleteConfirmOpen(false);
          setSuccessMsg("Patient deleted successfully.");
          setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
          alert("Failed to delete patient. They may have existing records.");
      }
  };

  // --- FILTER LOGIC ---
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusText = p.isActive ? 'Active' : 'Inactive';
    const matchesFilter = filterStatus === 'All' || statusText === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2">Patient Management</h1>
           <p className="text-slate-500 text-sm md:text-base">Register walk-in patients and manage accounts.</p>
        </div>
        <button 
          className="flex items-center justify-center px-6 py-3 bg-[#1A237E] hover:bg-[#12185c] text-white rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md focus:outline-none whitespace-nowrap"
          onClick={() => setOpenAdd(true)}
        >
          <PersonAdd fontSize="small" className="mr-2" /> New Patient
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-6 flex items-center shadow-sm">
            <CheckCircle fontSize="small" className="mr-3 text-green-600" />
            <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* SEARCH AND FILTER */}
      <div className="bg-white p-4 mb-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Search patients by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <FilterList fontSize="small" />
          </div>
          <select
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium appearance-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
          </div>
        </div>

      </div>

      {/* TABLE */}
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
                    <th className="p-4 font-bold rounded-tl-3xl">Patient Details</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Phone</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center rounded-tr-3xl">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((row) => (
                    <tr key={row.patientId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 align-middle">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${row.isActive ? 'bg-[#1A237E]' : 'bg-slate-400'}`}>
                                {row.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{row.name}</p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ID: PT-00{row.patientId}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-4 align-middle text-sm font-medium text-slate-600">{row.email}</td>
                    <td className="p-4 align-middle text-sm font-medium text-slate-600">{row.phone}</td>
                    <td className="p-4 align-middle">
                        <span className={`inline-block px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg ${
                            row.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                            {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="p-4 align-middle text-center">
                        <div className="flex justify-center items-center space-x-2">
                            <button 
                                className={`p-1.5 rounded-lg transition-colors focus:outline-none ${row.isActive ? "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700" : "text-green-600 hover:bg-green-50 hover:text-green-700"}`}
                                onClick={() => handleToggleStatus(row.patientId)}
                                title={row.isActive ? "Deactivate Account" : "Activate Account"}
                            >
                                {row.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </button>
                            <button 
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none"
                                onClick={() => handleDeleteClick(row.patientId)}
                                title="Delete Permanently"
                            >
                                <Delete fontSize="small" />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))}
                {filteredPatients.length === 0 && (
                    <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500">No patients found.</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* ADD PATIENT DIALOG */}
      {openAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                      <h2 className="text-slate-800 font-bold font-poppins text-lg text-center flex-grow">Register Walk-In Patient</h2>
                      <button 
                         onClick={() => setOpenAdd(false)}
                         disabled={adding}
                         className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none disabled:opacity-50"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Body & Form */}
                  <form onSubmit={handleAddSubmit} className="flex flex-col flex-grow overflow-hidden">
                      <div className="p-6 overflow-y-auto flex-grow">
                          
                          <p className="text-sm text-slate-500 mb-5 text-center px-4">
                              Fill in the patient's details below. An invitation email will be sent to them to set up their password.
                          </p>

                          {errorMsg && (
                              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-5 flex items-start text-sm font-medium">
                                  <Warning fontSize="small" className="mr-2 shrink-0 mt-0.5" />
                                  <span>{errorMsg}</span>
                              </div>
                          )}

                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Full Name</label>
                                  <input 
                                      type="text" 
                                      required
                                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all"
                                      value={newPatient.name} 
                                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} 
                                  />
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Email Address</label>
                                  <input 
                                      type="email" 
                                      required
                                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all"
                                      value={newPatient.email} 
                                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} 
                                  />
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Phone Number</label>
                                  <input 
                                      type="tel" 
                                      required
                                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all"
                                      value={newPatient.phone} 
                                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} 
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Gender</label>
                                      <div className="relative">
                                          <select 
                                              required
                                              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all appearance-none"
                                              value={newPatient.gender} 
                                              onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                                          >
                                              <option value="" disabled>Select</option>
                                              <option value="Male">Male</option>
                                              <option value="Female">Female</option>
                                              <option value="Other">Other</option>
                                          </select>
                                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                              </svg>
                                          </div>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">DOB</label>
                                      <input 
                                          type="date" 
                                          required
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all uppercase text-sm"
                                          value={newPatient.dob} 
                                          onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})} 
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Footer */}
                      <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
                          <button 
                              type="button"
                              onClick={() => setOpenAdd(false)}
                              disabled={adding}
                              className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors focus:outline-none disabled:opacity-50"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit"
                              disabled={adding}
                              className="px-5 py-2.5 rounded-xl bg-[#1A237E] text-white font-bold hover:bg-[#12185c] hover:-translate-y-0.5 transition-all focus:outline-none shadow-md flex items-center disabled:opacity-70 disabled:hover:translate-y-0"
                          >
                              {adding ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Sending Invite...
                                  </>
                              ) : (
                                  <>
                                    <Send fontSize="small" className="mr-2 -ml-1" />
                                    Send Invite
                                  </>
                              )}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                      <Warning fontSize="large" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Deletion</h3>
                  <p className="text-sm text-slate-500 mb-6">
                      Are you sure you want to permanently delete this patient? This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setDeleteConfirmOpen(false)}
                          className="flex-1 py-3 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors focus:outline-none shadow-md shadow-red-600/20"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Patients;