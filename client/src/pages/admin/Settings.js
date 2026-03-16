import React, { useState, useEffect } from 'react';
import { 
  Save, Business, AccessTime, MonetizationOn, 
  CloudUpload, Settings as SettingsIcon 
} from '@mui/icons-material';
import axios from '../../api/axios';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Core Configuration State
  const [config, setConfig] = useState({
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    clinicLogo: '',
    standardBookingFee: 0
  });

  // Schedule State (Array of 7 days)
  const [schedules, setSchedules] = useState([]);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/admin/settings');
      const data = res.data;
      
      setConfig({
        clinicName: data.clinicName || '',
        clinicAddress: data.clinicAddress || '',
        clinicPhone: data.clinicPhone || '',
        clinicEmail: data.clinicEmail || '',
        clinicLogo: data.clinicLogo || '',
        standardBookingFee: data.standardBookingFee || 0
      });

      // Sort schedules so Monday is first
      const dayOrder = { "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3, "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6, "SUNDAY": 7 };
      const sortedSchedules = (data.schedules || []).sort((a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]);
      setSchedules(sortedSchedules);

    } catch (err) {
      console.error("Error fetching settings:", err);
      setStatus({ type: 'error', msg: 'Failed to load clinic settings.' });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLERS ---
  const handleConfigChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2097152) { // 2MB Limit
      setStatus({ type: 'error', msg: "Logo must be less than 2MB." });
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig({ ...config, clinicLogo: reader.result });
      setStatus({ type: 'success', msg: "Logo uploaded locally. Click 'Save Settings' to apply." });
      setTimeout(() => setStatus(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload = { ...config, schedules };
      await axios.put('/admin/settings', payload);
      setStatus({ type: 'success', msg: 'Clinic settings updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error saving settings:", err);
      setStatus({ type: 'error', msg: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-24">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1A237E] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2 flex items-center">
            <SettingsIcon fontSize="large" className="mr-3 opacity-80" /> System Settings
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            Configure clinic identity, financial rules, and global operating hours.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1A237E] hover:bg-[#12185c] disabled:bg-slate-400 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center justify-center min-w-[160px]"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><Save fontSize="small" className="mr-2" /> Save Settings</>
          )}
        </button>
      </div>

      {status && (
        <div className={`mb-8 p-4 rounded-xl font-bold shadow-sm flex items-center ${
            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
            {status.msg}
        </div>
      )}

      {/* --- TOP ROW: Identity & Financial Rules Side-by-Side --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Clinic Identity Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-indigo-50 text-[#1A237E] rounded-xl flex items-center justify-center">
              <Business />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Clinic Identity</h2>
          </div>

          <div className="space-y-5">
            {/* Logo Upload */}
            <div className="flex items-center space-x-6 mb-2">
              <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {config.clinicLogo ? (
                  <img src={config.clinicLogo} alt="Clinic Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-4xl text-slate-300 font-bold">C</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors inline-flex items-center shadow-sm">
                  <CloudUpload fontSize="small" className="mr-2" />
                  Upload Logo
                  <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </label>
                <p className="text-xs text-slate-400 mt-2 font-medium">Used on PDF Receipts & Reports. Max 2MB.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Clinic Name</label>
              <input 
                type="text" name="clinicName" value={config.clinicName} onChange={handleConfigChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Primary Address</label>
              <input 
                type="text" name="clinicAddress" value={config.clinicAddress} onChange={handleConfigChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Contact Phone</label>
                <input 
                  type="text" name="clinicPhone" value={config.clinicPhone} onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Billing Email</label>
                <input 
                  type="email" name="clinicEmail" value={config.clinicEmail} onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center">
              <MonetizationOn />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Financial Rules</h2>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Standard Booking Fee (LKR)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold pointer-events-none">
                Rs.
              </span>
              <input 
                type="number" name="standardBookingFee" 
                value={config.standardBookingFee} 
                onChange={handleConfigChange}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-1">This fee will be charged when patients book appointments via the portal.</p>
          </div>
        </div>

      </div>

      {/* --- BOTTOM SECTION: Full Width Operating Hours --- */}
      <div className="w-full">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-8 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <AccessTime />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Operating Hours</h2>
          </div>

          <div className="space-y-4">
            {/* Full-width 7-Day Schedule Mapping */}
            {schedules.map((schedule, index) => (
              <div key={schedule.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 md:px-8 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors gap-4">
                
                {/* Left Side: Day & Status Button */}
                <div className="flex items-center gap-6 md:gap-12 w-full sm:w-auto">
                  <div className="font-extrabold text-slate-700 text-sm md:text-base w-24 shrink-0 uppercase tracking-wide">
                    {schedule.dayOfWeek}
                  </div>
                  
                  <button
                    onClick={() => handleScheduleChange(index, 'isClosed', !schedule.isClosed)}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all w-28 shrink-0 shadow-sm ${
                      schedule.isClosed 
                        ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                    }`}
                  >
                    {schedule.isClosed ? 'CLOSED' : 'OPEN'}
                  </button>
                </div>

                {/* Right Side: Fixed Width Time Inputs */}
                <div className="flex items-center justify-start sm:justify-end gap-3 md:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <input 
                    type="time" 
                    value={schedule.openTime ? schedule.openTime.substring(0,5) : ''}
                    onChange={(e) => handleScheduleChange(index, 'openTime', e.target.value + ':00')}
                    disabled={schedule.isClosed}
                    className="w-32 md:w-40 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-700 disabled:opacity-50 disabled:bg-slate-100 outline-none focus:border-[#1A237E] transition-all cursor-pointer shadow-sm"
                  />
                  <span className="text-slate-400 font-bold text-sm md:text-base">to</span>
                  <input 
                    type="time" 
                    value={schedule.closeTime ? schedule.closeTime.substring(0,5) : ''}
                    onChange={(e) => handleScheduleChange(index, 'closeTime', e.target.value + ':00')}
                    disabled={schedule.isClosed}
                    className="w-32 md:w-40 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-700 disabled:opacity-50 disabled:bg-slate-100 outline-none focus:border-[#1A237E] transition-all cursor-pointer shadow-sm"
                  />
                </div>

              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 mt-8 font-medium italic border-l-4 border-[#1A237E] pl-4 bg-slate-50 py-3 rounded-r-lg">
            Note: Changing these hours will immediately update the available appointment slots for patients on the booking portal.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Settings;