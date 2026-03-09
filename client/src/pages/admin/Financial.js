import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Stack, Button, TextField, InputAdornment, 
  Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Divider,IconButton
} from '@mui/material';
import { 
  Search, AttachMoney, Download, PendingActions, AccountBalanceWallet, 
  PictureAsPdf, TableView, ReceiptLong, Close
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios';

const AdminFinancial = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modal State
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
      fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
      try {
          const res = await axios.get('/admin/finance/transactions');
          setTransactions(res.data);
      } catch (err) {
          console.error("Error fetching financial data:", err);
      } finally {
          setLoading(false);
      }
  };

  // --- CALCULATIONS  ---
  const totalIncome = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'PENDING')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRefunds = 0; // Keeping as 0 until refund logic is built

  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if the transaction's Year-Month matches the filterDate (e.g., "2024-07")
    const txnMonth = dayjs(t.paymentDate).format('YYYY-MM');
    const matchesDate = filterDate ? txnMonth === filterDate : true;
    
    return matchesSearch && matchesDate;
  });

  // --- HANDLERS ---
  const handleRowClick = (txn) => {
      setSelectedTxn(txn);
      setOpenDetails(true);
  };

  const handleExportMock = (type) => {
      alert(`Generating ${type} report... (Feature requires file generation library)`);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" gutterBottom>
        Financial Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage clinic revenue, track pending treatment balances, and generate reports.
      </Typography>

      {/* 1. FINANCIAL SUMMARY CARDS  */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #C8E6C9' }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">TOTAL INCOME</Typography>
                <Typography variant="h4" fontWeight="bold" color="#2E7D32">LKR {totalIncome.toLocaleString()}</Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, color: '#4CAF50' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ bgcolor: '#FFF3E0', borderRadius: 2, border: '1px solid #FFE0B2' }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">PENDING PAYMENTS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#EF6C00">LKR {pendingPayments.toLocaleString()}</Typography>
              </Box>
              <PendingActions sx={{ fontSize: 40, color: '#FF9800' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ bgcolor: '#FFEBEE', borderRadius: 2, border: '1px solid #FFCDD2' }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">REFUNDS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#C62828">LKR {totalRefunds.toLocaleString()}</Typography>
              </Box>
              <AccountBalanceWallet sx={{ fontSize: 40, color: '#EF5350' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. CONTROLS (Search, Filter, Export) */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search by patient name..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Filter by Month"
            type="month"
            size="small"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <Stack direction="row" spacing={1}>
             <Button variant="outlined" startIcon={<PictureAsPdf />} size="small" onClick={() => handleExportMock('PDF')}>PDF</Button>
             <Button variant="outlined" startIcon={<TableView />} size="small" onClick={() => handleExportMock('Excel')}>Excel</Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 3. GENERATE REPORT BUTTON */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
         <Button variant="contained" startIcon={<Download />} sx={{ bgcolor: '#1A237E' }} onClick={() => handleExportMock('Monthly Report')}>
           Generate Monthly Report
         </Button>
      </Box>

      {/* 4. TRANSACTIONS TABLE  */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F4F7F6' }}>
              <TableRow>
                <TableCell><strong>Transaction ID</strong></TableCell>
                <TableCell><strong>Patient Name</strong></TableCell>
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((row) => (
                <TableRow 
                    key={row.paymentId} 
                    hover 
                    onClick={() => handleRowClick(row)}
                    sx={{ cursor: 'pointer' }}
                >
                  <TableCell>#TXN-00{row.paymentId}</TableCell>
                  <TableCell fontWeight="500">{row.patientName}</TableCell>
                  <TableCell>{dayjs(row.paymentDate).format('MMM D, YYYY h:mm A')}</TableCell>
                  <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250 }} noWrap>
                          {row.description}
                      </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>LKR {row.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status === 'COMPLETED' ? 'Paid' : 'Pending'} 
                      size="small"
                      color={row.status === 'COMPLETED' ? 'success' : 'warning'}
                      variant={row.status === 'COMPLETED' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No transactions found for this period.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 5. TRANSACTION DETAILS MODAL */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F4F7F6' }}>
            <Typography variant="h6" fontWeight="bold">Transaction Details</Typography>
            <IconButton onClick={() => setOpenDetails(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
            {selectedTxn && (
                <Stack spacing={3}>
                    {/* Header Info */}
                    <Box textAlign="center" sx={{ mb: 1 }}>
                        <Typography variant="h3" fontWeight="bold" color={selectedTxn.status === 'COMPLETED' ? "success.main" : "warning.main"}>
                            LKR {selectedTxn.amount?.toLocaleString()}
                        </Typography>
                        <Chip 
                            label={selectedTxn.status === 'COMPLETED' ? 'Successfully Paid' : 'Payment Pending'} 
                            color={selectedTxn.status === 'COMPLETED' ? 'success' : 'warning'} 
                            sx={{ mt: 1, fontWeight: 'bold' }}
                        />
                    </Box>

                    <Divider />

                    {/* Data Grid */}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                            <Typography variant="body1" fontWeight="bold">#TXN-00{selectedTxn.paymentId}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {dayjs(selectedTxn.paymentDate).format('MMM D, YYYY h:mm A')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Patient Name</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedTxn.patientName}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Description / Service</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedTxn.description}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Payment Type</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {selectedTxn.paymentType === 'BOOKING_FEE' ? 'Online / App' : 'Cash at Clinic'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Stack>
            )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F4F7F6' }}>
            <Button onClick={() => setOpenDetails(false)} color="inherit">Close Window</Button>
            {selectedTxn?.status === 'COMPLETED' && (
                <Button variant="contained" startIcon={<ReceiptLong />} sx={{ bgcolor: '#1A237E' }} onClick={() => alert("Downloading Receipt...")}>
                    Download Receipt
                </Button>
            )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFinancial;