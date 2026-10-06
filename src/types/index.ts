export type UserRole = 
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technician'
  | 'receptionist'
  | 'accountant';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isMain: boolean;
  active: boolean;
}

export interface Department {
  id: string;
  branchId: string;
  name: string;
  code: string;
  headDoctorId?: string;
  description: string;
}

export interface Staff {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  title: string; // e.g. Dr., RN, PharmD
  departmentId: string;
  departmentName: string;
  branchId: string;
  email: string;
  phone: string;
  licenseNumber: string;
  avatarUrl: string;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. PC-2026-0042
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  city: string;
  branchId: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    coveragePercent: number;
    expiryDate: string;
    isInsured: boolean;
  };
  allergies: string[];
  chronicConditions: string[];
  registeredAt: string;
  avatarUrl?: string;
  status: 'active' | 'inpatient' | 'discharged';
}

export interface VitalSign {
  id: string;
  patientId: string;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  heartRate: number; // bpm
  temperature: number; // Celsius
  respiratoryRate: number; // breaths/min
  spO2: number; // %
  weightKg: number;
  heightCm: number;
  bmi: number;
  notes?: string;
  status: 'normal' | 'warning' | 'critical';
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_consultation' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export type OPDStage = 'registered' | 'triage' | 'doctor_queue' | 'consultation' | 'lab_pharmacy' | 'billing' | 'completed';

export interface OPDVisit {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  branchId: string;
  queueNumber: string; // e.g. Q-014
  stage: OPDStage;
  priority: 'routine' | 'urgent' | 'emergency';
  arrivalTime: string;
  chiefComplaint: string;
  vitalsId?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  completedAt?: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string; // e.g. 500mg
  frequency: string; // e.g. Three times daily
  duration: string; // e.g. 7 days
  instructions: string;
  quantity: number;
  dispensedQuantity: number;
  unitPrice: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  visitId?: string;
  branchId: string;
  items: PrescriptionItem[];
  status: 'pending' | 'partially_dispensed' | 'dispensed' | 'cancelled';
  createdAt: string;
  dispensedAt?: string;
  dispensedBy?: string;
  notes?: string;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: string; // Antibiotic, Analgesic, Antihypertensive, etc.
  strength: string; // 500mg, 10mg/ml
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'inhaler';
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  reorderLevel: number;
  location: string; // Shelf A-3
  branchId: string;
  batches: MedicineBatch[];
}

export interface MedicineBatch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  supplierName: string;
}

export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Immunology' | 'Radiology' | 'Pathology';
  sampleType: 'Blood' | 'Serum' | 'Urine' | 'Stool' | 'Swab' | 'Imaging';
  price: number;
  turnaroundHours: number;
  referenceRanges: {
    parameter: string;
    normalMin: number;
    normalMax: number;
    unit: string;
  }[];
}

export type LabOrderStatus = 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'verified';

export interface LabResultItem {
  parameter: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'low' | 'high' | 'critical';
}

export interface LabOrder {
  id: string;
  orderNumber: string; // e.g. LAB-2026-0891
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  branchId: string;
  tests: {
    testId: string;
    testName: string;
    price: number;
  }[];
  status: LabOrderStatus;
  clinicalNotes?: string;
  results?: LabResultItem[];
  technicianNotes?: string;
  orderedAt: string;
  collectedAt?: string;
  completedAt?: string;
  verifiedBy?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'consultation' | 'lab' | 'pharmacy' | 'procedure' | 'room' | 'other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-1042
  patientId: string;
  patientName: string;
  patientMrn: string;
  branchId: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxPercent: number; // e.g. 15% VAT
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  status: 'paid' | 'partial' | 'unpaid' | 'refunded';
  createdAt: string;
  dueDate: string;
  payments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'telebirr' | 'card' | 'bank_transfer' | 'insurance';
  referenceNumber: string;
  recordedBy: string;
  recordedAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "CREATE_PATIENT", "RECORD_VITALS", "DISPENSE_MEDICINE"
  module: 'Patients' | 'Appointments' | 'Clinical' | 'Laboratory' | 'Pharmacy' | 'Billing' | 'Staff' | 'Settings';
  details: string;
  ipAddress: string;
  timestamp: string;
  branchId: string;
}

export interface Notification {
  id: string;
  userId?: string;
  roleTarget?: UserRole | 'all';
  branchId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SystemSettings {
  hospitalName: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  currency: 'ETB' | 'USD' | 'EUR';
  defaultVatRate: number;
  allowNegativeStock: boolean;
  requireLabVerification: boolean;
  language: 'en' | 'om' | 'am';
}
