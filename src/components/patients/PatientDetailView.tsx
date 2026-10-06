import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import {
  User,
  Heart,
  Activity,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  Receipt,
  Plus,
  Clock,
  Printer,
  ChevronLeft,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { VitalsModal } from '../clinical/VitalsModal';
import { PatientVitalsTrend } from '../clinical/PatientVitalsTrend';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patientId, onBack }) => {
  const { currentUser, currentRole, setActiveNav, navigateToConsultation, setPrintableDoc, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'consultations' | 'prescriptions' | 'lab' | 'billing'>('overview');
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  const patient = dbService.getPatientById(patientId);
  const vitals = dbService.getVitalsForPatient(patientId);
  const appointments = dbService.getAppointments().filter((a) => a.patientId === patientId);
  const visits = dbService.getOPDVisits().filter((v) => v.patientId === patientId);
  const prescriptions = dbService.getPrescriptions().filter((p) => p.patientId === patientId);
  const labOrders = dbService.getLabOrders().filter((l) => l.patientId === patientId);
  const invoices = dbService.getInvoices().filter((i) => i.patientId === patientId);

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Patient record not found</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white"
        >
          Return to Patients List
        </button>
      </div>
    );
  }

  const latestVital = vitals[0];

  const handleStartOPDVisit = () => {
    const newVisit = dbService.createOPDVisit(
      {
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientMrn: patient.mrn,
        doctorId: currentUser.role === 'doctor' ? currentUser.id : 'staff-doc-1',
        doctorName: currentUser.role === 'doctor' ? currentUser.name : 'Dr. Dawit Abebe',
        branchId: patient.branchId,
        stage: 'triage',
        priority: 'routine',
        arrivalTime: new Date().toISOString(),
        chiefComplaint: 'Patient walk-in follow up consultation',
      },
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );
    showToast(`Admitted ${patient.firstName} to OPD queue (${newVisit.queueNumber})`, 'success');
    navigateToConsultation(newVisit.id, patient.id);
  };

  const handlePrintSummary = () => {
    setPrintableDoc({
      type: 'patient_summary',
      title: `EMR Summary - ${patient.firstName} ${patient.lastName}`,
      data: {
        patient,
        latestVital,
        prescriptions,
        labOrders,
        invoices,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              title="Back to Patients"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/60">
                  {patient.mrn}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Blood Group: {patient.bloodGroup}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {patient.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {patient.gender.toUpperCase()} • DOB: {patient.dateOfBirth} • Phone: {patient.phone} • {patient.address}, {patient.city}
              </p>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsVitalsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Record Vitals</span>
            </button>
            <button
              onClick={handleStartOPDVisit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Admit to OPD</span>
            </button>
            <button
              onClick={handlePrintSummary}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Print Clinical Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Warning / Alerts bar for Allergies & Chronic Conditions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Allergies:</span>
            {patient.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((allg, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  {allg}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">No known drug allergies</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Chronic Conditions:</span>
            {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
              patient.chronicConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                >
                  {cond}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">None documented</span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Insurance:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {patient.insurance?.isInsured ? `${patient.insurance.provider} (${patient.insurance.coveragePercent}%)` : 'Self Pay'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'vitals', label: `Vital Signs (${vitals.length})`, icon: <Heart className="w-3.5 h-3.5" /> },
          { id: 'consultations', label: `Visits & Consultations (${visits.length})`, icon: <Stethoscope className="w-3.5 h-3.5" /> },
          { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: <Pill className="w-3.5 h-3.5" /> },
          { id: 'lab', label: `Laboratory (${labOrders.length})`, icon: <FlaskConical className="w-3.5 h-3.5" /> },
          { id: 'billing', label: `Billing & Invoices (${invoices.length})`, icon: <Receipt className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview & Timeline */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Historical Vital Signs Recharts Trend Chart */}
          <PatientVitalsTrend
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            vitals={vitals}
            onOpenRecordModal={() => setIsVitalsModalOpen(true)}
            compact
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Vitals Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Latest Physiological Vitals</span>
              </h2>
              <button
                onClick={() => setIsVitalsModalOpen(true)}
                className="text-xs font-semibold text-teal-600 hover:underline"
              >
                + New
              </button>
            </div>

            {latestVital ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Pressure</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">mmHg</span>
                  </p>
                  <span className={`text-[10px] font-bold ${latestVital.status === 'normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {latestVital.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Heart Rate</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {latestVital.heartRate}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">bpm</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Temperature</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {latestVital.temperature}°C
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Oxygen (SpO2)</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {latestVital.spO2}%
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">BMI & Body Index</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {latestVital.bmi} kg/m² ({latestVital.weightKg} kg / {latestVital.heightCm} cm)
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    By {latestVital.recordedByName}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No vitals recorded yet for this patient.
              </div>
            )}
          </div>

          {/* Clinical Timeline (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Comprehensive Patient Care Timeline</span>
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {visits.map((vis) => (
                <div key={vis.id} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-slate-400">{new Date(vis.arrivalTime).toLocaleDateString()}</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Consultation with {vis.doctorName}
                    </p>
                    <p className="text-slate-500 mt-0.5">{vis.chiefComplaint}</p>
                    {vis.diagnosis && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        Dx: {vis.diagnosis}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {labOrders.map((ord) => (
                <div key={ord.id} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-slate-400">{new Date(ord.orderedAt).toLocaleDateString()}</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Diagnostic Laboratory Order ({ord.orderNumber})
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Tests: {ord.tests.map((t) => t.testName).join(', ')} • Status: {ord.status}
                    </p>
                  </div>
                </div>
              ))}

              {prescriptions.map((rx) => (
                <div key={rx.id} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Prescription Dispensed
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {rx.items.map((it) => `${it.medicineName} (${it.quantity})`).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Vitals Tab */}
      {activeTab === 'vitals' && (
        <div className="space-y-4">
          <PatientVitalsTrend
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            vitals={vitals}
            onOpenRecordModal={() => setIsVitalsModalOpen(true)}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Vital Signs Historical Log</h2>
              <button
                onClick={() => setIsVitalsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700"
              >
                + Record Vitals
              </button>
            </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Date & Time</th>
                <th className="p-3">BP (mmHg)</th>
                <th className="p-3">Heart Rate</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">SpO2</th>
                <th className="p-3">Weight / Height</th>
                <th className="p-3">BMI</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vitals.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-500">{new Date(v.recordedAt).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                    {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                  </td>
                  <td className="p-3">{v.heartRate} bpm</td>
                  <td className="p-3">{v.temperature}°C</td>
                  <td className="p-3">{v.spO2}%</td>
                  <td className="p-3">{v.weightKg}kg / {v.heightCm}cm</td>
                  <td className="p-3 font-bold">{v.bmi}</td>
                  <td className="p-3 text-slate-500">{v.recordedByName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        v.status === 'normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* TAB CONTENT: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Prescription #{rx.id}</span>
                  <p className="text-[11px] text-slate-400">Prescribed by {rx.doctorName} on {new Date(rx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rx.status === 'dispensed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rx.status}
                  </span>
                  <button
                    onClick={() => setPrintableDoc({ type: 'prescription', title: `Rx ${rx.id}`, data: rx })}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Print Prescription"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {rx.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.medicineName}</span>
                      <p className="text-[11px] text-slate-500">{item.dosage} • {item.frequency} • {item.duration}</p>
                    </div>
                    <span className="font-bold text-teal-700 dark:text-teal-400">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Laboratory */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          {labOrders.map((ord) => (
            <div key={ord.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Order {ord.orderNumber}</span>
                  <p className="text-[11px] text-slate-400">Ordered by {ord.doctorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {ord.status}
                  </span>
                  {ord.results && ord.results.length > 0 && (
                    <button
                      onClick={() => setPrintableDoc({ type: 'lab_report', title: `Lab Report ${ord.orderNumber}`, data: ord })}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {ord.results && ord.results.length > 0 ? (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-1">Parameter</th>
                      <th className="py-1">Value</th>
                      <th className="py-1">Ref Range</th>
                      <th className="py-1">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ord.results.map((r, idx) => (
                      <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/40">
                        <td className="py-1.5 font-medium text-slate-800 dark:text-slate-200">{r.parameter}</td>
                        <td className="py-1.5 font-bold">{r.value} {r.unit}</td>
                        <td className="py-1.5 text-slate-500">{r.referenceRange}</td>
                        <td className="py-1.5 font-bold capitalize text-amber-600">{r.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-400 italic">Results processing in laboratory...</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{inv.invoiceNumber}</span>
                  <p className="text-[11px] text-slate-400">Date: {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inv.status}
                  </span>
                  <button
                    onClick={() => setPrintableDoc({ type: 'invoice', title: `Invoice ${inv.invoiceNumber}`, data: inv })}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">{inv.items.length} billed services / medications</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                  ETB {inv.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vitals Recording Modal */}
      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patientId={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
      />
    </div>
  );
};
