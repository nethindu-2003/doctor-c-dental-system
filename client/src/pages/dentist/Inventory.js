import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Stack, TextField, InputAdornment, Grid, 
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, 
  CircularProgress, Button, Divider, IconButton
} from '@mui/material';
import { 
  Search, Inventory as InventoryIcon, Warning, CheckCircle, ErrorOutline, 
  History, Close, Assignment 
} from '@mui/icons-material';
import axios from '../../api/axios'; // Adjust path as needed

const DentistInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Usage Modal State
  const [openUsageDialog, setOpenUsageDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
      fetchInventory();
  }, []);

  const fetchInventory = async () => {
      try {
          const res = await axios.get('/dentist/inventory');
          setItems(res.data);
      } catch (err) {
          console.error("Error fetching inventory", err);
      } finally {
          setLoading(false);
      }
  };

  // --- HANDLERS ---
  const handleRowClick = (item) => {
      setSelectedItem(item);
      setOpenUsageDialog(true);
  };

  // --- FILTER & CALCULATIONS ---
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = items.filter(i => i.stockQuantity <= (i.threshold || 20)).length;

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box>
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4 }}>
         <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C">
             Clinical Inventory
         </Typography>
         <Typography variant="body2" color="text.secondary">
             Check availability of clinic supplies and track your treatment usage.
         </Typography>
      </Box>

      {/* --- SUMMARY CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#E0F2F1', border: '1px solid #B2DFDB' }}>
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
          <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">LOW STOCK WARNINGS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#C62828">{lowStockCount}</Typography>
              </Box>
              <Warning sx={{ fontSize: 40, color: '#E57373' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- INVENTORY TABLE --- */}
      <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid #e0e0e0' }}>
        
        <Box sx={{ mb: 3, maxWidth: 400 }}>
          <TextField
            fullWidth
            placeholder="Search by item name or category..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
            sx={{ bgcolor: '#F8FAFC' }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F4F7F6' }}>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Stock Quantity</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((row) => {
                const isLowStock = row.stockQuantity <= (row.threshold || 20);
                const isOutOfStock = row.stockQuantity === 0;

                let statusLabel = 'In Stock';
                let statusColor = 'success';
                let StatusIcon = CheckCircle;

                if (isOutOfStock) {
                    statusLabel = 'Out of Stock';
                    statusColor = 'error';
                    StatusIcon = ErrorOutline;
                } else if (isLowStock) {
                    statusLabel = 'Low Stock';
                    statusColor = 'warning';
                    StatusIcon = Warning;
                }

                return (
                  <TableRow 
                    key={row.equipmentId} 
                    hover 
                    onClick={() => handleRowClick(row)}
                    sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: '#F0F4F8' } }}
                  >
                    <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InventoryIcon fontSize="small" color="action" />
                            <Typography fontWeight="bold" color="#0E4C5C">{row.name}</Typography>
                        </Stack>
                    </TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color={isOutOfStock ? 'error' : (isLowStock ? 'warning.main' : 'inherit')}>
                        {row.stockQuantity} Units
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<StatusIcon fontSize="small" />}
                        label={statusLabel} 
                        color={statusColor} 
                        size="small" 
                        variant={isOutOfStock ? "filled" : "outlined"}
                        sx={{ fontWeight: 'bold', '& .MuiChip-icon': { color: 'inherit' } }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredItems.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No items found in inventory.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- USAGE HISTORY DIALOG --- */}
      <Dialog open={openUsageDialog} onClose={() => setOpenUsageDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F4F7F6' }}>
            <Typography variant="h6" fontWeight="bold" color="#0E4C5C">
                Item Usage History
            </Typography>
            <IconButton onClick={() => setOpenUsageDialog(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
            {selectedItem && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{selectedItem.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Category: {selectedItem.category}</Typography>
                        </Box>
                        <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" display="block">CURRENT STOCK</Typography>
                            <Typography variant="h6" fontWeight="bold" color={selectedItem.stockQuantity === 0 ? 'error' : 'primary'}>
                                {selectedItem.stockQuantity} Units
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <History color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">Recent Treatments Involving This Item</Typography>
                    </Stack>
                    
                    {/* Placeholder for Treatment Module Integration */}
                    <Paper elevation={0} sx={{ bgcolor: '#F8FAFC', p: 4, textAlign: 'center', borderRadius: 2, border: '1px dashed #B0BEC5' }}>
                        <Assignment sx={{ fontSize: 40, color: '#90A4AE', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            No recent usage records found.
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                            Usage logs will appear here once this item is deducted during patient treatments.
                        </Typography>
                    </Paper>
                </Box>
            )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F4F7F6' }}>
            <Button onClick={() => setOpenUsageDialog(false)} variant="contained" sx={{ bgcolor: '#0E4C5C', textTransform: 'none', fontWeight: 'bold' }}>
                Close Window
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DentistInventory;