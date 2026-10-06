import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Medicine, Prescription } from '../../types';
import {
  Pill,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  AlertTriangle,
  Plus,
  Boxes,
  ArrowDownToLine,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const PharmacyView: React.FC = () => {
  const { currentBranchId, currentUser, currentRole, setPrintableDoc, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRxForDispense, setSelectedRxForDispense] = useState<Prescription | null>(null);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [selectedMedForStockIn, setSelectedMedForStockIn] = useState<Medicine | null>(null);
  const [stockInAmount, setStockInAmount] = useState<number>(100);

  const prescriptions = dbService.getPrescriptions(currentBranchId);
  const medicines = dbService.getMedicines(currentBranchId);

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'pending');
  const dispensedPrescriptions = prescriptions.filter((p) => p.status === 'dispensed');
  const lowStockCount = medicines.filter((m) => m.currentStock <= m.minimumStock).length;

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDispense = (rx: Prescription) => {
    // Check if sufficient stock exists for all items
    for (const item of rx.items) {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (med && med.currentStock < item.quantity) {
        showToast(`Insufficient stock for ${med.name}! Available: ${med.currentStock}`, 'error');
        return;
      }
    }

    dbService.dispensePrescription(rx.id, {
      id: currentUser.id,
      name: currentUser.name,
      role: currentRole,
    });

    showToast(`Prescription dispensed to ${rx.patientName}. Inventory updated.`, 'success');
    setSelectedRxForDispense(null);
  };

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForStockIn) return;

    dbService.updateMedicineStock(selectedMedForStockIn.id, Number(stockInAmount), {
      id: currentUser.id,
      name: currentUser.name,
      role: currentRole,
    });

    showToast(`Added ${stockInAmount} units to ${selectedMedForStockIn.name}`, 'success');
    setIsStockInModalOpen(false);
    setSelectedMedForStockIn(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-500" />
            <span>Pharmacy & Formulary Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prescription verification, automated stock deduction, batch lot numbers & restock orders
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'prescriptions'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prescription Queue ({pendingPrescriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Inventory ({medicines.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Prescriptions Waiting</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {pendingPrescriptions.length}
            </p>
            <span className="text-[11px] text-teal-600 font-medium">Ready for review</span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Dispensed Today</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dispensedPrescriptions.length}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Completed orders</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Low Stock Alerts</span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {lowStockCount}
            </p>
            <span className="text-[11px] text-rose-500 font-medium">Below reorder threshold</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: Prescription Queue */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-3">
          {prescriptions.map((rx) => {
            const isPending = rx.status === 'pending';

            return (
              <div
                key={rx.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500">{rx.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {rx.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rx.patientName} <span className="font-mono text-xs text-teal-600 font-normal">({rx.patientMrn})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Prescribing Physician: {rx.doctorName}</p>
                  </div>

                  {/* Medicines in prescription */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rx.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">{it.medicineName}</span>
                        <span className="text-slate-400 ml-1">× {it.quantity}</span>
                        <span className="block text-[10px] text-slate-500">{it.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setPrintableDoc({
                        type: 'prescription',
                        title: `Prescription ${rx.id}`,
                        data: rx,
                      })
                    }
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Print Prescription Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {isPending && (
                    <button
                      onClick={() => handleDispense(rx)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Dispense</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Medicine Formulary & Stock Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine name, generic name, category, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Medicine Details</th>
                  <th className="py-3 px-4">Form & Strength</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMedicines.map((med) => {
                  const isLow = med.currentStock <= med.minimumStock;
                  const isCritical = med.currentStock <= med.minimumStock / 3;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{med.name}</p>
                        <p className="text-[10px] text-slate-400">{med.genericName} • {med.code}</p>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {med.dosageForm} ({med.strength})
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {med.category}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {med.location}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {med.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">units</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-teal-700 dark:text-teal-400">
                        ETB {med.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {isCritical ? 'Critical Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedMedForStockIn(med);
                            setIsStockInModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 transition"
                        >
                          + Stock In
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {isStockInModalOpen && selectedMedForStockIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Replenish Stock / Stock In
            </h2>
            <p className="text-slate-500">
              Add inventory for <strong className="text-slate-800 dark:text-slate-200">{selectedMedForStockIn.name}</strong>. Current stock: {selectedMedForStockIn.currentStock} units.
            </p>

            <form onSubmit={handleStockInSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={stockInAmount}
                  onChange={(e) => setStockInAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-base"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Confirm Replenishment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
