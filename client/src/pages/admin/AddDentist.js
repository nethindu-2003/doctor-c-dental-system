import React, { useState } from 'react';
import { 
  PersonAdd, Email, Phone, MedicalServices, Send, 
  AdminPanelSettings, VerifiedUser, ErrorOutline
} from '@mui/icons-material';
import api from '../../api/axios'; 
import { validateAddDentist } from '../../utils/validation'; 

const AddDentist = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-clear field-specific errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    setErrors({});

    // 1. RUN VALIDATION
    const validationErrors = validateAddDentist(formData);
    
    // If validation fails, stop and show errors on the specific fields
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/admin/add-dentist', formData);
      setStatus({ type: 'success', msg: 'Invitation sent successfully! The dentist will receive an email shortly.' });
      setFormData({ name: '', email: '', phone: '', specialization: '' }); 
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to invite dentist.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* HEADER SECTION (Optional, can be removed if relying on Sidebar context) */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-2">
          Team Management
        </h1>
        <p className="text-slate-500 text-lg">
          Expand your clinic's capacity by inviting new specialists.
        </p>
      </div>

      {/* MAIN CARD WITH SPLIT LAYOUT */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl flex flex-col md:flex-row">
        
        {/* --- LEFT PANEL: VISUAL CONTEXT --- */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#1A237E] to-[#0E4C5C] text-white p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4"></div>

          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl mb-6 relative z-10 border border-white/30">
            <PersonAdd style={{ fontSize: 48, color: 'white' }} />
          </div>

          <h2 className="text-2xl font-bold mb-4 relative z-10 font-poppins text-white">
            Invite New Dentist
          </h2>
          
          <p className="text-white/80 text-sm mb-8 max-w-[280px] leading-relaxed relative z-10">
            The new dentist will receive a secure link to set up their password and access their portal.
          </p>

          {/* Simple Stats or Trust Indicators */}
          <div className="flex flex-col space-y-3 w-full max-w-[280px] relative z-10">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl flex items-center border border-white/20">
              <AdminPanelSettings fontSize="small" className="text-white/80 mr-3" />
              <span className="text-sm font-medium text-white/90">Admin Approval Required</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl flex items-center border border-white/20">
              <VerifiedUser fontSize="small" className="text-white/80 mr-3" />
              <span className="text-sm font-medium text-white/90">Secure Invitation Link</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: THE FORM --- */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
          
          {status.msg && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center shadow-sm animate-fade-in ${
                status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <span className="font-semibold text-sm">{status.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="md:col-span-2 group">
                <label className="block text-sm font-bold text-[#1A237E] mb-2 font-poppins tracking-wide">FULL NAME</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <PersonAdd fontSize="small" />
                  </div>
                  <input 
                    type="text"
                    name="name" 
                    placeholder="e.g. Dr. Sarah Smith" 
                    required
                    value={formData.name} 
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all duration-300 text-slate-800 font-medium ${
                        errors.name 
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 hover:bg-white'
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-2 text-xs text-red-500 font-semibold flex items-center"><ErrorOutline fontSize="inherit" className="mr-1"/> {errors.name}</p>}
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-bold text-[#1A237E] mb-2 font-poppins tracking-wide">EMAIL ADDRESS</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Email fontSize="small" />
                  </div>
                  <input 
                    type="email"
                    name="email" 
                    placeholder="doctor@clinic.com" 
                    required
                    value={formData.email} 
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all duration-300 text-slate-800 font-medium ${
                        errors.email 
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 hover:bg-white'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs text-red-500 font-semibold flex items-center"><ErrorOutline fontSize="inherit" className="mr-1"/> {errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-bold text-[#1A237E] mb-2 font-poppins tracking-wide">PHONE NUMBER</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Phone fontSize="small" />
                  </div>
                  <input 
                    type="tel"
                    name="phone" 
                    placeholder="077 123 4567" 
                    required
                    value={formData.phone} 
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all duration-300 text-slate-800 font-medium ${
                        errors.phone 
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 hover:bg-white'
                    }`}
                  />
                </div>
                {errors.phone && <p className="mt-2 text-xs text-red-500 font-semibold flex items-center"><ErrorOutline fontSize="inherit" className="mr-1"/> {errors.phone}</p>}
              </div>

              {/* Specialization */}
              <div className="md:col-span-2 group">
                <label className="block text-sm font-bold text-[#1A237E] mb-2 font-poppins tracking-wide">SPECIALIZATION</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <MedicalServices fontSize="small" />
                  </div>
                  <select 
                    name="specialization"
                    required
                    value={formData.specialization} 
                    onChange={handleChange}
                    className={`w-full pl-11 pr-10 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all duration-300 text-slate-800 font-medium appearance-none ${
                        errors.specialization 
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <option value="" disabled>-- Select Specialization --</option>
                    <option value="General Dentist">General Dentist</option>
                    <option value="Orthodontist">Orthodontist</option>
                    <option value="Periodontist">Periodontist</option>
                    <option value="Oral Surgeon">Oral Surgeon</option>
                    <option value="Pediatric Dentist">Pediatric Dentist</option>
                  </select>
                  {/* Custom select arrow */}
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.specialization && <p className="mt-2 text-xs text-red-500 font-semibold flex items-center"><ErrorOutline fontSize="inherit" className="mr-1"/> {errors.specialization}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8 pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={loading}
                className={`flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 outline-none focus:ring-4 focus:ring-[#1A237E]/20 shadow-[0_8px_16px_rgba(26,35,126,0.2)] ${
                    loading 
                    ? 'bg-[#1A237E]/80 text-white cursor-not-allowed transform scale-95 shadow-none' 
                    : 'bg-[#1A237E] text-white hover:bg-[#12185c] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(26,35,126,0.3)] active:scale-95'
                }`}
              >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Invitation...
                    </>
                ) : (
                    <>
                        Send Invitation
                        <Send fontSize="small" className="ml-2 -mr-1" />
                    </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AddDentist;