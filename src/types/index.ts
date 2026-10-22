export type HalalStatus = 'halal_gecertificeerd' | 'natuurlijk_halal' | 'niet_halal';

export type AllergenType = 
  | 'gluten' 
  | 'lactose' 
  | 'noten' 
  | 'pinda' 
  | 'ei' 
  | 'soja' 
  | 'vis' 
  | 'schaaldieren' 
  | 'selderij' 
  | 'sesam';

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  isCentralHub: boolean;
  phone: string;
}

export interface ProductItem {
  id: string;
  code: string; // QR code identifier (e.g. VB-2026-001)
  name: string;
  category: 
    | 'Groente & Fruit'
    | 'Brood & Bakkerij'
    | 'Zuivel & Eieren'
    | 'Droogwaren & Pasta'
    | 'Vlees, Vis & Plantaardig'
    | 'Conserven & Peulvruchten'
    | 'Babyvoeding & Verzorging'
    | 'Dranken & Sappen';
  quantity: number;
  unit: 'stuks' | 'kg' | 'pakken' | 'kratten' | 'blikken' | 'liters';
  locationId: string;
  shelf: string; // e.g. "Stelling A-03" or "Koelcel B"
  expirationDate: string; // YYYY-MM-DD
  expirationType: 'THT' | 'TGT'; // Tenminste Houdbaar Tot of Te Gebruiken Tot
  halalStatus: HalalStatus;
  halalCertifier?: string; // e.g. "Halal Correct Certification"
  allergens: AllergenType[];
  donorName: string;
  donorType: 'Supermarkt' | 'Groothandel' | 'Tuinder/Boer' | 'Particulier' | 'Fabrikant';
  donationDate: string;
  weightKg: number;
  batchNumber: string;
  status: 'beschikbaar' | 'gereserveerd' | 'uitgedeeld' | 'afgekeurd';
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedRole: 'vrijwilliger' | 'medewerker' | 'beide';
  status: 'open' | 'bezig' | 'afgerond';
  priority: 'laag' | 'normaal' | 'spoed';
  locationId: string;
  dueTime: string;
  createdAt: string;
  assigneeName?: string;
  category: 'Sorteren' | 'Pakketten' | 'Uitgifte' | 'Voorraadcontrole' | 'Schoonmaak';
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  type: 'spoedlevering' | 'vervaldatum_alert' | 'voorraadtekort' | 'update';
  priority: 'urgent' | 'belangrijk' | 'info';
  locationId?: string;
  timestamp: string;
  read: boolean;
  actionRequired?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorType: 'Supermarkt' | 'Groothandel' | 'Tuinder/Boer' | 'Particulier' | 'Fabrikant';
  date: string;
  itemsCount: number;
  totalWeightKg: number;
  estimatedValueEur: number;
  co2SavedKg: number;
  halalItemsCount: number;
  categoryBreakdown: Record<string, number>; // weight per category
  receivedBy: string;
  locationId: string;
}

export interface ParcelPlan {
  id: string;
  familyCode: string;
  householdSize: number;
  halalRequired: boolean;
  excludedAllergens: AllergenType[];
  assignedItems: { productId: string; quantity: number }[];
  status: 'klaarmaken' | 'gereed' | 'opgehaald';
  distributionDate: string;
  locationId: string;
  notes?: string;
}

export interface DistributionSession {
  id: string;
  locationId: string;
  locationName: string;
  date: string;
  timeSlot: string; // e.g. "13:30 - 16:30"
  expectedFamiliesCount: number;
  actualServedFamiliesCount?: number;
  status: 'gepland' | 'nu_actief' | 'afgerond';
  halalPacksReserved: number;
  dietaryAllergenPacksReserved: number;
  inspectionStatus: 'niet_geïnspecteerd' | 'audit_bezig' | 'geïnspecteerd';
}

export interface InspectionAudit {
  id: string;
  inspectorNumber: string; // Anoniem inspectienummer (bijv. "INSP-8402" of "INSP-7701")
  sessionId: string;
  locationId: string;
  inspectionDate: string;
  inspectionTime: string;
  overallScore: number; // percentage 0 - 100
  status: 'uitmuntend' | 'voldoende' | 'aandachtspunt' | 'onvoldoende';
  checks: {
    coldChainCompliance: boolean; // Koelketen < 7°C gehandhaafd
    temperatureMeasuredC: number; // gemeten temp in °C
    halalSeparationStrict: boolean; // Volledige scheiding halal van niet-halal
    allergenClearLabeling: boolean; // Duidelijke waarschuwingen en filtering
    expiryDatesZeroExpired: boolean; // Geen enkel verlopen product aangetroffen
    recipientDignityScore: number; // 1-5 Waardigheid en privacy van hulpvragers
    queueFlowEfficiency: number; // 1-5 Wachttijd & soepele doorstroom
    haccpHygieneScore: number; // 1-5 Schone kratten, handschoenen, hygiëne
  };
  sampledParcels: string[];
  sampledProducts: string[];
  findingsNotes: string;
  criticalDeficiencies: string[];
  praisesNotes: string;
  anonymousVerificationHash: string;
}

export interface ChatUser {
  id: string;
  name: string;
  mobileNumber: string; // e.g. "0612345678"
  email: string; // Email where verification code is sent
  role: 'vrijwilliger' | 'medewerker' | 'beheerder';
  locationId?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  type: 'hele_groep' | 'medewerkers' | 'vrijwilligers_groep';
  createdByUserId: string;
  createdByRole: 'beheerder' | 'medewerker';
  isAllMembers: boolean;
  memberUserIds: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: 'vrijwilliger' | 'medewerker' | 'beheerder';
  text: string;
  timestamp: string;
  isUrgent?: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  encryption: 'TLS' | 'SSL' | 'Geen';
  senderEmail: string;
  senderName: string;
  apiKeyOrPassword: string;
  simulationMode: boolean; // Simuleer e-mail in UI met instant preview modal
}

export interface EmailVerificationLog {
  id: string;
  mobileNumber: string;
  targetEmail: string;
  verificationCode: string;
  sentAt: string;
  expiresAt: string;
  isUsed: boolean;
}

export interface VolunteerShift {
  id: string;
  sessionId?: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 - 13:00"
  roleTitle: string; // e.g. "Distributie & Cliëntenontvangst", "Inpakken Halal- & Gezinspakketten", "Chauffeur & Koeltransport", "Sorteren & HACCP Controle"
  description: string;
  category: 'Uitgifte' | 'Inpakken' | 'Sorteren' | 'Chauffeur' | 'Kwaliteit & Halal';
  requiredVolunteers: number;
  registeredVolunteers: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    registeredAt: string;
  }[];
  urgency: 'normaal' | 'spoed' | 'kritiek';
}

export type UserRole = 'public' | 'vrijwilliger' | 'medewerker' | 'beheerder' | 'inspecteur' | 'chat';

