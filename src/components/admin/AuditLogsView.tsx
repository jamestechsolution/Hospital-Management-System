import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { AuditLog } from '../../types';
import { ShieldAlert, Search, Filter, ShieldCheck, Clock, Terminal } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { currentBranchId } = useApp();
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const logs = dbService.getAuditLogs(currentBranchId);

  const filteredLogs = logs.filter((log) => {
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <span>Immutable Security Audit Log & Compliance Stream</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tamper-evident healthcare security trail recording user events, prescriptions, lab results, and financial transactions
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'Patients', 'Appointments', 'Clinical', 'Laboratory', 'Pharmacy', 'Billing'].map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap ${
                moduleFilter === m
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit events by user name, action, or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4">Host IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{log.userName}</p>
                    <span className="text-[10px] text-teal-600 font-semibold capitalize">{log.userRole.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
