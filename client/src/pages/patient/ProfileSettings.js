import React, { useState, useEffect } from 'react';
import { 
  Save, PhotoCamera, Lock, Person, Notifications, 
  Bloodtype, Phone, Email
} from '@mui/icons-material';
import axios from '../../api/axios';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password States
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    allergies: '',
    emailNotifications: true,
    profilePicture: '' 
  });

  // --- 1. FETCH PROFILE ---
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/patient/profile');
      const data = res.data;
      setUserData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        gender: data.gender || '',
        dob: data.dob || '',
        bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '',
        emailNotifications: data.emailNotifications !== false,
        profilePicture: data.profilePicture || '' 
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile", err);
      setErrorMsg("Failed to load profile data.");
      setLoading(false);
    }
  };

  // --- 2. HANDLE INPUTS & IMAGE UPLOAD ---
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setUserData({ ...userData, emailNotifications: e.target.checked });
  };

  const handlePasswordChange = (e) => {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // IMAGE UPLOAD LOGIC
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2097152) {
      setErrorMsg("Profile picture must be less than 2MB.");
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData({ ...userData, profilePicture: reader.result });
      setSuccessMsg("Picture uploaded locally. Click 'Save Changes' to update your profile.");
      setTimeout(() => setSuccessMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  // --- 3. SAVE PROFILE ---
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await axios.put('/patient/profile', userData);
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // --- 4. UPDATE PASSWORD ---
  const handleUpdatePassword = async () => {
      setPassError('');
      setPassSuccess('');
      
      if (!passwords.currentPassword || !passwords.newPassword) {
          setPassError("Both password fields are required.");
          return;
      }
      if (passwords.newPassword.length < 6) {
          setPassError("New password must be at least 6 characters long.");
          return;
      }

      try {
          await axios.put('/patient/password', passwords);
          setPassSuccess("Password updated securely.");
          setPasswords({ currentPassword: '', newPassword: '' }); 
          setTimeout(() => setPassSuccess(''), 4000);
      } catch (err) {
          setPassError(err.response?.data?.message || "Incorrect current password.");
      }
  };

  if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-2">
          My Profile
        </h1>
        <p className="text-slate-500 text-lg">
          Manage your personal details and account settings.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100 flex items-start shadow-sm">
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-start shadow-sm">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- SECTION 1: UNIFIED PROFILE HEADER (OPTION 1) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        
        {/* Avatar Circle */}
        <div className="relative shrink-0">
           <div className="w-32 h-32 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-full text-6xl text-[#0E4C5C] font-bold shadow-sm overflow-hidden">
             {userData.profilePicture ? (
               <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
             )}
           </div>
           
           {/* Camera Upload Button */}
           <label className="absolute bottom-1 right-1 bg-white border border-slate-200 shadow-md rounded-full p-2 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center">
             <PhotoCamera fontSize="small" className="text-[#0E4C5C]" />
             <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
           </label>
        </div>

        {/* Name & Badges */}
        <div className="text-center sm:text-left flex-grow">
          <h2 className="text-3xl font-poppins font-bold text-slate-800">
            {userData.name || 'Your Name'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 mt-2 text-slate-500">
            <span className="flex items-center text-sm font-medium">
               <Person fontSize="small" className="mr-1 text-slate-400" /> Verified Patient
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-bold">
                Active Member
            </span>
          </div>
        </div>
        
      </div>

      {/* --- SECTION 2: PERSONAL INFORMATION FORM --- */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 w-full">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-[#E0F7FA] text-[#0E4C5C] rounded-2xl flex items-center justify-center shrink-0">
            <Person />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input 
              type="text" name="name" value={userData.name} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all"
            />
          </div>

          <div className="w-full relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
            <input 
              type="date" name="dob" value={userData.dob} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all pr-10 text-slate-600"
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
            <select 
              name="gender" value={userData.gender} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all"
            >
              <option value=""></option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="w-full relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
            <input 
              type="tel" name="phone" value={userData.phone} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all pr-10"
            />
            <Phone className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" fontSize="small" />
          </div>

          <div className="w-full relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
            <input 
              type="text" name="bloodGroup" value={userData.bloodGroup} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all pr-10"
            />
            <Bloodtype className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" fontSize="small" />
          </div>

          <div className="w-full lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Residential Address</label>
            <input 
              type="text" name="address" value={userData.address} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all"
            />
          </div>

          <div className="w-full relative">
             <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
             <input 
              type="email" value={userData.email} disabled 
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed pr-10"
             />
             <Email className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" fontSize="small" />
             <p className="text-xs text-slate-400 mt-1 ml-1">Contact admin to change login email</p>
          </div>

          <div className="w-full lg:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Medical Conditions / Allergies</label>
            <input 
              type="text" name="allergies" value={userData.allergies} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all text-red-600 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button 
            disabled={saving}
            onClick={handleSaveProfile}
            className="bg-[#0E4C5C] hover:bg-[#0a3541] disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center space-x-2"
          >
            {saving ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Save fontSize="small" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* --- SECTION 3: SECURITY & SETTINGS --- */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 w-full mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Security */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                <Lock />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Security</h3>
            </div>
            
            {passError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100 font-medium">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm border border-green-100 font-medium">
                {passSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
                 <input 
                    type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all"
                 />
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">New Password (Min 6 chars)</label>
                 <input 
                    type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 outline-none transition-all"
                 />
              </div>
              <button 
                onClick={handleUpdatePassword} 
                className="mt-2 border-2 border-slate-200 hover:border-[#0E4C5C] hover:text-[#0E4C5C] text-slate-700 px-6 py-2 rounded-xl font-bold transition-all duration-300 text-sm"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* System Notifications */}
          <div>
             <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Notifications />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">System Notifications</h3>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="flex items-center cursor-pointer mb-4">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={userData.emailNotifications} onChange={handleToggle} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${userData.emailNotifications ? 'bg-[#0E4C5C]' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${userData.emailNotifications ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-slate-800 font-bold">
                  Email Notifications
                </div>
              </label>
              
              <div className="ml-17">
                  <p className="text-sm text-slate-500 mb-2">
                    When enabled, you will automatically receive:
                  </p>
                  <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1 marker:text-[#0E4C5C]">
                      <li>Instant booking confirmations and receipts.</li>
                      <li>Automated reminders 12 hours before appointments.</li>
                      <li>Automated reminders 24 hours before treatment sessions.</li>
                  </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileSettings;