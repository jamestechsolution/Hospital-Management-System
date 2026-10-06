import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Patient } from '../../types';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Stethoscope,
  MoreVertical,
  Activity,
  Heart,
} from 'lucide-react';
import { PatientRegisterModal } from './PatientRegisterModal';
import { PatientDetailView } from './PatientDetailView';

export const PatientListView: React.FC = () => {
  const { currentBranchId, navigateToPatient, selectedPatientId, navigateToConsultation, currentUser, currentRole, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null);

  const pageSize = 10;
  const allPatients = dbService.getPatients(currentBranchId);

  // Filter
  const filteredPatients = allPatients.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);

    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesBlood = bloodFilter === 'all' || p.bloodGroup === bloodFilter;

    return matchesSearch && matchesGender && matchesBlood;
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    const headers = ['MRN', 'First Name', 'Last Name', 'Gender', 'DOB', 'Blood Group', 'Phone', 'Email', 'City', 'Insurance'];
    const rows = filteredPatients.map((p) => [
      p.mrn,
      p.firstName,
      p.lastName,
      p.gender,
      p.dateOfBirth,
      p.bloodGroup,
      p.phone,
      p.email,
      p.city,
      p.insurance?.provider || 'None',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulsecare_patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported patient list to CSV', 'success');
  };

  const handleQuickAdmit = (p: Patient) => {
    const newVisit = dbService.createOPDVisit(
      {
        patientId: p.id,
        patientName: `${p.firstName} ${p.lastName}`,
        patientMrn: p.mrn,
        doctorId: currentUser.role === 'doctor' ? currentUser.id : 'staff-doc-1',
        doctorName: currentUser.role === 'doctor' ? currentUser.name : 'Dr. Dawit Abebe',
        branchId: p.branchId,
        stage: 'triage',
        priority: 'routine',
        arrivalTime: new Date().toISOString(),
        chiefComplaint: 'Outpatient consultation walk-in',
      },
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );
    showToast(`Admitted ${p.firstName} to OPD queue (${newVisit.queueNumber})`, 'success');
    navigateToConsultation(newVisit.id, p.id);
  };

  if (viewingDetailId) {
    return <PatientDetailView patientId={viewingDetailId} onBack={() => setViewingDetailId(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Patient Electronic Health Records</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredPatients.length} total
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, register and manage clinical charts across branches
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, MRN (e.g. PC-2026-0001), or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => {
              setBloodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Blood Groups</option>
            {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Patient Info</th>
                <th className="py-3 px-4">MRN</th>
                <th className="py-3 px-4">Gender & Age</th>
                <th className="py-3 px-4">Blood</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Insurance</th>
                <th className="py-3 px-4">Allergies</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPatients.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => setViewingDetailId(p.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">{p.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {p.mrn}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    {p.gender}, {2026 - parseInt(p.dateOfBirth.split('-')[0])} yrs
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {p.phone}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      p.insurance?.isInsured ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-slate-400'
                    }`}>
                      {p.insurance?.isInsured ? p.insurance.provider : 'Self Pay'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.allergies && p.allergies.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {p.allergies[0]}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 text-[10px]">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleQuickAdmit(p)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 transition"
                        title="Admit to OPD Queue"
                      >
                        Admit OPD
                      </button>
                      <button
                        onClick={() => setViewingDetailId(p.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Open EMR Chart"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} patients
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Register Modal */}
      <PatientRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(newP) => {
          setViewingDetailId(newP.id);
        }}
      />
    </div>
  );
};
