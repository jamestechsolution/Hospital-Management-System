import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { UserRole } from '../../types';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { switchUserRole, showToast } = useApp();
  const [email, setEmail] = useState('dawit.a@pulsecare.et');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const demoAccounts: { role: UserRole; name: string; title: string; email: string }[] = [
    { role: 'admin', name: 'Dr. Almaz Bekele', title: 'Hospital Executive Director', email: 'almaz.b@pulsecare.et' },
    { role: 'doctor', name: 'Dr. Dawit Abebe', title: 'Chief of Internal Medicine', email: 'dawit.a@pulsecare.et' },
    { role: 'nurse', name: 'Sister Selamawit Desta', title: 'Head Triage Nurse', email: 'selamawit.d@pulsecare.et' },
    { role: 'pharmacist', name: 'PharmD Fitsum Tefera', title: 'Chief Pharmacist', email: 'fitsum.t@pulsecare.et' },
    { role: 'lab_technician', name: 'Yared Worku', title: 'Senior Biochemist (LIS)', email: 'yared.w@pulsecare.et' },
    { role: 'receptionist', name: 'Senait Kebede', title: 'Senior Patient Registrar', email: 'senait.k@pulsecare.et' },
    { role: 'accountant', name: 'Hanna Gizaw', title: 'Senior Billing Officer', email: 'hanna.g@pulsecare.et' },
  ];

  const handleSelectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    switchUserRole(acc.role);
    showToast(`Loaded ${acc.title} (${acc.name}) credentials`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Column: Hospital Branding & Healthcare Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-teal-800 flex items-center justify-center font-bold shadow-lg shadow-teal-900/30">
              <Activity className="w-6 h-6 text-teal-700 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">PulseCare HMS</span>
              <span className="block text-[11px] text-teal-200/80 font-medium">Enterprise Healthcare Operating Platform</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/50 border border-teal-500/30 text-teal-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>HIPAA Compliant & ISO 27001 Certified Clinical Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Unified Clinical, Laboratory, Pharmacy & Billing Intelligence.
            </h1>
            <p className="text-sm text-teal-100/80 leading-relaxed">
              Designed for high-reliability medical operations. Connects registration, triage, physician consultations, automated diagnostic LIS pipelines, medication stock control, and insurance co-pay processing across multiple hospital branches.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-teal-700/60">
            <div>
              <span className="text-2xl font-black text-white font-mono">99.99%</span>
              <p className="text-[11px] text-teal-200">Uptime Reliability</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white font-mono">&lt; 15s</span>
              <p className="text-[11px] text-teal-200">Patient Intake Time</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white font-mono">3 Branches</span>
              <p className="text-[11px] text-teal-200">Federated Synchronized</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-teal-300/60">
          © 2026 PulseCare Health Systems. All rights reserved.
        </div>

        {/* Ambient background circles */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Column: Login Portal */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 max-w-xl mx-auto w-full">
        <div className="space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">PulseCare HMS</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your clinical credentials to access your authorized department workstation.
            </p>
          </div>

          {/* Quick Demo Role Selectors */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Demo Login by Role</span>
              </span>
              <span className="text-[10px] text-teal-600">Click to switch</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc)}
                  className="p-1.5 rounded-lg text-left bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900/40 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/50 transition cursor-pointer text-xs group"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block truncate group-hover:text-teal-600">
                    {acc.role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {acc.name.split(' ')[0]} {acc.name.split(' ')[1]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hospital Staff Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                />
                <span>Remember this terminal</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered administrator.'); }} className="text-teal-600 dark:text-teal-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
            >
              <span>Sign In to Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
