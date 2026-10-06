import {
  Patient,
  Appointment,
  OPDVisit,
  VitalSign,
  Medicine,
  LabTest,
  LabOrder,
  Prescription,
  Invoice,
  PaymentRecord,
  AuditLog,
  Notification,
  Staff,
  Branch,
  Department,
  SystemSettings,
  UserRole,
} from '../types';

import {
  initialPatients,
  initialBranches,
  initialDepartments,
  initialStaff,
  initialMedicines,
  initialLabTests,
  initialVitalSigns,
  initialAppointments,
  initialOPDVisits,
  initialLabOrders,
  initialPrescriptions,
  initialInvoices,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
} from './mockData';

// Storage keys
const STORAGE_PREFIX = 'pulsecare_hms_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

class HospitalDatabaseService {
  private branches: Branch[];
  private departments: Department[];
  private staff: Staff[];
  private patients: Patient[];
  private medicines: Medicine[];
  private labTests: LabTest[];
  private vitalSigns: VitalSign[];
  private appointments: Appointment[];
  private opdVisits: OPDVisit[];
  private labOrders: LabOrder[];
  private prescriptions: Prescription[];
  private invoices: Invoice[];
  private auditLogs: AuditLog[];
  private notifications: Notification[];
  private settings: SystemSettings;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.branches = loadFromStorage('branches', initialBranches);
    this.departments = loadFromStorage('departments', initialDepartments);
    this.staff = loadFromStorage('staff', initialStaff);
    this.patients = loadFromStorage('patients', initialPatients);
    this.medicines = loadFromStorage('medicines', initialMedicines);
    this.labTests = loadFromStorage('labTests', initialLabTests);
    // Load vitals and ensure new historical mock records are merged if using cached storage
    const storedVitals = loadFromStorage<VitalSign[]>('vitalSigns', initialVitalSigns);
    const existingVitalIds = new Set(storedVitals.map((v) => v.id));
    const mergedVitals = [...storedVitals];
    for (const initV of initialVitalSigns) {
      if (!existingVitalIds.has(initV.id)) {
        mergedVitals.push(initV);
      }
    }
    this.vitalSigns = mergedVitals;
    this.appointments = loadFromStorage('appointments', initialAppointments);
    this.opdVisits = loadFromStorage('opdVisits', initialOPDVisits);
    this.labOrders = loadFromStorage('labOrders', initialLabOrders);
    this.prescriptions = loadFromStorage('prescriptions', initialPrescriptions);
    this.invoices = loadFromStorage('invoices', initialInvoices);
    this.auditLogs = loadFromStorage('auditLogs', initialAuditLogs);
    this.notifications = loadFromStorage('notifications', initialNotifications);
    this.settings = loadFromStorage('settings', initialSettings);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // Audit Log helper
  public logAudit(
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    module: AuditLog['module'],
    details: string,
    branchId: string = 'branch-main'
  ) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      userRole,
      action,
      module,
      details,
      ipAddress: '192.168.1.120',
      timestamp: new Date().toISOString(),
      branchId,
    };
    this.auditLogs.unshift(newLog);
    saveToStorage('auditLogs', this.auditLogs);
    this.notify();
  }

  // Notification helper
  public addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    saveToStorage('notifications', this.notifications);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveToStorage('notifications', this.notifications);
    this.notify();
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    saveToStorage('notifications', this.notifications);
    this.notify();
  }

  // Patients
  public getPatients(branchId?: string): Patient[] {
    if (!branchId || branchId === 'all') return this.patients;
    return this.patients.filter((p) => p.branchId === branchId);
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id || p.mrn === id);
  }

  public createPatient(patientData: Omit<Patient, 'id' | 'mrn' | 'registeredAt'>, creator: { id: string; name: string; role: UserRole }): Patient {
    const count = this.patients.length + 1;
    const year = new Date().getFullYear();
    const newPatient: Patient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      mrn: `PC-${year}-${String(count).padStart(4, '0')}`,
      registeredAt: new Date().toISOString(),
    };
    this.patients.unshift(newPatient);
    saveToStorage('patients', this.patients);
    
    this.logAudit(
      creator.id,
      creator.name,
      creator.role,
      'REGISTER_PATIENT',
      'Patients',
      `Registered new patient: ${newPatient.firstName} ${newPatient.lastName} (${newPatient.mrn})`,
      newPatient.branchId
    );

    this.notify();
    return newPatient;
  }

  public updatePatient(id: string, updates: Partial<Patient>, updater: { id: string; name: string; role: UserRole }) {
    this.patients = this.patients.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveToStorage('patients', this.patients);
    this.logAudit(updater.id, updater.name, updater.role, 'UPDATE_PATIENT', 'Patients', `Updated patient record for ID ${id}`);
    this.notify();
  }

  // Appointments
  public getAppointments(branchId?: string): Appointment[] {
    if (!branchId || branchId === 'all') return this.appointments;
    return this.appointments.filter((a) => a.branchId === branchId);
  }

  public createAppointment(apt: Omit<Appointment, 'id' | 'createdAt'>, creator: { id: string; name: string; role: UserRole }): Appointment {
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.appointments.unshift(newApt);
    saveToStorage('appointments', this.appointments);

    this.logAudit(
      creator.id,
      creator.name,
      creator.role,
      'BOOK_APPOINTMENT',
      'Appointments',
      `Scheduled appointment for ${apt.patientName} with ${apt.doctorName} at ${apt.time}`
    );

    this.notify();
    return newApt;
  }

  public updateAppointmentStatus(id: string, status: Appointment['status'], updater: { id: string; name: string; role: UserRole }) {
    this.appointments = this.appointments.map((a) => (a.id === id ? { ...a, status } : a));
    saveToStorage('appointments', this.appointments);
    this.logAudit(updater.id, updater.name, updater.role, 'UPDATE_APPOINTMENT_STATUS', 'Appointments', `Appointment ${id} status set to ${status}`);
    this.notify();
  }

  // OPD Visits & Queue
  public getOPDVisits(branchId?: string): OPDVisit[] {
    if (!branchId || branchId === 'all') return this.opdVisits;
    return this.opdVisits.filter((v) => v.branchId === branchId);
  }

  public createOPDVisit(visit: Omit<OPDVisit, 'id' | 'queueNumber'>, creator: { id: string; name: string; role: UserRole }): OPDVisit {
    const queueNum = `OPD-${String(this.opdVisits.length + 1).padStart(3, '0')}`;
    const newVisit: OPDVisit = {
      ...visit,
      id: `visit-${Date.now()}`,
      queueNumber: queueNum,
    };
    this.opdVisits.unshift(newVisit);
    saveToStorage('opdVisits', this.opdVisits);
    this.logAudit(creator.id, creator.name, creator.role, 'ADMIT_TO_OPD', 'Clinical', `Checked in ${visit.patientName} to OPD (${queueNum})`);
    this.notify();
    return newVisit;
  }

  public updateOPDVisit(id: string, updates: Partial<OPDVisit>, updater: { id: string; name: string; role: UserRole }) {
    this.opdVisits = this.opdVisits.map((v) => (v.id === id ? { ...v, ...updates } : v));
    saveToStorage('opdVisits', this.opdVisits);
    this.logAudit(updater.id, updater.name, updater.role, 'UPDATE_OPD_VISIT', 'Clinical', `Updated visit notes for ${id}`);
    this.notify();
  }

  // Vitals
  public getVitalsForPatient(patientId: string): VitalSign[] {
    return this.vitalSigns
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  public recordVitalSign(vital: Omit<VitalSign, 'id' | 'recordedAt' | 'bmi' | 'status'>, recorder: { id: string; name: string; role: UserRole }): VitalSign {
    const heightInMeters = vital.heightCm / 100;
    const bmi = Number((vital.weightKg / (heightInMeters * heightInMeters)).toFixed(1));
    
    // Evaluate status
    let status: VitalSign['status'] = 'normal';
    if (
      vital.bloodPressureSystolic >= 160 ||
      vital.bloodPressureDiastolic >= 100 ||
      vital.heartRate > 115 ||
      vital.spO2 < 93 ||
      vital.temperature >= 39.0
    ) {
      status = 'critical';
    } else if (
      vital.bloodPressureSystolic >= 140 ||
      vital.bloodPressureDiastolic >= 90 ||
      vital.heartRate > 100 ||
      vital.spO2 < 95 ||
      vital.temperature >= 38.0
    ) {
      status = 'warning';
    }

    const newVital: VitalSign = {
      ...vital,
      id: `vit-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      bmi,
      status,
    };

    this.vitalSigns.unshift(newVital);
    saveToStorage('vitalSigns', this.vitalSigns);

    this.logAudit(
      recorder.id,
      recorder.name,
      recorder.role,
      'RECORD_VITALS',
      'Clinical',
      `Recorded vitals for patient ${vital.patientId}. BP: ${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}, Temp: ${vital.temperature}°C (${status})`
    );

    if (status === 'critical') {
      this.addNotification({
        roleTarget: 'doctor',
        branchId: 'branch-main',
        title: 'Critical Vitals Alert',
        message: `Patient ${vital.patientId} has abnormal vital signs recorded by ${recorder.name}`,
        type: 'urgent',
      });
    }

    this.notify();
    return newVital;
  }

  // Lab Tests & Orders
  public getLabTests(): LabTest[] {
    return this.labTests;
  }

  public getLabOrders(branchId?: string): LabOrder[] {
    if (!branchId || branchId === 'all') return this.labOrders;
    return this.labOrders.filter((o) => o.branchId === branchId);
  }

  public createLabOrder(order: Omit<LabOrder, 'id' | 'orderNumber' | 'orderedAt' | 'status'>, creator: { id: string; name: string; role: UserRole }): LabOrder {
    const orderNum = `LAB-${new Date().getFullYear()}-${String(this.labOrders.length + 101).padStart(4, '0')}`;
    const newOrder: LabOrder = {
      ...order,
      id: `order-${Date.now()}`,
      orderNumber: orderNum,
      orderedAt: new Date().toISOString(),
      status: 'ordered',
    };
    this.labOrders.unshift(newOrder);
    saveToStorage('labOrders', this.labOrders);

    this.logAudit(
      creator.id,
      creator.name,
      creator.role,
      'ORDER_LAB_TEST',
      'Laboratory',
      `Created lab order ${orderNum} for ${order.patientName} (${order.tests.map((t) => t.testName).join(', ')})`
    );

    this.addNotification({
      roleTarget: 'lab_technician',
      branchId: order.branchId,
      title: 'New Lab Request',
      message: `${order.doctorName} requested ${order.tests.length} tests for ${order.patientName}`,
      type: 'info',
    });

    this.notify();
    return newOrder;
  }

  public updateLabOrderStatus(id: string, status: LabOrder['status'], updates: Partial<LabOrder>, updater: { id: string; name: string; role: UserRole }) {
    this.labOrders = this.labOrders.map((o) => {
      if (o.id === id) {
        return {
          ...o,
          ...updates,
          status,
          ...(status === 'sample_collected' && !o.collectedAt ? { collectedAt: new Date().toISOString() } : {}),
          ...(status === 'completed' || status === 'verified' ? { completedAt: new Date().toISOString() } : {}),
        };
      }
      return o;
    });

    saveToStorage('labOrders', this.labOrders);
    this.logAudit(updater.id, updater.name, updater.role, 'UPDATE_LAB_ORDER', 'Laboratory', `Lab order ${id} status moved to ${status}`);
    this.notify();
  }

  // Pharmacy & Prescriptions
  public getMedicines(branchId?: string): Medicine[] {
    if (!branchId || branchId === 'all') return this.medicines;
    return this.medicines.filter((m) => m.branchId === branchId);
  }

  public getPrescriptions(branchId?: string): Prescription[] {
    if (!branchId || branchId === 'all') return this.prescriptions;
    return this.prescriptions.filter((p) => p.branchId === branchId);
  }

  public createPrescription(rx: Omit<Prescription, 'id' | 'createdAt' | 'status'>, creator: { id: string; name: string; role: UserRole }): Prescription {
    const newRx: Prescription = {
      ...rx,
      id: `rx-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    this.prescriptions.unshift(newRx);
    saveToStorage('prescriptions', this.prescriptions);

    this.logAudit(
      creator.id,
      creator.name,
      creator.role,
      'CREATE_PRESCRIPTION',
      'Pharmacy',
      `Prescribed ${rx.items.length} medications for ${rx.patientName}`
    );

    this.addNotification({
      roleTarget: 'pharmacist',
      branchId: rx.branchId,
      title: 'New Prescription Waiting',
      message: `Prescription from ${rx.doctorName} for ${rx.patientName} waiting to be dispensed.`,
      type: 'info',
    });

    this.notify();
    return newRx;
  }

  public dispensePrescription(prescriptionId: string, dispenser: { id: string; name: string; role: UserRole }) {
    const rx = this.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    // Deduct stock for each medicine
    rx.items.forEach((item) => {
      const med = this.medicines.find((m) => m.id === item.medicineId);
      if (med) {
        med.currentStock = Math.max(0, med.currentStock - item.quantity);
        item.dispensedQuantity = item.quantity;
      }
    });

    this.prescriptions = this.prescriptions.map((p) =>
      p.id === prescriptionId
        ? {
            ...p,
            status: 'dispensed',
            dispensedAt: new Date().toISOString(),
            dispensedBy: dispenser.name,
          }
        : p
    );

    saveToStorage('medicines', this.medicines);
    saveToStorage('prescriptions', this.prescriptions);

    this.logAudit(
      dispenser.id,
      dispenser.name,
      dispenser.role,
      'DISPENSE_PRESCRIPTION',
      'Pharmacy',
      `Dispensed prescription ${prescriptionId} to ${rx.patientName}`
    );

    this.notify();
  }

  public updateMedicineStock(medicineId: string, addedStock: number, updater: { id: string; name: string; role: UserRole }) {
    this.medicines = this.medicines.map((m) => {
      if (m.id === medicineId) {
        return { ...m, currentStock: Math.max(0, m.currentStock + addedStock) };
      }
      return m;
    });
    saveToStorage('medicines', this.medicines);
    this.logAudit(updater.id, updater.name, updater.role, 'STOCK_ADJUSTMENT', 'Pharmacy', `Adjusted stock for medicine ID ${medicineId} by ${addedStock}`);
    this.notify();
  }

  // Invoices & Billing
  public getInvoices(branchId?: string): Invoice[] {
    if (!branchId || branchId === 'all') return this.invoices;
    return this.invoices.filter((inv) => inv.branchId === branchId);
  }

  public createInvoice(invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'paidAmount' | 'balanceDue' | 'status' | 'payments'>, creator: { id: string; name: string; role: UserRole }): Invoice {
    const invNum = `INV-${new Date().getFullYear()}-${String(this.invoices.length + 101).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      createdAt: new Date().toISOString(),
      paidAmount: 0,
      balanceDue: invData.total,
      status: 'unpaid',
      payments: [],
    };
    this.invoices.unshift(newInvoice);
    saveToStorage('invoices', this.invoices);

    this.logAudit(
      creator.id,
      creator.name,
      creator.role,
      'CREATE_INVOICE',
      'Billing',
      `Generated invoice ${invNum} for ${invData.patientName} (Amount: ETB ${invData.total.toFixed(2)})`
    );

    this.notify();
    return newInvoice;
  }

  public recordPayment(
    invoiceId: string,
    amount: number,
    method: PaymentRecord['method'],
    reference: string,
    notes: string,
    recorder: { id: string; name: string; role: UserRole }
  ) {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId,
      amount,
      method,
      referenceNumber: reference,
      recordedBy: recorder.name,
      recordedAt: new Date().toISOString(),
      notes,
    };

    const newPaidAmount = inv.paidAmount + amount;
    const newBalanceDue = Math.max(0, inv.total - newPaidAmount);
    const newStatus: Invoice['status'] = newBalanceDue <= 0 ? 'paid' : 'partial';

    this.invoices = this.invoices.map((i) =>
      i.id === invoiceId
        ? {
            ...i,
            paidAmount: newPaidAmount,
            balanceDue: newBalanceDue,
            status: newStatus,
            payments: [...i.payments, newPayment],
          }
        : i
    );

    saveToStorage('invoices', this.invoices);

    this.logAudit(
      recorder.id,
      recorder.name,
      recorder.role,
      'RECORD_PAYMENT',
      'Billing',
      `Recorded payment of ETB ${amount.toFixed(2)} via ${method} for ${inv.invoiceNumber} (${newStatus})`
    );

    this.notify();
  }

  // Branches, Staff, Settings
  public getBranches(): Branch[] {
    return this.branches;
  }

  public getDepartments(branchId?: string): Department[] {
    if (!branchId || branchId === 'all') return this.departments;
    return this.departments.filter((d) => d.branchId === branchId);
  }

  public getStaff(branchId?: string): Staff[] {
    if (!branchId || branchId === 'all') return this.staff;
    return this.staff.filter((s) => s.branchId === branchId);
  }

  public getSettings(): SystemSettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>, updater: { id: string; name: string; role: UserRole }) {
    this.settings = { ...this.settings, ...updates };
    saveToStorage('settings', this.settings);
    this.logAudit(updater.id, updater.name, updater.role, 'UPDATE_SETTINGS', 'Settings', `System settings updated`);
    this.notify();
  }

  public getAuditLogs(branchId?: string): AuditLog[] {
    if (!branchId || branchId === 'all') return this.auditLogs;
    return this.auditLogs.filter((l) => l.branchId === branchId);
  }

  public getNotifications(userRole?: UserRole): Notification[] {
    if (!userRole) return this.notifications;
    return this.notifications.filter((n) => n.roleTarget === 'all' || n.roleTarget === userRole);
  }

  // Reset database back to realistic defaults
  public resetToDefaults() {
    this.branches = initialBranches;
    this.departments = initialDepartments;
    this.staff = initialStaff;
    this.patients = initialPatients;
    this.medicines = initialMedicines;
    this.labTests = initialLabTests;
    this.vitalSigns = initialVitalSigns;
    this.appointments = initialAppointments;
    this.opdVisits = initialOPDVisits;
    this.labOrders = initialLabOrders;
    this.prescriptions = initialPrescriptions;
    this.invoices = initialInvoices;
    this.auditLogs = initialAuditLogs;
    this.notifications = initialNotifications;
    this.settings = initialSettings;

    saveToStorage('branches', this.branches);
    saveToStorage('departments', this.departments);
    saveToStorage('staff', this.staff);
    saveToStorage('patients', this.patients);
    saveToStorage('medicines', this.medicines);
    saveToStorage('labTests', this.labTests);
    saveToStorage('vitalSigns', this.vitalSigns);
    saveToStorage('appointments', this.appointments);
    saveToStorage('opdVisits', this.opdVisits);
    saveToStorage('labOrders', this.labOrders);
    saveToStorage('prescriptions', this.prescriptions);
    saveToStorage('invoices', this.invoices);
    saveToStorage('auditLogs', this.auditLogs);
    saveToStorage('notifications', this.notifications);
    saveToStorage('settings', this.settings);

    this.notify();
  }
}

export const dbService = new HospitalDatabaseService();
