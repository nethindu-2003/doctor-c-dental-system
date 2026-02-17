import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, TextField, Button, MenuItem, Stack, 
  LinearProgress, Card, CardContent, Divider, Chip, IconButton, Collapse,
  Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { 
  Save, History, ExpandMore, ExpandLess, MedicalServices, Event 
} from '@mui/icons-material';

// --- MOCK DATA: Treatment + Sessions Structure ---
const mockTreatments = [
  {
    id: 1,
    patientName: 'Sophia Clark',
    diagnosis: 'Malocclusion (Misaligned Teeth)',
    procedure: 'Braces Installation',
    totalSessions: 5,
    completedSessions: 3,
    status: 'Ongoing',
    cost: 1500,
    sessions: [ // <--- The "Sessions" Table you mentioned
      { id: 101, date: '2024-06-01', notes: 'Initial Consultation & X-Rays', dentist: 'Dr. Emily' },
      { id: 102, date: '2024-06-15', notes: 'Brackets bonded to teeth', dentist: 'Dr. Emily' },
      { id: 103, date: '2024-07-01', notes: 'Wire tightening and adjustment', dentist: 'Dr. Emily' }
    ]
  },
  {
    id: 2,
    patientName: 'David Lee',
    diagnosis: 'Dental Caries',
    procedure: 'Composite Filling',
    totalSessions: 1,
    completedSessions: 1,
    status: 'Completed',
    cost: 120,
    sessions: [
      { id: 201, date: '2024-06-20', notes: 'Cavity cleaned and filled', dentist: 'Dr. Emily' }
    ]
  }
];

const Treatments = () => {
  const [treatments, setTreatments] = useState(mockTreatments);
  const [expandedId, setExpandedId] = useState(null); // For toggling session details

  // Form State
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    procedure: '',
    sessions: 1,
    cost: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Box>
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C" sx={{ mb: 3 }}>
        Treatment Management
      </Typography>

      <Grid container spacing={3}>
        
        {/* --- LEFT: ADD NEW TREATMENT / SESSION FORM [cite: 95-132] --- */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <MedicalServices sx={{ color: '#0E4C5C' }} />
              <Typography variant="h6" fontWeight="bold">Add New Treatment</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              {/* Patient Search */}
              <TextField 
                label="Search Patient" 
                variant="outlined" 
                fullWidth 
                placeholder="Name or ID" 
                helperText="Selected: Sophia Clark (ID: #12345)" // Mock selection
              />

              {/* Diagnosis & Procedure */}
              <TextField label="Diagnosis" fullWidth variant="outlined" placeholder="e.g. Gingivitis" />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField select label="Procedure" fullWidth defaultValue="">
                     <MenuItem value="Cleaning">Cleaning</MenuItem>
                     <MenuItem value="Filling">Filling</MenuItem>
                     <MenuItem value="Root Canal">Root Canal</MenuItem>
                     <MenuItem value="Braces">Braces</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Est. Cost (Rs.)" type="number" fullWidth />
                </Grid>
              </Grid>

              {/* Session Planning */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1, color: '#0E4C5C' }}>
                Session Planning
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                   <TextField label="Total Sessions" type="number" defaultValue={1} fullWidth />
                </Grid>
                <Grid item xs={6}>
                   <TextField label="Session Date" type="date" fullWidth InputLabelProps={{ shrink: true }} defaultValue={formData.date} />
                </Grid>
              </Grid>

              <TextField 
                label="Clinical Notes" 
                multiline 
                rows={4} 
                fullWidth 
                placeholder="Details about today's procedure..." 
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" startIcon={<Save />} fullWidth sx={{ bgcolor: '#0E4C5C' }}>
                  Save Treatment
                </Button>
                <Button variant="outlined" color="error">
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* --- RIGHT: TREATMENT HISTORY & SESSIONS [cite: 139-165] --- */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Patient History</Typography>
              <Button startIcon={<History />} size="small">View All</Button>
            </Stack>

            {/* List of Treatments */}
            <Stack spacing={2}>
              {treatments.map((t) => (
                <Card key={t.id} variant="outlined" sx={{ borderRadius: 2, borderColor: t.status === 'Ongoing' ? '#4DB6AC' : '#e0e0e0' }}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{t.procedure}</Typography>
                        <Typography variant="caption" color="text.secondary">Diagnosis: {t.diagnosis}</Typography>
                      </Box>
                      <Chip 
                        label={t.status} 
                        color={t.status === 'Ongoing' ? 'primary' : 'success'} 
                        size="small" 
                        variant={t.status === 'Ongoing' ? 'filled' : 'outlined'}
                      />
                    </Stack>

                    {/* Progress Bar for Multi-Session Treatments */}
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" fontWeight="bold">Progress</Typography>
                        <Typography variant="caption">
                           {t.completedSessions} / {t.totalSessions} Sessions
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={(t.completedSessions / t.totalSessions) * 100} 
                        sx={{ height: 6, borderRadius: 5, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#0E4C5C' } }}
                      />
                    </Box>

                    {/* Expand Button for Sessions Table */}
                    <Button 
                      onClick={() => handleExpandClick(t.id)}
                      endIcon={expandedId === t.id ? <ExpandLess /> : <ExpandMore />}
                      size="small"
                      sx={{ textTransform: 'none', mt: 1, p: 0 }}
                    >
                      View Session Records
                    </Button>

                    {/* --- COLLAPSIBLE SESSION TABLE --- */}
                    <Collapse in={expandedId === t.id} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2, bgcolor: '#F8F9FA', borderRadius: 2, p: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><Typography variant="caption" fontWeight="bold">Date</Typography></TableCell>
                              <TableCell><Typography variant="caption" fontWeight="bold">Dentist</Typography></TableCell>
                              <TableCell><Typography variant="caption" fontWeight="bold">Notes</Typography></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {t.sessions.map((session) => (
                              <TableRow key={session.id}>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{session.date}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{session.dentist}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{session.notes}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {/* Quick Add Session Button for Ongoing Treatments */}
                        {t.status === 'Ongoing' && (
                          <Button 
                            startIcon={<Event />} 
                            fullWidth 
                            size="small" 
                            sx={{ mt: 1, borderColor: '#0E4C5C', color: '#0E4C5C' }} 
                            variant="outlined"
                          >
                            Log Next Session
                          </Button>
                        )}
                      </Box>
                    </Collapse>

                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Treatments;