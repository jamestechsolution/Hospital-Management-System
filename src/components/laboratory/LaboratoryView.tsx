import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { LabOrder, LabOrderStatus, LabResultItem } from '../../types';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  AlertTriangle,
  FileText,
  Activity,
  User,
  Plus,
} from 'lucide-react';

export const LaboratoryView: React.FC = () => {
  const { currentBranchId, currentUser, currentRole, setPrintableDoc, showToast } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrderForResults, setActiveOrderForResults] = useState<LabOrder | null>(null);

  const labOrders = dbService.getLabOrders(currentBranchId);
  const labTestCatalog = dbService.getLabTests();

  const filteredOrders = labOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientMrn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (order: LabOrder, newStatus: LabOrderStatus) => {
    dbService.updateLabOrderStatus(order.id, newStatus, {}, { id: currentUser.id, name: currentUser.name, role: currentRole });
    showToast(`Order ${order.orderNumber} moved to ${newStatus.replace('_', ' ')}`, 'success');
  };

  const handleOpenResultEntry = (order: LabOrder) => {
    // If order has no results yet, pre-populate parameters from the test catalog
    if (!order.results || order.results.length === 0) {
      const generatedResults: LabResultItem[] = [];
      order.tests.forEach((t) => {
        const catalogItem = labTestCatalog.find((cat) => cat.id === t.testId);
        if (catalogItem) {
          catalogItem.referenceRanges.forEach((ref) => {
            const avgVal = ((ref.normalMin + ref.normalMax) / 2).toFixed(1);
            generatedResults.push({
              parameter: ref.parameter,
              value: avgVal,
              numericValue: Number(avgVal),
              unit: ref.unit,
              referenceRange: `${ref.normalMin} - ${ref.normalMax}`,
              flag: 'normal',
            });
          });
        }
      });
      setActiveOrderForResults({ ...order, results: generatedResults });
    } else {
      setActiveOrderForResults(order);
    }
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderForResults) return;

    dbService.updateLabOrderStatus(
      activeOrderForResults.id,
      'verified',
      {
        results: activeOrderForResults.results,
        technicianNotes: activeOrderForResults.technicianNotes,
        verifiedBy: `${currentUser.name} (${currentUser.title})`,
      },
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );

    showToast(`Results verified and released for ${activeOrderForResults.orderNumber}`, 'success');
    setActiveOrderForResults(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-500" />
            <span>Laboratory Information System (LIS)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Specimen collection tracking, analyzer results entry, reference flags & report release
          </p>
        </div>

        {/* LIS Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'ordered', label: '1. Requested' },
            { id: 'sample_collected', label: '2. Collected' },
            { id: 'in_progress', label: '3. In Progress' },
            { id: 'verified', label: '4. Verified & Released' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, patient name, or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Patient Demographics</th>
                <th className="py-3 px-4">Tests Ordered</th>
                <th className="py-3 px-4">Ordering Physician</th>
                <th className="py-3 px-4">Ordered Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => {
                const hasAbnormal = order.results?.some((r) => r.flag && r.flag !== 'normal');

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                      {hasAbnormal && (
                        <span className="block text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{order.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{order.patientMrn}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {order.tests.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-block mr-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {t.testName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {order.doctorName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(order.orderedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : order.status === 'sample_collected'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'ordered' && (
                          <button
                            onClick={() => handleUpdateStatus(order, 'sample_collected')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          >
                            Collect Specimen
                          </button>
                        )}

                        {order.status === 'sample_collected' && (
                          <button
                            onClick={() => handleUpdateStatus(order, 'in_progress')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          >
                            Start Analysis
                          </button>
                        )}

                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => handleOpenResultEntry(order)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                          >
                            Enter Results
                          </button>
                        )}

                        {order.status === 'verified' && (
                          <button
                            onClick={() =>
                              setPrintableDoc({
                                type: 'lab_report',
                                title: `Lab Report ${order.orderNumber}`,
                                data: order,
                              })
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print Report</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Entry Modal */}
      {activeOrderForResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter Laboratory Results & Release Report
                </h2>
                <p className="text-[11px] text-slate-500">
                  Order #{activeOrderForResults.orderNumber} • Patient: {activeOrderForResults.patientName}
                </p>
              </div>
              <button
                onClick={() => setActiveOrderForResults(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResults} className="p-6 overflow-y-auto space-y-4 text-xs">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Observed Value</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Ref Range</th>
                    <th className="p-2">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeOrderForResults.results?.map((res, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{res.parameter}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={res.value}
                          onChange={(e) => {
                            const updated = [...(activeOrderForResults.results || [])];
                            updated[idx].value = e.target.value;
                            setActiveOrderForResults({ ...activeOrderForResults, results: updated });
                          }}
                          className="w-24 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                        />
                      </td>
                      <td className="p-2 text-slate-400">{res.unit}</td>
                      <td className="p-2 text-slate-500">{res.referenceRange}</td>
                      <td className="p-2">
                        <select
                          value={res.flag}
                          onChange={(e) => {
                            const updated = [...(activeOrderForResults.results || [])];
                            updated[idx].flag = e.target.value as any;
                            setActiveOrderForResults({ ...activeOrderForResults, results: updated });
                          }}
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-[10px]"
                        >
                          <option value="normal">NORMAL</option>
                          <option value="high">HIGH</option>
                          <option value="low">LOW</option>
                          <option value="critical">CRITICAL</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Technician Clinical Interpretation / Morphology Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Smear examined, white blood cells appear reactive..."
                  value={activeOrderForResults.technicianNotes || ''}
                  onChange={(e) =>
                    setActiveOrderForResults({
                      ...activeOrderForResults,
                      technicianNotes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOrderForResults(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  Verify & Release Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
