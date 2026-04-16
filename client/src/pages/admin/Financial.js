import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Search, AttachMoney, Download, PendingActions, AccountBalanceWallet, 
  PictureAsPdf, TableView, ReceiptLong, Close
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Import the new Excel library

const AdminFinancial = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // NEW: Export Mode State ('PDF' or 'Excel')
  const [exportMode, setExportMode] = useState('PDF');

  // Modal State
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
      fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
      try {
          const res = await axios.get('/admin/finance/transactions');
          setTransactions(res.data);
      } catch (err) {
          console.error("Error fetching financial data:", err);
      } finally {
          setLoading(false);
      }
  };

  // --- CALCULATIONS  ---
  const totalIncome = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'PENDING')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRefunds = 0; // Keeping as 0 until refund logic is built

  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if the transaction's Year-Month matches the filterDate
    const txnMonth = dayjs(t.paymentDate).format('YYYY-MM');
    const matchesDate = filterDate ? txnMonth === filterDate : true;
    
    return matchesSearch && matchesDate;
  });

  // --- HANDLERS ---
  const handleRowClick = (txn) => {
      setSelectedTxn(txn);
      setOpenDetails(true);
  };

  // --- PDF: SINGLE RECEIPT ---
  const handleDownloadReceipt = (txn) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(26, 35, 126); // #1A237E (Admin Blue)
    doc.setFont("helvetica", "bold");
    doc.text('Doctor C Dental Clinic', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text('123 Smile Avenue, Colombo, Sri Lanka', 14, 30);
    doc.text('Phone: +94 11 234 5678 | Email: billing@doctorcdental.com', 14, 35);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('PAYMENT RECEIPT (ADMIN COPY)', 14, 55);

    doc.setFontSize(12);
    if (txn.status === 'COMPLETED') {
        doc.setTextColor(46, 125, 50); 
        doc.text('PAID', 170, 55);
    } else {
        doc.setTextColor(211, 47, 47); 
        doc.text('PENDING', 160, 55);
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Receipt No:`, 14, 70);
    doc.setFont("helvetica", "bold");
    doc.text(`#TXN-00${txn.paymentId}`, 45, 70);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Date:`, 14, 78);
    doc.text(`${dayjs(txn.paymentDate).format('MMMM D, YYYY h:mm A')}`, 45, 78);
    
    doc.text(`Patient:`, 14, 86);
    doc.text(`${txn.patientName}`, 45, 86);

    doc.text(`Method:`, 120, 70);
    doc.text(`${txn.paymentType === 'BOOKING_FEE' ? 'Online' : 'Clinic'}`, 140, 70);

    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Amount (LKR)']],
      body: [[txn.description, txn.amount?.toLocaleString()]],
      theme: 'striped',
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 6 },
    });

    const finalY = doc.lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: LKR ${txn.amount?.toLocaleString()}`, 140, finalY + 10);

    doc.save(`Receipt_TXN00${txn.paymentId}.pdf`);
  };

  // --- PDF / EXCEL: MONTHLY REPORT ---
  const handleGenerateReport = () => {
    // 1. Identify target month (Use filterDate, or current month if empty)
    const targetMonthStr = filterDate || dayjs().format('YYYY-MM');
    const formattedMonth = dayjs(targetMonthStr).format('MMMM YYYY');

    // 2. Isolate transactions for only this month
    const reportTxns = transactions.filter(t => dayjs(t.paymentDate).format('YYYY-MM') === targetMonthStr);

    if (reportTxns.length === 0) {
      alert(`No transactions found for ${formattedMonth}.`);
      return;
    }

    // Calculate stats for the report
    const monthIncome = reportTxns.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + (t.amount || 0), 0);
    const monthPending = reportTxns.filter(t => t.status === 'PENDING').reduce((s, t) => s + (t.amount || 0), 0);

    if (exportMode === 'PDF') {
      // --- GENERATE PDF ---
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(26, 35, 126);
      doc.setFont("helvetica", "bold");
      doc.text('Doctor C Dental Clinic', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text('Financial Report', 14, 30);
      
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`MONTHLY FINANCIAL REPORT - ${formattedMonth.toUpperCase()}`, 105, 48, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Collected: LKR ${monthIncome.toLocaleString()}`, 14, 60);
      doc.text(`Total Pending: LKR ${monthPending.toLocaleString()}`, 14, 67);
      doc.text(`Transaction Count: ${reportTxns.length}`, 140, 60);

      const tableData = reportTxns.map(t => [
        dayjs(t.paymentDate).format('DD/MM/YY'),
        `#00${t.paymentId}`,
        t.patientName,
        t.description,
        t.status,
        `LKR ${t.amount?.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 75,
        head: [['Date', 'Txn ID', 'Patient', 'Description', 'Status', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [26, 35, 126], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 5: { halign: 'right' } }
      });

      doc.save(`Financial_Report_${targetMonthStr}.pdf`);

    } else if (exportMode === 'Excel') {
      // --- GENERATE EXCEL ---
      const worksheetData = reportTxns.map(t => ({
        "Date & Time": dayjs(t.paymentDate).format('YYYY-MM-DD HH:mm'),
        "Transaction ID": `TXN-00${t.paymentId}`,
        "Patient Name": t.patientName,
        "Description": t.description,
        "Status": t.status,
        "Payment Method": t.paymentType === 'BOOKING_FEE' ? 'Online' : 'Clinic',
        "Amount (LKR)": t.amount
      }));

      // Add a summary row at the bottom
      worksheetData.push({}); // Empty row
      worksheetData.push({ "Description": "TOTAL COLLECTED INCOME:", "Amount (LKR)": monthIncome });
      worksheetData.push({ "Description": "TOTAL PENDING:", "Amount (LKR)": monthPending });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      
      // Adjust column widths automatically
      const colWidths = [
        { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, formattedMonth);
      XLSX.writeFile(workbook, `Financial_Report_${targetMonthStr}.xlsx`);
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center mt-24">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1A237E] rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2">
          Financial Management
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Manage clinic revenue, track pending treatment balances, and generate reports.
        </p>
      </div>

      {/* 1. FINANCIAL SUMMARY CARDS  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#E8F5E9] p-6 rounded-3xl border border-[#C8E6C9] flex justify-between items-center transition-transform hover:-translate-y-1 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1 tracking-wider">TOTAL INCOME</p>
            <h2 className="text-3xl font-bold text-[#2E7D32]">LKR {totalIncome.toLocaleString()}</h2>
          </div>
          <AttachMoney sx={{ fontSize: 48, color: '#4CAF50' }} />
        </div>
        
        <div className="bg-[#FFF3E0] p-6 rounded-3xl border border-[#FFE0B2] flex justify-between items-center transition-transform hover:-translate-y-1 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1 tracking-wider">PENDING PAYMENTS</p>
            <h2 className="text-3xl font-bold text-[#EF6C00]">LKR {pendingPayments.toLocaleString()}</h2>
          </div>
          <PendingActions sx={{ fontSize: 48, color: '#FF9800' }} />
        </div>

        <div className="bg-[#FFEBEE] p-6 rounded-3xl border border-[#FFCDD2] flex justify-between items-center transition-transform hover:-translate-y-1 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1 tracking-wider">REFUNDS</p>
            <h2 className="text-3xl font-bold text-[#C62828]">LKR {totalRefunds.toLocaleString()}</h2>
          </div>
          <AccountBalanceWallet sx={{ fontSize: 48, color: '#EF5350' }} />
        </div>
      </div>

      {/* 2. CONTROLS (Search, Filter, Export) & 3. GENERATE REPORT BUTTON */}
      <div className="bg-white p-4 mb-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-grow">
                {/* Search */}
                <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Search fontSize="small" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Date Filter */}
                <div className="w-full sm:w-auto">
                    <input 
                        type="month"
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium uppercase text-slate-600"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>

                {/* Export Mode Toggles */}
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                        onClick={() => setExportMode('PDF')}
                        className={`flex items-center justify-center px-4 py-1.5 rounded-lg transition-all font-semibold text-sm focus:outline-none ${
                           exportMode === 'PDF' ? 'bg-white text-[#1A237E] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <PictureAsPdf fontSize="small" className="mr-1.5" /> PDF
                    </button>
                    <button 
                        onClick={() => setExportMode('Excel')}
                        className={`flex items-center justify-center px-4 py-1.5 rounded-lg transition-all font-semibold text-sm focus:outline-none ${
                           exportMode === 'Excel' ? 'bg-white text-[#1A237E] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <TableView fontSize="small" className="mr-1.5" /> Excel
                    </button>
                </div>
            </div>

            {/* Generate Report Button */}
             <div className="w-full lg:w-auto flex justify-end">
                <button 
                    onClick={handleGenerateReport}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-[#1A237E] hover:bg-[#12185c] text-white rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md focus:outline-none"
                >
                    <Download fontSize="small" className="mr-2" /> 
                    Generate Monthly {exportMode}
                </button>
             </div>
        </div>
      </div>

      {/* 4. TRANSACTIONS TABLE  */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-tl-3xl">Transaction ID</th>
                <th className="p-4 font-bold">Patient Name</th>
                <th className="p-4 font-bold">Date & Time</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold rounded-tr-3xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((row) => (
                <tr 
                    key={row.paymentId} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(row)}
                >
                  <td className="p-4 align-middle text-sm font-semibold text-slate-600 group-hover:text-[#1A237E]">
                      #TXN-00{row.paymentId}
                  </td>
                  <td className="p-4 align-middle text-sm font-semibold text-slate-800">
                      {row.patientName}
                  </td>
                  <td className="p-4 align-middle text-sm text-slate-600 whitespace-nowrap">
                      {dayjs(row.paymentDate).format('MMM D, YYYY h:mm A')}
                  </td>
                  <td className="p-4 align-middle text-sm text-slate-600 max-w-[250px] truncate">
                      {row.description}
                  </td>
                  <td className="p-4 align-middle text-sm font-bold text-slate-800">
                      LKR {row.amount?.toLocaleString()}
                  </td>
                  <td className="p-4 align-middle">
                     <span className={`inline-block px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg ${
                         row.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                     }`}>
                        {row.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                     </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TRANSACTION DETAILS MODAL */}
      {openDetails && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                      <h2 className="text-slate-800 font-bold font-poppins text-lg">Transaction Details</h2>
                      <button 
                         onClick={() => setOpenDetails(false)}
                         className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                      >
                         <Close fontSize="small" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto flex-grow bg-white">
                      {selectedTxn && (
                          <div className="space-y-6">
                              {/* Header Info */}
                              <div className="text-center">
                                  <h3 className={`text-4xl font-extrabold mb-2 ${selectedTxn.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-500'}`}>
                                      LKR {selectedTxn.amount?.toLocaleString()}
                                  </h3>
                                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                                      selectedTxn.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                      {selectedTxn.status === 'COMPLETED' ? 'Successfully Paid' : 'Payment Pending'}
                                  </span>
                              </div>

                              <hr className="border-slate-100" />

                              {/* Data Grid */}
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                                      <p className="text-sm font-semibold text-slate-800">#TXN-00{selectedTxn.paymentId}</p>
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                                      <p className="text-sm font-semibold text-slate-800">
                                          {dayjs(selectedTxn.paymentDate).format('MMM D, YYYY h:mm A')}
                                      </p>
                                  </div>
                                  <div className="col-span-2">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                                      <p className="text-sm font-semibold text-slate-800">{selectedTxn.patientName}</p>
                                  </div>
                                  <div className="col-span-2">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description / Service</p>
                                      <p className="text-sm font-semibold text-slate-800">{selectedTxn.description}</p>
                                  </div>
                                  <div className="col-span-2">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Type</p>
                                      <p className="text-sm font-semibold text-slate-800">
                                          {selectedTxn.paymentType === 'BOOKING_FEE' ? 'Online / App' : 'Cash at Clinic'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
                      <button 
                          onClick={() => setOpenDetails(false)}
                          className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors focus:outline-none"
                      >
                          Close Window
                      </button>
                      {selectedTxn?.status === 'COMPLETED' && (
                          <button 
                              onClick={() => handleDownloadReceipt(selectedTxn)}
                              className="px-5 py-2.5 rounded-xl bg-[#1A237E] text-white font-bold flex items-center hover:bg-[#12185c] hover:-translate-y-0.5 transition-all focus:outline-none shadow-md"
                          >
                              <ReceiptLong fontSize="small" className="mr-2 -ml-1" />
                              Download Receipt
                          </button>
                      )}
                  </div>
              </div>
          </div>, document.body)
      )}
    </div>
  );
};

export default AdminFinancial;