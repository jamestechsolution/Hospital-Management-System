import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { PrintableDocument } from './components/common/PrintableDocument';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientListView } from './components/patients/PatientListView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { OPDQueue } from './components/clinical/OPDQueue';
import { DoctorConsultation } from './components/clinical/DoctorConsultation';
import { LaboratoryView } from './components/laboratory/LaboratoryView';
import { PharmacyView } from './components/pharmacy/PharmacyView';
import { BillingView } from './components/billing/BillingView';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { StaffDirectory } from './components/admin/StaffDirectory';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { SettingsView } from './components/admin/SettingsView';
import { LoginPage } from './components/auth/LoginPage';

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { activeNav } = useApp();

  const renderActiveModule = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;
      case 'patients':
        return <PatientListView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'opd':
      case 'nursing':
        return <OPDQueue />;
      case 'consultations':
        return <DoctorConsultation />;
      case 'laboratory':
        return <LaboratoryView />;
      case 'pharmacy':
      case 'inventory':
        return <PharmacyView />;
      case 'billing':
        return <BillingView />;
      case 'reports':
        return <ReportsCenter />;
      case 'staff':
        return <StaffDirectory />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Overlays */}
      <CommandPalette />
      <PrintableDocument />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <AppProvider>
      {isAuthenticated ? (
        <MainLayout onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </AppProvider>
  );
}
