import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import {
  Search,
  User,
  Calendar,
  Pill,
  Receipt,
  FlaskConical,
  X,
  ArrowRight,
  UserPlus,
  Stethoscope,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, navigateToPatient, setActiveNav } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const patients = dbService.getPatients();
  const medicines = dbService.getMedicines();
  const invoices = dbService.getInvoices();

  const filteredPatients = query.trim()
    ? patients
        .filter(
          (p) =>
            p.firstName.toLowerCase().includes(query.toLowerCase()) ||
            p.lastName.toLowerCase().includes(query.toLowerCase()) ||
            p.mrn.toLowerCase().includes(query.toLowerCase()) ||
            p.phone.includes(query)
        )
        .slice(0, 5)
    : [];

  const filteredMedicines = query.trim()
    ? medicines
        .filter(
          (m) =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.genericName.toLowerCase().includes(query.toLowerCase()) ||
            m.code.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const filteredInvoices = query.trim()
    ? invoices
        .filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
            i.patientName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const quickNavigations = [
    { label: 'Register New Patient', icon: <UserPlus className="w-4 h-4 text-teal-600" />, action: () => { setActiveNav('patients'); setIsCommandPaletteOpen(false); } },
    { label: 'OPD Clinical Queue', icon: <Stethoscope className="w-4 h-4 text-blue-600" />, action: () => { setActiveNav('opd'); setIsCommandPaletteOpen(false); } },
    { label: 'Laboratory Orders', icon: <FlaskConical className="w-4 h-4 text-amber-600" />, action: () => { setActiveNav('laboratory'); setIsCommandPaletteOpen(false); } },
    { label: 'Pharmacy & Prescriptions', icon: <Pill className="w-4 h-4 text-emerald-600" />, action: () => { setActiveNav('pharmacy'); setIsCommandPaletteOpen(false); } },
    { label: 'Billing & Invoices', icon: <Receipt className="w-4 h-4 text-indigo-600" />, action: () => { setActiveNav('billing'); setIsCommandPaletteOpen(false); } },
    { label: 'Book Appointment', icon: <Calendar className="w-4 h-4 text-rose-600" />, action: () => { setActiveNav('appointments'); setIsCommandPaletteOpen(false); } },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 gap-3">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a patient name, MRN, medicine, or jump to module..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions (when no search query) */}
          {!query.trim() && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Quick Actions & Shortcuts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickNavigations.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Patient Matches */}
          {filteredPatients.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Patients Found ({filteredPatients.length})
              </p>
              <div className="space-y-1">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigateToPatient(p.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          MRN: {p.mrn} • {p.gender} • {p.bloodGroup} • {p.phone}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medicine Matches */}
          {filteredMedicines.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Medicines & Pharmacy Items ({filteredMedicines.length})
              </p>
              <div className="space-y-1">
                {filteredMedicines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveNav('pharmacy');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {m.name} ({m.genericName})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Code: {m.code} • Stock: {m.currentStock} units • Price: ETB {m.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{m.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoice Matches */}
          {filteredInvoices.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Invoices & Billing Records ({filteredInvoices.length})
              </p>
              <div className="space-y-1">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setActiveNav('billing');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        <Receipt className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {inv.invoiceNumber} - {inv.patientName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Total: ETB {inv.total.toFixed(2)} • Due: ETB {inv.balanceDue.toFixed(2)} • Status: {inv.status}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty search */}
          {query.trim() &&
            filteredPatients.length === 0 &&
            filteredMedicines.length === 0 &&
            filteredInvoices.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No records found for "{query}"</p>
                <p className="text-[11px] mt-0.5">Check for spelling or try searching by Patient ID or Medicine code.</p>
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search records across all hospital branches</span>
          <div className="flex items-center gap-2">
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
