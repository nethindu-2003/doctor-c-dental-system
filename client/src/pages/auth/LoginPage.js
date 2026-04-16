import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios'; 
import { EMAIL_REGEX, PASSWORD_REGEX, validateLogin, validateForgotPasswordEmail, validatePasswordUpdate } from '../../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || searchParams.get('resetToken');

  // --- STATES ---
  const [role, setRole] = useState(0); // 0=Patient, 1=Dentist, 2=Admin
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  
  // POPUP 1: Forgot Password
  const [openForgot, setOpenForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetRole, setResetRole] = useState(0); // 0=Patient, 1=Dentist (No Admin)
  const [resetStatus, setResetStatus] = useState({ msg: '', type: '' });
  const [resetErrors, setResetErrors] = useState('');
  const [isSending, setIsSending] = useState(false);

  // POPUP 2: Reset Password
  const [openReset, setOpenReset] = useState(false);
  const [newPasswords, setNewPasswords] = useState({ new: '', confirm: '' });
  const [updateStatus, setUpdateStatus] = useState({ msg: '', type: '' });
  const [updateErrors, setUpdateErrors] = useState({});

  useEffect(() => {
    if (urlToken) {
      setOpenReset(true); 
    }
  }, [urlToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-clear field-specific errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // 1. RUN VALIDATION
    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const roleMap = ['patient', 'dentist', 'admin'];
    const selectedRole = roleMap[role]; 

    try {
      await login(formData.email, formData.password, selectedRole);
      
      if (selectedRole === 'patient') navigate('/patient/dashboard');
      else if (selectedRole === 'dentist') navigate('/dentist/dashboard');
      else if (selectedRole === 'admin') navigate('/admin/dashboard'); 

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // --- HANDLER FOR POPUP 1 (SEND LINK) ---
  const handleSendLink = async () => {
    setResetErrors('');
    setResetStatus({ msg: '', type: '' });

    // Validate email
    const emailError = validateForgotPasswordEmail(resetEmail);
    if (emailError) {
      setResetErrors(emailError);
      return;
    }

    try {
      setIsSending(true);
      setResetStatus({ msg: '', type: '' });

      // Only allow Patient (0) and Dentist (1)
      const roleMap = ['patient', 'dentist']; 
      const selectedResetRole = roleMap[resetRole];

      await axios.post('/forgot-password', { 
        email: resetEmail, 
        role: selectedResetRole 
      });

      setResetStatus({ msg: `Reset link sent to your ${selectedResetRole} email!`, type: 'success' });
      
      setTimeout(() => {
        setOpenForgot(false);
        setResetEmail('');
        setResetStatus({ msg: '', type: '' });
        setResetErrors('');
      }, 3000);

    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? `No ${['patient', 'dentist'][resetRole]} account found with this email.` 
        : (err.response?.data?.message || 'Error sending email.');
      
      setResetStatus({ msg: errorMsg, type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdatePassword = async () => {
    setUpdateStatus({ msg: '', type: '' });
    setUpdateErrors({});

    // Validate passwords
    const validationErrors = validatePasswordUpdate(newPasswords.new, newPasswords.confirm);
    if (Object.keys(validationErrors).length > 0) {
      setUpdateErrors(validationErrors);
      return;
    }

    try {
      await axios.post('/reset-password', { 
        token: urlToken, 
        newPassword: newPasswords.new 
      });

      setUpdateStatus({ msg: 'Password updated successfully! Please login.', type: 'success' });
      
      setTimeout(() => {
        setOpenReset(false);
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err) {
      setUpdateStatus({ msg: err.response?.data?.message || 'Failed to update password.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center overflow-x-hidden font-sans" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 to-[#062e38]/85 z-0" />

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl"
        >

          <button 
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-semibold group"
          >
            <ArrowBack fontSize="small" className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-poppins font-bold text-primary-dark mb-2">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Login to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start">
              <span>{error}</span>
            </div>
          )}

          {/* MAIN LOGIN TABS (All 3 Roles) */}
          <div className="flex border-b border-slate-200 mb-8">
            {['Patient', 'Dentist', 'Admin'].map((tabLabel, idx) => (
              <button
                key={idx}
                type="button"
                className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  role === idx 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setRole(idx)}
              >
                {tabLabel}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Email fontSize="small" />
                </div>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                    errors.email ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock fontSize="small" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                    errors.password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password}</p>}
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button"
                onClick={() => {
                  setResetRole(role === 2 ? 0 : role); 
                  setOpenForgot(true);
                }} 
                className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
            >
              Login as {['Patient', 'Dentist', 'Admin'][role]}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')} 
              className="font-bold text-primary hover:text-primary-dark transition-colors"
            >
              Register here
            </button>
          </div>

        </motion.div>
      </div>

      {/* --- POPUP 1: FORGOT PASSWORD (NO ADMIN) --- */}
      <AnimatePresence>
        {openForgot && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-2xl font-poppins font-bold text-slate-800 mb-2">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-6">
                Select your account type and enter your email.
              </p>
              
              {/* RESET TABS (Only Patient & Dentist) */}
              <div className="flex border-b border-slate-200 mb-6">
                {['Patient', 'Dentist'].map((tabLabel, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                      resetRole === idx 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                    onClick={() => setResetRole(idx)}
                  >
                    {tabLabel}
                  </button>
                ))}
              </div>

              {resetErrors && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100">{resetErrors}</div>}
              {resetStatus.msg && (
                <div className={`p-3 rounded-xl mb-4 text-sm border ${resetStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {resetStatus.msg}
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  disabled={isSending}
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setOpenForgot(false)} 
                  disabled={isSending}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSendLink} 
                  disabled={!resetEmail || isSending}
                  className="px-5 py-2.5 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSending ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </motion.div>
          </div>, document.body)
        )}
      </AnimatePresence>

      {/* --- POPUP 2: UPDATE PASSWORD --- */}
      <AnimatePresence>
        {openReset && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-2xl font-poppins font-bold text-slate-800 mb-2">Set New Password</h2>
              <p className="text-slate-500 text-sm mb-6">Please enter your new password below.</p>
              
              {updateStatus.msg && (
                <div className={`p-3 rounded-xl mb-4 text-sm border ${updateStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {updateStatus.msg}
                </div>
              )}
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                      updateErrors.new ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                    value={newPasswords.new} 
                    onChange={(e) => setNewPasswords({...newPasswords, new: e.target.value})}
                  />
                  {updateErrors.new && <p className="text-red-500 text-xs mt-1.5 ml-1">{updateErrors.new}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                      updateErrors.confirm ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                    value={newPasswords.confirm} 
                    onChange={(e) => setNewPasswords({...newPasswords, confirm: e.target.value})}
                  />
                  {updateErrors.confirm && <p className="text-red-500 text-xs mt-1.5 ml-1">{updateErrors.confirm}</p>}
                </div>
              </div>

              <button 
                type="button"
                onClick={handleUpdatePassword} 
                className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary-dark text-white rounded-xl transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Update Password
              </button>
            </motion.div>
          </div>, document.body)
        )}
      </AnimatePresence>

    </div>
  );
};

export default LoginPage;