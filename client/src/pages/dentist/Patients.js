import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, InputAdornment, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton, 
  Stack, Button, Pagination, Tooltip 
} from '@mui/material';
import { 
  Search, Visibility, Assessment, FilterList, Phone, Email 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 5) ---
const mockPatients = [
  { 
    id: 'PT12345', 
    name: 'Sophia Clark', 
    email: 'sophie.clark@email.com', 
    phone: '(555) 123-4567', 
    treatment: 'Orthodontics', 
    lastVisit: '2023-11-15',
    img: '' // In a real app, this would be a URL
  },
  { 
    id: 'PT67890', 
    name: 'Ethan Bennett', 
    email: 'ethan.bennett@email.com', 
    phone: '(555) 987-6543', 
    treatment: 'General Checkup', 
    lastVisit: '2023-10-20',
    img: '' 
  },
  { 
    id: 'PT24680', 
    name: 'Olivia Harper', 
    email: 'olivia.harper@email.com', 
    phone: '(555) 555-1212', 
    treatment: 'Teeth Whitening', 
    lastVisit: '2023-12-01',
    img: '' 
  },
  { 
    id: 'PT13579', 
    name: 'Liam Foster', 
    email: 'liam.foster@email.com', 
    phone: '(555) 321-4567', 
    treatment: 'Root Canal', 
    lastVisit: '2023-11-28',
    img: '' 
  },
  { 
    id: 'PT98765', 
    name: 'Ava Mitchell', 
    email: 'ava.mitchell@email.com', 
    phone: '(555) 789-0123', 
    treatment: 'Dental Cleaning', 
    lastVisit: '2023-12-10',
    img: '' 
  },
];

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Filter Logic 
  const filteredPatients = mockPatients.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* --- HEADER & SEARCH [cite: 169-170] --- */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3, gap: 2 }}>
        <Box>
           <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C">Patient Records</Typography>
           <Typography variant="body2" color="text.secondary">Manage and view detailed patient information</Typography>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            placeholder="Search by name, ID..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
            }}
            sx={{ bgcolor: 'white', borderRadius: 1, minWidth: 250 }}
          />
          <Button variant="outlined" startIcon={<FilterList />} sx={{ borderColor: '#cfd8dc', color: '#546e7a' }}>
            Filter
          </Button>
        </Stack>
      </Stack>

      {/* --- PATIENT TABLE [cite: 172-266] --- */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F4F7F6' }}>
              <TableRow>
                <TableCell><strong>Patient Name</strong></TableCell>
                <TableCell><strong>Patient ID</strong></TableCell>
                <TableCell><strong>Contact Info</strong></TableCell>
                <TableCell><strong>Current Treatment</strong></TableCell>
                <TableCell><strong>Last Visit</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  
                  {/* Name & Avatar [cite: 175] */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={patient.img} sx={{ bgcolor: '#0E4C5C' }}>
                        {patient.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="600">
                        {patient.name}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* ID [cite: 179] */}
                  <TableCell>
                    <Chip label={patient.id} size="small" variant="outlined" sx={{ fontWeight: 'bold', color: '#546e7a' }} />
                  </TableCell>

                  {/* Contact [cite: 180-181] */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{patient.email}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{patient.phone}</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Treatment [cite: 182] */}
                  <TableCell>
                    <Chip 
                      label={patient.treatment} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#E0F2F1', 
                        color: '#00695C', 
                        fontWeight: 'bold',
                        borderRadius: 1 
                      }} 
                    />
                  </TableCell>

                  {/* Last Visit [cite: 183] */}
                  <TableCell>
                    <Typography variant="body2">{patient.lastVisit}</Typography>
                  </TableCell>

                  {/* Actions [cite: 217-223] */}
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={1}>
                      <Tooltip title="View Profile">
                        <IconButton size="small" sx={{ color: '#0E4C5C', bgcolor: '#E0F7FA' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate Report">
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<Assessment />}
                          sx={{ 
                            fontSize: '0.7rem', 
                            textTransform: 'none', 
                            borderColor: '#B0BEC5', 
                            color: '#455A64' 
                          }}
                        >
                          Report
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- PAGINATION --- */}
        <Stack alignItems="center" sx={{ py: 3 }}>
          <Pagination count={3} color="primary" page={page} onChange={(e, v) => setPage(v)} />
        </Stack>
      </Paper>
    </Box>
  );
};

export default Patients;