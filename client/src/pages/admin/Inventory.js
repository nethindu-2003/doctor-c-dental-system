import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Stack, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, Grid, Alert, CircularProgress, Divider
} from '@mui/material';
import { 
  Search, Add, Edit, Delete, Warning, CheckCircle, Inventory as InventoryIcon, History 
} from '@mui/icons-material';
import axios from '../../api/axios';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // CRUD Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ 
    name: '', category: '', stockQuantity: '', unitCost: '', threshold: 20 
  });

  // Details Modal State (Row Click)
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
      fetchInventory();
  }, []);

  const fetchInventory = async () => {
      try {
          const res = await axios.get('/admin/inventory');
          setItems(res.data);
      } catch (err) {
          console.error("Error fetching inventory", err);
      } finally {
          setLoading(false);
      }
  };

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentItem({ name: '', category: 'Consumables', stockQuantity: '', unitCost: '', threshold: 20 });
    setOpenDialog(true);
  };

  const handleOpenEdit = (e, item) => {
    e.stopPropagation(); // Prevent row click from firing
    setIsEditMode(true);
    setCurrentItem({ ...item }); 
    setOpenDialog(true);
  };

  const handleRowClick = (item) => {
      setSelectedItem(item);
      setOpenDetails(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click from firing
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
          await axios.delete(`/admin/inventory/${id}`);
          setItems(items.filter(i => i.equipmentId !== id));
      } catch (err) {
          alert("Failed to delete item.");
      }
    }
  };

  const handleSave = async () => {
    try {
        if (isEditMode) {
            const res = await axios.put(`/admin/inventory/${currentItem.equipmentId}`, currentItem);
            setItems(items.map(i => i.equipmentId === currentItem.equipmentId ? res.data : i));
        } else {
            const res = await axios.post('/admin/inventory', currentItem);
            setItems([...items, res.data]);
        }
        setOpenDialog(false);
    } catch (err) {
        alert("Failed to save item.");
    }
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
          <Typography variant="body2" color="text.secondary">Track clinic supplies, equipment, and stock levels</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd} sx={{ bgcolor: '#1A237E' }}>
          Add Item
        </Button>
      </Stack>

      {/* SEARCH BAR */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth placeholder="Search for items..." size="small"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {/* INVENTORY TABLE */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        {loading ? (
            <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
            <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: '#F4F7F6' }}>
                <TableRow>
                    <TableCell><strong>Item Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Quantity</strong></TableCell>
                    <TableCell><strong>Unit Cost</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {filteredItems.map((row) => {
                    const isLowStock = row.stockQuantity <= row.threshold;
                    return (
                        <TableRow 
                            key={row.equipmentId} 
                            hover 
                            onClick={() => handleRowClick(row)}
                            sx={{ cursor: 'pointer' }}
                        >
                        <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                            <InventoryIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                            </Stack>
                        </TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                            <Typography fontWeight="bold" color={isLowStock ? 'error.main' : 'text.primary'}>
                            {row.stockQuantity}
                            </Typography>
                        </TableCell>
                        <TableCell>LKR {row.unitCost?.toLocaleString()}</TableCell>
                        <TableCell>
                            <Chip 
                            icon={!isLowStock ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                            label={!isLowStock ? 'In Stock' : 'Low Stock'} 
                            size="small"
                            color={!isLowStock ? 'success' : 'error'}
                            variant={!isLowStock ? 'outlined' : 'filled'}
                            sx={{ fontWeight: 'bold' }}
                            />
                        </TableCell>
                        <TableCell align="center">
                            <Stack direction="row" justifyContent="center">
                            <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(e, row)}>
                                <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={(e) => handleDelete(e, row.equipmentId)}>
                                <Delete fontSize="small" />
                            </IconButton>
                            </Stack>
                        </TableCell>
                        </TableRow>
                    );
                })}
                {filteredItems.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No items found.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
            </TableContainer>
        )}
      </Paper>

      {/* --- CRUD DIALOG (Add/Edit) --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold" sx={{ bgcolor: '#1A237E', color: 'white' }}>
          {isEditMode ? 'Update Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Item Name" fullWidth value={currentItem.name} onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} />
            <TextField select label="Category" fullWidth value={currentItem.category} onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}>
              <MenuItem value="Consumables">Consumables</MenuItem>
              <MenuItem value="Medical">Medical</MenuItem>
              <MenuItem value="Equipment">Equipment</MenuItem>
              <MenuItem value="Office">Office Supplies</MenuItem>
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <TextField label="Stock Quantity" type="number" fullWidth value={currentItem.stockQuantity} onChange={(e) => setCurrentItem({...currentItem, stockQuantity: e.target.value})} />
              </Grid>
              <Grid item xs={6}>
                 <TextField label="Unit Cost (LKR)" type="number" fullWidth value={currentItem.unitCost} onChange={(e) => setCurrentItem({...currentItem, unitCost: e.target.value})} />
              </Grid>
            </Grid>
            <Alert severity="info" icon={false} sx={{ py: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Typography variant="body2">Low Stock Warning Threshold:</Typography>
                <TextField variant="standard" type="number" size="small" sx={{ width: 60 }} value={currentItem.threshold} onChange={(e) => setCurrentItem({...currentItem, threshold: e.target.value})} />
              </Stack>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#1A237E' }}>
            {isEditMode ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- ITEM DETAILS / PAST USAGE MODAL (Row Click) --- */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#F4F7F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Item Details & Usage</Typography>
            {selectedItem?.stockQuantity <= selectedItem?.threshold && (
                <Chip label="LOW STOCK" color="error" size="small" sx={{ fontWeight: 'bold' }} />
            )}
        </DialogTitle>
        <DialogContent dividers>
            {selectedItem && (
                <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Item Name</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedItem.name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Category</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedItem.category}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedItem.stockQuantity} Units</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Unit Value</Typography>
                            <Typography variant="body1" fontWeight="bold">LKR {selectedItem.unitCost?.toLocaleString()}</Typography>
                        </Grid>
                    </Grid>

                    <Alert severity="success" sx={{ mb: 3 }}>
                        <strong>Last Updated:</strong> {selectedItem.lastUpdated || 'Never'} <br/>
                        <strong>Updated By:</strong> Admin ID #{selectedItem.adminId || 'System'}
                    </Alert>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <History color="primary" />
                        <Typography variant="h6" fontWeight="bold" color="primary.dark">Past Usage History</Typography>
                    </Stack>
                    
                    {/* Placeholder for future Treatment Integration */}
                    <Paper elevation={0} sx={{ bgcolor: '#FAFAFA', p: 3, textAlign: 'center', borderRadius: 2, border: '1px dashed #ccc' }}>
                        <Typography variant="body2" color="text.secondary">
                            Usage history will populate here automatically once this item is utilized in clinical Treatments.
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                            (Treatment linking module in development)
                        </Typography>
                    </Paper>
                </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminInventory;