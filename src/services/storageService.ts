import { 
  ProductItem, 
  Location, 
  TaskItem, 
  NotificationAlert, 
  DonationRecord, 
  ParcelPlan, 
  DistributionSession, 
  InspectionAudit,
  ChatUser,
  ChatGroup,
  ChatMessage,
  EmailSettings,
  EmailVerificationLog,
  VolunteerShift
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'voedselbank_products_v1',
  LOCATIONS: 'voedselbank_locations_v1',
  TASKS: 'voedselbank_tasks_v1',
  NOTIFICATIONS: 'voedselbank_notifications_v1',
  DONATIONS: 'voedselbank_donations_v1',
  PARCELS: 'voedselbank_parcels_v1',
  OFFLINE_MODE: 'voedselbank_offline_mode',
  DISTRIBUTIONS: 'voedselbank_distributions_v1',
  INSPECTIONS: 'voedselbank_inspections_v1',
  CHAT_USERS: 'voedselbank_chat_users_v1',
  CHAT_GROUPS: 'voedselbank_chat_groups_v1',
  CHAT_MESSAGES: 'voedselbank_chat_messages_v1',
  EMAIL_SETTINGS: 'voedselbank_email_settings_v1',
  VERIFICATION_LOGS: 'voedselbank_verification_logs_v1',
  CURRENT_CHAT_USER: 'voedselbank_current_chat_user_v1',
  VOLUNTEER_SHIFTS: 'voedselbank_volunteer_shifts_v1',
};

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-centraal',
    name: 'Centraal Distributiecentrum',
    code: 'CDC-01',
    address: 'Haarlemmerweg 410',
    city: 'Amsterdam',
    isCentralHub: true,
    phone: '020-5849200',
  },
  {
    id: 'loc-west',
    name: 'Distributie- en Uitdeelpunt West',
    code: 'HUB-WST',
    address: 'Jan van Galenstraat 128',
    city: 'Amsterdam',
    isCentralHub: false,
    phone: '020-5849212',
  },
  {
    id: 'loc-oost',
    name: 'Uitdeelpunt Oost & Diemen',
    code: 'UIT-OOST',
    address: 'Linnaeusstraat 89',
    city: 'Amsterdam',
    isCentralHub: false,
    phone: '020-5849234',
  },
  {
    id: 'loc-koelhaven',
    name: 'Koelhub & Opslag Haven',
    code: 'KOEL-HVN',
    address: 'Coenhavenweg 15',
    city: 'Amsterdam',
    isCentralHub: false,
    phone: '020-5849250',
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'p-01',
    code: 'VB-2026-001',
    name: 'Halal Kipfiletblokjes (Gekoeld)',
    category: 'Vlees, Vis & Plantaardig',
    quantity: 45,
    unit: 'pakken',
    locationId: 'loc-koelhaven',
    shelf: 'Koelcel K-01',
    expirationDate: '2026-10-24', // Expiring in 2 days (Urgent TGT)
    expirationType: 'TGT',
    halalStatus: 'halal_gecertificeerd',
    halalCertifier: 'Halal Correct Certification Europe',
    allergens: [],
    donorName: 'Pluimvee Groothandel De Vries',
    donorType: 'Groothandel',
    donationDate: '2026-10-21',
    weightKg: 22.5,
    batchNumber: 'HL-2610-89',
    status: 'beschikbaar',
    notes: 'Direct verdelen over weekendpakketten i.v.m. TGT vervaldatum.',
  },
  {
    id: 'p-02',
    code: 'VB-2026-002',
    name: 'Volkoren Brood Heel Gesneden',
    category: 'Brood & Bakkerij',
    quantity: 60,
    unit: 'stuks',
    locationId: 'loc-west',
    shelf: 'Broodrek B-02',
    expirationDate: '2026-10-23', // Tomorrow!
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: ['gluten', 'sesam'],
    donorName: 'Ambachtelijke Bakkerij Van Dijk',
    donorType: 'Fabrikant',
    donationDate: '2026-10-22',
    weightKg: 48,
    batchNumber: 'BR-2210',
    status: 'beschikbaar',
    notes: 'Dagvers binnengekomen, geschikt voor invriezen of directe uitgifte.',
  },
  {
    id: 'p-03',
    code: 'VB-2026-003',
    name: 'Zilvervliesrijst 1kg Pak',
    category: 'Droogwaren & Pasta',
    quantity: 180,
    unit: 'pakken',
    locationId: 'loc-centraal',
    shelf: 'Stelling D-04',
    expirationDate: '2027-08-15',
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: [],
    donorName: 'Albert Heijn Distributie',
    donorType: 'Supermarkt',
    donationDate: '2026-10-18',
    weightKg: 180,
    batchNumber: 'AH-DR-401',
    status: 'beschikbaar',
    notes: 'Ideaal basisvoedsel, lang houdbaar.',
  },
  {
    id: 'p-04',
    code: 'VB-2026-004',
    name: 'Bruine Bonen & Linzen in Blik',
    category: 'Conserven & Peulvruchten',
    quantity: 240,
    unit: 'blikken',
    locationId: 'loc-oost',
    shelf: 'Stelling C-02',
    expirationDate: '2027-11-30',
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: [],
    donorName: 'Jumbo Supermarkten',
    donorType: 'Supermarkt',
    donationDate: '2026-10-15',
    weightKg: 192,
    batchNumber: 'PEUL-992',
    status: 'beschikbaar',
    notes: 'Rijk aan eiwitten, 100% plantaardig en halal.',
  },
  {
    id: 'p-05',
    code: 'VB-2026-005',
    name: 'Verse Hollandse Appels & Peren',
    category: 'Groente & Fruit',
    quantity: 35,
    unit: 'kratten',
    locationId: 'loc-centraal',
    shelf: 'AGF Zone 1',
    expirationDate: '2026-10-27',
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: [],
    donorName: 'Fruitbedrijf Betuwe Oogst',
    donorType: 'Tuinder/Boer',
    donationDate: '2026-10-20',
    weightKg: 280,
    batchNumber: 'AGF-BET-04',
    status: 'beschikbaar',
    notes: 'Eersteklas kwaliteit, lokaal geoogst.',
  },
  {
    id: 'p-06',
    code: 'VB-2026-006',
    name: 'Halfvolle Melk Houdbaar (UHT)',
    category: 'Zuivel & Eieren',
    quantity: 110,
    unit: 'pakken',
    locationId: 'loc-west',
    shelf: 'Stelling Z-01',
    expirationDate: '2026-10-26', // within 4 days
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: ['lactose'],
    donorName: 'FrieslandCampina Donatie',
    donorType: 'Fabrikant',
    donationDate: '2026-10-14',
    weightKg: 110,
    batchNumber: 'ZUIV-104',
    status: 'beschikbaar',
    notes: 'Voorrang bij samenstellen gezinspakketten.',
  },
  {
    id: 'p-07',
    code: 'VB-2026-007',
    name: 'Baby Opvolgmelk Fase 2 (6-12 mnd)',
    category: 'Babyvoeding & Verzorging',
    quantity: 18, // critical low stock
    unit: 'blikken',
    locationId: 'loc-centraal',
    shelf: 'Veilige Kast Baby-01',
    expirationDate: '2027-04-10',
    expirationType: 'THT',
    halalStatus: 'halal_gecertificeerd',
    halalCertifier: 'Halal Feed and Food Inspection Authority (HFFIA)',
    allergens: ['lactose', 'soja'],
    donorName: 'Nutricia Medisch Voeding',
    donorType: 'Fabrikant',
    donationDate: '2026-10-10',
    weightKg: 14.4,
    batchNumber: 'BABY-9011',
    status: 'beschikbaar',
    notes: 'Zeer schaars. Alleen uitdelen op indicatie gezin met zuigeling.',
  },
  {
    id: 'p-08',
    code: 'VB-2026-008',
    name: 'Halal Rundergehakt 500g',
    category: 'Vlees, Vis & Plantaardig',
    quantity: 50,
    unit: 'pakken',
    locationId: 'loc-koelhaven',
    shelf: 'Vriescel V-02',
    expirationDate: '2027-01-15',
    expirationType: 'TGT',
    halalStatus: 'halal_gecertificeerd',
    halalCertifier: 'Halal Quality Control (HQC)',
    allergens: [],
    donorName: 'Slagerij & Vleeswaren Al-Baraka',
    donorType: 'Groothandel',
    donationDate: '2026-10-19',
    weightKg: 25,
    batchNumber: 'HQC-RUND-33',
    status: 'beschikbaar',
    notes: 'Ingevroren bij -18°C. Gecertificeerd halal.',
  },
  {
    id: 'p-09',
    code: 'VB-2026-009',
    name: 'Glutenvrije Havermout & Granola',
    category: 'Droogwaren & Pasta',
    quantity: 42,
    unit: 'pakken',
    locationId: 'loc-oost',
    shelf: 'Dieetkast D-Gluten',
    expirationDate: '2027-03-20',
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: [],
    donorName: 'Ekoplaza Bio Food',
    donorType: 'Supermarkt',
    donationDate: '2026-10-16',
    weightKg: 21,
    batchNumber: 'EKO-GF-77',
    status: 'beschikbaar',
    notes: 'Gegarandeerd glutenvrij met gecertificeerd gekruiste korenaar.',
  },
  {
    id: 'p-10',
    code: 'VB-2026-010',
    name: 'Pindakaas 100% Pinda (Glutenvrij)',
    category: 'Brood & Bakkerij',
    quantity: 75,
    unit: 'stuks',
    locationId: 'loc-west',
    shelf: 'Stelling B-05',
    expirationDate: '2027-06-30',
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: ['pinda', 'noten'],
    donorName: 'Calvé Unilever Donatie',
    donorType: 'Fabrikant',
    donationDate: '2026-10-08',
    weightKg: 37.5,
    batchNumber: 'UNI-PIN-20',
    status: 'beschikbaar',
    notes: 'Let op allergenen: bevat pinda!',
  },
  {
    id: 'p-11',
    code: 'VB-2026-011',
    name: 'Verse Scharreleieren (Doos à 10)',
    category: 'Zuivel & Eieren',
    quantity: 48,
    unit: 'pakken',
    locationId: 'loc-west',
    shelf: 'Koelcel K-02',
    expirationDate: '2026-10-25', // Expiring in 3 days!
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: ['ei'],
    donorName: 'Biologische Pluimveehouderij Zonheuvel',
    donorType: 'Tuinder/Boer',
    donationDate: '2026-10-19',
    weightKg: 28.8,
    batchNumber: 'EI-1019',
    status: 'beschikbaar',
    notes: 'Snel verdelen, gekoeld bewaren.',
  },
  {
    id: 'p-12',
    code: 'VB-2026-012',
    name: 'Extra Vierge Olijfolie 750ml',
    category: 'Droogwaren & Pasta',
    quantity: 65,
    unit: 'stuks',
    locationId: 'loc-centraal',
    shelf: 'Stelling D-02',
    expirationDate: '2027-10-15',
    expirationType: 'THT',
    halalStatus: 'natuurlijk_halal',
    allergens: [],
    donorName: 'Mediterrane Import B.V.',
    donorType: 'Groothandel',
    donationDate: '2026-10-12',
    weightKg: 48.75,
    batchNumber: 'OIL-MED-84',
    status: 'beschikbaar',
    notes: 'Hoogwaardige bakolie, zeer gewild onder cliënten.',
  },
  {
    id: 'p-13',
    code: 'VB-2026-013',
    name: 'Boeren Gelderse Rookworst & Spekblokjes',
    category: 'Vlees, Vis & Plantaardig',
    quantity: 40,
    unit: 'pakken',
    locationId: 'loc-centraal',
    shelf: 'Stelling V-04',
    expirationDate: '2026-11-20',
    expirationType: 'THT',
    halalStatus: 'niet_halal',
    allergens: [],
    donorName: 'Slagerijbedrijf Midden-Nederland',
    donorType: 'Fabrikant',
    donationDate: '2026-10-17',
    weightKg: 20,
    batchNumber: 'VARK-902',
    status: 'beschikbaar',
    notes: 'Bevat varkensvlees. Strikt gescheiden houden van halal pakketten (normale weergave).',
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-01',
    title: 'Spoedcontrole TGT-data Koelhaven',
    description: 'Controleer partij Halal Kipfilet (VB-2026-001) in koelcel K-01 en prepareer 20 porties voor transport naar Hub West.',
    assignedRole: 'medewerker',
    status: 'bezig',
    priority: 'spoed',
    locationId: 'loc-koelhaven',
    dueTime: 'Vandaag 11:30',
    createdAt: '2026-10-22 08:15',
    assigneeName: 'Karel van Dijk',
    category: 'Voorraadcontrole',
  },
  {
    id: 't-02',
    title: '35 Halal Gezinspakketten klaarmaken',
    description: 'Samenstellen van weekpakketten voor 35 gezinnen met strikte halal-certificering en uitsluiting van varkensvetten/gelatine.',
    assignedRole: 'vrijwilliger',
    status: 'open',
    priority: 'spoed',
    locationId: 'loc-west',
    dueTime: 'Vandaag 14:00',
    createdAt: '2026-10-22 08:30',
    category: 'Pakketten',
  },
  {
    id: 't-03',
    title: 'Sorteren groente & fruit kratten Betuwe',
    description: 'Kratten appels en peren nalopen op kwaliteit, zachte exemplaren apart houden voor soepkeuken.',
    assignedRole: 'vrijwilliger',
    status: 'open',
    priority: 'normaal',
    locationId: 'loc-centraal',
    dueTime: 'Vandaag 15:00',
    createdAt: '2026-10-22 09:00',
    category: 'Sorteren',
  },
  {
    id: 't-04',
    title: 'QR-code scans & inboeken Jumbo levering',
    description: 'Nieuwe pallet met conserven scannen en toewijzen aan stelling C-02 in Hub Oost.',
    assignedRole: 'medewerker',
    status: 'open',
    priority: 'normaal',
    locationId: 'loc-oost',
    dueTime: 'Vandaag 16:30',
    createdAt: '2026-10-22 09:15',
    category: 'Voorraadcontrole',
  },
  {
    id: 't-05',
    title: 'Hygiënische reiniging koelcellen K-01 & K-02',
    description: 'Wekelijkse HACCP desinfectieronde en temperatuurlogboeken bijwerken.',
    assignedRole: 'vrijwilliger',
    status: 'afgerond',
    priority: 'normaal',
    locationId: 'loc-koelhaven',
    dueTime: 'Gisteren 17:00',
    createdAt: '2026-10-21 10:00',
    assigneeName: 'Fatima Z.',
    category: 'Schoonmaak',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: 'n-01',
    title: 'SPOEDLEVERING: 80 kratten verse groenten verwacht',
    message: 'Om 13:00 uur arriveert een koeltruck van tuinderscoöperatie met verse spinazie, wortelen en tomaten bij Centraal Depot.',
    type: 'spoedlevering',
    priority: 'urgent',
    locationId: 'loc-centraal',
    timestamp: 'Vandaag 09:15',
    read: false,
    actionRequired: 'Vrijwilligers gezocht voor lossen en direct koelen.',
  },
  {
    id: 'n-02',
    title: 'Vervaldata Alert (THT < 48 uur)',
    message: 'Partij Halal Kipfilet (VB-2026-001) en Dagvers Brood verlopen binnen 24-48 uur. Voorrang geven bij uitgifte.',
    type: 'vervaldatum_alert',
    priority: 'urgent',
    locationId: 'loc-koelhaven',
    timestamp: 'Vandaag 08:00',
    read: false,
    actionRequired: 'FIFO rotatie toepassen.',
  },
  {
    id: 'n-03',
    title: 'Kritiek tekort: Babyvoeding fase 1 en 2',
    message: 'Er zijn nog slechts 18 bussen opvolgmelk op voorraad verdeeld over alle locaties.',
    type: 'voorraadtekort',
    priority: 'belangrijk',
    locationId: 'loc-centraal',
    timestamp: 'Gisteren 16:40',
    read: true,
    actionRequired: 'Oproep geplaatst op homepage voor gerichte babyvoeding donaties.',
  },
  {
    id: 'n-04',
    title: 'Lokale Server Synchronisatie geslaagd',
    message: 'Lokale offline database is gesynchroniseerd met lokaal opslagpunt. Geen actieve externe poorten geopend.',
    type: 'update',
    priority: 'info',
    timestamp: 'Gisteren 12:00',
    read: true,
  },
];

export const INITIAL_DONATIONS: DonationRecord[] = [
  {
    id: 'don-2026-10-01',
    donorName: 'Albert Heijn Zaandam DC',
    donorType: 'Supermarkt',
    date: '2026-10-18',
    itemsCount: 420,
    totalWeightKg: 1250,
    estimatedValueEur: 4850,
    co2SavedKg: 2750,
    halalItemsCount: 85,
    categoryBreakdown: {
      'Droogwaren & Pasta': 500,
      'Conserven & Peulvruchten': 400,
      'Zuivel & Eieren': 350,
    },
    receivedBy: 'Marc Bakker (Logistiek Medewerker)',
    locationId: 'loc-centraal',
  },
  {
    id: 'don-2026-10-02',
    donorName: 'Pluimvee Groothandel De Vries',
    donorType: 'Groothandel',
    date: '2026-10-21',
    itemsCount: 95,
    totalWeightKg: 475,
    estimatedValueEur: 3800,
    co2SavedKg: 1425,
    halalItemsCount: 95,
    categoryBreakdown: {
      'Vlees, Vis & Plantaardig': 475,
    },
    receivedBy: 'Marc Bakker',
    locationId: 'loc-koelhaven',
  },
  {
    id: 'don-2026-10-03',
    donorName: 'Betuwe Oogst Tuinders',
    donorType: 'Tuinder/Boer',
    date: '2026-10-20',
    itemsCount: 120,
    totalWeightKg: 960,
    estimatedValueEur: 2400,
    co2SavedKg: 1920,
    halalItemsCount: 120,
    categoryBreakdown: {
      'Groente & Fruit': 960,
    },
    receivedBy: 'Anouk Visser',
    locationId: 'loc-centraal',
  },
  {
    id: 'don-2026-10-04',
    donorName: 'Wijkactie Amsterdam-Oost Burgers',
    donorType: 'Particulier',
    date: '2026-10-19',
    itemsCount: 310,
    totalWeightKg: 285,
    estimatedValueEur: 1150,
    co2SavedKg: 620,
    halalItemsCount: 140,
    categoryBreakdown: {
      'Droogwaren & Pasta': 120,
      'Conserven & Peulvruchten': 90,
      'Babyvoeding & Verzorging': 75,
    },
    receivedBy: 'Fatima Z.',
    locationId: 'loc-oost',
  },
  {
    id: 'don-2026-09-28',
    donorName: 'Jumbo Supermarkten Regio West',
    donorType: 'Supermarkt',
    date: '2026-09-28',
    itemsCount: 540,
    totalWeightKg: 1680,
    estimatedValueEur: 6200,
    co2SavedKg: 3690,
    halalItemsCount: 110,
    categoryBreakdown: {
      'Droogwaren & Pasta': 600,
      'Brood & Bakkerij': 450,
      'Zuivel & Eieren': 630,
    },
    receivedBy: 'Marc Bakker',
    locationId: 'loc-west',
  },
];

export const INITIAL_PARCELS: ParcelPlan[] = [
  {
    id: 'par-01',
    familyCode: 'GEZ-1042',
    householdSize: 4,
    halalRequired: true,
    excludedAllergens: ['noten', 'pinda'],
    assignedItems: [
      { productId: 'p-01', quantity: 2 },
      { productId: 'p-02', quantity: 2 },
      { productId: 'p-03', quantity: 2 },
      { productId: 'p-04', quantity: 3 },
      { productId: 'p-05', quantity: 1 },
    ],
    status: 'klaarmaken',
    distributionDate: '2026-10-22',
    locationId: 'loc-west',
    notes: 'Gezin met 2 jonge kinderen. Streng halal gewenst.',
  },
  {
    id: 'par-02',
    familyCode: 'GEZ-1088',
    householdSize: 2,
    halalRequired: false,
    excludedAllergens: ['gluten'],
    assignedItems: [
      { productId: 'p-09', quantity: 2 },
      { productId: 'p-04', quantity: 2 },
      { productId: 'p-06', quantity: 2 },
    ],
    status: 'gereed',
    distributionDate: '2026-10-22',
    locationId: 'loc-oost',
  },
];

export const INITIAL_DISTRIBUTIONS: DistributionSession[] = [
  {
    id: 'dist-01',
    locationId: 'loc-west',
    locationName: 'Distributie- en Uitdeelpunt West',
    date: '2026-10-22',
    timeSlot: '13:30 - 16:30',
    expectedFamiliesCount: 42,
    actualServedFamiliesCount: 18,
    status: 'nu_actief',
    halalPacksReserved: 16,
    dietaryAllergenPacksReserved: 8,
    inspectionStatus: 'audit_bezig',
  },
  {
    id: 'dist-02',
    locationId: 'loc-oost',
    locationName: 'Uitdeelpunt Oost & Diemen',
    date: '2026-10-22',
    timeSlot: '17:00 - 19:30',
    expectedFamiliesCount: 35,
    status: 'gepland',
    halalPacksReserved: 12,
    dietaryAllergenPacksReserved: 5,
    inspectionStatus: 'niet_geïnspecteerd',
  },
  {
    id: 'dist-03',
    locationId: 'loc-centraal',
    locationName: 'Centraal Distributiecentrum',
    date: '2026-10-21',
    timeSlot: '10:00 - 13:00',
    expectedFamiliesCount: 60,
    actualServedFamiliesCount: 59,
    status: 'afgerond',
    halalPacksReserved: 24,
    dietaryAllergenPacksReserved: 11,
    inspectionStatus: 'geïnspecteerd',
  },
  {
    id: 'dist-04',
    locationId: 'loc-koelhaven',
    locationName: 'Koelhub & Opslag Haven',
    date: '2026-10-23',
    timeSlot: '09:00 - 12:00',
    expectedFamiliesCount: 28,
    status: 'gepland',
    halalPacksReserved: 10,
    dietaryAllergenPacksReserved: 4,
    inspectionStatus: 'niet_geïnspecteerd',
  },
];

export const INITIAL_INSPECTIONS: InspectionAudit[] = [
  {
    id: 'audit-01',
    inspectorNumber: 'INSP-8402',
    sessionId: 'dist-03',
    locationId: 'loc-centraal',
    inspectionDate: '2026-10-21',
    inspectionTime: '11:45',
    overallScore: 94,
    status: 'uitmuntend',
    checks: {
      coldChainCompliance: true,
      temperatureMeasuredC: 4.2,
      halalSeparationStrict: true,
      allergenClearLabeling: true,
      expiryDatesZeroExpired: true,
      recipientDignityScore: 5,
      queueFlowEfficiency: 4,
      haccpHygieneScore: 5,
    },
    sampledParcels: ['GEZ-1042', 'GEZ-1088'],
    sampledProducts: ['VB-2026-001', 'VB-2026-008'],
    findingsNotes: 'Uitstekende scheiding van gecertificeerde halal vleeswaren in koelcel K-01. Geen kruisbesmetting.',
    criticalDeficiencies: [],
    praisesNotes: 'Vrijwilligers controleren proactief allergenenstickers bij overhandiging van tassen. Hulpvragers worden met respect ontvangen.',
    anonymousVerificationHash: 'ANON-VERIF-8402-991A',
  },
];

export const INITIAL_CHAT_USERS: ChatUser[] = [
  {
    id: 'user-01',
    name: 'Karel van Dijk',
    mobileNumber: '0612345678',
    email: 'karel.vandijk@voedselbank.nl',
    role: 'medewerker',
    locationId: 'loc-koelhaven',
  },
  {
    id: 'user-02',
    name: 'Anouk Visser',
    mobileNumber: '0623456789',
    email: 'anouk.visser@voedselbank.nl',
    role: 'medewerker',
    locationId: 'loc-centraal',
  },
  {
    id: 'user-03',
    name: 'Fatima Z.',
    mobileNumber: '0634567890',
    email: 'fatima.z@vrijwilliger-vb.nl',
    role: 'vrijwilliger',
    locationId: 'loc-west',
  },
  {
    id: 'user-04',
    name: 'Jan de Boer',
    mobileNumber: '0645678901',
    email: 'jan.deboer@vrijwilliger-vb.nl',
    role: 'vrijwilliger',
    locationId: 'loc-oost',
  },
  {
    id: 'user-05',
    name: 'Directie / Hoofdbeheerder',
    mobileNumber: '0656789012',
    email: 'beheer@voedselbank-verbinding.nl',
    role: 'beheerder',
  },
];

export const INITIAL_CHAT_GROUPS: ChatGroup[] = [
  {
    id: 'grp-01',
    name: 'Hele Voedselbank Groep (Algemeen)',
    description: 'Algemeen overleg voor de gehele organisatie (vrijwilligers, medewerkers en beheer).',
    type: 'hele_groep',
    createdByUserId: 'user-05',
    createdByRole: 'beheerder',
    isAllMembers: true,
    memberUserIds: [],
    createdAt: '2026-10-01',
  },
  {
    id: 'grp-02',
    name: 'Hub West Vrijwilligersploeg',
    description: 'Vrijwilligersgroep voor inpakken, distributie en voorraadbeheer op locatie West.',
    type: 'vrijwilligers_groep',
    createdByUserId: 'user-01',
    createdByRole: 'medewerker',
    isAllMembers: false,
    memberUserIds: ['user-01', 'user-03', 'user-05'],
    createdAt: '2026-10-15',
  },
  {
    id: 'grp-03',
    name: 'Chauffeurs & Koeltransport',
    description: 'Vrijwilligersploeg voor het ophalen van verse donaties en koeltransport tussen hubs.',
    type: 'vrijwilligers_groep',
    createdByUserId: 'user-02',
    createdByRole: 'medewerker',
    isAllMembers: false,
    memberUserIds: ['user-02', 'user-04', 'user-05'],
    createdAt: '2026-10-18',
  },
  {
    id: 'grp-04',
    name: 'Medewerkers & Coördinatie',
    description: 'Besloten kanaal tussen vaste medewerkers en de beheerder.',
    type: 'medewerkers',
    createdByUserId: 'user-05',
    createdByRole: 'beheerder',
    isAllMembers: false,
    memberUserIds: ['user-01', 'user-02', 'user-05'],
    createdAt: '2026-10-05',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    groupId: 'grp-01',
    senderId: 'user-05',
    senderName: 'Directie / Hoofdbeheerder',
    senderRole: 'beheerder',
    text: 'Welkom bij de beveiligde interne chatbox van Voedselbank Verbinding! Alle berichten worden lokaal geborgd.',
    timestamp: 'Gisteren 08:30',
  },
  {
    id: 'msg-02',
    groupId: 'grp-01',
    senderId: 'user-03',
    senderName: 'Fatima Z.',
    senderRole: 'vrijwilliger',
    text: 'Fijn dat we nu direct kunnen communiceren met de chauffeurs en het distributiecentrum over halal-pakketten.',
    timestamp: 'Gisteren 09:15',
  },
  {
    id: 'msg-03',
    groupId: 'grp-02',
    senderId: 'user-01',
    senderName: 'Karel van Dijk',
    senderRole: 'medewerker',
    text: 'Hallo vrijwilligers Hub West! Vanmiddag om 13:30 start de uitgifte voor 42 gezinnen. Vergeet niet de allergenenstickers te controleren.',
    timestamp: 'Vandaag 09:40',
  },
  {
    id: 'msg-04',
    groupId: 'grp-02',
    senderId: 'user-03',
    senderName: 'Fatima Z.',
    senderRole: 'vrijwilliger',
    text: 'Staat genoteerd Karel, de 16 halal-gecertificeerde gezinspakketten zijn al klaargezet in stelling A-03.',
    timestamp: 'Vandaag 10:05',
  },
];

export const INITIAL_EMAIL_SETTINGS: EmailSettings = {
  smtpHost: 'smtp.voedselbank-verbinding.nl',
  smtpPort: 587,
  encryption: 'TLS',
  senderEmail: 'verificatie@voedselbank-verbinding.nl',
  senderName: 'Voedselbank Login Dienst',
  apiKeyOrPassword: '••••••••••••••••',
  simulationMode: true,
};

export const INITIAL_SHIFTS: VolunteerShift[] = [
  {
    id: 'shift-01',
    sessionId: 'dist-01',
    locationId: 'loc-west',
    date: '2026-10-22',
    timeSlot: '13:00 - 16:45',
    roleTitle: 'Distributie & Cliëntenontvangst',
    category: 'Uitgifte',
    description: 'Uitdelen van 42 gezinspakketten, hartelijke ontvangst, controle afhaalkaarten en overhandigen van verswaren.',
    requiredVolunteers: 4,
    registeredVolunteers: [
      { id: 'user-03', name: 'Fatima Z.', phone: '06-34567890', email: 'fatima.z@vrijwilliger-vb.nl', registeredAt: '2026-10-20' },
      { id: 'user-04', name: 'Jan de Boer', phone: '06-45678901', email: 'jan.deboer@vrijwilliger-vb.nl', registeredAt: '2026-10-21' },
    ],
    urgency: 'spoed',
  },
  {
    id: 'shift-02',
    sessionId: 'dist-01',
    locationId: 'loc-west',
    date: '2026-10-22',
    timeSlot: '10:30 - 13:00',
    roleTitle: 'Inpakken Halal- & Dieetpakketten',
    category: 'Kwaliteit & Halal',
    description: 'Samenstellen van weekpakketten voor 16 halal-gezinnen en gezinnen met geregistreerde gluten/notenallergieën.',
    requiredVolunteers: 3,
    registeredVolunteers: [
      { id: 'user-03', name: 'Fatima Z.', phone: '06-34567890', registeredAt: '2026-10-19' },
      { id: 'v-103', name: 'Khadija Mansouri', registeredAt: '2026-10-21' },
    ],
    urgency: 'normaal',
  },
  {
    id: 'shift-03',
    sessionId: 'dist-02',
    locationId: 'loc-oost',
    date: '2026-10-22',
    timeSlot: '16:30 - 19:45',
    roleTitle: 'Avonduitgifte & Krattenbeheer',
    category: 'Uitgifte',
    description: 'Assisteren bij de uitgiftesessie Oost voor werkende hulpvragers. Hulp bij tillen van zware kratten.',
    requiredVolunteers: 3,
    registeredVolunteers: [
      { id: 'v-104', name: 'Peter Bakker', registeredAt: '2026-10-21' },
    ],
    urgency: 'spoed',
  },
  {
    id: 'shift-04',
    locationId: 'loc-centraal',
    date: '2026-10-23',
    timeSlot: '09:00 - 12:30',
    roleTitle: 'Sorteren Groente & Fruit Oogst',
    category: 'Sorteren',
    description: 'Kratten verse groenten en fruit van tuinders sorteren op rijpheid, overpakken in uitdeelkratten volgens FIFO.',
    requiredVolunteers: 5,
    registeredVolunteers: [
      { id: 'user-02', name: 'Anouk Visser', registeredAt: '2026-10-21' },
      { id: 'v-106', name: 'Mo El Amrani', registeredAt: '2026-10-22' },
      { id: 'v-107', name: 'Sophie van Dijk', registeredAt: '2026-10-22' },
    ],
    urgency: 'normaal',
  },
  {
    id: 'shift-05',
    sessionId: 'dist-04',
    locationId: 'loc-koelhaven',
    date: '2026-10-23',
    timeSlot: '08:30 - 12:00',
    roleTitle: 'Chauffeur & Koeltransport Haven',
    category: 'Chauffeur',
    description: 'Transport van verse zuivel- en halalvlees batches in de koelwagen naar Hub West en Hub Oost.',
    requiredVolunteers: 2,
    registeredVolunteers: [],
    urgency: 'kritiek',
  },
  {
    id: 'shift-06',
    locationId: 'loc-centraal',
    date: '2026-10-24',
    timeSlot: '09:30 - 13:00',
    roleTitle: 'Weekend Schapcontrole & QR-Labels',
    category: 'Kwaliteit & Halal',
    description: 'Met de scanner app alle schappen nalopen op vervaldata, voorraad tellen en nieuwe donaties stickeren.',
    requiredVolunteers: 4,
    registeredVolunteers: [
      { id: 'v-108', name: 'Ahmed Belkadi', registeredAt: '2026-10-21' },
    ],
    urgency: 'normaal',
  },
];



// Helper to safely read from localStorage
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export const StorageService = {
  getProducts(): ProductItem[] {
    const list = getLocalItem<ProductItem[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const hasP13 = list.some((p) => p.id === 'p-13');
    if (!hasP13) {
      const merged = [...list, ...INITIAL_PRODUCTS.filter((init) => !list.some((p) => p.id === init.id))];
      setLocalItem(STORAGE_KEYS.PRODUCTS, merged);
      return merged;
    }
    return list;
  },

  saveProducts(products: ProductItem[]): void {
    setLocalItem(STORAGE_KEYS.PRODUCTS, products);
  },

  addProduct(product: Omit<ProductItem, 'id'>): ProductItem {
    const products = this.getProducts();
    const newProduct: ProductItem = {
      ...product,
      id: `p-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<ProductItem>): ProductItem | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    this.saveProducts(products);
    return products[index];
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
    return true;
  },

  getLocations(): Location[] {
    return getLocalItem<Location[]>(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
  },

  getTasks(): TaskItem[] {
    return getLocalItem<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  saveTasks(tasks: TaskItem[]): void {
    setLocalItem(STORAGE_KEYS.TASKS, tasks);
  },

  addTask(task: Omit<TaskItem, 'id' | 'createdAt'>): TaskItem {
    const tasks = this.getTasks();
    const newTask: TaskItem = {
      ...task,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    const updated = [newTask, ...tasks];
    this.saveTasks(updated);
    return newTask;
  },

  updateTask(id: string, updates: Partial<TaskItem>): TaskItem | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates };
    this.saveTasks(tasks);
    return tasks[idx];
  },

  getNotifications(): NotificationAlert[] {
    return getLocalItem<NotificationAlert[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  saveNotifications(alerts: NotificationAlert[]): void {
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, alerts);
  },

  addNotification(alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>): NotificationAlert {
    const alerts = this.getNotifications();
    const newAlert: NotificationAlert = {
      ...alert,
      id: `n-${Date.now()}`,
      timestamp: 'Zojuist',
      read: false,
    };
    const updated = [newAlert, ...alerts];
    this.saveNotifications(updated);
    return newAlert;
  },

  markNotificationRead(id: string): void {
    const alerts = this.getNotifications();
    const updated = alerts.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  },

  markAllNotificationsRead(): void {
    const alerts = this.getNotifications();
    const updated = alerts.map((n) => ({ ...n, read: true }));
    this.saveNotifications(updated);
  },

  getDonations(): DonationRecord[] {
    return getLocalItem<DonationRecord[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
  },

  addDonation(donation: Omit<DonationRecord, 'id'>): DonationRecord {
    const list = this.getDonations();
    const newDonation: DonationRecord = {
      ...donation,
      id: `don-${Date.now()}`,
    };
    const updated = [newDonation, ...list];
    setLocalItem(STORAGE_KEYS.DONATIONS, updated);
    return newDonation;
  },

  getParcels(): ParcelPlan[] {
    return getLocalItem<ParcelPlan[]>(STORAGE_KEYS.PARCELS, INITIAL_PARCELS);
  },

  saveParcels(parcels: ParcelPlan[]): void {
    setLocalItem(STORAGE_KEYS.PARCELS, parcels);
  },

  addParcel(parcel: Omit<ParcelPlan, 'id'>): ParcelPlan {
    const parcels = this.getParcels();
    const newParcel: ParcelPlan = {
      ...parcel,
      id: `par-${Date.now()}`,
    };
    const updated = [newParcel, ...parcels];
    this.saveParcels(updated);
    return newParcel;
  },

  updateParcel(id: string, updates: Partial<ParcelPlan>): ParcelPlan | null {
    const parcels = this.getParcels();
    const idx = parcels.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    parcels[idx] = { ...parcels[idx], ...updates };
    this.saveParcels(parcels);
    return parcels[idx];
  },

  getDistributionSessions(): DistributionSession[] {
    return getLocalItem<DistributionSession[]>(STORAGE_KEYS.DISTRIBUTIONS, INITIAL_DISTRIBUTIONS);
  },

  saveDistributionSessions(sessions: DistributionSession[]): void {
    setLocalItem(STORAGE_KEYS.DISTRIBUTIONS, sessions);
  },

  updateDistributionSession(id: string, updates: Partial<DistributionSession>): DistributionSession | null {
    const list = this.getDistributionSessions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.saveDistributionSessions(list);
    return list[idx];
  },

  getInspections(): InspectionAudit[] {
    return getLocalItem<InspectionAudit[]>(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
  },

  saveInspections(inspections: InspectionAudit[]): void {
    setLocalItem(STORAGE_KEYS.INSPECTIONS, inspections);
  },

  addInspection(
    inspection: Omit<InspectionAudit, 'id' | 'inspectionDate' | 'inspectionTime' | 'anonymousVerificationHash'>
  ): InspectionAudit {
    const list = this.getInspections();
    const now = new Date();
    const newAudit: InspectionAudit = {
      ...inspection,
      id: `audit-${Date.now()}`,
      inspectionDate: now.toISOString().slice(0, 10),
      inspectionTime: now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      anonymousVerificationHash: `ANON-HASH-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${inspection.inspectorNumber.slice(-4)}`,
    };
    const updated = [newAudit, ...list];
    this.saveInspections(updated);

    // Update the distribution session's inspection status
    this.updateDistributionSession(inspection.sessionId, {
      inspectionStatus: 'geïnspecteerd',
    });

    return newAudit;
  },

  // --- CHAT & EMAIL AUTHENTICATION ENGINE ---
  getChatUsers(): ChatUser[] {
    return getLocalItem<ChatUser[]>(STORAGE_KEYS.CHAT_USERS, INITIAL_CHAT_USERS);
  },

  saveChatUsers(users: ChatUser[]): void {
    setLocalItem(STORAGE_KEYS.CHAT_USERS, users);
  },

  getCurrentChatUser(): ChatUser | null {
    return getLocalItem<ChatUser | null>(STORAGE_KEYS.CURRENT_CHAT_USER, null);
  },

  setCurrentChatUser(user: ChatUser | null): void {
    setLocalItem(STORAGE_KEYS.CURRENT_CHAT_USER, user);
  },

  getChatGroups(): ChatGroup[] {
    return getLocalItem<ChatGroup[]>(STORAGE_KEYS.CHAT_GROUPS, INITIAL_CHAT_GROUPS);
  },

  saveChatGroups(groups: ChatGroup[]): void {
    setLocalItem(STORAGE_KEYS.CHAT_GROUPS, groups);
  },

  addChatGroup(group: Omit<ChatGroup, 'id' | 'createdAt'>): ChatGroup {
    const groups = this.getChatGroups();
    const newGroup: ChatGroup = {
      ...group,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [...groups, newGroup];
    this.saveChatGroups(updated);
    return newGroup;
  },

  getChatMessages(): ChatMessage[] {
    return getLocalItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  },

  saveChatMessages(messages: ChatMessage[]): void {
    setLocalItem(STORAGE_KEYS.CHAT_MESSAGES, messages);
  },

  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const list = this.getChatMessages();
    const now = new Date();
    const timeStr = `Vandaag ${now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: timeStr,
    };
    const updated = [...list, newMsg];
    this.saveChatMessages(updated);
    return newMsg;
  },

  getEmailSettings(): EmailSettings {
    return getLocalItem<EmailSettings>(STORAGE_KEYS.EMAIL_SETTINGS, INITIAL_EMAIL_SETTINGS);
  },

  saveEmailSettings(settings: EmailSettings): void {
    setLocalItem(STORAGE_KEYS.EMAIL_SETTINGS, settings);
  },

  getVerificationLogs(): EmailVerificationLog[] {
    return getLocalItem<EmailVerificationLog[]>(STORAGE_KEYS.VERIFICATION_LOGS, []);
  },

  saveVerificationLogs(logs: EmailVerificationLog[]): void {
    setLocalItem(STORAGE_KEYS.VERIFICATION_LOGS, logs);
  },

  requestEmailVerificationCode(
    mobileNumber: string,
    emailOverride?: string
  ): { code: string; targetEmail: string; user?: ChatUser } {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const users = this.getChatUsers();
    const user = users.find((u) => u.mobileNumber.replace(/\D/g, '') === cleanMobile);

    const targetEmail = emailOverride?.trim() || user?.email || `gebruiker.${cleanMobile.slice(-4)}@voedselbank-post.nl`;
    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const logs = this.getVerificationLogs();
    const newLog: EmailVerificationLog = {
      id: `vlog-${Date.now()}`,
      mobileNumber: cleanMobile,
      targetEmail,
      verificationCode: code,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      isUsed: false,
    };
    this.saveVerificationLogs([newLog, ...logs]);

    return { code, targetEmail, user };
  },

  verifyEmailCode(mobileNumber: string, code: string): ChatUser | null {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const logs = this.getVerificationLogs();
    const foundLog = logs.find(
      (l) => l.mobileNumber === cleanMobile && l.verificationCode === code.trim() && !l.isUsed
    );

    if (!foundLog) return null;

    // Mark code as used
    foundLog.isUsed = true;
    this.saveVerificationLogs(logs);

    // Find or create user
    const users = this.getChatUsers();
    let user = users.find((u) => u.mobileNumber.replace(/\D/g, '') === cleanMobile);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name: `Vrijwilliger (${cleanMobile.slice(-4)})`,
        mobileNumber: cleanMobile,
        email: foundLog.targetEmail,
        role: 'vrijwilliger',
      };
      this.saveChatUsers([...users, user]);
    }

    this.setCurrentChatUser(user);
    return user;
  },

  // --- VOLUNTEER SHIFTS & ROSTER ENGINE ---
  getVolunteerShifts(): VolunteerShift[] {
    const list = getLocalItem<VolunteerShift[]>(STORAGE_KEYS.VOLUNTEER_SHIFTS, INITIAL_SHIFTS);
    // Ensure all initial shifts exist
    const hasShift01 = list.some((s) => s.id === 'shift-01');
    if (!hasShift01) {
      const merged = [...list, ...INITIAL_SHIFTS.filter((init) => !list.some((s) => s.id === init.id))];
      setLocalItem(STORAGE_KEYS.VOLUNTEER_SHIFTS, merged);
      return merged;
    }
    return list;
  },

  saveVolunteerShifts(shifts: VolunteerShift[]): void {
    setLocalItem(STORAGE_KEYS.VOLUNTEER_SHIFTS, shifts);
  },

  registerForShift(
    shiftId: string,
    volunteer: { id?: string; name: string; phone?: string; email?: string }
  ): { success: boolean; message: string; shift?: VolunteerShift } {
    const shifts = this.getVolunteerShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return { success: false, message: 'Shift niet gevonden' };

    const cleanName = volunteer.name.trim();
    if (!cleanName) return { success: false, message: 'Naam is verplicht' };

    const alreadyRegistered = shift.registeredVolunteers.some(
      (v) =>
        (volunteer.id && v.id === volunteer.id) ||
        v.name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyRegistered) {
      return { success: false, message: 'Je bent al ingeschreven voor deze shift!' };
    }

    if (shift.registeredVolunteers.length >= shift.requiredVolunteers) {
      return { success: false, message: 'Deze shift is helaas al volledig bezet.' };
    }

    const newReg = {
      id: volunteer.id || `v-${Date.now()}`,
      name: cleanName,
      phone: volunteer.phone?.trim() || '06-********',
      email: volunteer.email?.trim(),
      registeredAt: new Date().toISOString().slice(0, 10),
    };

    shift.registeredVolunteers.push(newReg);
    this.saveVolunteerShifts(shifts);
    return { success: true, message: `Succesvol ingeschreven voor ${shift.roleTitle}!`, shift };
  },

  unregisterFromShift(
    shiftId: string,
    volunteerIdentifier: string
  ): { success: boolean; message: string; shift?: VolunteerShift } {
    const shifts = this.getVolunteerShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return { success: false, message: 'Shift niet gevonden' };

    const initialLen = shift.registeredVolunteers.length;
    shift.registeredVolunteers = shift.registeredVolunteers.filter(
      (v) =>
        v.id !== volunteerIdentifier &&
        v.name.toLowerCase() !== volunteerIdentifier.toLowerCase()
    );

    if (shift.registeredVolunteers.length === initialLen) {
      return { success: false, message: 'Vrijwilliger niet gevonden op deze shift.' };
    }

    this.saveVolunteerShifts(shifts);
    return { success: true, message: 'Inschrijving geannuleerd.', shift };
  },

  addVolunteerShift(shift: Omit<VolunteerShift, 'id' | 'registeredVolunteers'>): VolunteerShift {
    const shifts = this.getVolunteerShifts();
    const newShift: VolunteerShift = {
      ...shift,
      id: `shift-${Date.now()}`,
      registeredVolunteers: [],
    };
    const updated = [newShift, ...shifts];
    this.saveVolunteerShifts(updated);
    return newShift;
  },

  resetAllToSampleData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.PARCELS);
    localStorage.removeItem(STORAGE_KEYS.DISTRIBUTIONS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_USERS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_GROUPS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.EMAIL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.VERIFICATION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT_USER);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEER_SHIFTS);

    this.saveProducts(INITIAL_PRODUCTS);
    setLocalItem(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
    this.saveTasks(INITIAL_TASKS);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    setLocalItem(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    this.saveParcels(INITIAL_PARCELS);
    this.saveDistributionSessions(INITIAL_DISTRIBUTIONS);
    this.saveInspections(INITIAL_INSPECTIONS);
    this.saveChatUsers(INITIAL_CHAT_USERS);
    this.saveChatGroups(INITIAL_CHAT_GROUPS);
    this.saveChatMessages(INITIAL_CHAT_MESSAGES);
    this.saveEmailSettings(INITIAL_EMAIL_SETTINGS);
    this.saveVolunteerShifts(INITIAL_SHIFTS);
  },

  exportDatabaseSnapshot(): string {
    const snapshot = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      locations: this.getLocations(),
      tasks: this.getTasks(),
      notifications: this.getNotifications(),
      donations: this.getDonations(),
      parcels: this.getParcels(),
      distributions: this.getDistributionSessions(),
      inspections: this.getInspections(),
      chatUsers: this.getChatUsers(),
      chatGroups: this.getChatGroups(),
      chatMessages: this.getChatMessages(),
      emailSettings: this.getEmailSettings(),
      volunteerShifts: this.getVolunteerShifts(),
    };
    return JSON.stringify(snapshot, null, 2);
  },

  importDatabaseSnapshot(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) this.saveProducts(data.products);
      if (data.tasks && Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (data.notifications && Array.isArray(data.notifications)) this.saveNotifications(data.notifications);
      if (data.donations && Array.isArray(data.donations)) setLocalItem(STORAGE_KEYS.DONATIONS, data.donations);
      if (data.parcels && Array.isArray(data.parcels)) this.saveParcels(data.parcels);
      if (data.distributions && Array.isArray(data.distributions)) this.saveDistributionSessions(data.distributions);
      if (data.inspections && Array.isArray(data.inspections)) this.saveInspections(data.inspections);
      if (data.chatUsers && Array.isArray(data.chatUsers)) this.saveChatUsers(data.chatUsers);
      if (data.chatGroups && Array.isArray(data.chatGroups)) this.saveChatGroups(data.chatGroups);
      if (data.chatMessages && Array.isArray(data.chatMessages)) this.saveChatMessages(data.chatMessages);
      if (data.emailSettings) this.saveEmailSettings(data.emailSettings);
      if (data.volunteerShifts && Array.isArray(data.volunteerShifts)) this.saveVolunteerShifts(data.volunteerShifts);
      return true;
    } catch {
      return false;
    }
  },
};

