import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Download, Search, ReceiptLong, AttachMoney, CreditCard, History, Payment, Close 
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PaymentHistory = () => {
  const { user } = useAuth();
  const { config } = useClinic();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/patient/payments');
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // --- Helper Functions for Data Display ---
  const getDescription = (payment) => {
    if (payment.paymentType === 'BOOKING_FEE') {
        return `Booking Fee - ${payment.appointment?.reasonForVisit || 'General'}`;
    }
    if (payment.paymentType === 'TREATMENT_PAYMENT') {
        return `Treatment - ${payment.treatment?.treatmentName || 'Procedure'}`;
    }
    return 'Clinic Payment';
  };

  const getDentistName = (payment) => {
      if (payment.appointment?.dentist) {
          return `Dr. ${payment.appointment.dentist.name}`;
      }
      return 'Clinic Admin'; 
  };

  // --- Filter Logic ---
  const filteredPayments = payments.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const desc = getDescription(item).toLowerCase();
    const doc = getDentistName(item).toLowerCase();
    const matchesSearch = desc.includes(searchTerm.toLowerCase()) || doc.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // --- Summary Calculations ---
  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const lastPaymentDate = payments.length > 0 && payments[0].paymentDate 
    ? dayjs(payments[0].paymentDate).format('MMMM D, YYYY') 
    : 'No Payments Yet';

  const handleOpenDetails = (payment) => {
      setSelectedPayment(payment);
      setOpenModal(true);
  };

  // --- PDF GENERATOR 1: SINGLE RECEIPT ---
  const generateReceiptPDF = (e, payment) => {
    e.stopPropagation(); // Prevent the row click from opening the modal
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(14, 76, 92);
    doc.setFont("helvetica", "bold");
    doc.text(config.clinicName || 'Dental Clinic', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(config.clinicAddress || '', 14, 30);
    const contactLine = [config.clinicPhone, config.clinicEmail].filter(Boolean).join(' | ');
    if (contactLine) doc.text(contactLine, 14, 35);

    // Divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    // Receipt Title & Status
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('PAYMENT RECEIPT', 14, 55);

    doc.setFontSize(12);
    if (payment.status === 'COMPLETED') {
        doc.setTextColor(46, 125, 50); // Green
        doc.text('PAID', 170, 55);
    } else {
        doc.setTextColor(211, 47, 47); // Red
        doc.text('PENDING', 160, 55);
    }

    // Payment Details Box
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Receipt No:`, 14, 70);
    doc.setFont("helvetica", "bold");
    doc.text(`#TXN-00${payment.paymentId}`, 50, 70);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Date:`, 14, 78);
    doc.text(`${dayjs(payment.paymentDate).format('MMMM D, YYYY h:mm A')}`, 50, 78);
    
    doc.text(`Patient Name:`, 14, 86);
    doc.text(`${user?.name || 'Patient'}`, 50, 86);

    doc.text(`Attending:`, 120, 70);
    doc.text(`${getDentistName(payment)}`, 145, 70);

    doc.text(`Method:`, 120, 78);
    doc.text(`${payment.paymentType === 'BOOKING_FEE' ? 'Online' : 'Clinic'}`, 145, 78);

    // Itemized Table
    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Amount (LKR)']],
      body: [
        [getDescription(payment), payment.amount.toLocaleString()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [14, 76, 92], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 6 },
    });

    // Total Row
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: LKR ${payment.amount.toLocaleString()}`, 140, finalY + 10);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(`Thank you for choosing ${config.clinicName || 'our clinic'}.`, 105, 280, { align: 'center' });

    doc.save(`Receipt_TXN00${payment.paymentId}.pdf`);
  };

  // --- PDF GENERATOR 2: FULL STATEMENT ---
  const generateStatementPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(14, 76, 92);
    doc.setFont("helvetica", "bold");
    doc.text(config.clinicName || 'Dental Clinic', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(config.clinicAddress || '', 14, 30);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 38, 196, 38);

    // Statement Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('PATIENT ACCOUNT STATEMENT', 105, 50, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${user?.name || 'Patient'}`, 14, 65);
    doc.text(`Statement Date: ${dayjs().format('MMMM D, YYYY')}`, 14, 72);

    // Summary Box
    doc.setFont("helvetica", "bold");
    doc.text(`Total Paid to Date: LKR ${totalPaid.toLocaleString()}`, 130, 65);
    if (totalPending > 0) {
        doc.setTextColor(211, 47, 47);
        doc.text(`Outstanding Balance: LKR ${totalPending.toLocaleString()}`, 130, 72);
        doc.setTextColor(0, 0, 0);
    }

    // Ledger Table
    const tableColumn = ["Date", "Txn ID", "Description", "Status", "Amount"];
    const tableRows = [];

    // Sort all payments chronologically for the statement
    const sortedPayments = [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    sortedPayments.forEach(payment => {
      const paymentData = [
        dayjs(payment.paymentDate).format('DD/MM/YYYY'),
        `#00${payment.paymentId}`,
        getDescription(payment),
        payment.status,
        `LKR ${payment.amount.toLocaleString()}`
      ];
      tableRows.push(paymentData);
    });

    autoTable(doc, {
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [14, 76, 92], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
          4: { halign: 'right' } // Align amount to the right
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`Account_Statement_${user?.name?.replace(/\s+/g, '_') || 'Patient'}.pdf`);
  };

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-2">
            Payment History
          </h1>
          <p className="text-slate-500 text-lg">
            Manage your invoices and track your dental expenses.
          </p>
        </div>
        <button 
          onClick={generateStatementPDF}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
        >
          <Download fontSize="small" />
          <span>Statement (PDF)</span>
        </button>
      </div>

      {/* --- 1. SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50/50 border border-green-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
              <AttachMoney fontSize="small" />
            </div>
            <h3 className="text-slate-600 font-semibold text-sm uppercase tracking-wider">Total Paid</h3>
          </div>
          <h2 className="text-3xl font-bold text-green-700 ml-13">LKR {totalPaid.toLocaleString()}</h2>
        </div>

        <div className="bg-red-50/50 border border-red-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0">
              <Payment fontSize="small" />
            </div>
            <h3 className="text-slate-600 font-semibold text-sm uppercase tracking-wider">Pending</h3>
          </div>
          <h2 className="text-3xl font-bold text-red-600 ml-13">LKR {totalPending.toLocaleString()}</h2>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shrink-0">
              <History fontSize="small" />
            </div>
            <h3 className="text-slate-600 font-semibold text-sm uppercase tracking-wider">Last Payment</h3>
          </div>
          <h2 className="text-2xl font-bold text-primary-dark mt-1 ml-13">{lastPaymentDate}</h2>
        </div>
      </div>

      {/* --- 2. TRANSACTIONS TABLE --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search fontSize="small" />
              </div>
              <input 
                  type="text" 
                  placeholder="Search by description or dentist..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="w-full sm:w-48 shrink-0">
              <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
              >
                  <option value="All">All Status</option>
                  <option value="COMPLETED">Paid</option>
                  <option value="PENDING">Pending</option>
              </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-xl">Date</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Dentist</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredPayments.map((row) => (
                <tr 
                    key={row.paymentId} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetails(row)}
                >
                  <td className="px-4 py-4 text-slate-500">{dayjs(row.paymentDate).format('MMM D, YYYY')}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-800">{getDescription(row)}</p>
                    <p className="text-xs text-slate-500">
                        {row.paymentType === 'BOOKING_FEE' ? 'Online Booking' : 'Clinic Service'}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{getDentistName(row)}</td>
                  <td className="px-4 py-4 font-bold text-slate-700">LKR {row.amount?.toLocaleString()}</td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="flex items-center space-x-2">
                       {row.paymentType === 'BOOKING_FEE' ? <CreditCard fontSize="small" className="text-slate-400" /> : <AttachMoney fontSize="small" className="text-slate-400" />}
                       <span>{row.paymentType === 'BOOKING_FEE' ? 'Online' : 'Cash/Card at Clinic'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                     <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${row.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-800'}`}>
                        {row.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                     </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {row.status === 'COMPLETED' ? (
                        <button 
                            className="p-2 text-primary hover:bg-primary-light/20 rounded-full transition-colors focus:outline-none"
                            onClick={(e) => generateReceiptPDF(e, row)}
                            title="Download Receipt"
                        >
                            <ReceiptLong fontSize="small" />
                        </button>
                    ) : (
                      <button 
                        className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-1.5 rounded-full text-xs font-bold transition-colors focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); alert(`Redirecting to payment gateway for LKR ${row.amount}`); }}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 3. PAYMENT DETAILS MODAL --- */}
      {openModal && selectedPayment && (
          ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="bg-primary-dark text-white px-6 py-4 flex justify-between items-center shrink-0">
                     <h3 className="text-lg font-bold font-poppins">Transaction Details</h3>
                     <button onClick={() => setOpenModal(false)} className="text-white/80 hover:text-white transition-colors focus:outline-none">
                         <Close />
                     </button>
                 </div>
                 
                 <div className="p-6 overflow-y-auto flex-grow space-y-6">
                     {/* Header Info */}
                     <div className="text-center">
                         <h2 className={`text-4xl font-bold ${selectedPayment.status === 'COMPLETED' ? 'text-primary' : 'text-slate-800'}`}>
                             LKR {selectedPayment.amount?.toLocaleString()}
                         </h2>
                         <div className="mt-3 inline-block">
                             <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${selectedPayment.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                 {selectedPayment.status === 'COMPLETED' ? 'Successfully Paid' : 'Payment Pending'}
                             </span>
                         </div>
                     </div>
 
                     <hr className="border-slate-100" />
 
                     {/* Transaction Details */}
                     <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                         <div>
                             <p className="text-slate-500 font-semibold mb-1">Transaction ID</p>
                             <p className="font-bold text-slate-800">#TXN-00{selectedPayment.paymentId}</p>
                         </div>
                         <div>
                             <p className="text-slate-500 font-semibold mb-1">Date &amp; Time</p>
                             <p className="font-bold text-slate-800">
                                 {dayjs(selectedPayment.paymentDate).format('MMM D, YYYY h:mm A')}
                             </p>
                         </div>
                         <div className="col-span-2">
                             <p className="text-slate-500 font-semibold mb-1">Description</p>
                             <p className="font-bold text-slate-800">{getDescription(selectedPayment)}</p>
                         </div>
                         <div>
                             <p className="text-slate-500 font-semibold mb-1">Attending Doctor</p>
                             <p className="font-bold text-slate-800">{getDentistName(selectedPayment)}</p>
                         </div>
                         <div>
                             <p className="text-slate-500 font-semibold mb-1">Payment Method</p>
                             <p className="font-bold text-slate-800">
                                 {selectedPayment.paymentType === 'BOOKING_FEE' ? 'Online / Credit Card' : 'Settled at Clinic'}
                             </p>
                         </div>
                     </div>
 
                     {/* Contextual Box based on type */}
                     {selectedPayment.paymentType === 'BOOKING_FEE' && selectedPayment.appointment && (
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <h4 className="font-bold text-primary-dark mb-2 text-sm uppercase tracking-wider">Associated Appointment</h4>
                             <div className="space-y-1 text-sm text-slate-600">
                                 <p><span className="font-semibold text-slate-700">Date:</span> {selectedPayment.appointment.appointmentDate}</p>
                                 <p><span className="font-semibold text-slate-700">Time:</span> {selectedPayment.appointment.appointmentTime}</p>
                                 <p><span className="font-semibold text-slate-700">Reason:</span> {selectedPayment.appointment.reasonForVisit}</p>
                             </div>
                         </div>
                     )}
                 </div>
                 
                 <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 space-x-3">
                     <button 
                         onClick={() => setOpenModal(false)}
                         className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors focus:outline-none"
                     >
                         Close
                     </button>
                     {selectedPayment?.status === 'COMPLETED' && (
                         <button 
                            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors focus:outline-none block"
                            onClick={(e) => generateReceiptPDF(e, selectedPayment)}
                         >
                             <ReceiptLong fontSize="small" />
                             <span>Download Receipt</span>
                         </button>
                     )}
                 </div>
             </div>
          </div>, document.body)
      )}

    </div>
  );
};

export default PaymentHistory;