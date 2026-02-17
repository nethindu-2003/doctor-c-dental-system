import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Grid, Alert 
} from '@mui/material';
import { 
  Search, Add, Edit, Delete, Warning, CheckCircle, Inventory as InventoryIcon 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 5) ---
const initialInventory = [
  { id: 1, name: 'Gloves (Size M)', category: 'Consumables', quantity: 500, unitCost: 10, lastUpdated: '2023-11-15', status: 'In Stock' }, // [cite: 574-576]
  { id: 2, name: 'Syringes (2ml)', category: 'Consumables', quantity: 200, unitCost: 15, lastUpdated: '2023-11-15', status: 'In Stock' }, // [cite: 583-586]
  { id: 3, name: 'Cotton Swabs', category: 'Consumables', quantity: 50, unitCost: 5, lastUpdated: '2023-11-15', status: 'Low Stock' }, // [cite: 591-594]
  { id: 4, name: 'Anesthetic (Lidocaine)', category: 'Medical', quantity: 25, unitCost: 45, lastUpdated: '2023-11-15', status: 'Low Stock' }, // [cite: 595-598]
];

const AdminInventory = () => {
  const [items, setItems] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ 
    name: '', category: '', quantity: '', unitCost: '', threshold: 10 
  });

  // --- HANDLERS ---

  // Open Dialog for Add
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentItem({ name: '', category: '', quantity: '', unitCost: '', threshold: 10 });
    setOpenDialog(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (item) => {
    setIsEditMode(true);
    setCurrentItem({ ...item }); // Copy item data
    setOpenDialog(true);
  };

  // Delete Item [cite: 600]
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Save (Add or Update) [cite: 607]
  const handleSave = () => {
    if (isEditMode) {
      // Update Logic
      setItems(items.map(i => i.id === currentItem.id ? { 
        ...currentItem, 
        lastUpdated: new Date().toISOString().split('T')[0],
        status: parseInt(currentItem.quantity) <= parseInt(currentItem.threshold || 20) ? 'Low Stock' : 'In Stock'
      } : i));
    } else {
      // Add Logic
      const newItem = {
        id: items.length + 1,
        ...currentItem,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: parseInt(currentItem.quantity) <= parseInt(currentItem.threshold || 20) ? 'Low Stock' : 'In Stock'
      };
      setItems([...items, newItem]);
    }
    setOpenDialog(false);
  };

  // Filter Logic
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#1A237E">Inventory Management</Typography>
          <Typography variant="body2" color="text.secondary">Track clinic supplies and equipment</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenAdd}
          sx={{ bgcolor: '#1A237E' }}
        >
          Add Item
        </Button>
      </Stack>

      {/* SEARCH BAR [cite: 569] */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search for items..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ bgcolor: 'white' }}
        />
      </Paper>

      {/* INVENTORY TABLE [cite: 570-598] */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#E8EAF6' }}>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Unit Cost</strong></TableCell>
                <TableCell><strong>Last Updated</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <InventoryIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="500">{row.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color={row.status === 'Low Stock' ? 'error.main' : 'text.primary'}>
                      {row.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>Rs. {row.unitCost}</TableCell>
                  <TableCell>{row.lastUpdated}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={row.status === 'In Stock' ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                      label={row.status} 
                      size="small"
                      color={row.status === 'In Stock' ? 'success' : 'warning'}
                      variant={row.status === 'In Stock' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD/UPDATE DIALOG [cite: 577-607] */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" sx={{ bgcolor: '#1A237E', color: 'white' }}>
          {isEditMode ? 'Update Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            
            <TextField 
              label="Item Name" fullWidth 
              value={currentItem.name} 
              onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} 
            />
            
            <TextField 
              select label="Category" fullWidth 
              value={currentItem.category} 
              onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
            >
              <MenuItem value="Consumables">Consumables</MenuItem>
              <MenuItem value="Medical">Medical</MenuItem>
              <MenuItem value="Equipment">Equipment</MenuItem>
              <MenuItem value="Office">Office Supplies</MenuItem>
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <TextField 
                   label="Quantity" type="number" fullWidth 
                   value={currentItem.quantity} 
                   onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} 
                 />
              </Grid>
              <Grid item xs={6}>
                 <TextField 
                   label="Unit Cost(Rs.)" type="number" fullWidth 
                   value={currentItem.unitCost} 
                   onChange={(e) => setCurrentItem({...currentItem, unitCost: e.target.value})} 
                 />
              </Grid>
            </Grid>

            {/* Threshold Logic [cite: 605] */}
            <Alert severity="info" icon={false} sx={{ py: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Typography variant="body2">Low Stock Threshold:</Typography>
                <TextField 
                  variant="standard" type="number" size="small" sx={{ width: 60 }}
                  value={currentItem.threshold || 20}
                  onChange={(e) => setCurrentItem({...currentItem, threshold: e.target.value})}
                />
              </Stack>
            </Alert>

          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#1A237E' }}>
            {isEditMode ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminInventory;