import React, { useState, useEffect } from 'react';
import { 
  Edit, Save, CameraAlt, Person, Email, Phone, 
  MedicalServices, VerifiedUser, Badge as BadgeIcon, AutoAwesome
} from '@mui/icons-material';
import axios from '../../api/axios';

const DentistProfile = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', licenseId: '', bio: '', profilePicture: ''
  });

  const [originalData, setOriginalData] = useState({});

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/dentist/profile');
        setFormData({
            ...res.data,
            profilePicture: res.data.profilePicture || ''
        });
        setOriginalData({
            ...res.data,
            profilePicture: res.data.profilePicture || ''
        });
      } catch (err) {
        setStatus({ type: 'error', msg: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // IMAGE UPLOAD LOGIC
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2097152) {
      setStatus({ type: 'error', msg: "Profile picture must be less than 2MB." });
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    // Convert to Base64 String
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profilePicture: reader.result });
      setStatus({ type: 'success', msg: "Picture uploaded locally. Click 'Save Changes' to update your profile." });
      // Automatically toggle edit mode on if they upload a picture so they can save it
      setIsEditing(true); 
      setTimeout(() => setStatus(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      setStatus({ type: 'error', msg: 'Name and Phone are required.' });
      return;
    }

    try {
        setStatus(null);
        const res = await axios.put('/dentist/profile', formData);
        setFormData({
            ...res.data,
            profilePicture: res.data.profilePicture || ''
        });
        setOriginalData({
            ...res.data,
            profilePicture: res.data.profilePicture || ''
        });
        setIsEditing(false);
        setStatus({ type: 'success', msg: 'Profile updated successfully!' });
        setTimeout(() => setStatus(null), 4000);
    } catch (err) {
        setStatus({ type: 'error', msg: 'Failed to update profile.' });
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setStatus(null);
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64 mt-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-4 md:p-6 lg:p-8 max-w-6xl mx-auto mb-10">
      
      {/* HEADER SECTION */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-2">
          My Profile
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Manage your clinical identity and contact credentials.
        </p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl font-medium shadow-sm flex items-center ${
            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
            {status.msg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* --- LEFT COLUMN: IDENTITY CARD --- */}
        <div className="w-full lg:w-4/12 flex flex-col">
          <div className="bg-[#F8FAFC] rounded-3xl p-6 text-center border border-slate-200 relative overflow-hidden shadow-sm h-full flex flex-col items-center">
            
            {/* Aesthetic Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-[#0E4C5C] rounded-t-3xl"></div>

            {/* Avatar Section */}
            <div className="relative inline-block mt-4 mb-4 z-10 mx-auto">
               <div className="w-32 h-32 rounded-full bg-white text-[#0E4C5C] border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold mx-auto overflow-hidden">
                 {formData.profilePicture ? (
                   <img src={formData.profilePicture} alt="Dr. Profile" className="w-full h-full object-cover" />
                 ) : (
                   formData.name ? formData.name.charAt(0).toUpperCase() : 'D'
                 )}
               </div>
               
               <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md text-[#0E4C5C] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center">
                 <CameraAlt fontSize="small" />
                 <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
               </label>
            </div>

            <h2 className="text-2xl font-black text-[#0E4C5C] mt-2 font-poppins z-10">
              Dr. {formData.name}
            </h2>
            <p className="text-slate-600 font-bold mb-4 z-10">
              {formData.specialization || 'General Dentistry'}
            </p>

            <div className="flex justify-center flex-wrap gap-2 mb-6 z-10 w-full">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-200 whitespace-nowrap">
                  <VerifiedUser className="mr-1" style={{ fontSize: 16 }} />
                  SLMC Verified
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 whitespace-nowrap">
                  Active Staff
              </span>
            </div>

            <hr className="w-full border-slate-200 mb-6 z-10" />

            {/* Read-Only Stats */}
            <div className="w-full text-left px-2 z-10 space-y-4">
              <div className="flex items-start space-x-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                 <div className="mt-0.5 text-slate-400"><BadgeIcon fontSize="small" /></div>
                 <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Clinical License</span>
                    <span className="block text-sm font-bold text-slate-800">{formData.licenseId || 'Pending'}</span>
                 </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                 <div className="mt-0.5 text-slate-400"><AutoAwesome fontSize="small" /></div>
                 <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Clinic Status</span>
                    <span className="block text-sm font-bold text-green-600">Practicing</span>
                 </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS FORM --- */}
        <div className="w-full lg:w-8/12 flex flex-col">
          <div className="bg-white rounded-3xl p-6 md:p-8 xl:p-10 border border-slate-200 shadow-sm flex-grow">
            
            {/* Header with Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-poppins text-[#0E4C5C]">
                  Professional Information
                </h2>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#0E4C5C] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0a3541] focus:ring-4 focus:ring-[#0E4C5C]/30 transition-all shadow-md flex items-center shrink-0 w-full sm:w-auto justify-center"
                >
                  <Edit fontSize="small" className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleCancel} 
                    className="flex-1 sm:flex-none border border-slate-300 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 focus:ring-4 focus:ring-slate-200 transition-all flex items-center justify-center"
                  >
                      Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="flex-1 sm:flex-none bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 focus:ring-4 focus:ring-green-600/30 transition-all shadow-md flex items-center justify-center whitespace-nowrap"
                  >
                      <Save fontSize="small" className="mr-2" />
                      Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* The Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="md:col-span-1">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 flex items-center">
                    <Person fontSize="small" className="mr-1.5 text-slate-400" /> Full Name
                 </label>
                 <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    minLength="3"
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                        isEditing 
                          ? 'bg-slate-50 border-slate-200 focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 text-slate-800' 
                          : 'bg-slate-100/50 border-transparent text-slate-600 cursor-not-allowed'
                    }`}
                 />
              </div>

              {/* Specialization */}
              <div className="md:col-span-1">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 flex items-center">
                    <MedicalServices fontSize="small" className="mr-1.5 text-slate-400" /> Specialization
                 </label>
                 <input
                    type="text"
                    name="specialization"
                    value={formData.specialization || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                        isEditing 
                          ? 'bg-slate-50 border-slate-200 focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 text-slate-800' 
                          : 'bg-slate-100/50 border-transparent text-slate-600 cursor-not-allowed'
                    }`}
                 />
              </div>

              {/* Email Address */}
              <div className="md:col-span-1">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 flex items-center">
                    <Email fontSize="small" className="mr-1.5 text-slate-400" /> Email Address
                 </label>
                 <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-4 py-3 rounded-xl border border-transparent bg-slate-100/50 text-slate-500 font-medium cursor-not-allowed outline-none"
                 />
                 <p className="text-xs text-slate-500 mt-1.5 ml-1 mb-0 font-medium italic">Contact admin to change system email.</p>
              </div>

              {/* Contact Number */}
              <div className="md:col-span-1">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 flex items-center">
                    <Phone fontSize="small" className="mr-1.5 text-slate-400" /> Contact Number
                 </label>
                 <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    pattern="[0-9]{10}"
                    title="10-digit phone number"
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                        isEditing 
                          ? 'bg-slate-50 border-slate-200 focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 text-slate-800' 
                          : 'bg-slate-100/50 border-transparent text-slate-600 cursor-not-allowed'
                    }`}
                 />
              </div>

              {/* License ID */}
              <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 flex items-center">
                    <BadgeIcon fontSize="small" className="mr-1.5 text-slate-400" /> License ID
                 </label>
                 <input
                    type="text"
                    name="licenseId"
                    value={formData.licenseId || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    minLength="5"
                    placeholder="e.g. SLMC-12345"
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                        isEditing 
                          ? 'bg-slate-50 border-slate-200 focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 text-slate-800' 
                          : 'bg-slate-100/50 border-transparent text-slate-600 cursor-not-allowed'
                    }`}
                 />
              </div>

              {/* Professional Biography */}
              <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                    Professional Biography
                 </label>
                 <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Share a brief overview of your clinical experience and expertise..."
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all resize-none ${
                        isEditing 
                          ? 'bg-slate-50 border-slate-200 focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 text-slate-800' 
                          : 'bg-slate-100/50 border-transparent text-slate-600 cursor-not-allowed'
                    }`}
                 ></textarea>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DentistProfile;