import React, { useState } from 'react';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack, Phone, Person, CalendarToday } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { validateRegistration } from '../../utils/validation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); 

  // --- 1. STATE MANAGEMENT ---
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '', 
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  // --- 2. HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    // 1. RUN VALIDATION LOGIC
    const validationErrors = validateRegistration(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; 
    }

    try {
      // 2. Call Backend API
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password
      });

      setSuccess('Registration successful! Please check your email to verify.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center overflow-x-hidden font-sans py-4" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
      
      {/* 1. DARK TEAL OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 to-[#062e38]/85 z-0" />

      {/* 2. CENTERED REGISTER CARD */}
      <div className="relative z-10 w-full max-w-2xl px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl"
        >

          {/* Back to Home Link */}
          <button 
            type="button"
            className="flex items-center text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-semibold group" 
            onClick={() => navigate('/')}
          >
            <ArrowBack fontSize="small" className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-poppins font-bold text-primary-dark mb-2">Create Account</h1>
            <p className="text-slate-500 text-sm">Join Doctor C Dental Clinic as a new patient.</p>
          </div>

          {/* Global Alerts */}
          {serverError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start">
              <span>{serverError}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm border border-green-100 flex items-start">
              <span>{success}</span>
            </div>
          )}

          {/* FORM FIELDS */}
          <form onSubmit={handleRegister} className="space-y-5">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Person fontSize="small" />
                </div>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                    errors.name ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.name}</p>}
            </div>

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
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone fontSize="small" />
                </div>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                    errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="+94 7X XXX XXXX"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.phone}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-slate-700"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <CalendarToday fontSize="small" />
                  </div>
                  <input 
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* PASSWORD FIELD */}
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

            {/* CONFIRM PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock fontSize="small" />
                </div>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-4"
            >
              Register
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="font-bold text-primary hover:text-primary-dark transition-colors"
            >
              Login here
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;