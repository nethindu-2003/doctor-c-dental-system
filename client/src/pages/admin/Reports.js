import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Stack, Button, TextField, InputAdornment, 
  Grid, Avatar, Tooltip, IconButton 
} from '@mui/material';
import { 
  Search, FilterList, PictureAsPdf, Visibility, RestartAlt 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 7) ---
const initialRecords = [
  { 
    id: 1, 
    patientName: 'Sophia Clark', 
    patientId: '#12345', 
    treatment: 'Root Canal', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-01-15', 
    endDate: '2024-02-15', 
    sessions: '3 / 3', 
    status: 'Completed', 
    amount: 1500 
  },
  { 
    id: 2, 
    patientName: 'Ethan Miller', 
    patientId: '#67890', 
    treatment: 'Whitening', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-03-01', 
    endDate: '2024-03-15', 
    sessions: '2 / 2', 
    status: 'Completed', 
    amount: 500 
  },
  { 
    id: 3, 
    patientName: 'Olivia Davis', 
    patientId: '#11223', 
    treatment: 'Braces', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-04-01', 
    endDate: '2025-04-01', 
    sessions: '1 / 12', 
    status: 'Ongoing', 
    amount: 4000 
  },
  { 
    id: 4, 
    patientName: 'Liam Wilson', 
    patientId: '#44556', 
    treatment: 'Cleaning', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-05-10', 
    endDate: '2024-05-10', 
    sessions: '1 / 1', 
    status: 'Completed', 
    amount: 150 
  },
];

const AdminReports = () => {
  const [records, setRecords] = useState(initialRecords);
  
  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    id: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ name: '', id: '', startDate: '', endDate: '' });
  };

  // Filter Logic
  const filteredRecords = records.filter(row => {
    const matchesName = row.patientName.toLowerCase().includes(filters.name.toLowerCase());
    const matchesId = row.patientId.toLowerCase().includes(filters.id.toLowerCase());
    const matchesStart = filters.startDate ? row.startDate >= filters.startDate : true;
    const matchesEnd = filters.endDate ? row.startDate <= filters.endDate : true;

    return matchesName && matchesId && matchesStart && matchesEnd;
  });

  const handleGenerateReport = (patientName) => {
    alert(`Generating PDF Report for ${patientName}...`);
    // In real app: trigger backend PDF generation
  };

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E" gutterBottom>
        Patient Treatment Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Filter, view, and generate reports of all patient treatments.
      </Typography>

      {/* 1. FILTER SECTION */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
           <FilterList color="action" />
           <Typography variant="h6" fontWeight="bold">Filter Options</Typography>
        </Stack>
        
        <Grid container spacing={2} alignItems="center">
          {/* Search by Name */}
          <Grid item xs={12} md={3}>
             <TextField 
               label="Patient Name" 
               name="name" 
               size="small" 
               fullWidth 
               value={filters.name}
               onChange={handleFilterChange}
               InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
             />
          </Grid>
          
          {/* Search by ID */}
          <Grid item xs={12} md={2}>
             <TextField 
               label="Patient ID" 
               name="id" 
               size="small" 
               fullWidth 
               value={filters.id}
               onChange={handleFilterChange}
             />
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} md={2}>
             <TextField 
               label="From" 
               name="startDate" 
               type="date" 
               size="small" 
               fullWidth 
               InputLabelProps={{ shrink: true }}
               value={filters.startDate}
               onChange={handleFilterChange}
             />
          </Grid>
          <Grid item xs={12} md={2}>
             <TextField 
               label="To" 
               name="endDate" 
               type="date" 
               size="small" 
               fullWidth 
               InputLabelProps={{ shrink: true }}
               value={filters.endDate}
               onChange={handleFilterChange}
             />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} md={3}>
             <Stack direction="row" spacing={1}>
                <Button variant="contained" sx={{ bgcolor: '#1A237E' }} fullWidth>
                  Filter
                </Button>
                <Button variant="outlined" startIcon={<RestartAlt />} onClick={handleReset} fullWidth>
                  Reset
                </Button>
             </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. REPORT TABLE */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#E8EAF6', display: 'flex', justifyContent: 'space-between' }}>
           <Typography variant="subtitle1" fontWeight="bold">Treatment Records</Typography>
           <Typography variant="caption" color="text.secondary">
             Showing {filteredRecords.length} records
           </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F5F5F5' }}>
              <TableRow>
                <TableCell><strong>Patient</strong></TableCell>
                <TableCell><strong>Treatment Details</strong></TableCell>
                <TableCell><strong>Dates</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((row) => (
                <TableRow key={row.id} hover>
                  
                  {/* Patient Info */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: '#1A237E' }}>{row.patientName.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{row.patientName}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.patientId}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Treatment Info */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{row.treatment}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.dentist}</Typography>
                  </TableCell>

                  {/* Dates */}
                  <TableCell>
                    <Stack>
                       <Typography variant="caption">Start: {row.startDate}</Typography>
                       <Typography variant="caption">End: {row.endDate}</Typography>
                    </Stack>
                  </TableCell>

                  {/* Sessions */}
                  <TableCell>
                    <Chip label={`${row.sessions} Sessions`} size="small" variant="outlined" />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      color={row.status === 'Completed' ? 'success' : 'primary'} 
                      variant="filled"
                    />
                  </TableCell>

                  {/* Amount */}
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Rs. {row.amount}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                       <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                             <Visibility fontSize="small" />
                          </IconButton>
                       </Tooltip>
                       <Tooltip title="Generate PDF Report">
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="secondary"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleGenerateReport(row.patientName)}
                            sx={{ fontSize: '0.7rem', py: 0.5 }}
                          >
                            Report
                          </Button>
                       </Tooltip>
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No records found matching filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminReports;