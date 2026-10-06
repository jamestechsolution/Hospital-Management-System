import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Building2,
  Globe,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    switchUserRole,
    currentBranchId,
    setCurrentBranchId,
    branches,
    language,
    setLanguage,
    theme,
    setTheme,
    setIsCommandPaletteOpen,
    t,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const notifications = dbService.getNotifications(currentRole);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleOptions: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'admin', label: 'Administrator', desc: 'Full hospital ops, staff & audit', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    { role: 'doctor', label: 'Doctor / Physician', desc: 'Consultations, EMR, prescriptions, lab', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { role: 'nurse', label: 'Nurse / Triage', desc: 'Vitals, patient intake, ward monitoring', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { role: 'pharmacist', label: 'Pharmacist', desc: 'Dispensing, medicine stocks, batches', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
    { role: 'lab_technician', label: 'Lab Technician', desc: 'LIS orders, specimen processing, results', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { role: 'receptionist', label: 'Receptionist', desc: 'Patient registration, appointments & check-in', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    { role: 'accountant', label: 'Billing / Cashier', desc: 'Invoices, payments, financial ledger', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Search Bar / Command Palette trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 transition shadow-xs text-left group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition" />
          <span className="flex-1 truncate">{t.searchPlaceholder}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Branch Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 text-xs">
          <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <select
            value={currentBranchId}
            onChange={(e) => setCurrentBranchId(e.target.value)}
            className="bg-transparent font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="dark:bg-slate-800 dark:text-slate-200">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
              setShowLangMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/70 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 transition shadow-2xs cursor-pointer"
            title="Switch demo role perspective"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="capitalize">{currentRole.replace('_', ' ')}</span>
            <span className="text-[10px] text-teal-500 font-normal">▼</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Perspective Switcher</p>
                  <p className="text-[11px] text-slate-500">Explore tailored dashboards & permissions</p>
                </div>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      switchUserRole(opt.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition flex items-start gap-2.5 ${
                      currentRole === opt.role
                        ? 'bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="mt-0.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${opt.color}`}>
                        {opt.label.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{opt.label}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">{opt.desc}</p>
                    </div>
                    {currentRole === opt.role && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Select Language"
          >
            <Globe className="w-4 h-4" />
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50">
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                  language === 'en' ? 'bg-slate-100 dark:bg-slate-800 font-bold text-teal-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>English (US)</span>
                {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('om');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                  language === 'om' ? 'bg-slate-100 dark:bg-slate-800 font-bold text-teal-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Afaan Oromoo</span>
                {language === 'om' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('am');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                  language === 'am' ? 'bg-slate-100 dark:bg-slate-800 font-bold text-teal-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>አማርኛ (Amharic)</span>
                {language === 'am' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
              setShowLangMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.notifications} ({unreadCount} unread)
                </span>
                <button
                  onClick={() => dbService.markAllNotificationsAsRead()}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => dbService.markNotificationAsRead(notif.id)}
                      className={`p-2.5 text-xs cursor-pointer transition ${
                        notif.read ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-teal-50/40 dark:bg-teal-950/30 hover:bg-teal-50/80'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'urgent' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : notif.type === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Quick Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[130px]">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
              {currentUser.title}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
