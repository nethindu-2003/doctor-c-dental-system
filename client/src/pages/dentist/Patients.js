import React, { useState, useEffect } from 'react';
import { 
  Search, Visibility, Assessment, Phone, Email, Close, MedicalServices, 
  AssignmentTurnedIn, LocalHospital
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Ensure correct autotable import

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/dentist/patients');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleRowClick = async (patient) => {
    setSelectedPatient(patient);
    setOpenModal(true);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`/dentist/patients/${patient.patientId}/history`);
      setTreatmentHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- PDF GENERATION LOGIC ---
  const handleGeneratePDF = async (e, patient) => {
    if (e) e.stopPropagation(); // Prevents opening the row modal if clicked from the table

    let historyToPrint = [];

    // If we already opened this patient's modal, we have the history.
    // Otherwise, we need to fetch it specifically for the PDF.
    if (selectedPatient?.patientId === patient.patientId && treatmentHistory.length > 0) {
      historyToPrint = treatmentHistory;
    } else {
      try {
        const res = await axios.get(`/dentist/patients/${patient.patientId}/history`);
        historyToPrint = res.data;
      } catch (err) {
        console.error("Error fetching history for PDF", err);
        alert("Failed to load patient records for the report.");
        return;
      }
    }

    generatePatientReport(patient, historyToPrint);
  };

  const generatePatientReport = (patient, history) => {
    const doc = new jsPDF();

    // 1. Clinic Header
    doc.setFontSize(22);
    doc.setTextColor(14, 76, 92); // #0E4C5C
    doc.setFont("helvetica", "bold");
    doc.text('Doctor C Dental Clinic', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text('No 20, Circular Road, Devinuwara, Sri Lanka', 14, 30);
    doc.text('Phone: +94 70 513 9901 | Email: doctorcdentalsurgery@gmail.com', 14, 35);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    // 2. Report Title & Patient Info
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('PATIENT MEDICAL REPORT', 105, 55, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Patient Name:`, 14, 70);
    doc.setFont("helvetica", "bold");
    doc.text(`${patient.name}`, 45, 70);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Patient ID:`, 14, 78);
    doc.text(`#PT-${patient.patientId}`, 45, 78);

    doc.text(`Email:`, 120, 70);
    doc.text(`${patient.email || 'N/A'}`, 140, 70);
    
    doc.text(`Phone:`, 120, 78);
    doc.text(`${patient.phone || 'N/A'}`, 140, 78);

    // 3. Separate Treatments by Status
    const ongoingTreatments = history.filter(t => t.status === 'ONGOING' || t.status === 'IN_PROGRESS');
    const completedTreatments = history.filter(t => t.status === 'COMPLETED');

    let currentY = 95;

    // --- ONGOING TREATMENTS SECTION ---
    doc.setFontSize(14);
    doc.setTextColor(14, 76, 92);
    doc.setFont("helvetica", "bold");
    doc.text('Ongoing Treatments', 14, currentY);
    
    if (ongoingTreatments.length > 0) {
      const ongoingRows = ongoingTreatments.map(t => [
        t.treatmentName,
        t.diagnosis || 'N/A',
        `Dr. ${t.dentistName}`,
        t.startDate ? dayjs(t.startDate).format('MMM D, YYYY') : '-',
        `${t.sessions?.length || 0} session(s)`
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Procedure', 'Diagnosis', 'Assigned Dentist', 'Started On', 'Progress']],
        body: ongoingRows,
        theme: 'striped',
        headStyles: { fillColor: [14, 76, 92], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 4 }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      doc.text('No ongoing treatments found.', 14, currentY + 8);
      currentY += 20;
    }

    // --- COMPLETED TREATMENTS SECTION ---
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50); // Green color for completed
    doc.setFont("helvetica", "bold");
    doc.text('Completed Treatments', 14, currentY);

    if (completedTreatments.length > 0) {
      const completedRows = completedTreatments.map(t => [
        t.treatmentName,
        t.diagnosis || 'N/A',
        `Dr. ${t.dentistName}`,
        t.endDate ? dayjs(t.endDate).format('MMM D, YYYY') : (t.startDate ? dayjs(t.startDate).format('MMM D, YYYY') : '-'),
        t.cost ? `LKR ${t.cost.toLocaleString()}` : 'N/A'
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Procedure', 'Diagnosis', 'Attending Dentist', 'Completed On', 'Total Cost']],
        body: completedRows,
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 4 }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      doc.text('No completed treatments found.', 14, currentY + 8);
    }

    // 4. Footer
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
    doc.save(`Patient_Report_${patient.name.replace(/\s+/g, '_')}.pdf`);
  };

  // --- FILTER LOGIC ---
  const filteredPatients = patients.filter((p) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId?.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto print:hidden">
      
      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#0E4C5C] mb-2">Patient Directory</h1>
           <p className="text-slate-500 text-sm md:text-base">Review clinical records and medical history.</p>
        </div>
        
        <div className="relative w-full sm:w-auto min-w-[300px]">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search fontSize="small" />
           </div>
           <input
             type="text"
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm shadow-sm"
             placeholder="Search by name or ID..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* --- PATIENT TABLE --- */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
        {loading ? (
             <div className="flex justify-center items-center h-64">
                 <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
             </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Patient Details</th>
                  <th className="p-4 font-bold">Patient ID</th>
                  <th className="p-4 font-bold">Contact Info</th>
                  <th className="p-4 font-bold">Current Treatment</th>
                  <th className="p-4 font-bold">Last Visit</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr 
                    key={patient.patientId} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(patient)}
                  >
                    
                    {/* Name & Avatar */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#0E4C5C] text-white flex items-center justify-center font-bold shadow-sm shrink-0 overflow-hidden">
                           {patient.profilePicture ? (
                               <img src={patient.profilePicture} alt={patient.name} className="w-full h-full object-cover" />
                           ) : (
                               patient.name ? patient.name.charAt(0).toUpperCase() : 'P'
                           )}
                        </div>
                        <p className="font-bold text-[#0E4C5C] truncate max-w-[150px]">
                          {patient.name}
                        </p>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="p-4 align-middle">
                      <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm">
                          #PT-{patient.patientId}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="p-4 align-middle">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-slate-500">
                          <Email fontSize="inherit" className="mr-2 text-[14px]" />
                          <span className="text-xs font-medium truncate max-w-[150px]">{patient.email}</span>
                        </div>
                        <div className="flex items-center text-slate-500">
                          <Phone fontSize="inherit" className="mr-2 text-[14px]" />
                          <span className="text-xs font-medium">{patient.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Treatment */}
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center px-3 py-1.5 bg-[#E0F2F1] text-[#00695C] text-xs font-bold rounded-lg truncate max-w-[200px]">
                          <MedicalServices fontSize="inherit" className="mr-1.5 text-[14px]" />
                          <span className="truncate">{patient.currentTreatment || 'None'}</span>
                      </span>
                    </td>

                    {/* Last Visit */}
                    <td className="p-4 align-middle">
                      <p className="font-medium text-slate-700 text-sm">
                        {patient.lastVisit !== 'Never' && patient.lastVisit ? dayjs(patient.lastVisit).format('MMM D, YYYY') : 'No Visits'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-middle text-center">
                      <div className="flex items-center justify-center space-x-2">
                          <button 
                             className="p-1.5 rounded-lg text-[#0E4C5C] bg-[#E0F7FA] hover:bg-cyan-100 transition-colors focus:outline-none shadow-sm"
                             title="View Medical Profile"
                             onClick={(e) => { e.stopPropagation(); handleRowClick(patient); }}
                          >
                            <Visibility fontSize="small" />
                          </button>
                          
                          <button 
                            className="flex items-center px-3 py-1.5 rounded-lg border border-[#B0BEC5] text-[#455A64] hover:bg-slate-50 transition-colors focus:outline-none text-xs font-semibold shadow-sm"
                            onClick={(e) => handleGeneratePDF(e, patient)}
                            title="Download PDF Report"
                          >
                            <Assessment fontSize="small" className="mr-1.5 text-[14px]" />
                            Report
                          </button>
                      </div>
                    </td>

                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-500 font-medium bg-slate-50/50">
                          No patient records found.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- PATIENT DOSSIER MODAL --- */}
      {openModal && selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in print:hidden">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="bg-[#0E4C5C] px-6 py-4 flex justify-between items-center text-white shrink-0">
                      <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-white text-[#0E4C5C] flex items-center justify-center font-bold text-xl shadow-lg shrink-0 overflow-hidden">
                              {selectedPatient.profilePicture ? (
                                  <img src={selectedPatient.profilePicture} alt={selectedPatient.name} className="w-full h-full object-cover" />
                              ) : (
                                  selectedPatient.name?.charAt(0).toUpperCase()
                              )}
                          </div>
                          <div>
                              <h2 className="text-xl font-bold font-poppins">{selectedPatient.name}</h2>
                              <p className="text-white/80 text-sm font-medium">Patient ID: #PT-{selectedPatient.patientId}</p>
                          </div>
                      </div>
                      <button 
                         onClick={() => setOpenModal(false)}
                         className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none"
                      >
                         <Close />
                      </button>
                  </div>
                  
                  {/* Body */}
                  <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-slate-50">
                      
                      {/* Contact Overview Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Email</p>
                              <p className="text-slate-800 font-bold text-lg">{selectedPatient.email}</p>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</p>
                              <p className="text-slate-800 font-bold text-lg">{selectedPatient.phone || 'Not Provided'}</p>
                          </div>
                      </div>

                      <div className="flex items-center justify-center mb-8 relative">
                          <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative bg-slate-50 px-4">
                              <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold shadow-sm">
                                  Clinical Treatment History
                              </span>
                          </div>
                      </div>

                      {/* Treatment History Timeline */}
                      {historyLoading ? (
                          <div className="flex justify-center py-10">
                              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
                          </div>
                      ) : (
                          <div>
                              {treatmentHistory.length > 0 ? (
                                  <div className="space-y-6">
                                      {treatmentHistory.map((treatment) => (
                                          <div key={treatment.treatmentId} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-[#0E4C5C]">
                                              
                                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                                  <h3 className="text-lg font-bold text-[#0E4C5C] flex items-center">
                                                      <LocalHospital fontSize="small" className="mr-2 opacity-80" />
                                                      {treatment.treatmentName}
                                                  </h3>
                                                  <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border w-max ${
                                                      treatment.status === 'COMPLETED' 
                                                          ? 'bg-green-100 text-green-700 border-green-200' 
                                                          : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                  }`}>
                                                      {treatment.status === 'IN_PROGRESS' ? 'ONGOING' : treatment.status}
                                                  </span>
                                              </div>
                                              
                                              <p className="text-sm text-slate-600 mb-6 font-medium">Assigned Dentist: <span className="font-bold text-slate-800">Dr. {treatment.dentistName}</span></p>
                                              
                                              {/* Nested Sessions */}
                                              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Notes</p>
                                                  
                                                  {treatment.sessions?.length > 0 ? (
                                                      <div className="space-y-4">
                                                          {treatment.sessions.map((session, idx) => (
                                                              <div key={idx} className={`flex flex-col sm:flex-row gap-2 sm:gap-6 pb-4 ${idx !== treatment.sessions.length - 1 ? 'border-b border-dashed border-slate-200' : 'pb-0'}`}>
                                                                  <div className="sm:w-32 shrink-0">
                                                                      <p className="text-sm font-bold text-[#0E4C5C]">
                                                                          {dayjs(session.sessionDate).format('MMM D, YYYY')}
                                                                      </p>
                                                                  </div>
                                                                  <div className="flex-grow">
                                                                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                                          {session.note || session.notes || 'No clinical notes recorded.'}
                                                                      </p>
                                                                  </div>
                                                              </div>
                                                          ))}
                                                      </div>
                                                  ) : (
                                                      <p className="text-sm font-medium text-slate-500 italic">No active sessions logged yet.</p>
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <AssignmentTurnedIn className="text-slate-300" style={{ fontSize: 40 }} />
                                      </div>
                                      <h3 className="text-xl font-bold text-slate-700 mb-2">No Medical History Found</h3>
                                      <p className="text-slate-500 max-w-sm mx-auto">This patient has not undergone any recorded treatments yet.</p>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
                  
                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-white flex justify-end items-center gap-3 shrink-0">
                     <button 
                         onClick={() => setOpenModal(false)}
                         className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors focus:outline-none"
                     >
                         Close Dossier
                     </button>
                     <button 
                         onClick={(e) => handleGeneratePDF(e, selectedPatient)}
                         className="px-6 py-2.5 rounded-xl bg-[#0E4C5C] text-white font-bold hover:bg-[#0a3541] focus:ring-4 focus:ring-[#0E4C5C]/30 transition-all shadow-md flex items-center"
                     >
                         <Assessment fontSize="small" className="mr-2" />
                         Print PDF Report
                     </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Patients;