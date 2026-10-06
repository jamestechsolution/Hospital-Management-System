import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import {
  FileBarChart2,
  Download,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Pill,
  FlaskConical,
  Printer,
  TrendingUp,
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const { currentBranchId, setPrintableDoc, showToast } = useApp();

  const [category, setCategory] = useState<'financial' | 'clinical' | 'pharmacy' | 'laboratory'>('financial');
  const [dateRange, setDateRange] = useState('30days');

  const patients = dbService.getPatients(currentBranchId);
  const visits = dbService.getOPDVisits(currentBranchId);
  const invoices = dbService.getInvoices(currentBranchId);
  const medicines = dbService.getMedicines(currentBranchId);
  const labOrders = dbService.getLabOrders(currentBranchId);

  const totalRevenue = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalBilled = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalUnpaid = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `report_${category}.csv`;

    if (category === 'financial') {
      headers = ['Invoice #', 'Patient Name', 'Total (ETB)', 'Paid (ETB)', 'Balance (ETB)', 'Status', 'Date'];
      rows = invoices.map((i) => [i.invoiceNumber, i.patientName, i.total, i.paidAmount, i.balanceDue, i.status, i.createdAt]);
    } else if (category === 'clinical') {
      headers = ['Queue #', 'Patient Name', 'Doctor', 'Complaint', 'Diagnosis', 'Stage', 'Arrival Time'];
      rows = visits.map((v) => [v.queueNumber, v.patientName, v.doctorName, v.chiefComplaint, v.diagnosis || 'None', v.stage, v.arrivalTime]);
    } else if (category === 'pharmacy') {
      headers = ['Code', 'Medicine Name', 'Category', 'Stock', 'Min Stock', 'Unit Price'];
      rows = medicines.map((m) => [m.code, m.name, m.category, m.currentStock, m.minimumStock, m.unitPrice]);
    } else {
      headers = ['Order #', 'Patient', 'Tests', 'Status', 'Ordered At', 'Verified By'];
      rows = labOrders.map((l) => [l.orderNumber, l.patientName, l.tests.map((t) => t.testName).join('; '), l.status, l.orderedAt, l.verifiedBy || 'Pending']);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${category} report to CSV`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-teal-600" />
            <span>Executive Health Reports & Analytics Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export operational metrics, financial summaries, pharmaceutical consumption and clinical outcomes
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export {category.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'financial', label: 'Financial & Revenue Ledger', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'clinical', label: 'Clinical OPD & Encounters', icon: <Activity className="w-4 h-4" /> },
          { id: 'pharmacy', label: 'Pharmacy & Stock Valuation', icon: <Pill className="w-4 h-4" /> },
          { id: 'laboratory', label: 'LIS Diagnostic Turnaround', icon: <FlaskConical className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id as any)}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              category === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Report Data Table */}
      {category === 'financial' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 font-semibold">Total Invoiced Amount</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">ETB {totalBilled.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Total Collections (Cash/Telebirr)</span>
              <p className="text-xl font-black text-emerald-600 mt-1">ETB {totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Current Accounts Receivable</span>
              <p className="text-xl font-black text-rose-600 mt-1">ETB {totalUnpaid.toFixed(2)}</p>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold">{inv.invoiceNumber}</td>
                  <td className="p-3">{inv.patientName}</td>
                  <td className="p-3 font-mono text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-bold font-mono">ETB {inv.total.toFixed(2)}</td>
                  <td className="p-3 font-mono text-emerald-600 font-semibold">ETB {inv.paidAmount.toFixed(2)}</td>
                  <td className="p-3 font-mono text-rose-600 font-bold">ETB {inv.balanceDue.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {category === 'clinical' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <th className="p-3">Queue ID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Attending Physician</th>
                <th className="p-3">Chief Complaint</th>
                <th className="p-3">Diagnosis</th>
                <th className="p-3">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visits.map((vis) => (
                <tr key={vis.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold">{vis.queueNumber}</td>
                  <td className="p-3 font-bold">{vis.patientName}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{vis.doctorName}</td>
                  <td className="p-3 text-slate-500">{vis.chiefComplaint}</td>
                  <td className="p-3 font-semibold text-teal-700 dark:text-teal-400">{vis.diagnosis || 'Pending'}</td>
                  <td className="p-3 capitalize">{vis.stage.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {category === 'pharmacy' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <th className="p-3">Medicine Code</th>
                <th className="p-3">Item Name & Strength</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock on Hand</th>
                <th className="p-3">Reorder Point</th>
                <th className="p-3">Unit Price (ETB)</th>
                <th className="p-3">Total Valuation (ETB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {medicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-400">{m.code}</td>
                  <td className="p-3 font-bold">{m.name}</td>
                  <td className="p-3 text-slate-500">{m.category}</td>
                  <td className="p-3 font-mono font-bold">{m.currentStock} units</td>
                  <td className="p-3 text-slate-500">{m.reorderLevel} units</td>
                  <td className="p-3 font-mono">{m.unitPrice.toFixed(2)}</td>
                  <td className="p-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {(m.currentStock * m.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {category === 'laboratory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <th className="p-3">Order #</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Tests Conducted</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ordered Date</th>
                <th className="p-3">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {labOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold">{ord.orderNumber}</td>
                  <td className="p-3 font-bold">{ord.patientName}</td>
                  <td className="p-3">{ord.tests.map((t) => t.testName).join(', ')}</td>
                  <td className="p-3 uppercase font-semibold text-emerald-600">{ord.status}</td>
                  <td className="p-3 font-mono text-slate-500">{new Date(ord.orderedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{ord.verifiedBy || 'In Process'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
