import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { UserRole, Staff } from '../../types';
import { Users, Search, Phone, Mail, Award, CheckCircle2, Shield } from 'lucide-react';

export const StaffDirectory: React.FC = () => {
  const { currentBranchId } = useApp();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const staff = dbService.getStaff(currentBranchId);

  const filteredStaff = staff.filter((s) => {
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      s.licenseNumber.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Hospital Staff Directory & Clinical Credentials</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Licensed physicians, nursing staff, pharmacists, laboratory analysts and administrative officers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'accountant'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                roleFilter === r
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((person) => (
          <div
            key={person.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={person.avatarUrl}
                alt={person.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
              />
              <div className="truncate">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {person.name}
                </h3>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 truncate">
                  {person.title}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Lic: {person.licenseNumber}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{person.departmentName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Role Permission:</span>
                <span className="font-bold capitalize text-teal-700 dark:text-teal-300">{person.role.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                {person.phone}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
