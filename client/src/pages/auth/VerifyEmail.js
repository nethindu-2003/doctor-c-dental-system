import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { MarkEmailRead, ErrorOutline, CheckCircle } from '@mui/icons-material';
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
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#E3F2FD' 
    }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, maxWidth: 400 }}>
        
        {status === 'verifying' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>Verified!</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message || "Your email has been successfully verified."}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>Go to Login</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutline sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>Verification Failed</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The link is invalid or has expired.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/login')}>Back to Login</Button>
          </>
        )}

      </Paper>
    </Box>
  );
};

export default VerifyEmail;