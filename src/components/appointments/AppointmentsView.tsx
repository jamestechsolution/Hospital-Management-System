import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Appointment, AppointmentStatus } from '../../types';
import {
  CalendarDays,
  Search,
  Plus,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  Stethoscope,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { currentBranchId, currentUser, currentRole, navigateToConsultation, showToast } = useApp();

  const [dateFilter, setDateFilter] = useState('2026-09-25');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Form state for booking
  const [patientId, setPatientId] = useState('patient-1');
  const [doctorId, setDoctorId] = useState('staff-doc-1');
  const [time, setTime] = useState('11:00');
  const [reason, setReason] = useState('Follow up check-up');

  const appointments = dbService.getAppointments(currentBranchId);
  const patients = dbService.getPatients(currentBranchId);
  const doctors = dbService.getStaff(currentBranchId).filter((s) => s.role === 'doctor');

  const filteredAppointments = appointments.filter((a) => {
    const matchesDate = dateFilter === 'all' || a.date === dateFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const handleStatusChange = (aptId: string, status: AppointmentStatus) => {
    dbService.updateAppointmentStatus(aptId, status, {
      id: currentUser.id,
      name: currentUser.name,
      role: currentRole,
    });
    showToast(`Appointment marked as ${status.replace('_', ' ')}`, 'success');
  };

  const handleCheckIn = (apt: Appointment) => {
    // 1. Update appointment status
    dbService.updateAppointmentStatus(apt.id, 'checked_in', {
      id: currentUser.id,
      name: currentUser.name,
      role: currentRole,
    });

    // 2. Dispatch to OPD Queue
    const newVisit = dbService.createOPDVisit(
      {
        patientId: apt.patientId,
        patientName: apt.patientName,
        patientMrn: apt.patientMrn,
        doctorId: apt.doctorId,
        doctorName: apt.doctorName,
        branchId: apt.branchId,
        stage: 'triage',
        priority: 'routine',
        arrivalTime: new Date().toISOString(),
        chiefComplaint: apt.reason,
      },
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );

    showToast(`Checked in ${apt.patientName} into OPD Triage (${newVisit.queueNumber})`, 'success');
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find((p) => p.id === patientId) || patients[0];
    const selDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

    dbService.createAppointment(
      {
        patientId: selPatient.id,
        patientName: `${selPatient.firstName} ${selPatient.lastName}`,
        patientMrn: selPatient.mrn,
        doctorId: selDoctor.id,
        doctorName: selDoctor.name,
        departmentId: selDoctor.departmentId,
        departmentName: selDoctor.departmentName,
        branchId: selPatient.branchId,
        date: dateFilter === 'all' ? '2026-09-25' : dateFilter,
        time,
        durationMinutes: 30,
        reason,
        status: 'scheduled',
      },
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );

    showToast(`Appointment booked for ${selPatient.firstName} with ${selDoctor.name}`, 'success');
    setIsBookModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <span>Consultation Appointments Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Booking slots, patient check-in triage dispatch, and doctor clinic calendars
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Date & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold"
          />
          <button
            onClick={() => setDateFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold ${
              dateFilter === 'all' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            All Dates
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No appointments scheduled for selected filters</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {apt.time}
                    </span>
                    <span className="text-[11px] text-slate-400">{apt.durationMinutes} mins</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      apt.status === 'in_consultation'
                        ? 'bg-purple-100 text-purple-800'
                        : apt.status === 'checked_in'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {apt.patientName}
                  </h3>
                  <p className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                    {apt.patientMrn}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>{apt.doctorName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic pl-5">
                    "{apt.reason}"
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {apt.status === 'scheduled' && (
                  <button
                    onClick={() => handleCheckIn(apt)}
                    className="w-full py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Check In & Queue OPD</span>
                  </button>
                )}

                {apt.status === 'checked_in' && (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In to Triage
                  </span>
                )}

                {apt.status === 'scheduled' && (
                  <button
                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    title="Cancel Appointment"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book New Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Book Patient Consultation Slot</h2>
              <button onClick={() => setIsBookModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assign Physician / Specialist</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time Slot</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason for Consultation</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Hypertension management check-up"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
