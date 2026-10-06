import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Staff, Branch } from '../types';
import { translations, Translations, SupportedLanguage } from '../i18n/translations';
import { dbService } from '../services/db';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface PrintableDocData {
  type: 'prescription' | 'lab_report' | 'invoice' | 'patient_summary';
  title: string;
  data: any;
}

interface AppContextType {
  currentUser: Staff;
  currentRole: UserRole;
  currentBranchId: string;
  currentBranch: Branch | undefined;
  branches: Branch[];
  language: SupportedLanguage;
  t: Translations;
  theme: 'light' | 'dark';
  activeNav: string;
  selectedPatientId: string | null;
  selectedVisitId: string | null;
  isCommandPaletteOpen: boolean;
  printableDoc: PrintableDocData | null;
  toasts: ToastMessage[];
  // Actions
  setCurrentRole: (role: UserRole) => void;
  setCurrentBranchId: (branchId: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveNav: (nav: string) => void;
  navigateToPatient: (patientId: string) => void;
  navigateToConsultation: (visitId?: string, patientId?: string) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setPrintableDoc: (doc: PrintableDocData | null) => void;
  showToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  removeToast: (id: string) => void;
  switchUserRole: (role: UserRole) => void;
  refreshKey: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string>('branch-main');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<Staff>(() => {
    const allStaff = dbService.getStaff();
    return allStaff.find((s) => s.role === 'admin') || allStaff[0];
  });
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('patient-1');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>('visit-1');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [printableDoc, setPrintableDoc] = useState<PrintableDocData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync branches from db
  useEffect(() => {
    setBranches(dbService.getBranches());
    const unsub = dbService.subscribe(() => {
      setRefreshKey((k) => k + 1);
      setBranches(dbService.getBranches());
    });
    return unsub;
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Command palette hotkey (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast actions
  const showToast = (message: string, type: ToastMessage['type'] = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch Role helper
  const switchUserRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const staffList = dbService.getStaff();
    const matchingStaff = staffList.find((s) => s.role === newRole) || staffList[0];
    setCurrentUser(matchingStaff);
    setActiveNav('dashboard');
    showToast(`Switched perspective to ${matchingStaff.title} (${matchingStaff.name})`, 'success', 'Role Changed');
  };

  const navigateToPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveNav('patients');
  };

  const navigateToConsultation = (visitId?: string, patientId?: string) => {
    if (visitId) setSelectedVisitId(visitId);
    if (patientId) setSelectedPatientId(patientId);
    setActiveNav('consultations');
  };

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentBranchId,
        currentBranch,
        branches,
        language,
        t,
        theme,
        activeNav,
        selectedPatientId,
        selectedVisitId,
        isCommandPaletteOpen,
        printableDoc,
        toasts,
        setCurrentRole,
        setCurrentBranchId,
        setLanguage,
        setTheme,
        setActiveNav,
        navigateToPatient,
        navigateToConsultation,
        setIsCommandPaletteOpen,
        setPrintableDoc,
        showToast,
        removeToast,
        switchUserRole,
        refreshKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
