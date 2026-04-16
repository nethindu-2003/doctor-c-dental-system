import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Search, CheckCircle, RadioButtonUnchecked, 
  MedicalServices, Assignment, Close, PictureAsPdf
} from '@mui/icons-material';
import axios from '../../api/axios'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const TreatmentHistory = () => {
  const [treatments, setTreatments] = useState([]);
  const [activeTreatment, setActiveTreatment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Modal State
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const res = await axios.get('/patient/treatments');
      const allTreatments = res.data;
      setTreatments(allTreatments);

      const active = allTreatments.find(t => t.status === 'IN_PROGRESS' || t.status === 'ONGOING');
      setActiveTreatment(active);
    } catch (err) {
      console.error("Error fetching treatments:", err);
    }
  };

  const calculateProgress = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.status === 'COMPLETED').length;
    return Math.round((completed / sessions.length) * 100);
  };

  const filteredHistory = treatments.filter(item => 
    (filterType === 'All' || item.status === filterType) &&
    (item.treatmentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (item.diagnosis && item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleViewDetails = (treatment) => {
    setSelectedTreatment(treatment);
    setOpenModal(true);
  };

  // --- PDF GENERATION LOGIC ---
  const generatePDF = (treatment) => {
    const doc = new jsPDF();

    // 1. Clinic Header
    doc.setFontSize(22);
    doc.setTextColor(14, 76, 92); // Primary Clinic Color (#0E4C5C)
    doc.setFont("helvetica", "bold");
    doc.text('Doctor C Dental Clinic', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text('123 Smile Avenue, Colombo, Sri Lanka', 14, 30);
    doc.text('Phone: +94 11 234 5678 | Email: contact@doctorcdental.com', 14, 35);

    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    // 2. Report Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('Treatment Record', 105, 55, { align: 'center' });

    // 3. Treatment Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // Left Column
    doc.text(`Treatment Name:`, 14, 70);
    doc.setFont("helvetica", "bold");
    doc.text(`${treatment.treatmentName}`, 48, 70);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Diagnosis:`, 14, 78);
    doc.text(`${treatment.diagnosis || 'N/A'}`, 48, 78);
    
    doc.text(`Status:`, 14, 86);
    doc.text(`${treatment.status === 'IN_PROGRESS' || treatment.status === 'ONGOING' ? 'In Progress' : 'Completed'}`, 48, 86);

    // Right Column
    doc.text(`Start Date:`, 120, 70);
    doc.text(`${dayjs(treatment.startDate).format('MMM D, YYYY')}`, 145, 70);
    
    doc.text(`Total Cost:`, 120, 78);
    doc.text(`LKR ${treatment.cost ? treatment.cost.toLocaleString() : '0.00'}`, 145, 78);

    // 4. Session Breakdown Table
    if (treatment.sessions && treatment.sessions.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text('Session Breakdown', 14, 105);

      const tableColumn = ["Date", "Session Name", "Notes", "Status", "Cost"];
      const tableRows = [];

      treatment.sessions.forEach(session => {
        const sessionData = [
          session.sessionDate ? dayjs(session.sessionDate).format('MMM D, YYYY') : 'TBD',
          session.sessionName,
          session.note || '-',
          session.status,
          `LKR ${session.cost ? session.cost.toLocaleString() : '0'}`
        ];
        tableRows.push(sessionData);
      });

      doc.autoTable({
        startY: 110,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [14, 76, 92], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
    } else {
       doc.setFontSize(10);
       doc.setFont("helvetica", "italic");
       doc.text('No sessions have been recorded for this treatment yet.', 14, 105);
    }

    // 5. Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on ${dayjs().format('MMMM D, YYYY at h:mm A')}  |  Page ${i} of ${pageCount}`, 
        105, 
        285, 
        { align: 'center' }
      );
    }

    // Download the PDF
    doc.save(`DoctorC_${treatment.treatmentName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const CustomTimeline = ({ sessions }) => {
    if (!sessions || sessions.length === 0) return <p className="text-sm text-slate-500 mt-4 ml-2">No sessions yet.</p>;
    return (
      <div className="relative border-l-2 border-slate-200 ml-3 mt-6">
        {sessions.map((step, index) => (
          <div key={step.sessionId || index} className="mb-6 ml-6 relative">
            <span className={`absolute -left-[35px] flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 ${step.status === 'COMPLETED' ? 'border-green-500 text-green-500' : 'border-slate-300 text-slate-300'}`}>
              {step.status === 'COMPLETED' ? <CheckCircle style={{ fontSize: 16 }} /> : <RadioButtonUnchecked style={{ fontSize: 16 }} />}
            </span>
            <div className="pl-2">
              <h5 className={`text-sm font-bold ${step.status === 'PENDING' ? 'text-slate-400' : 'text-slate-800'}`}>
                {step.sessionName}
              </h5>
              <p className="text-xs text-slate-500 mt-1">
                {step.sessionDate ? dayjs(step.sessionDate).format('MMM D, YYYY') : 'Date TBD'}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto relative">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-2">
          Treatment History
        </h1>
        <p className="text-slate-500 text-lg">
          View your ongoing progress and download past medical records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SECTION 1: ACTIVE TREATMENT CARD --- */}
        {activeTreatment && (
            <div className="lg:col-span-1">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 h-full shadow-sm">
                  <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-secondary text-primary-dark rounded-2xl flex items-center justify-center shrink-0">
                          <MedicalServices />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-primary-dark leading-tight">Ongoing Treatment</h3>
                          <p className="text-sm text-slate-500 truncate max-w-[200px]" title={activeTreatment.diagnosis}>{activeTreatment.diagnosis}</p>
                      </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-slate-800 mb-4">{activeTreatment.treatmentName}</h4>
                  
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Progress</span>
                      <span className="text-sm font-bold text-primary">{calculateProgress(activeTreatment.sessions)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-8">
                      <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${calculateProgress(activeTreatment.sessions)}%` }}
                      ></div>
                  </div>

                  <CustomTimeline sessions={activeTreatment.sessions} />
              </div>
            </div>
        )}

        {/* --- SECTION 2: HISTORY TABLE --- */}
        <div className={activeTreatment ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search fontSize="small" />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Search procedure or diagnosis..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="w-full sm:w-48 shrink-0">
                  <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none"
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                  >
                      <option value="All">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                  </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Start Date</th>
                    <th className="px-4 py-3 font-semibold">Treatment</th>
                    <th className="px-4 py-3 font-semibold">Diagnosis</th>
                    <th className="px-4 py-3 font-semibold">Cost</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-center rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {filteredHistory.map((row) => (
                    <tr key={row.treatmentId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-slate-500">{dayjs(row.startDate).format('MMM D, YYYY')}</td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-800">{row.treatmentName}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-500 truncate max-w-[150px]" title={row.diagnosis}>{row.diagnosis}</td>
                      <td className="px-4 py-4 text-slate-500">
                          {row.cost ? `LKR ${row.cost.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-4">
                         <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${row.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {row.status === 'IN_PROGRESS' || row.status === 'ONGOING' ? 'In Progress' : 'Completed'}
                         </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                              {/* View Details Button */}
                              <button 
                                title="View Details"
                                className="p-2 text-primary bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors focus:outline-none"
                                onClick={() => handleViewDetails(row)}
                              >
                                  <Assignment fontSize="small" />
                              </button>
                              
                              {/* NEW: Download PDF Button */}
                              <button 
                                title="Download PDF Report"
                                className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors focus:outline-none"
                                onClick={() => generatePDF(row)}
                              >
                                  <PictureAsPdf fontSize="small" />
                              </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* --- POPUP WINDOW (MODAL) FOR DETAILS --- */}
      {openModal && selectedTreatment && (
         ReactDOM.createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-primary-dark text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold font-poppins">Treatment Details</h3>
                    <button onClick={() => setOpenModal(false)} className="text-white/80 hover:text-white transition-colors focus:outline-none">
                        <Close />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Treatment Name</p>
                        <h4 className="text-lg font-bold text-slate-800">{selectedTreatment.treatmentName}</h4>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Diagnosis</p>
                        <p className="text-slate-700">{selectedTreatment.diagnosis || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Start Date</p>
                            <p className="text-slate-700">{dayjs(selectedTreatment.startDate).format('MMM D, YYYY')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">End Date</p>
                            <p className="text-slate-700">{selectedTreatment.endDate ? dayjs(selectedTreatment.endDate).format('MMM D, YYYY') : "Ongoing"}</p>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-4">Session Breakdown</h4>
                        
                        <div className="space-y-3">
                            {selectedTreatment.sessions && selectedTreatment.sessions.length > 0 ? (
                                selectedTreatment.sessions.map((session) => (
                                    <div key={session.sessionId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-bold text-slate-800 text-sm">{session.sessionName}</h5>
                                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                              {session.sessionDate ? dayjs(session.sessionDate).format('MMM D, YYYY') : 'TBD'}
                                            </span>
                                        </div>
                                        {session.note && (
                                            <p className="text-sm text-slate-500 italic mt-1 mb-3 bg-white p-2 border border-slate-100 rounded-lg">
                                                "{session.note}"
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
                                            <span className={`px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider rounded-md ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {session.status}
                                            </span>
                                            {session.cost > 0 && <span className="text-xs font-bold text-slate-700">LKR {session.cost.toLocaleString()}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No sessions recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 gap-3">
                    <button 
                        onClick={() => {
                          setOpenModal(false);
                          generatePDF(selectedTreatment);
                        }}
                        className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl transition-colors flex items-center"
                    >
                        <PictureAsPdf fontSize="small" className="mr-2"/> Download PDF
                    </button>
                    <button 
                        onClick={() => setOpenModal(false)}
                        className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors focus:outline-none"
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

export default TreatmentHistory;