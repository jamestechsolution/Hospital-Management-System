import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { OPDVisit, OPDStage } from '../../types';
import {
  Activity,
  ArrowRight,
  Clock,
  Heart,
  Stethoscope,
  FlaskConical,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Users,
} from 'lucide-react';
import { VitalsModal } from './VitalsModal';

export const OPDQueue: React.FC = () => {
  const { currentBranchId, currentUser, currentRole, navigateToConsultation, showToast } = useApp();

  const [priorityFilter, setPriorityFilter] = useState<'all' | 'emergency' | 'urgent' | 'routine'>('all');
  const [selectedForVitals, setSelectedForVitals] = useState<{ id: string; name: string } | null>(null);

  const visits = dbService.getOPDVisits(currentBranchId);

  const filteredVisits = visits.filter(
    (v) => priorityFilter === 'all' || v.priority === priorityFilter
  );

  const stages: { stage: OPDStage; label: string; icon: React.ReactNode; color: string }[] = [
    { stage: 'registered', label: '1. Registration', icon: <Users className="w-4 h-4" />, color: 'border-slate-300 dark:border-slate-700' },
    { stage: 'triage', label: '2. Triage & Vitals', icon: <Heart className="w-4 h-4" />, color: 'border-amber-400 dark:border-amber-600' },
    { stage: 'doctor_queue', label: '3. Doctor Queue', icon: <Clock className="w-4 h-4" />, color: 'border-blue-400 dark:border-blue-600' },
    { stage: 'consultation', label: '4. In Consultation', icon: <Stethoscope className="w-4 h-4" />, color: 'border-teal-500 dark:border-teal-500' },
    { stage: 'lab_pharmacy', label: '5. Lab / Meds', icon: <FlaskConical className="w-4 h-4" />, color: 'border-purple-400 dark:border-purple-600' },
    { stage: 'completed', label: '6. Completed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'border-emerald-500 dark:border-emerald-600' },
  ];

  const handleAdvanceStage = (visit: OPDVisit) => {
    const stageOrder: OPDStage[] = ['registered', 'triage', 'doctor_queue', 'consultation', 'lab_pharmacy', 'completed'];
    const currentIndex = stageOrder.indexOf(visit.stage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      dbService.updateOPDVisit(
        visit.id,
        {
          stage: nextStage,
          ...(nextStage === 'completed' ? { completedAt: new Date().toISOString() } : {}),
        },
        { id: currentUser.id, name: currentUser.name, role: currentRole }
      );
      showToast(`Advanced ${visit.patientName} to ${nextStage.replace('_', ' ')}`, 'success');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Outpatient (OPD) Workflow & Clinical Queue</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-stage patient tracking from check-in to triage, doctor station, and discharge
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          {(['all', 'emergency', 'urgent', 'routine'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                priorityFilter === p
                  ? p === 'emergency'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : p === 'urgent'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Board (6 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3.5 items-start">
        {stages.map((col) => {
          const colVisits = filteredVisits.filter((v) => v.stage === col.stage);

          return (
            <div
              key={col.stage}
              className={`bg-white dark:bg-slate-900/90 rounded-2xl border-t-4 ${col.color} border-x border-b border-slate-200 dark:border-slate-800 p-3 shadow-2xs min-h-[480px] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {col.icon}
                    <span>{col.label}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {colVisits.length}
                  </span>
                </div>

                {/* Patient Cards in Column */}
                <div className="space-y-2.5">
                  {colVisits.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-[11px] italic">
                      No patients in this stage
                    </div>
                  ) : (
                    colVisits.map((visit) => {
                      const isEmergency = visit.priority === 'emergency';
                      const isUrgent = visit.priority === 'urgent';

                      return (
                        <div
                          key={visit.id}
                          className={`p-3 rounded-xl border text-xs transition space-y-2 bg-slate-50/70 dark:bg-slate-800/60 ${
                            isEmergency
                              ? 'border-red-300 dark:border-red-900 bg-red-50/30'
                              : isUrgent
                              ? 'border-amber-300 dark:border-amber-900'
                              : 'border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                              {visit.queueNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                isEmergency
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : isUrgent
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {visit.priority}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              {visit.patientName}
                            </p>
                            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                              {visit.patientMrn}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {visit.chiefComplaint}
                          </p>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>Doctor: {visit.doctorName.split(' ')[1]}</span>
                            <span>{new Date(visit.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {/* Quick action buttons on card */}
                          <div className="pt-2 flex items-center gap-1.5">
                            {col.stage === 'triage' && (
                              <button
                                onClick={() => setSelectedForVitals({ id: visit.patientId, name: visit.patientName })}
                                className="w-full py-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1"
                              >
                                <Heart className="w-3 h-3 text-rose-500" />
                                <span>Record Vitals</span>
                              </button>
                            )}

                            {(col.stage === 'doctor_queue' || col.stage === 'consultation') && (
                              <button
                                onClick={() => navigateToConsultation(visit.id, visit.patientId)}
                                className="w-full py-1 rounded-lg text-[10px] font-bold bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 flex items-center justify-center gap-1"
                              >
                                <Stethoscope className="w-3 h-3 text-teal-600" />
                                <span>Start Consultation</span>
                              </button>
                            )}

                            {col.stage !== 'completed' && (
                              <button
                                onClick={() => handleAdvanceStage(visit)}
                                className="p-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-slate-600 text-slate-500 hover:text-teal-600 transition"
                                title="Move to next stage"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 text-center">
                <span className="text-[10px] text-slate-400 font-medium">Stage {col.label.split('.')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vitals Modal */}
      {selectedForVitals && (
        <VitalsModal
          isOpen={true}
          onClose={() => setSelectedForVitals(null)}
          patientId={selectedForVitals.id}
          patientName={selectedForVitals.name}
        />
      )}
    </div>
  );
};
