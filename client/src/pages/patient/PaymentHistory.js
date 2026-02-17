import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Stack, Avatar, Paper, MenuItem, IconButton, Tooltip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { 
  Download, Search, ReceiptLong, AttachMoney, CreditCard, History, Payment, Close 
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios'; // Ensure this points to your configured Axios instance

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/patient/payments');
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // --- Helper Functions for Data Display ---
  const getDescription = (payment) => {
    if (payment.paymentType === 'BOOKING_FEE') {
        return `Booking Fee - ${payment.appointment?.reasonForVisit || 'General'}`;
    }
    if (payment.paymentType === 'TREATMENT_PAYMENT') {
        return `Treatment - ${payment.treatment?.treatmentName || 'Procedure'}`;
    }
    return 'Clinic Payment';
  };

  const getDentistName = (payment) => {
      if (payment.appointment?.dentist) {
          return `Dr. ${payment.appointment.dentist.name}`;
      }
      return 'Clinic Admin'; // Treatments without specific dentists assigned yet
  };

  // --- Filter Logic ---
  const filteredPayments = payments.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const desc = getDescription(item).toLowerCase();
    const doc = getDentistName(item).toLowerCase();
    const matchesSearch = desc.includes(searchTerm.toLowerCase()) || doc.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // --- Summary Calculations ---
  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  // The backend returns them ordered by date descending, so index 0 is the latest
  const lastPaymentDate = payments.length > 0 && payments[0].paymentDate 
    ? dayjs(payments[0].paymentDate).format('MMMM D, YYYY') 
    : 'No Payments Yet';

  // --- Modal Handlers ---
  const handleOpenDetails = (payment) => {
      setSelectedPayment(payment);
      setOpenModal(true);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', md: 'center' }} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="primary.dark">
            Payment History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your invoices and track your dental expenses.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Download />} 
          sx={{ mt: { xs: 2, md: 0 }, borderRadius: 50, px: 3 }}
          onClick={() => alert("Statement generation coming soon!")}
        >
          Statement (PDF)
        </Button>
      </Stack>

      {/* --- 1. SUMMARY CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 4, bgcolor: '#E8F5E9', border: '1px solid #C8E6C9' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', color: 'white' }}><AttachMoney /></Avatar>
                <Typography variant="subtitle2" color="text.secondary">Total Paid</Typography>
              </Stack>
              <Typography variant="h4" fontWeight="bold" color="success.dark">LKR {totalPaid.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 4, bgcolor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Avatar sx={{ bgcolor: 'error.main', color: 'white' }}><Payment /></Avatar>
                <Typography variant="subtitle2" color="text.secondary">Pending Payments</Typography>
              </Stack>
              <Typography variant="h4" fontWeight="bold" color="error.dark">LKR {totalPending.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 4, bgcolor: '#E3F2FD', border: '1px solid #BBDEFB' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}><History /></Avatar>
                <Typography variant="subtitle2" color="text.secondary">Last Payment</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold" color="primary.dark">{lastPaymentDate}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- 2. TRANSACTIONS TABLE --- */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0' }}>
        
        {/* Search & Filter Toolbar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Search by description or dentist..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField 
              select 
              fullWidth 
              size="small" 
              label="Payment Status"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="COMPLETED">Paid</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F4F7F6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Dentist</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((row) => (
                <TableRow 
                    key={row.paymentId} 
                    hover 
                    onClick={() => handleOpenDetails(row)}
                    sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{dayjs(row.paymentDate).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{getDescription(row)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.paymentType === 'BOOKING_FEE' ? 'Online Booking' : 'Clinic Service'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getDentistName(row)}</TableCell>
                  <TableCell>LKR {row.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                       {row.paymentType === 'BOOKING_FEE' ? <CreditCard fontSize="small" color="action" /> : <AttachMoney fontSize="small" color="action" />}
                       <Typography variant="body2">{row.paymentType === 'BOOKING_FEE' ? 'Online' : 'Cash/Card at Clinic'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status === 'COMPLETED' ? 'Paid' : 'Pending'} 
                      size="small" 
                      color={row.status === 'COMPLETED' ? 'success' : 'warning'} 
                      variant={row.status === 'COMPLETED' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {row.status === 'COMPLETED' ? (
                      <Tooltip title="Download Receipt">
                        <IconButton color="primary" size="small" onClick={() => alert("Downloading Receipt...")}>
                            <ReceiptLong />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="error"
                        sx={{ borderRadius: 20, fontSize: '0.75rem', px: 2 }}
                        onClick={() => alert(`Redirecting to payment gateway for LKR ${row.amount}`)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">No transactions found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- 3. PAYMENT DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.dark', color: 'white' }}>
            Transaction Details
            <IconButton onClick={() => setOpenModal(false)} sx={{ color: 'white' }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
            {selectedPayment && (
                <Stack spacing={3}>
                    {/* Header Info */}
                    <Box textAlign="center" sx={{ mb: 2 }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                            LKR {selectedPayment.amount?.toLocaleString()}
                        </Typography>
                        <Chip 
                            label={selectedPayment.status === 'COMPLETED' ? 'Successfully Paid' : 'Payment Pending'} 
                            color={selectedPayment.status === 'COMPLETED' ? 'success' : 'warning'} 
                            sx={{ mt: 1 }}
                        />
                    </Box>

                    <Divider />

                    {/* Transaction Details */}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                            <Typography variant="body1" fontWeight="bold">#TXN-00{selectedPayment.paymentId}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {dayjs(selectedPayment.paymentDate).format('MMM D, YYYY h:mm A')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body1" fontWeight="bold">{getDescription(selectedPayment)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Attending Doctor</Typography>
                            <Typography variant="body1" fontWeight="bold">{getDentistName(selectedPayment)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {selectedPayment.paymentType === 'BOOKING_FEE' ? 'Online / Credit Card' : 'Settled at Clinic'}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Contextual Box based on type */}
                    {selectedPayment.paymentType === 'BOOKING_FEE' && selectedPayment.appointment && (
                        <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 1 }}>Associated Appointment</Typography>
                            <Typography variant="body2">Date: {selectedPayment.appointment.appointmentDate}</Typography>
                            <Typography variant="body2">Time: {selectedPayment.appointment.appointmentTime}</Typography>
                            <Typography variant="body2">Reason: {selectedPayment.appointment.reasonForVisit}</Typography>
                        </Box>
                    )}
                </Stack>
            )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Close</Button>
            {selectedPayment?.status === 'COMPLETED' && (
                <Button variant="contained" startIcon={<ReceiptLong />}>
                    Download Receipt
                </Button>
            )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistory;