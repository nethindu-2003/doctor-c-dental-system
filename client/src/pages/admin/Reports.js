import React, { useState } from 'react';
import { 
  Search, FilterList, PictureAsPdf, Visibility, RestartAlt 
} from '@mui/icons-material';

// --- MOCK DATA (Based on Prototype Page 7) ---
const initialRecords = [
  { 
    id: 1, 
    patientName: 'Sophia Clark', 
    patientId: '#12345', 
    treatment: 'Root Canal', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-01-15', 
    endDate: '2024-02-15', 
    sessions: '3 / 3', 
    status: 'Completed', 
    amount: 1500 
  },
  { 
    id: 2, 
    patientName: 'Ethan Miller', 
    patientId: '#67890', 
    treatment: 'Whitening', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-03-01', 
    endDate: '2024-03-15', 
    sessions: '2 / 2', 
    status: 'Completed', 
    amount: 500 
  },
  { 
    id: 3, 
    patientName: 'Olivia Davis', 
    patientId: '#11223', 
    treatment: 'Braces', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-04-01', 
    endDate: '2025-04-01', 
    sessions: '1 / 12', 
    status: 'Ongoing', 
    amount: 4000 
  },
  { 
    id: 4, 
    patientName: 'Liam Wilson', 
    patientId: '#44556', 
    treatment: 'Cleaning', 
    dentist: 'Dr. Emily Carter', 
    startDate: '2024-05-10', 
    endDate: '2024-05-10', 
    sessions: '1 / 1', 
    status: 'Completed', 
    amount: 150 
  },
];

const AdminReports = () => {
  const [records, setRecords] = useState(initialRecords);
  
  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    id: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ name: '', id: '', startDate: '', endDate: '' });
  };

  // Filter Logic
  const filteredRecords = records.filter(row => {
    const matchesName = row.patientName.toLowerCase().includes(filters.name.toLowerCase());
    const matchesId = row.patientId.toLowerCase().includes(filters.id.toLowerCase());
    const matchesStart = filters.startDate ? row.startDate >= filters.startDate : true;
    const matchesEnd = filters.endDate ? row.startDate <= filters.endDate : true;

    return matchesName && matchesId && matchesStart && matchesEnd;
  });

  const handleGenerateReport = (patientName) => {
    alert(`Generating PDF Report for ${patientName}...`);
    // In real app: trigger backend PDF generation
  };

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#1A237E] mb-2">
          Patient Treatment Reports
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Filter, view, and generate reports of all patient treatments.
        </p>
      </div>

      {/* 1. FILTER SECTION */}
      <div className="bg-white p-6 mb-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2 mb-6 text-slate-600">
           <FilterList fontSize="small" />
           <h2 className="text-lg font-bold text-slate-800">Filter Options</h2>
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
             />
          </div>

          {/* Date Range */}
          <div className="md:col-span-2 lg:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From</label>
             <input 
               type="date" 
               name="startDate" 
               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium text-slate-800 uppercase tracking-wider"
               value={filters.startDate}
               onChange={handleFilterChange}
             />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To</label>
             <input 
               type="date" 
               name="endDate" 
               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all text-sm font-medium text-slate-800 uppercase tracking-wider"
               value={filters.endDate}
               onChange={handleFilterChange}
             />
          </div>

          {/* Buttons */}
          <div className="md:col-span-4 lg:col-span-1 flex space-x-2">
             <button 
                onClick={handleReset}
                className="flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors focus:outline-none"
             >
                <RestartAlt fontSize="small" />
             </button>
          </div>
        </div>
      </div>

      {/* 2. REPORT TABLE */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
        <div className="bg-[#1A237E]/5 px-6 py-4 flex justify-between items-center border-b border-slate-200">
           <h3 className="text-lg font-bold text-[#1A237E]">Treatment Records</h3>
           <p className="text-sm font-semibold text-slate-500">
             Showing {filteredRecords.length} records
           </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Treatment Details</th>
                <th className="p-4 font-bold">Dates</th>
                <th className="p-4 font-bold text-center">Progress</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Patient Info */}
                  <td className="p-4 align-middle">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-[#1A237E]">
                        {row.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{row.patientName}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{row.patientId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Treatment Info */}
                  <td className="p-4 align-middle">
                    <p className="font-semibold text-slate-800 text-sm">{row.treatment}</p>
                    <p className="text-xs font-semibold text-slate-500">{row.dentist}</p>
                  </td>

                  {/* Dates */}
                  <td className="p-4 align-middle text-[0.8rem] text-slate-600 font-medium">
                    <p><span className="text-slate-400 mr-1">Start:</span>{row.startDate}</p>
                    <p><span className="text-slate-400 mr-1">End:</span>{row.endDate}</p>
                  </td>

                  {/* Sessions */}
                  <td className="p-4 align-middle text-center">
                    <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm whitespace-nowrap">
                        {row.sessions} Sessions
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4 align-middle text-center">
                    <span className={`inline-block px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-100 text-[#1A237E] border border-blue-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="p-4 align-middle font-bold text-slate-800 text-sm">
                    Rs. {row.amount?.toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center space-x-2">
                       <button 
                         className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
                         title="View Details"
                       >
                          <Visibility fontSize="small" />
                       </button>
                       <button 
                         className="flex items-center px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none"
                         onClick={() => handleGenerateReport(row.patientName)}
                         title="Generate PDF Report"
                       >
                         <PictureAsPdf fontSize="inherit" className="mr-1" />
                         Report
                       </button>
                    </div>
                  </td>

                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No records found matching filters.
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