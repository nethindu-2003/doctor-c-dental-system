import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LockReset } from '@mui/icons-material';
import api from '../../api/axios';

const DentistSetup = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', msg: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      // Call the backend to set the password
      await api.post('/setup-dentist', { token, newPassword: passwords.new });
      
      setStatus({ type: 'success', msg: 'Account setup complete! Redirecting to login...' });
      
      // Redirect to Login Page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Setup failed. Link may be expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark/90 to-[#062e38]/85 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-10 text-center rounded-3xl shadow-2xl max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-light/20 flex items-center justify-center rounded-full">
            <LockReset className="text-primary-dark" style={{ fontSize: 36 }} />
          </div>
        </div>
        
        <h2 className="text-2xl font-poppins font-bold text-slate-800 mb-2">Set Your Password</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Welcome, Doctor. Please create a secure password to activate your account.
        </p>

        {status.msg && (
          <div className={`p-4 rounded-xl mb-6 text-sm border flex items-start ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
              value={passwords.new} 
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="text-left">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
              value={passwords.confirm} 
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              placeholder="Confirm new password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
          >
            {loading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DentistSetup;