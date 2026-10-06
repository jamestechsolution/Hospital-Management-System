import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Patient } from '../../types';
import { X, Check, ArrowRight, ArrowLeft, UserPlus, Shield, HeartPulse } from 'lucide-react';

interface PatientRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient: Patient) => void;
}

export const PatientRegisterModal: React.FC<PatientRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, currentRole, currentBranchId, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '1995-05-15',
    gender: 'female' as Patient['gender'],
    bloodGroup: 'O+' as Patient['bloodGroup'],
    phone: '+251 9',
    email: '',
    address: 'Woreda 03, Bole',
    city: 'Addis Ababa',
    branchId: currentBranchId === 'all' ? 'branch-main' : currentBranchId,
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '+251 9',
    isInsured: false,
    insuranceProvider: 'Ethiopian Health Insurance Agency',
    insurancePolicyNumber: '',
    coveragePercent: 80,
    allergies: '',
    chronicConditions: '',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        showToast('Please provide both first and last name', 'warning');
        return;
      }
    }
    if (step === 2) {
      if (!formData.phone.trim() || formData.phone.length < 8) {
        showToast('Please enter a valid phone number', 'warning');
        return;
      }
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allergiesArr = formData.allergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const chronicArr = formData.chronicConditions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPatient = dbService.createPatient(
      {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@patient.et`,
        address: formData.address,
        city: formData.city,
        branchId: formData.branchId,
        emergencyContact: {
          name: formData.emergencyName || 'Family Member',
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone,
        },
        insurance: {
          isInsured: formData.isInsured,
          provider: formData.isInsured ? formData.insuranceProvider : 'Self Pay / None',
          policyNumber: formData.isInsured ? formData.insurancePolicyNumber : '',
          coveragePercent: formData.isInsured ? formData.coveragePercent : 0,
          expiryDate: formData.isInsured ? '2027-12-31' : '',
        },
        allergies: allergiesArr,
        chronicConditions: chronicArr,
        status: 'active',
      },
      {
        id: currentUser.id,
        name: currentUser.name,
        role: currentRole,
      }
    );

    showToast(`Patient ${newPatient.firstName} ${newPatient.lastName} registered! MRN: ${newPatient.mrn}`, 'success');
    onSuccess(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Register New Patient</h2>
              <p className="text-[11px] text-slate-500">Step {step} of 5 • Electronic Medical Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          {[
            { num: 1, label: 'Demographics' },
            { num: 2, label: 'Contact' },
            { num: 3, label: 'Emergency' },
            { num: 4, label: 'Insurance' },
            { num: 5, label: 'Review' },
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === st.num
                    ? 'bg-teal-600 text-white font-bold'
                    : step > st.num
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {step > st.num ? '✓' : st.num}
              </span>
              <span className={`hidden sm:inline ${step === st.num ? 'text-teal-700 dark:text-teal-300 font-bold' : 'text-slate-400'}`}>
                {st.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bethlehem"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tadesse"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  >
                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+251 91 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.et"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Woreda 03, House 42"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Emergency Contact Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Girma Tadesse"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={formData.emergencyRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend / Other">Friend / Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <span>Health Insurance Coverage</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isInsured}
                      onChange={(e) => setFormData({ ...formData, isInsured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {formData.isInsured && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Insurance Provider</label>
                      <input
                        type="text"
                        value={formData.insuranceProvider}
                        onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Policy / Card ID</label>
                      <input
                        type="text"
                        placeholder="POL-2026-XXXX"
                        value={formData.insurancePolicyNumber}
                        onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Known Allergies (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs, Aspirin"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chronic Medical Conditions (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-teal-50 dark:bg-teal-950/60 p-4 rounded-xl border border-teal-200 dark:border-teal-800 text-slate-800 dark:text-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-200">
                    Blood Group: {formData.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <p>DOB: {formData.dateOfBirth} ({formData.gender})</p>
                  <p>Phone: {formData.phone}</p>
                  <p>City: {formData.city}, {formData.address}</p>
                  <p>Emergency: {formData.emergencyName} ({formData.emergencyRelationship})</p>
                  <p>Insurance: {formData.isInsured ? formData.insuranceProvider : 'Self-Pay'}</p>
                  <p>Allergies: {formData.allergies || 'None documented'}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
                A permanent Medical Record Number (MRN) and initial electronic chart will be created. The patient can immediately be queued for Triage, OPD Consultation, or Emergency admission.
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Create Record</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
