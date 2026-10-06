import React from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Printer, X, Download, ShieldCheck, Activity } from 'lucide-react';

export const PrintableDocument: React.FC = () => {
  const { printableDoc, setPrintableDoc, currentBranch } = useApp();
  const settings = dbService.getSettings();

  if (!printableDoc) return null;

  const handlePrint = () => {
    window.print();
  };

  const { type, data } = printableDoc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Top Action bar (hidden when printed) */}
        <div className="no-print bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Document Preview</span>
            <span className="text-xs text-slate-400">• Ready to print or export PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={() => setPrintableDoc(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas (A4 Styled) */}
        <div className="p-8 sm:p-12 text-slate-800 bg-white min-h-[600px] flex flex-col justify-between" id="printable-area">
          <div>
            {/* Hospital Official Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-teal-600 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-xs">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{settings.hospitalName}</h1>
                  <p className="text-xs font-medium text-teal-700">{settings.tagline}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentBranch?.address || settings.address}</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                <p>Phone: {settings.phone}</p>
                <p>Email: {settings.email}</p>
                <p>Web: {settings.website}</p>
                <p className="font-semibold text-teal-700 mt-1">Branch Code: {currentBranch?.code || 'PCM-01'}</p>
              </div>
            </div>

            {/* Document Content Dependent on Type */}
            {type === 'prescription' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Medical Prescription</span>
                    <h2 className="text-base font-bold text-slate-800">Rx ID: {data.id}</h2>
                    <p className="text-xs text-slate-500">Issued: {new Date(data.createdAt).toLocaleDateString()} at {new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">Doctor: {data.doctorName}</p>
                    <p className="text-xs text-slate-500">License: MD-ET-CERT</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400">Patient Name:</span>
                    <p className="font-bold text-slate-800">{data.patientName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Medical Record No (MRN):</span>
                    <p className="font-bold text-teal-700">{data.patientMrn}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prescribed Medications</h3>
                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold">
                        <th className="p-2 border border-slate-200">#</th>
                        <th className="p-2 border border-slate-200">Medicine & Dosage</th>
                        <th className="p-2 border border-slate-200">Frequency & Instructions</th>
                        <th className="p-2 border border-slate-200">Duration</th>
                        <th className="p-2 border border-slate-200 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-200 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-2 border border-slate-200">
                            <span className="font-bold text-slate-900">{item.medicineName}</span>
                            <span className="block text-[11px] text-slate-500">{item.dosage}</span>
                          </td>
                          <td className="p-2 border border-slate-200">
                            <span className="font-medium text-slate-800">{item.frequency}</span>
                            <span className="block text-[10px] text-slate-500">{item.instructions}</span>
                          </td>
                          <td className="p-2 border border-slate-200">{item.duration}</td>
                          <td className="p-2 border border-slate-200 text-right font-bold">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.notes && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
                    <span className="font-bold text-amber-800">Special Clinical Instructions: </span>
                    <span className="text-amber-900">{data.notes}</span>
                  </div>
                )}
              </div>
            )}

            {type === 'lab_report' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Clinical Pathology & Diagnostic Report</span>
                    <h2 className="text-base font-bold text-slate-800">Order #{data.orderNumber}</h2>
                    <p className="text-xs text-slate-500">Sample Date: {data.collectedAt ? new Date(data.collectedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">Ordering Physician: {data.doctorName}</p>
                    <p className="text-xs text-teal-600 font-medium">Status: {data.status?.toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400">Patient:</span>
                    <p className="font-bold text-slate-800">{data.patientName} (MRN: {data.patientMrn})</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Verified By:</span>
                    <p className="font-bold text-slate-800">{data.verifiedBy || 'Pending Clinical Pathologist Verification'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Test Results & Reference Values</h3>
                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold">
                        <th className="p-2 border border-slate-200">Test Parameter</th>
                        <th className="p-2 border border-slate-200">Observed Value</th>
                        <th className="p-2 border border-slate-200">Unit</th>
                        <th className="p-2 border border-slate-200">Reference Interval</th>
                        <th className="p-2 border border-slate-200 text-center">Status Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.results?.map((res: any, idx: number) => {
                        const isAbnormal = res.flag && res.flag !== 'normal';
                        return (
                          <tr key={idx} className={isAbnormal ? 'bg-amber-50/60 font-semibold' : 'border-b border-slate-200'}>
                            <td className="p-2 border border-slate-200">{res.parameter}</td>
                            <td className="p-2 border border-slate-200 text-slate-900 font-bold">{res.value}</td>
                            <td className="p-2 border border-slate-200 text-slate-500">{res.unit}</td>
                            <td className="p-2 border border-slate-200 text-slate-600">{res.referenceRange}</td>
                            <td className="p-2 border border-slate-200 text-center">
                              {res.flag === 'critical' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-800 font-black">CRITICAL</span>
                              ) : res.flag === 'high' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">HIGH</span>
                              ) : res.flag === 'low' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">LOW</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">NORMAL</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {data.technicianNotes && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">Laboratory Specialist Findings: </span>
                    <span className="text-slate-600">{data.technicianNotes}</span>
                  </div>
                )}
              </div>
            )}

            {type === 'invoice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Patient Invoice / Receipt</span>
                    <h2 className="text-base font-bold text-slate-800">{data.invoiceNumber}</h2>
                    <p className="text-xs text-slate-500">Date: {new Date(data.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      data.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Payment Status: {data.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Due Date: {data.dueDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400">Billed To:</span>
                    <p className="font-bold text-slate-800">{data.patientName}</p>
                    <p className="text-slate-500">MRN: {data.patientMrn}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Hospital Branch:</span>
                    <p className="font-bold text-slate-800">{currentBranch?.name}</p>
                  </div>
                </div>

                <div>
                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold">
                        <th className="p-2 border border-slate-200">Item / Service Description</th>
                        <th className="p-2 border border-slate-200">Category</th>
                        <th className="p-2 border border-slate-200 text-center">Qty</th>
                        <th className="p-2 border border-slate-200 text-right">Unit Price</th>
                        <th className="p-2 border border-slate-200 text-right">Total (ETB)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-200 font-medium text-slate-800">{item.description}</td>
                          <td className="p-2 border border-slate-200 capitalize text-slate-500">{item.category}</td>
                          <td className="p-2 border border-slate-200 text-center">{item.quantity}</td>
                          <td className="p-2 border border-slate-200 text-right font-mono">{Number(item.unitPrice).toFixed(2)}</td>
                          <td className="p-2 border border-slate-200 text-right font-bold font-mono">{Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-medium">ETB {Number(data.subtotal).toFixed(2)}</span>
                    </div>
                    {data.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span className="font-mono">- ETB {Number(data.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>VAT ({data.taxPercent}%):</span>
                      <span className="font-mono">ETB {Number(data.taxAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                      <span>Total Amount:</span>
                      <span className="font-mono text-teal-700">ETB {Number(data.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Amount Paid:</span>
                      <span className="font-mono">ETB {Number(data.paidAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold border-t border-dashed border-slate-200 pt-1">
                      <span>Balance Outstanding:</span>
                      <span className="font-mono">ETB {Number(data.balanceDue).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Signature Block */}
          <div className="border-t border-slate-200 pt-8 mt-12 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <div className="flex items-center gap-1.5 text-teal-700 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Official PulseCare Record</span>
              </div>
              <p className="text-[10px] text-slate-400">
                This document is electronically generated and digitally stored under tamper-evident audit control.
              </p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-48 ml-auto mb-1"></div>
              <p className="font-semibold text-slate-800">Authorized Signature & Stamp</p>
              <p className="text-[10px] text-slate-400">PulseCare Medical Services Directorate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
