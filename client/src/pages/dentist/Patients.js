import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, InputAdornment, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton, 
  Stack, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Divider, CircularProgress, Card, CardContent
} from '@mui/material';
import { 
  Search, Visibility, Assessment, Phone, Email, Close, MedicalServices, 
  CalendarToday, AssignmentTurnedIn, LocalHospital
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios'; // Adjust path

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/dentist/patients');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleRowClick = async (patient) => {
    setSelectedPatient(patient);
    setOpenModal(true);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`/dentist/patients/${patient.patientId}/history`);
      setTreatmentHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Triggers browser's native print dialogue for PDF generation
  const handleGeneratePDF = (e, patient) => {
    e.stopPropagation(); // Prevents row click
    window.print(); 
    // In a production app, you would use jsPDF:
    // const doc = new jsPDF(); doc.text(`Report for ${patient.name}`, 10, 10); doc.save('report.pdf');
  };

  // --- FILTER LOGIC ---
  const filteredPatients = patients.filter((p) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId?.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ '.print-only': { display: 'none' } }}>
      
      {/* --- HEADER & SEARCH --- */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 2 }}>
        <Box>
           <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C">Patient Directory</Typography>
           <Typography variant="body2" color="text.secondary">Review clinical records and medical history.</Typography>
        </Box>
        
        <TextField
          placeholder="Search by name or ID..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment> }}
          sx={{ bgcolor: 'white', borderRadius: 1, minWidth: 300, border: '1px solid #E0E4E8' }}
        />
      </Stack>

      {/* --- PATIENT TABLE --- */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E4E8' }}>
        {loading ? (
           <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell><strong>Patient Details</strong></TableCell>
                  <TableCell><strong>Patient ID</strong></TableCell>
                  <TableCell><strong>Contact Info</strong></TableCell>
                  <TableCell><strong>Current Treatment</strong></TableCell>
                  <TableCell><strong>Last Visit</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow 
                    key={patient.patientId} 
                    hover 
                    onClick={() => handleRowClick(patient)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F0F4F8' } }}
                  >
                    
                    {/* Name & Avatar */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#0E4C5C', color: 'white', fontWeight: 'bold' }}>
                          {patient.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight="700" color="#0E4C5C">
                          {patient.name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* ID */}
                    <TableCell>
                      <Chip label={`#PT-${patient.patientId}`} size="small" variant="outlined" sx={{ fontWeight: 'bold', color: '#546e7a' }} />
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{patient.email}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{patient.phone || 'N/A'}</Typography>
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Treatment */}
                    <TableCell>
                      <Chip 
                        icon={<MedicalServices fontSize="small" />}
                        label={patient.currentTreatment} 
                        size="small" 
                        sx={{ bgcolor: '#E0F2F1', color: '#00695C', fontWeight: 'bold', borderRadius: 1 }} 
                      />
                    </TableCell>

                    {/* Last Visit */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {patient.lastVisit !== 'Never' ? dayjs(patient.lastVisit).format('MMM D, YYYY') : 'No Visits'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={1}>
                        <Tooltip title="View Medical Profile">
                          <IconButton size="small" sx={{ color: '#0E4C5C', bgcolor: '#E0F7FA' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF Report">
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<Assessment />}
                            onClick={(e) => handleGeneratePDF(e, patient)}
                            sx={{ fontSize: '0.7rem', textTransform: 'none', borderColor: '#B0BEC5', color: '#455A64' }}
                          >
                            Report
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No patient records found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* --- PATIENT DOSSIER MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        {selectedPatient && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0E4C5C', color: 'white' }}>
               <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'white', color: '#0E4C5C', fontWeight: 'bold' }}>{selectedPatient.name?.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{selectedPatient.name}</Typography>
                    <Typography variant="caption">Patient ID: #PT-{selectedPatient.patientId}</Typography>
                  </Box>
               </Stack>
               <IconButton onClick={() => setOpenModal(false)} sx={{ color: 'white' }}><Close /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ bgcolor: '#F8FAFC', p: 4 }}>
                
                {/* Contact Overview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <Card elevation={0} sx={{ border: '1px solid #E0E4E8', borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">CONTACT EMAIL</Typography>
                                <Typography variant="body1" fontWeight="500">{selectedPatient.email}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Card elevation={0} sx={{ border: '1px solid #E0E4E8', borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">PHONE NUMBER</Typography>
                                <Typography variant="body1" fontWeight="500">{selectedPatient.phone || 'Not Provided'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 4 }}><Chip label="Clinical Treatment History" color="primary" variant="outlined" /></Divider>

                {/* Treatment History Timeline */}
                {historyLoading ? (
                    <Box textAlign="center" py={3}><CircularProgress size={30} /></Box>
                ) : (
                    <Box>
                        {treatmentHistory.length > 0 ? (
                            <Stack spacing={3}>
                                {treatmentHistory.map((treatment) => (
                                    <Paper key={treatment.treatmentId} elevation={0} sx={{ p: 3, border: '1px solid #CFD8DC', borderRadius: 2, borderLeft: '5px solid #0E4C5C' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="h6" color="#0E4C5C" fontWeight="bold">
                                                <LocalHospital sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }}/>
                                                {treatment.treatmentName}
                                            </Typography>
                                            <Chip label={treatment.status} size="small" color={treatment.status === 'COMPLETED' ? 'success' : 'warning'} />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Assigned Dentist: <b>Dr. {treatment.dentistName}</b></Typography>
                                        
                                        {/* Nested Sessions */}
                                        <Stack spacing={1} sx={{ mt: 2, bgcolor: '#F1F5F9', p: 2, borderRadius: 1 }}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary">SESSION NOTES</Typography>
                                            {treatment.sessions?.length > 0 ? (
                                                treatment.sessions.map((session, idx) => (
                                                    <Box key={idx} sx={{ display: 'flex', gap: 2, pb: 1, borderBottom: idx !== treatment.sessions.length -1 ? '1px dashed #CFD8DC' : 'none' }}>
                                                        <Typography variant="body2" fontWeight="bold" color="#546E7A" sx={{ minWidth: 100 }}>
                                                            {dayjs(session.sessionDate).format('MMM D, YYYY')}
                                                        </Typography>
                                                        <Typography variant="body2">{session.notes || 'No clinical notes recorded.'}</Typography>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">No active sessions logged yet.</Typography>
                                            )}
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Box textAlign="center" py={4}>
                                <AssignmentTurnedIn sx={{ fontSize: 50, color: '#B0BEC5', mb: 1 }} />
                                <Typography variant="h6" color="text.secondary">No Medical History Found</Typography>
                                <Typography variant="body2" color="text.secondary">This patient has not undergone any recorded treatments yet.</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E0E4E8' }}>
               <Button onClick={() => setOpenModal(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Close Dossier</Button>
               <Button variant="contained" startIcon={<Assessment />} onClick={(e) => handleGeneratePDF(e, selectedPatient)} sx={{ bgcolor: '#0E4C5C', fontWeight: 'bold' }}>
                   Print PDF Report
               </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Patients;