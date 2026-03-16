import React, { useState, useEffect } from 'react';
import { 
  Search, FilterList, PictureAsPdf, Visibility, RestartAlt, EventNote 
} from '@mui/icons-material';
import axios from '../../api/axios';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null); // Tracks which PDF is loading
  
  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    id: '',
    startDate: '', // Used for "Last Visit From"
    endDate: ''    // Used for "Last Visit To"
  });

  // --- 1. FETCH SUMMARIES ---
  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const res = await axios.get('/admin/reports/summaries');
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching report summaries:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLERS ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ name: '', id: '', startDate: '', endDate: '' });
  };

  // Filter Logic
  const filteredRecords = records.filter(row => {
    const matchesName = row.patientName?.toLowerCase().includes(filters.name.toLowerCase());
    const matchesId = row.patientId?.toString().includes(filters.id);
    const matchesStart = filters.startDate && row.lastVisitDate ? row.lastVisitDate >= filters.startDate : true;
    const matchesEnd = filters.endDate && row.lastVisitDate ? row.lastVisitDate <= filters.endDate : true;

    return matchesName && matchesId && matchesStart && matchesEnd;
  });

  // --- 3. GENERATE FULL PDF REPORT ---
  const handleGenerateReport = async (patientId, patientName) => {
    setGeneratingId(patientId);
    
    try {
      // Fetch the deep-dive data for this specific patient
      const res = await axios.get(`/admin/reports/patient/${patientId}`);
      const reportData = res.data;

      const doc = new jsPDF();
      
      // -- HEADER --
      doc.setFontSize(22);
      doc.setTextColor(26, 35, 126); // #1A237E
      doc.setFont("helvetica", "bold");
      doc.text('Doctor C Dental Clinic', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text('Comprehensive Patient History Report', 14, 30);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 35, 196, 35);

      // -- PATIENT DETAILS --
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text('Patient Information', 14, 45);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${reportData.patientName}`, 14, 53);
      doc.text(`Patient ID: #PT-${reportData.patientId}`, 14, 60);
      doc.text(`Phone: ${reportData.contactNumber || 'N/A'}`, 120, 53);
      doc.text(`Email: ${reportData.email || 'N/A'}`, 120, 60);

      // -- APPOINTMENT HISTORY TABLE --
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text('Appointment History', 14, 75);

      const appBody = (reportData.appointmentHistory || []).map(app => [
        app.date ? dayjs(app.date).format('MMM D, YYYY') : 'N/A',
        app.time || 'N/A',
        app.dentistName || 'N/A',
        app.treatmentDescription || 'General Visit',
        app.status || 'N/A'
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['Date', 'Time', 'Dentist', 'Description', 'Status']],
        body: appBody.length > 0 ? appBody : [['No appointments found', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 4 },
      });

      // -- PAYMENT HISTORY TABLE --
      const finalY = doc.lastAutoTable.finalY || 80;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text('Payment History', 14, finalY + 15);

      const payBody = (reportData.paymentHistory || []).map(pay => [
        pay.paymentDate ? dayjs(pay.paymentDate).format('MMM D, YYYY') : 'N/A',
        `#TXN-${pay.paymentId}`,
        pay.description || 'Payment',
        pay.status || 'N/A',
        `LKR ${pay.amount?.toLocaleString() || 0}`
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Date', 'Transaction ID', 'Description', 'Status', 'Amount']],
        body: payBody.length > 0 ? payBody : [['No payments found', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50], textColor: 255 }, // Green header for finance
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
      });

      // -- TOTAL SUMMARY --
      const totalSpent = (reportData.paymentHistory || [])
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const lastY = doc.lastAutoTable.finalY || finalY + 20;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Lifetime Value (Paid): LKR ${totalSpent.toLocaleString()}`, 14, lastY + 15);

      // Generate & Download
      const fileName = `Patient_Report_${patientName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGeneratingId(null);
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
          Patient Reports
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          View high-level patient summaries and generate comprehensive history reports.
        </p>
      </div>

      {/* 1. FILTER SECTION */}
      <div className="bg-white p-6 mb-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2 mb-6 text-slate-600">
           <FilterList fontSize="small" />
           <h2 className="text-lg font-bold text-slate-800">Filter Patients</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-10 gap-4 items-end">
          {/* Search by Name */}
          <div className="md:col-span-2 lg:col-span-3">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Name</label>
             <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search fontSize="small" />
                 </div>
                 <input 
                   type="text" 
                   name="name" 
                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium text-slate-800"
                   value={filters.name}
                   onChange={handleFilterChange}
                   placeholder="Search name..."
                 />
             </div>
          </div>
          
          {/* Search by ID */}
          <div className="md:col-span-2 lg:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient ID</label>
             <input 
               type="text" 
               name="id" 
               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium text-slate-800"
               value={filters.id}
               onChange={handleFilterChange}
               placeholder="e.g. 12"
             />
          </div>

          {/* Date Range (Last Visit) */}
          <div className="md:col-span-2 lg:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Visit (From)</label>
             <input 
               type="date" 
               name="startDate" 
               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium text-slate-800 uppercase tracking-wider"
               value={filters.startDate}
               onChange={handleFilterChange}
             />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Visit (To)</label>
             <input 
               type="date" 
               name="endDate" 
               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium text-slate-800 uppercase tracking-wider"
               value={filters.endDate}
               onChange={handleFilterChange}
             />
          </div>

          {/* Reset Button */}
          <div className="md:col-span-4 lg:col-span-1 flex space-x-2">
             <button 
                onClick={handleReset}
                className="flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors focus:outline-none"
                title="Reset Filters"
             >
                <RestartAlt fontSize="small" />
             </button>
          </div>
        </div>
      </div>

      {/* 2. REPORT SUMMARY TABLE */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
        <div className="bg-[#1A237E]/5 px-6 py-4 flex justify-between items-center border-b border-slate-200">
           <h3 className="text-lg font-bold text-[#1A237E]">Patient Directory & Summaries</h3>
           <p className="text-sm font-semibold text-slate-500">
             Showing {filteredRecords.length} records
           </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Contact Info</th>
                <th className="p-4 font-bold text-center">Total Visits</th>
                <th className="p-4 font-bold text-center">Last Visit</th>
                <th className="p-4 font-bold">Total Revenue</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => (
                <tr key={row.patientId} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Patient Info */}
                  <td className="p-4 align-middle">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-[#1A237E]">
                        {row.patientName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{row.patientName}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">#PT-{row.patientId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="p-4 align-middle text-sm font-medium text-slate-600">
                    {row.contactNumber || 'No phone recorded'}
                  </td>

                  {/* Total Visits */}
                  <td className="p-4 align-middle text-center">
                    <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-lg whitespace-nowrap">
                        {row.totalAppointments} Appts
                    </span>
                  </td>

                  {/* Last Visit */}
                  <td className="p-4 align-middle text-center text-sm font-medium text-slate-600">
                    {row.lastVisitDate ? (
                        <div className="flex items-center justify-center text-slate-700">
                           <EventNote fontSize="inherit" className="mr-1.5 text-slate-400" />
                           {dayjs(row.lastVisitDate).format('MMM D, YYYY')}
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs italic">Never visited</span>
                    )}
                  </td>

                  {/* Total Revenue */}
                  <td className="p-4 align-middle font-bold text-green-700 text-sm">
                    LKR {row.totalSpent?.toLocaleString() || 0}
                  </td>

                  {/* Actions */}
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center space-x-2">
                       <button 
                         className="flex items-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#1A237E] font-bold text-xs hover:bg-[#1A237E] hover:text-white hover:border-[#1A237E] transition-all focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                         onClick={() => handleGenerateReport(row.patientId, row.patientName)}
                         disabled={generatingId === row.patientId}
                         title="Download Complete History"
                       >
                         {generatingId === row.patientId ? (
                             <div className="w-4 h-4 border-2 border-[#1A237E] border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                             <>
                               <PictureAsPdf fontSize="inherit" className="mr-1.5" />
                               Full Report
                             </>
                         )}
                       </button>
                    </div>
                  </td>

                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No patient records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;