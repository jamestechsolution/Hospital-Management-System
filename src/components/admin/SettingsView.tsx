import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { SystemSettings } from '../../types';
import { Settings, Save, RotateCcw, Building, ShieldCheck, DollarSign } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, currentRole, showToast } = useApp();
  const initialSettings = dbService.getSettings();

  const [settings, setSettings] = useState<SystemSettings>(initialSettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateSettings(settings, {
      id: currentUser.id,
      name: currentUser.name,
      role: currentRole,
    });
    showToast('System configuration successfully updated and saved', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo patient, clinical, lab, pharmacy and billing data back to realistic initial factory defaults?')) {
      dbService.resetToDefaults();
      setSettings(dbService.getSettings());
      showToast('Database reset to initial demo seeds', 'info');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <span>Hospital Operational & System Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Branding, currency, tax rates, regulatory compliance thresholds and branch parameters
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        {/* Hospital Branding & Identity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Building className="w-4 h-4 text-teal-600" />
            <span>Hospital Identity & Letterhead</span>
          </h2>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Hospital Organization Name
            </label>
            <input
              type="text"
              value={settings.hospitalName}
              onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tagline / Subheading
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Central Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Hospital Registered Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Financial & Compliance Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Financial & Billing Parameters</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                System Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 font-bold"
              >
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Default VAT / Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.defaultVatRate}
                onChange={(e) => setSettings({ ...settings, defaultVatRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 font-mono font-bold"
              />
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pt-3 pb-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Clinical & Inventory Governance</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Mandatory Lab Verification
                </span>
                <span className="text-[11px] text-slate-400">
                  Require licensed pathologist sign-off before releasing lab report to doctor & patient
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireLabVerification}
                onChange={(e) => setSettings({ ...settings, requireLabVerification: e.target.checked })}
                className="w-4 h-4 accent-teal-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Strict Inventory Balance (No Negative Stock)
                </span>
                <span className="text-[11px] text-slate-400">
                  Prevent pharmacy dispensing when medicine stock on hand is zero or insufficient
                </span>
              </div>
              <input
                type="checkbox"
                checked={!settings.allowNegativeStock}
                onChange={(e) => setSettings({ ...settings, allowNegativeStock: !e.target.checked })}
                className="w-4 h-4 accent-teal-600"
              />
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
