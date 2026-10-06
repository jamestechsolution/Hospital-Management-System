import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { PrescriptionItem, Patient, VitalSign } from '../../types';
import {
  Stethoscope,
  Heart,
  Pill,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { VitalsModal } from './VitalsModal';
import { PatientVitalsTrend } from './PatientVitalsTrend';

export const DoctorConsultation: React.FC = () => {
  const {
    currentUser,
    currentRole,
    currentBranchId,
    selectedVisitId,
    selectedPatientId,
    navigateToPatient,
    navigateToConsultation,
    setPrintableDoc,
    showToast,
    refreshKey,
  } = useApp();

  const visits = dbService.getOPDVisits(currentBranchId);
  const patients = dbService.getPatients(currentBranchId);
  const labTestCatalog = dbService.getLabTests();
  const medicineCatalog = dbService.getMedicines();

  // Find active visit and patient
  const activeVisit = visits.find((v) => v.id === selectedVisitId) || visits[0];
  const activePatientId = activeVisit ? activeVisit.patientId : selectedPatientId || 'patient-1';
  const patient = patients.find((p) => p.id === activePatientId) || patients[0];

  const vitals = patient ? dbService.getVitalsForPatient(patient.id) : [];
  const latestVital = vitals[0];
  const pastVisits = patient ? dbService.getOPDVisits().filter((v) => v.patientId === patient.id) : [];
  const pastLabs = patient ? dbService.getLabOrders().filter((l) => l.patientId === patient.id) : [];

  // Consultation state
  const [chiefComplaint, setChiefComplaint] = useState(activeVisit?.chiefComplaint || '');
  const [examination, setExamination] = useState('Patient is alert and oriented. Heart sounds regular S1/S2 without murmurs. Chest clear on auscultation.');
  const [diagnosis, setDiagnosis] = useState(activeVisit?.diagnosis || 'Acute Respiratory Tract Infection (J06.9)');
  const [clinicalNotes, setClinicalNotes] = useState(activeVisit?.clinicalNotes || 'Recommend rest, oral hydration, and symptomatic medication.');
  const [treatmentPlan, setTreatmentPlan] = useState(activeVisit?.treatmentPlan || 'Paracetamol 500mg as needed, return if fever persists > 48h.');
  const [followUpDate, setFollowUpDate] = useState('2026-10-02');

  // Prescriptions being prescribed in this consultation
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      medicineId: 'med-4',
      medicineName: 'Paracetamol 500mg',
      dosage: '500mg',
      frequency: 'Every 8 hours as needed',
      duration: '5 days',
      instructions: 'Take after meals',
      quantity: 15,
      dispensedQuantity: 0,
      unitPrice: 6.5,
    },
  ]);

  // Lab tests ordered in this consultation
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>([]);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  useEffect(() => {
    if (activeVisit) {
      setChiefComplaint(activeVisit.chiefComplaint || '');
      if (activeVisit.diagnosis) setDiagnosis(activeVisit.diagnosis);
      if (activeVisit.clinicalNotes) setClinicalNotes(activeVisit.clinicalNotes);
      if (activeVisit.treatmentPlan) setTreatmentPlan(activeVisit.treatmentPlan);
    }
  }, [selectedVisitId]);

  const handleAddPrescriptionItem = (medId: string) => {
    const med = medicineCatalog.find((m) => m.id === medId);
    if (!med) return;
    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.strength,
        frequency: 'Twice daily',
        duration: '7 days',
        instructions: 'Take with water',
        quantity: 14,
        dispensedQuantity: 0,
        unitPrice: med.unitPrice,
      },
    ]);
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleLabTest = (testId: string) => {
    setSelectedLabTestIds((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const handleCompleteConsultation = () => {
    if (!patient) return;

    // 1. Update the OPD Visit record
    if (activeVisit) {
      dbService.updateOPDVisit(
        activeVisit.id,
        {
          stage: 'lab_pharmacy',
          diagnosis,
          clinicalNotes,
          treatmentPlan,
          completedAt: new Date().toISOString(),
        },
        { id: currentUser.id, name: currentUser.name, role: currentRole }
      );
    }

    // 2. Create Prescription if any items added
    if (prescriptionItems.length > 0) {
      const rx = dbService.createPrescription(
        {
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientMrn: patient.mrn,
          doctorId: currentUser.id,
          doctorName: currentUser.name,
          visitId: activeVisit?.id,
          branchId: patient.branchId,
          items: prescriptionItems,
          notes: clinicalNotes,
        },
        { id: currentUser.id, name: currentUser.name, role: currentRole }
      );

      // Offer to print
      setPrintableDoc({
        type: 'prescription',
        title: `Prescription ${rx.id}`,
        data: rx,
      });
    }

    // 3. Create Lab Order if any tests selected
    if (selectedLabTestIds.length > 0) {
      const testsToOrder = labTestCatalog
        .filter((t) => selectedLabTestIds.includes(t.id))
        .map((t) => ({ testId: t.id, testName: t.name, price: t.price }));

      dbService.createLabOrder(
        {
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientMrn: patient.mrn,
          doctorId: currentUser.id,
          doctorName: currentUser.name,
          branchId: patient.branchId,
          tests: testsToOrder,
          clinicalNotes: `Suspected: ${diagnosis}. Reason: ${chiefComplaint}`,
        },
        { id: currentUser.id, name: currentUser.name, role: currentRole }
      );
    }

    showToast(`Consultation completed for ${patient.firstName} ${patient.lastName}`, 'success');
  };

  if (!patient) {
    return <div className="p-8 text-center text-slate-500">No active patient selected for consultation.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Station Title */}
      <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Doctor Consultation Workspace
            </h1>
            <p className="text-[11px] text-slate-500">
              Physician: {currentUser.name} ({currentUser.title})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500">Patient:</span>
            <select
              value={patient.id}
              onChange={(e) => {
                const targetP = patients.find((p) => p.id === e.target.value);
                if (targetP) {
                  const vis = visits.find((v) => v.patientId === targetP.id);
                  navigateToConsultation(vis?.id, targetP.id);
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsVitalsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Record Vitals
          </button>
          <button
            onClick={handleCompleteConsultation}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete & Sign Off</span>
          </button>
        </div>
      </div>

      {/* 3-Column Consultation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Patient Info & Vitals (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-lg flex items-center justify-center shrink-0">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div className="truncate">
                <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold">{patient.mrn}</p>
                <p className="text-[11px] text-slate-400 capitalize">
                  {patient.gender} • {2026 - parseInt(patient.dateOfBirth.split('-')[0])} yrs • {patient.bloodGroup}
                </p>
              </div>
            </div>

            {/* Allergies Notice */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
                Known Drug Allergies
              </span>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allg, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {allg}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 italic">No allergies recorded</span>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Chronic Conditions
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {patient.chronicConditions?.join(', ') || 'None recorded'}
              </p>
            </div>

            <button
              onClick={() => navigateToPatient(patient.id)}
              className="w-full py-1.5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 transition"
            >
              Open Full Patient EMR
            </button>
          </div>

          {/* Vitals Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Physiological Vitals</span>
              </span>
              {latestVital && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(latestVital.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {latestVital ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400">BP:</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400">Heart Rate:</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {latestVital.heartRate} bpm
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400">Temp:</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {latestVital.temperature}°C
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400">SpO2:</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {latestVital.spO2}%
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 col-span-2">
                    <span className="text-[10px] text-slate-400">BMI:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {latestVital.bmi} kg/m² ({latestVital.weightKg}kg / {latestVital.heightCm}cm)
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">History: {vitals.length} records</span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('consultation-vitals-trend-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Trend Graph</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 italic">
                No vitals recorded today.
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Clinical Consultation Form & Vitals Trend (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Integrated Patient Vitals Trend (Recharts) */}
          <div id="consultation-vitals-trend-section">
            <PatientVitalsTrend
              patientId={patient.id}
              patientName={`${patient.firstName} ${patient.lastName}`}
              vitals={vitals}
              onOpenRecordModal={() => setIsVitalsModalOpen(true)}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 text-xs">
            {/* Chief Complaint */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Chief Complaint & History of Present Illness
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Patient's primary symptoms, duration, aggravating/relieving factors..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
              />
            </div>

            {/* Physical Examination */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Objective Physical Examination
              </label>
              <textarea
                rows={2}
                value={examination}
                onChange={(e) => setExamination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
              />
            </div>

            {/* ICD-10 Diagnosis */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Clinical Diagnosis / ICD-10 Impression
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension (I10) or Type 2 Diabetes"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:border-teal-500"
              />
            </div>

            {/* Order Diagnostic Lab Tests Widget */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-amber-500" />
                <span>Order Diagnostic Laboratory Tests</span>
              </span>
              <p className="text-[11px] text-slate-400">Select tests to dispatch to the LIS queue:</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {labTestCatalog.map((test) => {
                  const isSelected = selectedLabTestIds.includes(test.id);
                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => handleToggleLabTest(test.id)}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{test.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ETB {test.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prescriptions Medication Builder */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-500" />
                  <span>Prescribe Medications ({prescriptionItems.length})</span>
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPrescriptionItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-teal-700 dark:text-teal-400 outline-none"
                >
                  <option value="">+ Add Medicine from Formulary</option>
                  {medicineCatalog.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.genericName})
                    </option>
                  ))}
                </select>
              </div>

              {prescriptionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{item.medicineName}</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-[11px]">
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => {
                          const updated = [...prescriptionItems];
                          updated[idx].frequency = e.target.value;
                          setPrescriptionItems(updated);
                        }}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        placeholder="Frequency"
                      />
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => {
                          const updated = [...prescriptionItems];
                          updated[idx].duration = e.target.value;
                          setPrescriptionItems(updated);
                        }}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        placeholder="Duration"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...prescriptionItems];
                          updated[idx].quantity = Number(e.target.value);
                          setPrescriptionItems(updated);
                        }}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescriptionItem(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Treatment Plan & Follow-up */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Treatment Plan & Patient Advice
                </label>
                <input
                  type="text"
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical History & Previous Encounters (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Previous Medical Visits</span>
            </h2>

            <div className="space-y-2 text-xs">
              {pastVisits.length === 0 ? (
                <p className="text-slate-400 italic">First documented visit</p>
              ) : (
                pastVisits.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{new Date(v.arrivalTime).toLocaleDateString()}</span>
                      <span className="font-semibold text-teal-600">{v.doctorName.split(' ')[1]}</span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{v.diagnosis || 'General Checkup'}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{v.chiefComplaint}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Diagnostic Labs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-amber-500" />
              <span>Prior Laboratory Findings</span>
            </h2>

            <div className="space-y-2 text-xs">
              {pastLabs.length === 0 ? (
                <p className="text-slate-400 italic">No past lab orders</p>
              ) : (
                pastLabs.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400">{l.orderNumber}</span>
                      <span className="font-bold text-emerald-600">{l.status}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">
                      {l.tests.map((t) => t.testName).join(', ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Modal */}
      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patientId={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
      />
    </div>
  );
};
