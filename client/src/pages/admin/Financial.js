import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Stack, Button, TextField, InputAdornment, 
  Grid, Card, CardContent 
} from '@mui/material';
import { 
  Search, AttachMoney, Download, PendingActions, AccountBalanceWallet, 
  PictureAsPdf, TableView 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 6) ---
const initialTransactions = [
  { id: 1, patient: 'Sophia Clark', date: '2024-07-20', amount: 250.00, method: 'Credit Card', status: 'Completed' }, // 
  { id: 2, patient: 'Ethan Miller', date: '2024-07-18', amount: 180.00, method: 'Cash', status: 'Completed' },
  { id: 3, patient: 'Olivia Davis', date: '2024-07-15', amount: 400.00, method: 'Insurance', status: 'Pending' },
  { id: 4, patient: 'Liam Wilson', date: '2024-07-12', amount: 120.00, method: 'Credit Card', status: 'Completed' },
  { id: 5, patient: 'Ava Taylor', date: '2024-07-10', amount: 300.00, method: 'Credit Card', status: 'Completed' },
  { id: 6, patient: 'Isabella Thomas', date: '2024-07-05', amount: 200.00, method: 'Insurance', status: 'Pending' },
];

const AdminFinancial = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // --- CALCULATIONS  ---
  const totalIncome = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunds = 0; // Mock value as per prototype

  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter(t => 
    t.patient.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDate ? t.date.startsWith(filterDate) : true)
  );

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" gutterBottom>
        Financial Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage and track all financial transactions related to patient care.
      </Typography>

      {/* 1. FINANCIAL SUMMARY CARDS  */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: '#E8F5E9', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">TOTAL INCOME</Typography>
                <Typography variant="h4" fontWeight="bold" color="#2E7D32">Rs. {totalIncome.toFixed(2)}</Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, color: '#4CAF50' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: '#FFF3E0', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">PENDING PAYMENTS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#EF6C00">Rs. {pendingPayments.toFixed(2)}</Typography>
              </Box>
              <PendingActions sx={{ fontSize: 40, color: '#FF9800' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: '#FFEBEE', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">REFUNDS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#C62828">Rs. {totalRefunds.toFixed(2)}</Typography>
              </Box>
              <AccountBalanceWallet sx={{ fontSize: 40, color: '#EF5350' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. CONTROLS (Search, Filter, Export) [cite: 612-615] */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
             <Button variant="outlined" startIcon={<PictureAsPdf />} size="small">Export PDF</Button>
             <Button variant="outlined" startIcon={<TableView />} size="small">Export Excel</Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 3. GENERATE REPORT BUTTON [cite: 619] */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
         <Button variant="contained" startIcon={<Download />} sx={{ bgcolor: '#1A237E' }}>
            Generate Monthly Report
         </Button>
      </Box>

      {/* 4. TRANSACTIONS TABLE  */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#E8EAF6' }}>
              <TableRow>
                <TableCell><strong>Patient Name</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell fontWeight="500">{row.patient}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rs. {row.amount.toFixed(2)}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={row.status === 'Completed' ? 'success' : 'warning'}
                      variant={row.status === 'Completed' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminFinancial;