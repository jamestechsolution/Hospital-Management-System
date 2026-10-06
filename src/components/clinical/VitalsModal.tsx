import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { X, Heart, AlertTriangle, Check } from 'lucide-react';

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
}) => {
  const { currentUser, currentRole, showToast } = useApp();

  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);
  const [spO2, setSpO2] = useState<number>(98);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Real-time BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;

  // Warnings
  const isBPCritical = systolic >= 160 || diastolic >= 100 || systolic < 90;
  const isSpO2Critical = spO2 < 94;
  const isFebrile = temperature >= 38.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dbService.recordVitalSign(
      {
        patientId,
        recordedBy: currentUser.id,
        recordedByName: currentUser.name,
        bloodPressureSystolic: Number(systolic),
        bloodPressureDiastolic: Number(diastolic),
        heartRate: Number(heartRate),
        temperature: Number(temperature),
        respiratoryRate: Number(respiratoryRate),
        spO2: Number(spO2),
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        notes,
      },
      {
        id: currentUser.id,
        name: currentUser.name,
        role: currentRole,
      }
    );

    showToast(`Recorded physiological vitals for ${patientName}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Record Vital Signs</h2>
              <p className="text-[11px] text-slate-500">Patient: {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Blood Pressure & Heart Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Systolic (mmHg)
              </label>
              <input
                type="number"
                required
                min={50}
                max={260}
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold ${
                  systolic >= 140 ? 'border-amber-500 text-amber-600' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Diastolic (mmHg)
              </label>
              <input
                type="number"
                required
                min={30}
                max={160}
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold ${
                  diastolic >= 90 ? 'border-amber-500 text-amber-600' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                required
                min={30}
                max={220}
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold"
              />
            </div>
          </div>

          {/* Temperature, Resp Rate, SpO2 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold ${
                  isFebrile ? 'border-amber-500 text-amber-600' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Resp Rate (/min)
              </label>
              <input
                type="number"
                required
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                SpO2 (%)
              </label>
              <input
                type="number"
                required
                min={70}
                max={100}
                value={spO2}
                onChange={(e) => setSpO2(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold ${
                  isSpO2Critical ? 'border-red-500 text-red-600' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>
          </div>

          {/* Weight & Height -> BMI */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Height (cm)</label>
              <input
                type="number"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold"
              />
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">BMI Value</span>
              <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400 font-mono">
                {bmi} <span className="text-[10px] font-normal text-slate-500">kg/m²</span>
              </span>
            </div>
          </div>

          {/* Clinical Alerts Box if bounds abnormal */}
          {(isBPCritical || isSpO2Critical || isFebrile) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <p className="font-bold">Abnormal Physiological Bound Flagged</p>
                {isBPCritical && <p>• Blood pressure outside normal limits ({systolic}/{diastolic} mmHg)</p>}
                {isSpO2Critical && <p>• SpO2 is sub-optimal ({spO2}%)</p>}
                {isFebrile && <p>• Patient is febrile ({temperature}°C)</p>}
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Clinical Nurse Observation Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Patient resting quietly, slight tachypnea on exertion"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Record & Update Chart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
