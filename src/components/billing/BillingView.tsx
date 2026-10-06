import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Invoice, PaymentRecord, InvoiceItem } from '../../types';
import {
  Receipt,
  Search,
  DollarSign,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  CreditCard,
  Building,
  Smartphone,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { currentBranchId, currentUser, currentRole, setPrintableDoc, showToast } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('telebirr');
  const [paymentRef, setPaymentRef] = useState('TB-' + Math.floor(100000000 + Math.random() * 900000000));
  const [paymentNotes, setPaymentNotes] = useState('Payment collected at hospital cashier counter');

  // Form state for creating invoice
  const [newInvoicePatientId, setNewInvoicePatientId] = useState('patient-1');
  const [newInvoiceItems, setNewInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'General Outpatient Medical Consultation', category: 'consultation', quantity: 1, unitPrice: 400, total: 400 },
  ]);
  const [newInvoiceDiscount, setNewInvoiceDiscount] = useState<number>(0);

  const invoices = dbService.getInvoices(currentBranchId);
  const patients = dbService.getPatients(currentBranchId);

  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientMrn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    if (paymentAmount <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }

    dbService.recordPayment(
      selectedInvoiceForPayment.id,
      Number(paymentAmount),
      paymentMethod,
      paymentRef,
      paymentNotes,
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );

    showToast(`Payment of ETB ${paymentAmount.toFixed(2)} recorded for ${selectedInvoiceForPayment.invoiceNumber}`, 'success');
    setSelectedInvoiceForPayment(null);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === newInvoicePatientId) || patients[0];

    const subtotal = newInvoiceItems.reduce((acc, it) => acc + it.total, 0);
    const taxPercent = 15; // 15% VAT
    const discountedSubtotal = Math.max(0, subtotal - newInvoiceDiscount);
    const taxAmount = Number(((discountedSubtotal * taxPercent) / 100).toFixed(2));
    const total = Number((discountedSubtotal + taxAmount).toFixed(2));

    const newInv = dbService.createInvoice(
      {
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientMrn: patient.mrn,
        branchId: patient.branchId,
        items: newInvoiceItems,
        subtotal,
        discount: newInvoiceDiscount,
        taxPercent,
        taxAmount,
        total,
        dueDate: '2026-10-05',
      },
      { id: currentUser.id, name: currentUser.name, role: currentRole }
    );

    showToast(`Created Invoice ${newInv.invoiceNumber}`, 'success');
    setIsCreateInvoiceOpen(false);

    // Offer print preview
    setPrintableDoc({
      type: 'invoice',
      title: `Invoice ${newInv.invoiceNumber}`,
      data: newInv,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-500" />
            <span>Hospital Billing & Revenue Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Invoicing, collection journals, Telebirr & insurance co-pays with itemized tax records
          </p>
        </div>

        <button
          onClick={() => setIsCreateInvoiceOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Revenue Collected</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xs font-bold text-slate-400">ETB</span>
            <span className="text-2xl font-black text-emerald-600">
              {totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Settled and banked funds</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Outstanding Balance Due</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xs font-bold text-slate-400">ETB</span>
            <span className="text-2xl font-black text-rose-600">
              {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-rose-500 font-medium">Pending collection from patients/insurers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Invoiced Billing</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xs font-bold text-slate-400">ETB</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">{invoices.length} invoices generated</span>
        </div>
      </div>

      {/* Invoice Filter & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice number, patient name, or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'paid', 'partial', 'unpaid'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient Demographics</th>
                <th className="py-3 px-4">Services Billed</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{inv.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inv.patientMrn}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-600 dark:text-slate-300">
                      {inv.items.map((i) => i.description).slice(0, 2).join(', ')}
                      {inv.items.length > 2 && ` +${inv.items.length - 2} more`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ETB {inv.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">
                    ETB {inv.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-600 font-bold">
                    ETB {inv.balanceDue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : inv.status === 'partial'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          setPrintableDoc({
                            type: 'invoice',
                            title: `Invoice ${inv.invoiceNumber}`,
                            data: inv,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Print Invoice / Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setPaymentAmount(inv.balanceDue);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 transition"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Drawer / Modal */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Record Cashier Payment</h2>
                <p className="text-[11px] text-slate-500">Invoice: {selectedInvoiceForPayment.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Patient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedInvoiceForPayment.patientName}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Invoice:</span>
                <span className="font-mono">ETB {selectedInvoiceForPayment.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Outstanding Balance:</span>
                <span className="font-mono">ETB {selectedInvoiceForPayment.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount to Collect (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0.01}
                  max={selectedInvoiceForPayment.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-base outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'telebirr', label: 'Telebirr', icon: <Smartphone className="w-3.5 h-3.5" /> },
                    { id: 'cash', label: 'Cash Desk', icon: <DollarSign className="w-3.5 h-3.5" /> },
                    { id: 'card', label: 'Debit/Credit Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
                    { id: 'insurance', label: 'Insurance Co-Pay', icon: <Building className="w-3.5 h-3.5" /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                        paymentMethod === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Reference / Receipt #
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Invoice Modal */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Generate Itemized Patient Invoice</h2>
              <button onClick={() => setIsCreateInvoiceOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Patient</label>
                <select
                  value={newInvoicePatientId}
                  onChange={(e) => setNewInvoicePatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Services & Medication Items</span>
                <div className="space-y-2">
                  {newInvoiceItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...newInvoiceItems];
                          updated[idx].description = e.target.value;
                          setNewInvoiceItems(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...newInvoiceItems];
                          updated[idx].quantity = Number(e.target.value);
                          updated[idx].total = updated[idx].quantity * updated[idx].unitPrice;
                          setNewInvoiceItems(updated);
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...newInvoiceItems];
                          updated[idx].unitPrice = Number(e.target.value);
                          updated[idx].total = updated[idx].quantity * updated[idx].unitPrice;
                          setNewInvoiceItems(updated);
                        }}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        placeholder="Price"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNewInvoiceItems([
                      ...newInvoiceItems,
                      { id: String(Date.now()), description: 'Medication / Laboratory Fee', category: 'procedure', quantity: 1, unitPrice: 250, total: 250 },
                    ])
                  }
                  className="mt-2 text-teal-600 dark:text-teal-400 font-bold hover:underline"
                >
                  + Add Item
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Generate & Preview Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
