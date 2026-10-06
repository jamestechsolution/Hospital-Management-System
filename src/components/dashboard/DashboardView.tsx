import React from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import {
  Users,
  Activity,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  FlaskConical,
  Pill,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Stethoscope,
  Receipt,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  Building2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { currentRole, currentUser, currentBranchId, setActiveNav, navigateToPatient, navigateToConsultation, setPrintableDoc, t } = useApp();

  const patients = dbService.getPatients(currentBranchId);
  const appointments = dbService.getAppointments(currentBranchId);
  const opdVisits = dbService.getOPDVisits(currentBranchId);
  const labOrders = dbService.getLabOrders(currentBranchId);
  const prescriptions = dbService.getPrescriptions(currentBranchId);
  const medicines = dbService.getMedicines(currentBranchId);
  const invoices = dbService.getInvoices(currentBranchId);

  // Computed metrics
  const totalPatientsCount = patients.length;
  const todayVisitsCount = opdVisits.length;
  const todayAppointments = appointments.filter((a) => a.date === '2026-09-25');
  const pendingLabOrders = labOrders.filter((l) => l.status === 'ordered' || l.status === 'in_progress');
  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'pending');
  const lowStockMeds = medicines.filter((m) => m.currentStock <= m.minimumStock);
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  // Common quick stats cards
  const renderKpiCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Patients */}
      <div
        onClick={() => setActiveNav('patients')}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-teal-500/50 dark:hover:border-teal-500/50 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.totalPatients}</span>
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalPatientsCount}</span>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Active electronic health records</p>
      </div>

      {/* Today Visits */}
      <div
        onClick={() => setActiveNav('opd')}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.todaysVisits}</span>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{todayVisitsCount}</span>
          <span className="text-[11px] text-slate-500">OPD & Emergencies</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {opdVisits.filter((v) => v.stage !== 'completed').length} currently in queue
        </p>
      </div>

      {/* Revenue */}
      <div
        onClick={() => setActiveNav('billing')}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.todayRevenue}</span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xs font-bold text-slate-400">ETB</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Outstanding: ETB {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Operational Alerts */}
      <div
        onClick={() => {
          if (lowStockMeds.length > 0) setActiveNav('inventory');
          else if (pendingLabOrders.length > 0) setActiveNav('laboratory');
        }}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-500/50 dark:hover:border-amber-500/50 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Actions</span>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {lowStockMeds.length + pendingLabOrders.length}
          </span>
          <span className="text-[11px] font-semibold text-amber-600">Requires attention</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {pendingLabOrders.length} lab tests • {lowStockMeds.length} low med stocks
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/30 text-teal-200 border border-teal-400/30">
                {currentRole.toUpperCase()} PERSPECTIVE
              </span>
              <span className="text-xs text-teal-200">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs text-teal-100/80 mt-1 max-w-xl">
              PulseCare Enterprise Operating Platform is live. You have access to real-time clinical workflows, automated LIS tracking, pharmacy inventory, and billing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentRole === 'doctor' && (
              <button
                onClick={() => navigateToConsultation()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Open Consultation</span>
              </button>
            )}
            {currentRole === 'receptionist' && (
              <button
                onClick={() => setActiveNav('patients')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-teal-700" />
                <span>Register Patient</span>
              </button>
            )}
            {currentRole === 'nurse' && (
              <button
                onClick={() => setActiveNav('opd')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                <span>Triage Station</span>
              </button>
            )}
            {currentRole === 'pharmacist' && (
              <button
                onClick={() => setActiveNav('pharmacy')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <Pill className="w-4 h-4 text-teal-700" />
                <span>Dispense Queue ({pendingPrescriptions.length})</span>
              </button>
            )}
            {currentRole === 'lab_technician' && (
              <button
                onClick={() => setActiveNav('laboratory')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4 text-teal-700" />
                <span>LIS Orders ({pendingLabOrders.length})</span>
              </button>
            )}
            {currentRole === 'accountant' && (
              <button
                onClick={() => setActiveNav('billing')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 text-teal-700" />
                <span>Billing Station</span>
              </button>
            )}
            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveNav('reports')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-xs flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-teal-700" />
                <span>View Analytics</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      {renderKpiCards()}

      {/* Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Queue & Appointments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active OPD Clinical Pipeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Real-Time OPD Clinical Queue</span>
                </h2>
                <p className="text-[11px] text-slate-400">Patients progressing through clinical stations</p>
              </div>
              <button
                onClick={() => setActiveNav('opd')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Full Queue Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {opdVisits.slice(0, 4).map((visit) => {
                const priorityBadge =
                  visit.priority === 'emergency'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-extrabold'
                    : visit.priority === 'urgent'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium';

                const stageName =
                  visit.stage === 'triage'
                    ? 'Vitals / Triage'
                    : visit.stage === 'doctor_queue'
                    ? 'Waiting for Doctor'
                    : visit.stage === 'consultation'
                    ? 'In Consultation'
                    : visit.stage === 'lab_pharmacy'
                    ? 'Lab / Meds'
                    : 'Completed';

                return (
                  <div
                    key={visit.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono font-bold text-xs flex items-center justify-center">
                        {visit.queueNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{visit.patientName}</p>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase ${priorityBadge}`}>
                            {visit.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{visit.chiefComplaint}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/60 font-semibold">
                        {stageName}
                      </span>
                      <button
                        onClick={() => navigateToConsultation(visit.id, visit.patientId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-700 transition"
                        title="View consultation"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Appointments Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Scheduled Consultations Today</span>
                </h2>
                <p className="text-[11px] text-slate-400">Doctor slots and checked-in arrivals</p>
              </div>
              <button
                onClick={() => setActiveNav('appointments')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayAppointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center w-12 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {apt.time}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{apt.patientName}</p>
                      <p className="text-[11px] text-slate-400">
                        {apt.doctorName} • {apt.departmentName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      apt.status === 'in_consultation'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : apt.status === 'checked_in'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lab & Pharmacy Operations Widget */}
        <div className="space-y-6">
          {/* Critical Lab Orders */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-500" />
                <span>LIS Laboratory Queue</span>
              </h2>
              <button
                onClick={() => setActiveNav('laboratory')}
                className="text-xs text-teal-600 hover:underline"
              >
                View ({labOrders.length})
              </button>
            </div>

            <div className="space-y-2">
              {labOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    if (order.results && order.results.length > 0) {
                      setPrintableDoc({
                        type: 'lab_report',
                        title: `Lab Report ${order.orderNumber}`,
                        data: order,
                      });
                    } else {
                      setActiveNav('laboratory');
                    }
                  }}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/80 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{order.orderNumber}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        order.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{order.patientName}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {order.tests.map((t) => t.testName).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pharmacy Low-Stock Medicines */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" />
                <span>Pharmacy Alerts</span>
              </h2>
              <button
                onClick={() => setActiveNav('inventory')}
                className="text-xs text-teal-600 hover:underline"
              >
                Stock ({medicines.length})
              </button>
            </div>

            <div className="space-y-2">
              {lowStockMeds.slice(0, 3).map((med) => (
                <div
                  key={med.id}
                  className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-950/50 bg-rose-50/30 dark:bg-rose-950/20 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{med.name}</p>
                    <p className="text-[10px] text-slate-400">Reorder threshold: {med.minimumStock} units</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono">
                      {med.currentStock}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-rose-500 font-bold">Low</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Overview Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Multi-Branch Operational Status</span>
            </h2>
            <div className="space-y-2 text-xs">
              {dbService.getBranches().map((branch) => (
                <div key={branch.id} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{branch.name}</span>
                    <span className="block text-[10px] text-slate-400">{branch.address}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
