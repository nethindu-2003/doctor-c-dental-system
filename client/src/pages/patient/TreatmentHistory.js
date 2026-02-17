import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Stack, LinearProgress, Avatar, Paper, MenuItem, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Download, Search, CheckCircle, RadioButtonUnchecked, 
  MedicalServices, Assignment, Close
} from '@mui/icons-material';
import { 
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot 
} from '@mui/lab';
import axios from '../../api/axios'; 

const TreatmentHistory = () => {
  const [treatments, setTreatments] = useState([]);
  const [activeTreatment, setActiveTreatment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Modal State
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const res = await axios.get('/patient/treatments');
      const allTreatments = res.data;
      setTreatments(allTreatments);

      // Logic: Find the most recent "IN_PROGRESS" treatment
      const active = allTreatments.find(t => t.status === 'IN_PROGRESS');
      setActiveTreatment(active);
    } catch (err) {
      console.error("Error fetching treatments:", err);
    }
  };

  // Helper: Calculate Progress %
  const calculateProgress = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.status === 'COMPLETED').length;
    return Math.round((completed / sessions.length) * 100);
  };

  // Helper: Filter Logic
  const filteredHistory = treatments.filter(item => 
    (filterType === 'All' || item.status === filterType) &&
    (item.treatmentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (item.diagnosis && item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Helper: Open Modal
  const handleViewDetails = (treatment) => {
    setSelectedTreatment(treatment);
    setOpenModal(true);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', md: 'center' }} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="primary.dark">
            Treatment History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your ongoing progress and past medical records.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<Download />} 
          sx={{ mt: { xs: 2, md: 0 }, borderRadius: 50 }}
          onClick={() => alert("Report generation coming soon!")}
        >
          Download Report (PDF)
        </Button>
      </Stack>

      <Grid container spacing={4}>
        
        {/* --- SECTION 1: ACTIVE TREATMENT CARD (Dynamic) --- */}
        {activeTreatment && (
            <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 4, bgcolor: '#FAFAFA', border: '1px solid #e0e0e0' }}>
                <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.dark' }}><MedicalServices /></Avatar>
                    <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary.dark">Ongoing Treatment</Typography>
                    <Typography variant="body2" color="text.secondary">{activeTreatment.diagnosis}</Typography>
                    </Box>
                </Stack>
                
                <Typography variant="h5" fontWeight="bold" gutterBottom>{activeTreatment.treatmentName}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" fontWeight="bold">Progress</Typography>
                    <Typography variant="caption" fontWeight="bold">{calculateProgress(activeTreatment.sessions)}%</Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(activeTreatment.sessions)} 
                    sx={{ height: 8, borderRadius: 5, mb: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} 
                />

                {/* Vertical Timeline of Sessions */}
                <Timeline position="right" sx={{ p: 0, m: 0, '& .MuiTimelineItem-root:before': { flex: 0, p: 0 } }}>
                    {activeTreatment.sessions && activeTreatment.sessions.map((step, index) => (
                    <TimelineItem key={step.sessionId}>
                        <TimelineSeparator>
                        <TimelineDot 
                            sx={{ 
                            bgcolor: step.status === 'COMPLETED' ? 'success.main' : 'grey.300',
                            boxShadow: 'none'
                            }}
                        >
                            {step.status === 'COMPLETED' ? <CheckCircle fontSize="small" /> : <RadioButtonUnchecked fontSize="small" />}
                        </TimelineDot>
                        {index < activeTreatment.sessions.length - 1 && <TimelineConnector sx={{ bgcolor: step.status === 'COMPLETED' ? 'success.main' : 'grey.300' }} />}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color={step.status === 'PENDING' ? 'text.secondary' : 'text.primary'}>
                            {step.sessionName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {step.sessionDate || 'Date TBD'}
                        </Typography>
                        </TimelineContent>
                    </TimelineItem>
                    ))}
                </Timeline>
                </CardContent>
            </Card>
            </Grid>
        )}

        {/* --- SECTION 2: HISTORY TABLE --- */}
        <Grid item xs={12} md={activeTreatment ? 8 : 12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  placeholder="Search procedure..." 
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextField 
                  select 
                  fullWidth 
                  size="small" 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F4F7F6' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Treatment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Diagnosis</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Cost</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((row) => (
                    <TableRow key={row.treatmentId} hover>
                      <TableCell>{row.startDate}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{row.treatmentName}</Typography>
                      </TableCell>
                      <TableCell>{row.diagnosis}</TableCell>
                      <TableCell>LKR {row.cost?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'} 
                          size="small" 
                          color={row.status === 'COMPLETED' ? 'success' : 'warning'} 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(row)}>
                                <Assignment color="primary" />
                            </IconButton>
                          </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No records found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </Paper>
        </Grid>

      </Grid>

      {/* --- POPUP WINDOW (MODAL) FOR DETAILS --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.dark', color: 'white' }}>
            Treatment Details
            <IconButton onClick={() => setOpenModal(false)} sx={{ color: 'white' }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
            {selectedTreatment && (
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Treatment Name</Typography>
                        <Typography variant="h6">{selectedTreatment.treatmentName}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                        <Typography variant="body1">{selectedTreatment.diagnosis}</Typography>
                    </Box>
                    <Stack direction="row" justifyContent="space-between">
                         <Box>
                            <Typography variant="caption" color="text.secondary">Start Date</Typography>
                            <Typography variant="body1">{selectedTreatment.startDate}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">End Date</Typography>
                            <Typography variant="body1">{selectedTreatment.endDate || "Ongoing"}</Typography>
                        </Box>
                    </Stack>
                    
                    <Typography variant="h6" sx={{ mt: 2, borderBottom: '1px solid #eee' }}>Session Breakdown</Typography>
                    
                    {selectedTreatment.sessions && selectedTreatment.sessions.length > 0 ? (
                        selectedTreatment.sessions.map((session) => (
                            <Box key={session.sessionId} sx={{ p: 1.5, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography fontWeight="bold">{session.sessionName}</Typography>
                                    <Typography variant="caption">{session.sessionDate}</Typography>
                                </Stack>
                                {session.note && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        "{session.note}"
                                    </Typography>
                                )}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                    <Chip 
                                        label={session.status} 
                                        size="small" 
                                        color={session.status === 'COMPLETED' ? 'success' : 'default'} 
                                        sx={{ height: 20, fontSize: '0.7rem' }} 
                                    />
                                    {session.cost > 0 && <Typography variant="caption">LKR {session.cost}</Typography>}
                                </Stack>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="caption" color="text.secondary">No sessions recorded yet.</Typography>
                    )}
                </Stack>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TreatmentHistory;