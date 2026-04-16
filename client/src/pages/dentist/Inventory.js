import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Search, Inventory as InventoryIcon, Warning, CheckCircle, ErrorOutline, 
  History, Close, Assignment 
} from '@mui/icons-material';
import axios from '../../api/axios'; 

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

  if (loading) return (
      <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
      </div>
  );

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="mb-8">
         <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-2">
             Clinical Inventory
         </h1>
         <p className="text-slate-500 text-sm md:text-base">
             Check availability of clinic supplies and track your treatment usage.
         </p>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#E0F2F1] border border-[#B2DFDB] rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-[#00695C]/70 uppercase tracking-wider mb-1">TOTAL ITEMS</p>
            <p className="text-4xl font-bold text-[#00695C]">{items.length}</p>
          </div>
          <div className="w-14 h-14 bg-[#4DB6AC]/20 rounded-2xl flex items-center justify-center text-[#4DB6AC]">
             <InventoryIcon fontSize="large" />
          </div>
        </div>
        
        <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-[#C62828]/70 uppercase tracking-wider mb-1">LOW STOCK WARNINGS</p>
            <p className="text-4xl font-bold text-[#C62828]">{lowStockCount}</p>
          </div>
          <div className="w-14 h-14 bg-[#E57373]/20 rounded-2xl flex items-center justify-center text-[#E57373]">
             <Warning fontSize="large" />
          </div>
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative">
        
        <div className="relative mb-6 max-w-md">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search fontSize="small" />
           </div>
           <input
             type="text"
             className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm"
             placeholder="Search by item name or category..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Item Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Stock Quantity</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((row) => {
                  const isLowStock = row.stockQuantity <= (row.threshold || 20);
                  const isOutOfStock = row.stockQuantity === 0;

                  let statusLabel = 'In Stock';
                  let statusStyles = 'bg-green-100 text-green-700 border-green-200';
                  let StatusIcon = CheckCircle;

                  if (isOutOfStock) {
                      statusLabel = 'Out of Stock';
                      statusStyles = 'bg-red-500 text-white border-red-600';
                      StatusIcon = ErrorOutline;
                  } else if (isLowStock) {
                      statusLabel = 'Low Stock';
                      statusStyles = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                      StatusIcon = Warning;
                  }

                  return (
                    <tr 
                      key={row.equipmentId} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(row)}
                    >
                      <td className="p-4 align-middle">
                          <div className="flex items-center space-x-3 text-[#0E4C5C]">
                              <InventoryIcon fontSize="small" className="text-slate-400 group-hover:text-[#0E4C5C] transition-colors" />
                              <p className="font-bold">{row.name}</p>
                          </div>
                      </td>
                      <td className="p-4 align-middle text-slate-600 font-medium">
                          {row.category}
                      </td>
                      <td className="p-4 align-middle">
                        <p className={`font-bold ${isOutOfStock ? 'text-red-600' : (isLowStock ? 'text-yellow-600' : 'text-slate-700')}`}>
                          {row.stockQuantity} Units
                        </p>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg border ${statusStyles}`}>
                          <StatusIcon fontSize="inherit" className="mr-1" />
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-500 font-medium bg-slate-50/50">
                        No items found in inventory.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- USAGE HISTORY DIALOG --- */}
      {openUsageDialog && selectedItem && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="bg-slate-50 px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-100">
                      <h2 className="font-bold font-poppins text-lg text-[#0E4C5C]">Item Usage History</h2>
                      <button 
                         onClick={() => setOpenUsageDialog(false)}
                         className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-all focus:outline-none"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto flex-grow bg-white">
                      
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <p className="text-xl font-bold text-slate-800">{selectedItem.name}</p>
                              <p className="text-sm font-semibold text-slate-500 mt-1">Category: {selectedItem.category}</p>
                          </div>
                          <div className="text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</p>
                              <p className={`text-lg font-bold mt-0.5 ${selectedItem.stockQuantity === 0 ? 'text-red-600' : 'text-[#0E4C5C]'}`}>
                                  {selectedItem.stockQuantity} Units
                              </p>
                          </div>
                      </div>

                      <hr className="border-slate-100 mb-6" />

                      <div className="flex items-center space-x-2 mb-4 text-[#0E4C5C]">
                          <History fontSize="small" />
                          <p className="font-bold text-sm">Recent Treatments Involving This Item</p>
                      </div>
                      
                      {/* Placeholder for Treatment Module Integration */}
                      <div className="bg-slate-50 p-6 text-center rounded-2xl border border-dashed border-slate-300">
                          <Assignment sx={{ fontSize: 40 }} className="text-slate-400 mb-3" />
                          <p className="font-semibold text-slate-600 mb-1">
                              No recent usage records found.
                          </p>
                          <p className="text-xs text-[#0E4C5C] font-medium max-w-[250px] mx-auto">
                              Usage logs will appear here once this item is deducted during patient treatments.
                          </p>
                      </div>

                  </div>
                  
                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                      <button 
                          onClick={() => setOpenUsageDialog(false)}
                          className="px-6 py-2.5 rounded-xl bg-[#0E4C5C] text-white font-bold hover:bg-[#0a3541] transition-colors focus:outline-none shadow-md"
                      >
                          Close Window
                      </button>
                  </div>

              </div>
          </div>, document.body)
      )}
    </div>
  );
};

export default DentistInventory;