import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ErrorOutline, CheckCircle } from '@mui/icons-material';
import api from '../../api/axios'; 

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState(''); // To show backend success message

  // Ref to prevent double-execution in React Strict Mode
  const shouldVerify = useRef(true);

  useEffect(() => {
    // If we have a token and haven't run verify yet
    if (token && shouldVerify.current) {
        shouldVerify.current = false; // Lock it immediately

        const verify = async () => {
          try {
            // FIX: Use .get() instead of .post()
            // Backend expects: /verify-email?token=xyz
            const response = await api.get(`/verify-email?token=${token}`);
            
            setStatus('success');
            setMessage(response.data); // "Email verified successfully!"
          } catch (err) {
            console.error("Verification Error:", err);
            // If the user is ALREADY verified, the backend might throw an error or return a message.
            // Check if the error message says "already verified" to show success instead of error.
            if (err.response?.data?.includes("already verified")) {
                 setStatus('success');
                 setMessage("Email already verified. You can login.");
            } else {
                 setStatus('error');
            }
          }
        };

        verify();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-10 text-center rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            {/* Simple CSS Spinner */}
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-slate-600 font-medium text-lg">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle className="text-green-500 mb-6" style={{ fontSize: 72 }} />
            <h2 className="text-3xl font-poppins font-bold text-slate-800 mb-3">Verified!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              {message || "Your email has been successfully verified."}
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <ErrorOutline className="text-red-500 mb-6" style={{ fontSize: 72 }} />
            <h2 className="text-3xl font-poppins font-bold text-slate-800 mb-3">Verification Failed</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              The link is invalid or has expired.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 py-3.5 rounded-xl font-bold transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;