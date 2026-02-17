import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Grid, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Card, CardContent 
} from '@mui/material';
import { 
  Add, Search, Edit, Delete, Inventory as InventoryIcon, Warning, CheckCircle, ErrorOutline 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 6) ---
const initialInventory = [
  { id: 1, name: 'Dental Floss', category: 'Consumables', quantity: 200, unit: 'Units', lastUpdated: '2024-08-15', status: 'OK' },
  { id: 2, name: 'Mouthwash', category: 'Consumables', quantity: 50, unit: 'Bottles', lastUpdated: '2024-08-10', status: 'OK' },
  { id: 3, name: 'Toothpaste', category: 'Consumables', quantity: 15, unit: 'Tubes', lastUpdated: '2024-08-05', status: 'Low Stock' }, // [cite: 312-316]
  { id: 4, name: 'Dental Mirrors', category: 'Equipment', quantity: 10, unit: 'Units', lastUpdated: '2024-07-25', status: 'OK' },
  { id: 5, name: 'Prophy Paste', category: 'Consumables', quantity: 15, unit: 'Jars', lastUpdated: '2024-07-20', status: 'Low Stock' }, // [cite: 328-331]
  { id: 6, name: 'Impression Material', category: 'Consumables', quantity: 0, unit: 'Kits', lastUpdated: '2024-07-10', status: 'Out of Stock' }, // [cite: 343-349]
  { id: 7, name: 'Gloves', category: 'Consumables', quantity: 1000, unit: 'Pairs', lastUpdated: '2024-07-01', status: 'OK' },
];

const getStatusColor = (status) => {
  if (status === 'Out of Stock') return 'error';
  if (status === 'Low Stock') return 'warning';
  return 'success';
};

const Inventory = () => {
  const [items, setItems] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form State for Add/Edit
  const [currentItem, setCurrentItem] = useState({ name: '', category: '', quantity: '', unit: '' });

  // Filter Logic
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation [cite: 271-274]
  const lowStockCount = items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  return (
    <Box>
      {/* --- HEADER --- */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
           <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C">Inventory Management</Typography>
           <Typography variant="body2" color="text.secondary">Track clinic supplies and equipment</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: '#0E4C5C' }}
        >
          Add New Item
        </Button>
      </Stack>

      {/* --- SUMMARY CARDS  --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#E0F2F1' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL ITEMS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#00695C">{items.length}</Typography>
              </Box>
              <InventoryIcon sx={{ fontSize: 40, color: '#4DB6AC' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#FFEBEE' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">LOW STOCK ALERTS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#C62828">{lowStockCount}</Typography>
              </Box>
              <Warning sx={{ fontSize: 40, color: '#E57373' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- INVENTORY TABLE [cite: 284-376] --- */}
      <Paper elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        {/* Search Bar [cite: 269] */}
        <Box sx={{ mb: 2, maxWidth: 400 }}>
          <TextField
            fullWidth
            placeholder="Search for items..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F5F5F5' }}>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Unit</strong></TableCell>
                <TableCell><strong>Last Updated</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell fontWeight="500">{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color={row.quantity === 0 ? 'error' : 'inherit'}>
                      {row.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.lastUpdated}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={row.status === 'OK' ? <CheckCircle fontSize="small" /> : (row.status === 'Out of Stock' ? <ErrorOutline fontSize="small" /> : <Warning fontSize="small" />)}
                      label={row.status} 
                      color={getStatusColor(row.status)} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold', border: 'none', bgcolor: getStatusColor(row.status) + '.main', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center">
                      <IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- ADD/UPDATE ITEM DIALOG [cite: 276-283] --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Add Inventory Item</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Item Name" fullWidth variant="outlined" placeholder="e.g. Anesthetic" />
            <TextField select label="Category" fullWidth defaultValue="">
               <MenuItem value="Consumables">Consumables</MenuItem>
               <MenuItem value="Equipment">Equipment</MenuItem>
               <MenuItem value="Instruments">Instruments</MenuItem>
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <TextField label="Quantity" type="number" fullWidth />
              </Grid>
              <Grid item xs={6}>
                 <TextField label="Unit" fullWidth placeholder="e.g. Boxes, Vials" />
              </Grid>
            </Grid>
            <TextField label="Restock Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)} sx={{ bgcolor: '#0E4C5C' }}>Save Item</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Inventory;