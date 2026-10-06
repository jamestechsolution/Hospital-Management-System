import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Activity,
  Stethoscope,
  HeartHandshake,
  FlaskConical,
  Pill,
  Receipt,
  FileBarChart2,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Boxes,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentRole, activeNav, setActiveNav, currentBranch, t } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // Compute live badge counters
  const waitingVisits = dbService.getOPDVisits().filter((v) => v.stage !== 'completed').length;
  const pendingRx = dbService.getPrescriptions().filter((p) => p.status === 'pending').length;
  const pendingLab = dbService.getLabOrders().filter((l) => l.status === 'ordered' || l.status === 'in_progress').length;
  const unpaidInvoices = dbService.getInvoices().filter((i) => i.status === 'unpaid' || i.status === 'partial').length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    roles: string[];
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-4 h-4" />, roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'accountant'] },
    { id: 'patients', label: t.patients, icon: <Users className="w-4 h-4" />, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] },
    { id: 'appointments', label: t.appointments, icon: <CalendarDays className="w-4 h-4" />, roles: ['admin', 'doctor', 'receptionist', 'nurse'] },
    { id: 'opd', label: t.clinicalOPD, icon: <Activity className="w-4 h-4" />, badge: waitingVisits, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { id: 'consultations', label: t.consultations, icon: <Stethoscope className="w-4 h-4" />, roles: ['admin', 'doctor'] },
    { id: 'nursing', label: t.nursing, icon: <HeartHandshake className="w-4 h-4" />, roles: ['admin', 'nurse'] },
    { id: 'laboratory', label: t.laboratory, icon: <FlaskConical className="w-4 h-4" />, badge: pendingLab, roles: ['admin', 'doctor', 'lab_technician'] },
    { id: 'pharmacy', label: t.pharmacy, icon: <Pill className="w-4 h-4" />, badge: pendingRx, roles: ['admin', 'doctor', 'pharmacist'] },
    { id: 'inventory', label: t.inventory, icon: <Boxes className="w-4 h-4" />, roles: ['admin', 'pharmacist'] },
    { id: 'billing', label: t.billing, icon: <Receipt className="w-4 h-4" />, badge: unpaidInvoices, roles: ['admin', 'accountant'] },
    { id: 'reports', label: t.reports, icon: <FileBarChart2 className="w-4 h-4" />, roles: ['admin', 'doctor', 'accountant', 'pharmacist'] },
    { id: 'staff', label: t.staff, icon: <UserPlus className="w-4 h-4" />, roles: ['admin'] },
    { id: 'audit-logs', label: t.auditLogs, icon: <ShieldAlert className="w-4 h-4" />, roles: ['admin'] },
    { id: 'settings', label: t.settings, icon: <Settings className="w-4 h-4" />, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between z-20 select-none ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveNav('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  PulseCare <span className="text-teal-600 dark:text-teal-400 font-bold">HMS</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">Enterprise Health</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Branch Subtitle */}
        {!collapsed && currentBranch && (
          <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate max-w-[170px] font-medium">{currentBranch.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {currentBranch.code}
            </span>
          </div>
        )}

        {/* Nav Items List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {filteredNav.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
                )}

                {/* Badge if counter > 0 */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-teal-700'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                    } ${collapsed ? 'absolute -top-1 -right-1 text-[9px] w-4 h-4 p-0' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={() => {
            alert('PulseCare HMS v2.4 Enterprise.\nBuilt for high reliability clinical and hospital operations.');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="PulseCare Help & Docs"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          {!collapsed && <span>Help & Docs</span>}
        </button>
      </div>
    </aside>
  );
};
