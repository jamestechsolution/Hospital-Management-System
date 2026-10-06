import React, { useState, useMemo } from 'react';
import { VitalSign } from '../../types';
import { dbService } from '../../services/db';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  Activity,
  Heart,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  Plus,
  Maximize2,
  Calendar,
  Info,
} from 'lucide-react';

export interface PatientVitalsTrendProps {
  patientId: string;
  patientName?: string;
  vitals?: VitalSign[];
  onOpenRecordModal?: () => void;
  compact?: boolean;
  className?: string;
}

type ChartMode = 'dual' | 'blood_pressure' | 'heart_rate';
type TimeFilter = 'all' | 'last5' | 'last3';

// Clinical BP Classification helper (AHA / ACC guidelines)
export function getBloodPressureClassification(systolic: number, diastolic: number): {
  label: string;
  status: 'normal' | 'warning' | 'critical';
  color: string;
  bgColor: string;
} {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      label: 'Hypertensive Crisis',
      status: 'critical',
      color: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: 'Stage 2 Hypertension',
      status: 'critical',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900',
    };
  }
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return {
      label: 'Stage 1 Hypertension',
      status: 'warning',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    };
  }
  if (systolic >= 120 && systolic < 130 && diastolic < 80) {
    return {
      label: 'Elevated BP',
      status: 'warning',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      label: 'Hypotension',
      status: 'warning',
      color: 'text-sky-700 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900',
    };
  }
  return {
    label: 'Normal BP (<120/80)',
    status: 'normal',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
  };
}

// Heart rate classification helper
export function getHeartRateClassification(hr: number): {
  label: string;
  status: 'normal' | 'warning' | 'critical';
  color: string;
} {
  if (hr > 120) {
    return { label: 'Severe Tachycardia (>120 bpm)', status: 'critical', color: 'text-rose-600' };
  }
  if (hr > 100) {
    return { label: 'Tachycardia (>100 bpm)', status: 'warning', color: 'text-amber-600' };
  }
  if (hr < 50) {
    return { label: 'Marked Bradycardia (<50 bpm)', status: 'critical', color: 'text-rose-600' };
  }
  if (hr < 60) {
    return { label: 'Bradycardia (<60 bpm)', status: 'warning', color: 'text-sky-600' };
  }
  return { label: 'Normal Resting (60-100 bpm)', status: 'normal', color: 'text-emerald-600' };
}

// Custom Recharts tooltip for clinical precision
const CustomClinicalTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const bpClass = getBloodPressureClassification(data.systolic, data.diastolic);
  const hrClass = getHeartRateClassification(data.heartRate);

  return (
    <div className="bg-slate-900/95 text-white dark:bg-slate-950/95 p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-2 backdrop-blur-md max-w-xs z-50">
      <div className="border-b border-slate-700/80 pb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-slate-300 font-semibold">{data.fullDateTime}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-medium">
          {data.recordedByName ? data.recordedByName.split(' ')[0] : 'Nurse'}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Blood Pressure:</span>
          </span>
          <span className="font-extrabold font-mono text-slate-100 text-sm">
            {data.systolic}/{data.diastolic} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
          </span>
        </div>
        <p className={`text-[10px] font-bold text-right ${bpClass.color}`}>{bpClass.label}</p>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Heart Rate:</span>
          </span>
          <span className="font-extrabold font-mono text-slate-100 text-sm">
            {data.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
          </span>
        </div>
        <p className={`text-[10px] font-bold text-right ${hrClass.color}`}>{hrClass.label}</p>

        <div className="pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
          <div>
            <span className="text-slate-400">MAP:</span>{' '}
            <span className="font-mono font-bold">{data.map} mmHg</span>
          </div>
          <div>
            <span className="text-slate-400">Pulse Press.:</span>{' '}
            <span className="font-mono font-bold">{data.pulsePressure} mmHg</span>
          </div>
          {data.spO2 && (
            <div>
              <span className="text-slate-400">SpO2:</span>{' '}
              <span className="font-mono font-bold text-cyan-300">{data.spO2}%</span>
            </div>
          )}
          {data.temperature && (
            <div>
              <span className="text-slate-400">Temp:</span>{' '}
              <span className="font-mono font-bold">{data.temperature}°C</span>
            </div>
          )}
        </div>

        {data.notes && (
          <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800 line-clamp-2">
            "{data.notes}"
          </p>
        )}
      </div>
    </div>
  );
};

export const PatientVitalsTrend: React.FC<PatientVitalsTrendProps> = ({
  patientId,
  patientName,
  vitals: passedVitals,
  onOpenRecordModal,
  compact = false,
  className = '',
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('dual');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Query vitals from DB if not passed directly
  const rawVitals = passedVitals || dbService.getVitalsForPatient(patientId);

  // Chronologically sort ascending (oldest -> newest) for trend graphing
  const sortedVitals = useMemo(() => {
    return [...rawVitals].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
  }, [rawVitals]);

  // Apply time filters
  const filteredVitals = useMemo(() => {
    if (timeFilter === 'last3') {
      return sortedVitals.slice(-3);
    }
    if (timeFilter === 'last5') {
      return sortedVitals.slice(-5);
    }
    return sortedVitals;
  }, [sortedVitals, timeFilter]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return filteredVitals.map((v, idx) => {
      const dateObj = new Date(v.recordedAt);
      const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fullDateTime = `${dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} ${timeStr}`;

      // Mean Arterial Pressure (MAP) = DBP + (SBP - DBP)/3
      const sbp = v.bloodPressureSystolic;
      const dbp = v.bloodPressureDiastolic;
      const map = Math.round(dbp + (sbp - dbp) / 3);
      const pulsePressure = sbp - dbp;

      return {
        id: v.id,
        index: idx + 1,
        date: shortDate,
        time: timeStr,
        label: `${shortDate} ${timeStr}`,
        fullDateTime,
        systolic: sbp,
        diastolic: dbp,
        heartRate: v.heartRate,
        spO2: v.spO2,
        temperature: v.temperature,
        bmi: v.bmi,
        notes: v.notes,
        recordedByName: v.recordedByName,
        map,
        pulsePressure,
      };
    });
  }, [filteredVitals]);

  // Latest and previous readings for delta computation
  const latestReading = sortedVitals[sortedVitals.length - 1];
  const previousReading = sortedVitals.length > 1 ? sortedVitals[sortedVitals.length - 2] : null;

  const sbpDelta = previousReading
    ? latestReading.bloodPressureSystolic - previousReading.bloodPressureSystolic
    : 0;
  const dbpDelta = previousReading
    ? latestReading.bloodPressureDiastolic - previousReading.bloodPressureDiastolic
    : 0;
  const hrDelta = previousReading ? latestReading.heartRate - previousReading.heartRate : 0;

  const latestBpClass = latestReading
    ? getBloodPressureClassification(
        latestReading.bloodPressureSystolic,
        latestReading.bloodPressureDiastolic
      )
    : null;
  const latestHrClass = latestReading
    ? getHeartRateClassification(latestReading.heartRate)
    : null;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Hemodynamic Trends & Vitals Trajectory
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {sortedVitals.length} {sortedVitals.length === 1 ? 'Reading' : 'Readings'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Longitudinal tracking of Blood Pressure (mmHg) & Heart Rate (bpm)
              {patientName ? ` for ${patientName}` : ''}
            </p>
          </div>
        </div>

        {/* View mode toggle & actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setChartMode('dual')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartMode === 'dual'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dual View
            </button>
            <button
              type="button"
              onClick={() => setChartMode('blood_pressure')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartMode === 'blood_pressure'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-2xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              BP Focus
            </button>
            <button
              type="button"
              onClick={() => setChartMode('heart_rate')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartMode === 'heart_rate'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HR Focus
            </button>
          </div>

          {/* Time range filter if > 3 points */}
          {sortedVitals.length > 3 && (
            <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  timeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : ''
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('last5')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  timeFilter === 'last5'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : ''
                }`}
              >
                Last 5
              </button>
            </div>
          )}

          {/* Record Vitals quick launcher button */}
          {onOpenRecordModal && (
            <button
              type="button"
              onClick={onOpenRecordModal}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards / Vitals Quick Health Gauge */}
      {latestReading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
          {/* BP Card */}
          <div
            className={`p-2.5 rounded-xl border transition ${
              latestBpClass?.bgColor || 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Latest BP</span>
              {previousReading && (
                <span
                  className={`flex items-center font-bold font-mono text-[10px] ${
                    sbpDelta < 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : sbpDelta > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                  title="Systolic change vs prior reading"
                >
                  {sbpDelta > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : sbpDelta < 0 ? (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  ) : (
                    <Minus className="w-3 h-3 mr-0.5" />
                  )}
                  {sbpDelta > 0 ? `+${sbpDelta}` : sbpDelta}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                {latestReading.bloodPressureSystolic}/{latestReading.bloodPressureDiastolic}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
            </div>
            <p className={`text-[10px] font-bold truncate mt-0.5 ${latestBpClass?.color}`}>
              {latestBpClass?.label}
            </p>
          </div>

          {/* Heart Rate Card */}
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Heart Rate</span>
              </span>
              {previousReading && (
                <span
                  className={`flex items-center font-bold font-mono text-[10px] ${
                    hrDelta < 0
                      ? 'text-sky-600 dark:text-sky-400'
                      : hrDelta > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400'
                  }`}
                  title="Heart rate change vs prior reading"
                >
                  {hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                {latestReading.heartRate}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">bpm</span>
            </div>
            <p className={`text-[10px] font-bold truncate mt-0.5 ${latestHrClass?.color}`}>
              {latestHrClass?.label}
            </p>
          </div>

          {/* Mean Arterial Pressure (MAP) */}
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">MAP (Mean Arterial)</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                {Math.round(
                  latestReading.bloodPressureDiastolic +
                    (latestReading.bloodPressureSystolic - latestReading.bloodPressureDiastolic) / 3
                )}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
              Normal range: 70–100 mmHg
            </p>
          </div>

          {/* Pulse Pressure */}
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Pulse Pressure</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                {latestReading.bloodPressureSystolic - latestReading.bloodPressureDiastolic}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">mmHg (SBP - DBP)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
              Normal range: 30–50 mmHg
            </p>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      {chartData.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
          <Activity className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No vitals recorded for this patient yet.
          </p>
          <p className="text-[11px] text-slate-500">
            Record the patient's initial triage vitals to establish clinical baseline.
          </p>
          {onOpenRecordModal && (
            <button
              type="button"
              onClick={onOpenRecordModal}
              className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              Record Initial Vitals
            </button>
          )}
        </div>
      ) : chartData.length === 1 ? (
        <div className="my-2 space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              1 vital sign logged. A trend line curve will appear once 2 or more historical readings are recorded.
            </span>
          </div>
          {/* Display single point overview */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height={176}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[50, 180]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomClinicalTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic BP (mmHg)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 6, fill: '#ef4444' }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic BP (mmHg)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 6, fill: '#0284c7' }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 6, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Multi-point Dynamic Recharts Visualization */
        <div className="mt-3 space-y-2">
          <div className={compact ? 'h-52 w-full' : 'h-64 sm:h-72 w-full'}>
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'dual' ? (
                /* DUAL AXIS: Blood Pressure (Left) + Heart Rate (Right) */
                <LineChart data={chartData} margin={{ top: 12, right: 15, left: -12, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  {/* Left Axis: Blood Pressure (mmHg) */}
                  <YAxis
                    yAxisId="bp"
                    domain={[40, 200]}
                    tick={{ fontSize: 10, fill: '#ef4444' }}
                    tickLine={false}
                    axisLine={{ stroke: '#ef4444', strokeOpacity: 0.4 }}
                    label={{
                      value: 'BP (mmHg)',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 10,
                      fill: '#ef4444',
                      offset: 14,
                    }}
                  />
                  {/* Right Axis: Heart Rate (bpm) */}
                  <YAxis
                    yAxisId="hr"
                    orientation="right"
                    domain={[40, 140]}
                    tick={{ fontSize: 10, fill: '#10b981' }}
                    tickLine={false}
                    axisLine={{ stroke: '#10b981', strokeOpacity: 0.4 }}
                    label={{
                      value: 'HR (bpm)',
                      angle: 90,
                      position: 'insideRight',
                      fontSize: 10,
                      fill: '#10b981',
                      offset: 14,
                    }}
                  />
                  <Tooltip content={<CustomClinicalTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                  />

                  {/* Clinical reference lines for BP thresholds */}
                  <ReferenceLine
                    yAxisId="bp"
                    y={140}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{
                      value: 'HTN Stage 2 (140)',
                      position: 'left',
                      fill: '#f43f5e',
                      fontSize: 9,
                    }}
                  />
                  <ReferenceLine
                    yAxisId="bp"
                    y={120}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    label={{
                      value: 'Normal SBP (120)',
                      position: 'left',
                      fill: '#10b981',
                      fontSize: 9,
                    }}
                  />

                  {/* Systolic BP Line */}
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#ef4444' }}
                  />

                  {/* Diastolic BP Line */}
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: '#0284c7', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#0284c7' }}
                  />

                  {/* Heart Rate Line */}
                  <Line
                    yAxisId="hr"
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </LineChart>
              ) : chartMode === 'blood_pressure' ? (
                /* BLOOD PRESSURE FOCUS: Area / Line view with pulse pressure band */
                <AreaChart data={chartData} margin={{ top: 12, right: 15, left: -12, bottom: 5 }}>
                  <defs>
                    <linearGradient id="systolicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="diastolicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 200]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    label={{
                      value: 'Blood Pressure (mmHg)',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 10,
                      fill: '#64748b',
                      offset: 14,
                    }}
                  />
                  <Tooltip content={<CustomClinicalTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11 }} />

                  {/* Clinical Guidelines threshold markers */}
                  <ReferenceLine
                    y={140}
                    stroke="#e11d48"
                    strokeDasharray="3 3"
                    label={{ value: 'Hypertension Stage 2 (≥140)', fill: '#e11d48', fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={130}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: 'Stage 1 (130-139)', fill: '#f59e0b', fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={120}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: 'Normal SBP (<120)', fill: '#10b981', fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    label={{ value: 'Normal DBP (<80)', fill: '#0284c7', fontSize: 9 }}
                  />

                  <Area
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#systolicGrad)"
                    dot={{ r: 4, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#diastolicGrad)"
                    dot={{ r: 4, stroke: '#0284c7', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="map"
                    name="Mean Arterial (MAP)"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                </AreaChart>
              ) : (
                /* HEART RATE FOCUS: Pulse curve with Normal Rest Zone (60-100 bpm) */
                <AreaChart data={chartData} margin={{ top: 12, right: 15, left: -12, bottom: 5 }}>
                  <defs>
                    <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 140]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    label={{
                      value: 'Heart Rate (bpm)',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 10,
                      fill: '#10b981',
                      offset: 14,
                    }}
                  />
                  <Tooltip content={<CustomClinicalTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11 }} />

                  {/* Resting heart rate normal zone (60 - 100 bpm) */}
                  <ReferenceArea
                    y1={60}
                    y2={100}
                    fill="#10b981"
                    fillOpacity={0.08}
                    label={{
                      value: 'Normal Resting Zone (60–100 bpm)',
                      position: 'insideTopLeft',
                      fill: '#059669',
                      fontSize: 9,
                    }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: 'Tachycardia Threshold (100 bpm)', fill: '#f59e0b', fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={60}
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    label={{ value: 'Bradycardia Threshold (60 bpm)', fill: '#0284c7', fontSize: 9 }}
                  />

                  <Area
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate (bpm)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#hrGrad)"
                    dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Reference legends and clinical guide footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-rose-500 rounded inline-block" />
                <span>Systolic (Optimal &lt;120 mmHg)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-sky-500 rounded inline-block" />
                <span>Diastolic (Optimal &lt;80 mmHg)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-emerald-500 rounded inline-block" />
                <span>Heart Rate (Normal 60–100 bpm)</span>
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>
                Range: {chartData[0]?.date} - {chartData[chartData.length - 1]?.date}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
