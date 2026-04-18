import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    Search, Add, Edit, Delete, Warning, CheckCircle, Inventory as InventoryIcon, History, Close, FilterList
} from '@mui/icons-material';
import axios from '../../api/axios';

const AdminInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All'); // All, In Stock, Low Stock

    // CRUD Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        name: '', category: '', stockQuantity: '', unitCost: '', threshold: 20
    });

    // Details Modal State (Row Click)
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [usageHistory, setUsageHistory] = useState([]);
    const [loadingUsage, setLoadingUsage] = useState(false);

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
        setCurrentItem({ name: '', category: 'Consumable', stockQuantity: '', unitCost: '', threshold: 20 });
        setOpenDialog(true);
    };

    const handleOpenEdit = (e, item) => {
        e.stopPropagation();
        setIsEditMode(true);
        setCurrentItem({ ...item });
        setOpenDialog(true);
    };

    const handleRowClick = async (item) => {
        setSelectedItem(item);
        setOpenDetails(true);
        setLoadingUsage(true);
        try {
            const res = await axios.get(`/admin/inventory/${item.equipmentId}/usage`);
            setUsageHistory(res.data);
        } catch (err) {
            console.error("Error fetching usage history", err);
            setUsageHistory([]);
        } finally {
            setLoadingUsage(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`/admin/inventory/${id}`);
                setItems(items.filter(i => i.equipmentId !== id));
            } catch (err) {
                alert("Failed to delete item.");
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
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
    const filteredItems = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || i.category === filterCategory;

        const isLowStock = i.stockQuantity <= i.threshold;
        const statusText = isLowStock ? 'Low Stock' : 'In Stock';
        const matchesStatus = filterStatus === 'All' || statusText === filterStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2">Inventory Management</h1>
                    <p className="text-slate-500 text-sm md:text-base">Track clinic supplies, equipment, and stock levels</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center px-6 py-3 bg-[#1A237E] hover:bg-[#12185c] text-white rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md focus:outline-none whitespace-nowrap"
                >
                    <Add fontSize="small" className="mr-2" /> Add Item
                </button>
            </div>

            {/* FILTERS SECTION */}
            <div className="bg-white p-4 mb-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Search fontSize="small" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for items..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FilterList fontSize="small" />
                    </div>
                    <select
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium appearance-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Consumable">Consumable</option>
                        <option value="Medical">Medical</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Office">Office Supplies</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                        ▼
                    </div>
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Warning fontSize="small" />
                    </div>
                    <select
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium appearance-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Stock Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                        ▼
                    </div>
                </div>
            </div>

            {/* INVENTORY TABLE */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
                {loading ? (
                    <div className="p-12 flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1A237E] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold rounded-tl-3xl">Item Name</th>
                                    <th className="p-4 font-bold">Category</th>
                                    <th className="p-4 font-bold">Quantity</th>
                                    <th className="p-4 font-bold">Unit Cost</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-center rounded-tr-3xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((row) => {
                                    const isLowStock = row.stockQuantity <= row.threshold;
                                    return (
                                        <tr
                                            key={row.equipmentId}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                            onClick={() => handleRowClick(row)}
                                        >
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center space-x-3">
                                                    <InventoryIcon fontSize="small" className="text-slate-400 group-hover:text-[#1A237E] transition-colors" />
                                                    <span className="font-bold text-slate-800">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-sm text-slate-600">
                                                {row.category}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {row.stockQuantity}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-sm font-bold text-slate-800">
                                                LKR {row.unitCost?.toLocaleString()}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg ${!isLowStock ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                    {!isLowStock ? <CheckCircle fontSize="inherit" className="mr-1" /> : <Warning fontSize="inherit" className="mr-1" />}
                                                    {!isLowStock ? 'In Stock' : 'Low Stock'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <div className="flex justify-center items-center space-x-2">
                                                    <button
                                                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none"
                                                        onClick={(e) => handleOpenEdit(e, row)}
                                                        title="Edit Item"
                                                    >
                                                        <Edit fontSize="small" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none"
                                                        onClick={(e) => handleDelete(e, row.equipmentId)}
                                                        title="Delete Item"
                                                    >
                                                        <Delete fontSize="small" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredItems.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">No items found matching your filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- CRUD DIALOG (Add/Edit) --- */}
            {openDialog && (
                ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="bg-[#1A237E] p-5 flex justify-between items-center shrink-0">
                            <h2 className="text-white font-bold font-poppins text-lg">
                                {isEditMode ? 'Update Inventory Item' : 'Add New Inventory Item'}
                            </h2>
                            <button
                                onClick={() => setOpenDialog(false)}
                                className="text-white/70 hover:text-white transition-colors focus:outline-none"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        {/* Body & Form */}
                        <form onSubmit={handleSave} className="flex flex-col flex-grow overflow-hidden">
                            <div className="p-6 overflow-y-auto flex-grow space-y-5">

                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        minLength="3"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all"
                                        value={currentItem.name}
                                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Category</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all appearance-none"
                                            value={currentItem.category}
                                            onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                                        >
                                            <option value="Consumable">Consumable</option>
                                            <option value="Medical">Medical</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Office">Office Supplies</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Stock Quantity</label>
                                        <input
                                            type="number"
                                            required min="0" step="any"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all"
                                            value={currentItem.stockQuantity}
                                            onChange={(e) => setCurrentItem({ ...currentItem, stockQuantity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Unit Cost (LKR)</label>
                                        <input
                                            type="number"
                                            required min="0" step="any"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 transition-all"
                                            value={currentItem.unitCost}
                                            onChange={(e) => setCurrentItem({ ...currentItem, unitCost: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center flex-wrap gap-2">
                                    <span className="text-sm font-semibold text-blue-800 flex-grow">Low Stock Warning Threshold:</span>
                                    <input
                                        type="number"
                                        required min="0"
                                        className="w-20 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-bold text-center text-blue-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        value={currentItem.threshold}
                                        onChange={(e) => setCurrentItem({ ...currentItem, threshold: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setOpenDialog(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-[#1A237E] text-white font-bold hover:bg-[#12185c] hover:-translate-y-0.5 transition-all focus:outline-none shadow-md"
                                >
                                    {isEditMode ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>, document.body)
            )}

            {/* --- ITEM DETAILS / PAST USAGE MODAL (Row Click) --- */}
            {openDetails && (
                ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h2 className="text-slate-800 font-bold font-poppins text-lg flex items-center gap-2">
                                Item Details & Usage
                                {selectedItem?.stockQuantity <= selectedItem?.threshold && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider bg-red-100 text-red-700">LOW STOCK</span>
                                )}
                            </h2>
                            <button
                                onClick={() => setOpenDetails(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-grow">
                            {selectedItem && (
                                <div className="space-y-6">

                                    {/* Data Grid */}
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Item Name</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedItem.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedItem.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedItem.stockQuantity} Units</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Value</p>
                                            <p className="text-sm font-semibold text-slate-800">LKR {selectedItem.unitCost?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                                        <p className="mb-1"><strong className="font-semibold text-green-900">Last Updated:</strong> {selectedItem.lastUpdated || 'Never'}</p>
                                        <p><strong className="font-semibold text-green-900">Updated By:</strong> Admin ID #{selectedItem.adminId || 'System'}</p>
                                    </div>

                                    <hr className="border-slate-100" />

                                    <div className="flex items-center gap-2 mb-2 pt-2">
                                        <History sx={{ color: '#1A237E' }} />
                                        <h3 className="text-lg font-bold text-[#1A237E]">Consumption History</h3>
                                    </div>

                                    {loadingUsage ? (
                                        <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A237E] rounded-full animate-spin"></div></div>
                                    ) : usageHistory.length > 0 ? (
                                        <div className="overflow-hidden border border-slate-100 rounded-2xl">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-[#1A237E]/5 text-[#1A237E] font-bold">
                                                    <tr>
                                                        <th className="p-3">Date</th>
                                                        <th className="p-3">Patient</th>
                                                        <th className="p-3">Treatment</th>
                                                        <th className="p-3 text-right">Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {usageHistory.map((u, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-3 font-semibold text-slate-600">{u.usageDate}</td>
                                                            <td className="p-3 font-bold text-slate-800">{u.patientName}</td>
                                                            <td className="p-3 text-slate-600">{u.treatmentName} <br/><span className="text-[10px] text-slate-400">({u.sessionName})</span></td>
                                                            <td className="p-3 text-right font-bold text-[#1A237E]">{u.quantityUsed}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 p-6 text-center rounded-2xl border border-dashed border-slate-300">
                                            <p className="text-sm text-slate-500">
                                                No consumption records found for this item yet. 
                                            </p>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                            <button
                                onClick={() => setOpenDetails(false)}
                                className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>, document.body)
            )}
        </div>
    );
};

export default AdminInventory;