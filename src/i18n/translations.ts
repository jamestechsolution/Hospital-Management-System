export type SupportedLanguage = 'en' | 'om' | 'am';

export interface Translations {
  appName: string;
  tagline: string;
  // Navigation
  dashboard: string;
  patients: string;
  allPatients: string;
  registerPatient: string;
  appointments: string;
  clinicalOPD: string;
  consultations: string;
  nursing: string;
  laboratory: string;
  pharmacy: string;
  inventory: string;
  billing: string;
  payments: string;
  reports: string;
  staff: string;
  auditLogs: string;
  settings: string;
  // Top bar
  searchPlaceholder: string;
  branch: string;
  notifications: string;
  quickAction: string;
  logout: string;
  switchRole: string;
  // Common terms
  status: string;
  actions: string;
  date: string;
  time: string;
  doctor: string;
  patient: string;
  department: string;
  total: string;
  paid: string;
  balance: string;
  view: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  print: string;
  exportCSV: string;
  filter: string;
  all: string;
  // Dashboard metrics
  totalPatients: string;
  todaysVisits: string;
  todayRevenue: string;
  pendingLabTests: string;
  lowStockItems: string;
  waitingQueue: string;
  completedVisits: string;
  bedOccupancy: string;
  // Clinical
  vitals: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  requestLab: string;
  prescribeMed: string;
  dispense: string;
  collected: string;
  verified: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'PulseCare HMS',
    tagline: 'Enterprise Healthcare Operating Platform',
    dashboard: 'Dashboard',
    patients: 'Patients',
    allPatients: 'All Patients',
    registerPatient: 'Register Patient',
    appointments: 'Appointments',
    clinicalOPD: 'OPD & Clinical',
    consultations: 'Doctor Consultations',
    nursing: 'Nursing Station',
    laboratory: 'Laboratory (LIS)',
    pharmacy: 'Pharmacy & Meds',
    inventory: 'Stock & Inventory',
    billing: 'Billing & Invoices',
    payments: 'Payments & Receipts',
    reports: 'Reports & Analytics',
    staff: 'Staff Directory',
    auditLogs: 'Audit Logs',
    settings: 'System Settings',
    searchPlaceholder: 'Search patients, MRN, medicines, invoices (Ctrl + K)...',
    branch: 'Branch',
    notifications: 'Notifications',
    quickAction: 'Quick Action',
    logout: 'Sign Out',
    switchRole: 'Switch Role / View',
    status: 'Status',
    actions: 'Actions',
    date: 'Date',
    time: 'Time',
    doctor: 'Doctor',
    patient: 'Patient',
    department: 'Department',
    total: 'Total',
    paid: 'Paid',
    balance: 'Balance',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save Changes',
    cancel: 'Cancel',
    print: 'Print Document',
    exportCSV: 'Export CSV',
    filter: 'Filter',
    all: 'All',
    totalPatients: 'Total Patients',
    todaysVisits: "Today's Visits",
    todayRevenue: "Today's Revenue",
    pendingLabTests: 'Pending Lab Tests',
    lowStockItems: 'Low Stock Medicines',
    waitingQueue: 'Active Queue',
    completedVisits: 'Completed Today',
    bedOccupancy: 'Ward Occupancy',
    vitals: 'Vital Signs',
    chiefComplaint: 'Chief Complaint',
    diagnosis: 'Diagnosis',
    treatmentPlan: 'Treatment Plan',
    requestLab: 'Order Lab Tests',
    prescribeMed: 'Prescribe Medicine',
    dispense: 'Dispense Meds',
    collected: 'Sample Collected',
    verified: 'Verified & Signed',
  },
  om: {
    appName: 'PulseCare HMS',
    tagline: 'Sirna Bulchiinsa Hospitaala Ammayyaa',
    dashboard: 'Daashboordii',
    patients: 'Dhukkubsattoota',
    allPatients: 'Dhukkubsattoota Hundaa',
    registerPatient: 'Dhukkubsataa Galmeessi',
    appointments: 'Beellama',
    clinicalOPD: 'Kilinikaa & OPD',
    consultations: 'Mariin Ogeessa Fayyaa',
    nursing: 'Kutaa Narsii',
    laboratory: 'Laabooratorii',
    pharmacy: 'Farmaasii fi Qoricha',
    inventory: 'Qabeenya Qorichaa',
    billing: 'Kaffaltii fi Invooyisii',
    payments: 'Nagahee Kaffaltii',
    reports: 'Gabaasaalee fi Qaaccessa',
    staff: 'Hojjattoota',
    auditLogs: 'Galmee Hordoffii',
    settings: 'Qindaa’ina Sirnichaa',
    searchPlaceholder: 'Dhukkubsataa, qoricha, invooyisii barbaadi (Ctrl + K)...',
    branch: 'Dhaabbata/Damee',
    notifications: 'Beeksisa',
    quickAction: 'Tarkaanfii Ariifataa',
    logout: 'Bahi',
    switchRole: 'Gahee Jijjiiri',
    status: 'Haala',
    actions: 'Tarkaanfiiwwan',
    date: 'Guyyaa',
    time: 'Sa’aatii',
    doctor: 'Doktoora',
    patient: 'Dhukkubsataa',
    department: 'Kutaa',
    total: 'Ida’ama',
    paid: 'Kaffalame',
    balance: 'Hafte',
    view: 'Ilaali',
    edit: 'Gulaali',
    delete: 'Haqi',
    save: 'Olkaa’i',
    cancel: 'Dhiisi',
    print: 'Maxxansi',
    exportCSV: 'Gara CSVtti Baasi',
    filter: 'Filtari',
    all: 'Hundaa',
    totalPatients: 'Waliigala Dhukkubsattoota',
    todaysVisits: 'Daawwannaa Har’aa',
    todayRevenue: 'Galii Har’aa',
    pendingLabTests: 'Qorannoo Eegamaa Jiru',
    lowStockItems: 'Qoricha Xiqqaate',
    waitingQueue: 'Tarree Eeggannaa',
    completedVisits: 'Har’a Xumurame',
    bedOccupancy: 'Siree Qabame',
    vitals: 'Mallattoolee Fayyaa',
    chiefComplaint: 'Komaa Ijoo',
    diagnosis: 'Qorannoo Dhukkubaa',
    treatmentPlan: 'Karoora Yaalaa',
    requestLab: 'Laabooratorii Ajaji',
    prescribeMed: 'Qoricha Ajaji',
    dispense: 'Qoricha Kenni',
    collected: 'Saamuda Fudhatame',
    verified: 'Mirkanaa’e',
  },
  am: {
    appName: 'PulseCare HMS',
    tagline: 'ዘመናዊ የሆስፒታል አስተዳደር ሥርዓት',
    dashboard: 'ዳሽቦርድ',
    patients: 'ሕመምተኞች',
    allPatients: 'ሁሉም ሕመምተኞች',
    registerPatient: 'ሕመምተኛ ይመዝግቡ',
    appointments: 'ቀጠሮዎች',
    clinicalOPD: 'የተመላላሽ ሕክምና (OPD)',
    consultations: 'የሐኪም ምርመራ',
    nursing: 'የነርሶች ክፍል',
    laboratory: 'ላቦራቶሪ (LIS)',
    pharmacy: 'ፋርማሲ እና መድኃኒት',
    inventory: 'የመድኃኒት ክምችት',
    billing: 'ሂሳብ እና ደረሰኝ',
    payments: 'ክፍያዎች',
    reports: 'ሪፖርቶች እና ትንታኔ',
    staff: 'የሰራተኞች ማውጫ',
    auditLogs: 'የኦዲት ምዝግብ',
    settings: 'የስርዓት ቅንብሮች',
    searchPlaceholder: 'ሕመምተኛ፣ መድኃኒት፣ ደረሰኝ ይፈልጉ (Ctrl + K)...',
    branch: 'ቅርንጫፍ',
    notifications: 'ማሳወቂያዎች',
    quickAction: 'ፈጣን እርምጃ',
    logout: 'ውጣ',
    switchRole: 'ሚና ቀይር',
    status: 'ሁኔታ',
    actions: 'እርምጃዎች',
    date: 'ቀን',
    time: 'ሰዓት',
    doctor: 'ሐኪም',
    patient: 'ሕመምተኛ',
    department: 'ክፍል',
    total: 'ጠቅላላ',
    paid: 'የተከፈለ',
    balance: 'ቀሪ ሂሳብ',
    view: 'ይመልከቱ',
    edit: 'ያርትዑ',
    delete: 'ሰርዝ',
    save: 'አስቀምጥ',
    cancel: 'ይቅር',
    print: 'አትም',
    exportCSV: 'ወደ CSV ላክ',
    filter: 'አጣራ',
    all: 'ሁሉም',
    totalPatients: 'ጠቅላላ ሕመምተኞች',
    todaysVisits: 'የዛሬ ጉብኝቶች',
    todayRevenue: 'የዛሬ ገቢ',
    pendingLabTests: 'የሚጠበቁ የላብ ምርመራዎች',
    lowStockItems: 'ያለቁ መድኃኒቶች',
    waitingQueue: 'የጥበቃ ወረፋ',
    completedVisits: 'ዛሬ የተጠናቀቁ',
    bedOccupancy: 'የአልጋዎች ይዞታ',
    vitals: 'የጤና መለኪያዎች (Vitals)',
    chiefComplaint: 'ዋናው አቤቱታ',
    diagnosis: 'ምርመራ / ውጤት',
    treatmentPlan: 'የሕክምና ዕቅድ',
    requestLab: 'የላብ ምርመራ እዘዝ',
    prescribeMed: 'መድኃኒት እዘዝ',
    dispense: 'መድኃኒት አስረክብ',
    collected: 'ናሙና ተወስዷል',
    verified: 'የተረጋገጠ',
  },
};
