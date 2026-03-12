import React, { useState, useEffect } from 'react';
import { Visibility, VisibilityOff, LockOpen, CheckCircleOutline } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- VALIDATION LOGIC ---
  const validatePassword = (pass) => {
    // Regex: At least 8 characters, at least 1 letter, at least 1 number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check if token exists
    if (!token) {
      setError("Invalid setup link. Please use the link sent to your email.");
      return;
    }

    // 2. Check strict password rules
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    // 3. Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 4. Send to Backend
    setLoading(true);
    try {
      await axios.post('/patient/setup-password', {
        token: token,
        password: password
      });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set up password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  // If link is completely broken/missing token
  useEffect(() => {
      if (!token) {
          setError("No security token found in the URL. Please click the exact link from your email.");
      }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-8 md:p-10 max-w-md w-full rounded-3xl shadow-xl border border-slate-100">
        
        {success ? (
            // --- SUCCESS STATE ---
            <div className="text-center py-8 animate-fade-in">
                <CheckCircleOutline className="text-green-500 mb-6" style={{ fontSize: 72 }} />
                <h2 className="text-2xl font-poppins font-bold text-slate-800 mb-3">Account Activated!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Your password has been securely set. You are being redirected to the login page...
                </p>
                <div className="w-8 h-8 mx-auto border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        ) : (
            // --- SETUP FORM ---
            <div>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-dark text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <LockOpen fontSize="large" />
                    </div>
                    <h2 className="text-2xl font-poppins font-bold text-primary-dark mb-2">
                        Secure Your Account
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Welcome to Doctor C Dental! Please create a strong password to access your patient portal.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all pr-12"
                                placeholder="Enter strong password"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 ml-1">Must contain at least 8 characters, including letters and numbers.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !token}
                        className="w-full bg-primary-dark hover:bg-[#0a3844] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-dark/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-2 flex items-center justify-center"
                    >
                        {loading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Set Password & Login'}
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default SetupPassword;