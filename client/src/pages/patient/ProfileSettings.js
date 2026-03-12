import React, { useState, useEffect } from 'react';
import { 
  Save, PhotoCamera, Lock, Person, MedicalServices, Notifications, Edit, 
  Bloodtype, Phone, Email, Cake 
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
    emailNotifications: true
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
        emailNotifications: data.emailNotifications !== false // Default to true if null
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile", err);
      setErrorMsg("Failed to load profile data.");
      setLoading(false);
    }
  };

  // --- 2. HANDLE INPUTS ---
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setUserData({ ...userData, emailNotifications: e.target.checked });
  };

  const handlePasswordChange = (e) => {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
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
          setPasswords({ currentPassword: '', newPassword: '' }); // Clear fields
          setTimeout(() => setPassSuccess(''), 4000);
      } catch (err) {
          setPassError(err.response?.data?.message || "Incorrect current password.");
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
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-2">
          My Profile
        </h1>
        <p className="text-slate-500 text-lg">
          Manage your personal details and account settings.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm border border-green-100 flex items-start">
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- SECTION 1: PROFILE HEADER --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mb-8 overflow-hidden relative">
        <div className="h-28 bg-gradient-to-r from-[#0E4C5C] to-[#166072]" />
        
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="relative">
               <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white bg-secondary flex items-center justify-center rounded-full text-5xl text-primary-dark font-bold shadow-md">
                 {userData.name.charAt(0).toUpperCase()}
               </div>
               <label className="absolute bottom-0 right-0 bg-white border border-slate-200 shadow-md rounded-full p-2 cursor-pointer hover:bg-slate-50 transition-colors">
                 <PhotoCamera fontSize="small" className="text-primary" />
                 <input hidden accept="image/*" type="file" />
               </label>
            </div>

            <div className="text-center sm:text-left flex-grow pb-2">
              <h2 className="text-3xl font-poppins font-bold text-slate-800">
                {userData.name}
              </h2>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-slate-500">
                <span className="flex items-center text-sm">
                   <Person fontSize="small" className="mr-1" /> Verified Patient
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold">
                    Active Member
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: PERSONAL INFORMATION FORM --- */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 mt-12 w-full">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-primary-light/20 text-primary-dark rounded-2xl flex items-center justify-center shrink-0">
            <Person />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input 
              type="text" name="name" value={userData.name} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="w-full relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
            <div className="relative">
                <input 
                  type="date" name="dob" value={userData.dob} onChange={handleChange} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10"
                />
            </div>
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
            <select 
              name="gender" value={userData.gender} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10"
            />
            <Phone className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" fontSize="small" />
          </div>

          <div className="w-full relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
            <input 
              type="text" name="bloodGroup" value={userData.bloodGroup} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10"
            />
            <Bloodtype className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" fontSize="small" />
          </div>

          <div className="w-full lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Residential Address</label>
            <input 
              type="text" name="address" value={userData.address} onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="w-full relative">
             <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
             <input 
              type="email" value={userData.email} disabled 
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed pr-10"
             />
             <Email className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" fontSize="small" />
             <p className="text-xs text-slate-500 mt-1 ml-1">Contact admin to change login email</p>
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
            className="bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
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
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm border border-green-100">
                {passSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
                 <input 
                    type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                 />
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">New Password (Min 6 chars)</label>
                 <input 
                    type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                 />
              </div>
              <button 
                onClick={handleUpdatePassword} 
                className="mt-2 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2 rounded-full font-bold transition-all duration-300 text-sm"
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
                  <div className={`block w-14 h-8 rounded-full transition-colors ${userData.emailNotifications ? 'bg-primary' : 'bg-slate-300'}`}></div>
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
                  <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
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