import {
  Evenement,
  Billet,
  Paiement,
  OnboardingRequest,
  FreemiumConfig,
  KikNotification,
  DashboardStats,
  ActivityItem,
  KikDocument
} from '../models/kikevent.models';
import { User } from '../models/user/User.model';
import { LoginReturnType } from '../models/auth/login.model';

// ============================================================================
// MOCK LOGIN RESPONSE
// ============================================================================
export const MOCK_LOGIN_RESPONSE: LoginReturnType = {
  status: 200,
  message: 'Login successful',
  data: {
    access_token: 'mock_jwt_token_12345678901234567890',
    token_type: 'Bearer',
    expires_in: 3600,
    user: {
      username: 'admin@kikevent.com',
      email: 'admin@kikevent.com'
    }
  }
};

// ============================================================================
// MOCK USER (CURRENT LOGGED IN USER)
// ============================================================================
export const MOCK_CURRENT_USER: User = {
  id: 1,
  username: 'admin_user',
  email: 'admin@kikevent.com',
  emailVerifiedAt: '2024-01-01T10:00:00Z',
  phoneNumber: 1234567890,
  enabled: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-03-15T15:30:00Z',
  roles: [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'ORGANIZER' }
  ],
  permissions: [
    { id: 1, name: 'MANAGE_USERS' },
    { id: 2, name: 'MANAGE_EVENTS' },
    { id: 3, name: 'MANAGE_PAYMENTS' },
    { id: 4, name: 'VIEW_REPORTS' },
    { id: 5, name: 'SEND_NOTIFICATIONS' }
  ]
};

// ============================================================================
// MOCK USERS LIST
// ============================================================================
export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin_user',
    email: 'admin@kikevent.com',
    emailVerifiedAt: '2024-01-01T10:00:00Z',
    enabled: true,
    createdAt: '2023-01-01T00:00:00Z',
    roles: [{ id: 1, name: 'ADMIN' }],
    permissions: []
  },
  {
    id: 2,
    username: 'organizer1',
    email: 'organizer1@example.com',
    emailVerifiedAt: '2024-02-01T10:00:00Z',
    enabled: true,
    createdAt: '2023-06-15T12:00:00Z',
    roles: [{ id: 2, name: 'ORGANIZER' }],
    permissions: []
  },
  {
    id: 3,
    username: 'organizer2',
    email: 'organizer2@example.com',
    emailVerifiedAt: '2024-02-05T10:00:00Z',
    enabled: true,
    createdAt: '2023-07-20T14:30:00Z',
    roles: [{ id: 2, name: 'ORGANIZER' }],
    permissions: []
  },
  {
    id: 4,
    username: 'participant1',
    email: 'participant1@example.com',
    emailVerifiedAt: null,
    enabled: true,
    createdAt: '2024-01-10T08:00:00Z',
    roles: [{ id: 3, name: 'PARTICIPANT' }],
    permissions: []
  },
  {
    id: 5,
    username: 'suspended_user',
    email: 'suspended@example.com',
    emailVerifiedAt: '2023-12-01T10:00:00Z',
    enabled: false,
    createdAt: '2023-05-01T10:00:00Z',
    roles: [{ id: 3, name: 'PARTICIPANT' }],
    permissions: []
  }
];

// ============================================================================
// MOCK EVENTS
// ============================================================================
export const MOCK_EVENTS: Evenement[] = [
  {
    id: 1,
    titre: 'Concert Live - Artiste Célèbre',
    description: 'Un concert exceptionnel avec l\'artiste international',
    date: '2024-04-20T19:00:00Z',
    lieu: 'Grande Salle de Kinshasa',
    statut: 'VALIDATED',
    capacite: 2000,
    billetsVendus: 1850,
    organisateurId: 2,
    organisateurNom: 'organizer1',
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 2,
    titre: 'Festival de Musique Locale',
    description: 'Découvrez les talents musicaux locaux',
    date: '2024-05-15T15:00:00Z',
    lieu: 'Parc Central',
    statut: 'PENDING',
    capacite: 5000,
    billetsVendus: 2100,
    organisateurId: 3,
    organisateurNom: 'organizer2',
    createdAt: '2024-02-10T14:30:00Z'
  },
  {
    id: 3,
    titre: 'Séminaire de Développement Personnel',
    description: 'Formation intensive sur le développement personnel',
    date: '2024-04-05T09:00:00Z',
    lieu: 'Centre de Conférences Premium',
    statut: 'VALIDATED',
    capacite: 300,
    billetsVendus: 280,
    organisateurId: 2,
    organisateurNom: 'organizer1',
    createdAt: '2024-02-05T11:00:00Z'
  },
  {
    id: 4,
    titre: 'Marche Sportive Solidaire',
    description: 'Une marche pour collecter des fonds pour une association',
    date: '2024-06-01T07:00:00Z',
    lieu: 'Boulevard du Fleuve',
    statut: 'REFUSED',
    capacite: 10000,
    billetsVendus: 0,
    organisateurId: 4,
    organisateurNom: 'autre_organizer',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 5,
    titre: 'Gala de Charité',
    description: 'Soirée chic pour soutenir une cause humanitaire',
    date: '2024-07-10T20:00:00Z',
    lieu: 'Hôtel de Luxe Downtown',
    statut: 'VALIDATED',
    capacite: 500,
    billetsVendus: 450,
    organisateurId: 3,
    organisateurNom: 'organizer2',
    createdAt: '2024-02-20T16:45:00Z'
  }
];

// ============================================================================
// MOCK BILLETS (TICKETS)
// ============================================================================
export const MOCK_BILLETS: Billet[] = [
  {
    id: 1,
    type: 'VIP',
    prix: 150000,
    statut: 'VALIDE',
    evenementId: 1,
    evenementTitre: 'Concert Live - Artiste Célèbre',
    acheteurNom: 'Jean Dupont',
    acheteurEmail: 'jean@example.com',
    createdAt: '2024-02-01T10:30:00Z'
  },
  {
    id: 2,
    type: 'STANDARD',
    prix: 75000,
    statut: 'VALIDE',
    evenementId: 1,
    evenementTitre: 'Concert Live - Artiste Célèbre',
    acheteurNom: 'Marie Durand',
    acheteurEmail: 'marie@example.com',
    createdAt: '2024-02-02T14:15:00Z'
  },
  {
    id: 3,
    type: 'STANDARD',
    prix: 75000,
    statut: 'UTILISE',
    evenementId: 1,
    evenementTitre: 'Concert Live - Artiste Célèbre',
    acheteurNom: 'Pierre Martin',
    acheteurEmail: 'pierre@example.com',
    createdAt: '2024-02-01T11:00:00Z'
  },
  {
    id: 4,
    type: 'NORMAL',
    prix: 50000,
    statut: 'REMBOURSE',
    evenementId: 5,
    evenementTitre: 'Gala de Charité',
    acheteurNom: 'Sophie Lefevre',
    acheteurEmail: 'sophie@example.com',
    createdAt: '2024-02-25T09:00:00Z'
  },
  {
    id: 5,
    type: 'STUDENT',
    prix: 30000,
    statut: 'VALIDE',
    evenementId: 3,
    evenementTitre: 'Séminaire de Développement Personnel',
    acheteurNom: 'Luc Bernard',
    acheteurEmail: 'luc@example.com',
    createdAt: '2024-02-20T13:45:00Z'
  }
];

// ============================================================================
// MOCK PAYMENTS
// ============================================================================
export const MOCK_PAIEMENTS: Paiement[] = [
  {
    id: 1,
    reference: 'PAY-2024-0001',
    montant: 150000,
    commission: 7500,
    statut: 'SUCCES',
    methode: 'MOBILE_MONEY',
    billetId: 1,
    evenementTitre: 'Concert Live - Artiste Célèbre',
    payeurNom: 'Jean Dupont',
    date: '2024-02-01T10:45:00Z'
  },
  {
    id: 2,
    reference: 'PAY-2024-0002',
    montant: 75000,
    commission: 3750,
    statut: 'SUCCES',
    methode: 'BANK_TRANSFER',
    billetId: 2,
    evenementTitre: 'Concert Live - Artiste Célèbre',
    payeurNom: 'Marie Durand',
    date: '2024-02-02T14:30:00Z'
  },
  {
    id: 3,
    reference: 'PAY-2024-0003',
    montant: 75000,
    commission: 3750,
    statut: 'SUCCES',
    methode: 'CARTE_BANCAIRE',
    billetId: 3,
    evenementTitre: 'Concert Live - Artiste Célèbre',
    payeurNom: 'Pierre Martin',
    date: '2024-02-01T11:20:00Z'
  },
  {
    id: 4,
    reference: 'PAY-2024-0004',
    montant: 50000,
    commission: 2500,
    statut: 'ECHEC',
    methode: 'MOBILE_MONEY',
    billetId: 4,
    evenementTitre: 'Gala de Charité',
    payeurNom: 'Sophie Lefevre',
    date: '2024-02-25T09:15:00Z'
  },
  {
    id: 5,
    reference: 'PAY-2024-0005',
    montant: 30000,
    commission: 1500,
    statut: 'EN_ATTENTE',
    methode: 'MOBILE_MONEY',
    billetId: 5,
    evenementTitre: 'Séminaire de Développement Personnel',
    payeurNom: 'Luc Bernard',
    date: '2024-02-20T14:00:00Z'
  }
];

// ============================================================================
// MOCK DOCUMENTS
// ============================================================================
export const MOCK_DOCUMENTS: KikDocument[] = [
  {
    id: 1,
    nom: 'Carte_Nationale_Identite.pdf',
    type: 'CNI',
    url: '/assets/documents/cni_sample.pdf',
    uploadedAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 2,
    nom: 'Registre_Commerce.pdf',
    type: 'REGISTRE_COMMERCE',
    url: '/assets/documents/registre_sample.pdf',
    uploadedAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 3,
    nom: 'Statuts_Association.pdf',
    type: 'STATUTS',
    url: '/assets/documents/statuts_sample.pdf',
    uploadedAt: '2024-02-01T11:00:00Z'
  }
];

// ============================================================================
// MOCK ONBOARDING REQUESTS
// ============================================================================
export const MOCK_ONBOARDING_REQUESTS: OnboardingRequest[] = [
  {
    id: 1,
    userId: 2,
    userName: 'organizer1',
    userEmail: 'organizer1@example.com',
    userPhone: '243812345678',
    roleDemande: 'ORGANIZER',
    statut: 'PENDING',
    documents: [
      MOCK_DOCUMENTS[0],
      MOCK_DOCUMENTS[1]
    ],
    nomOrganisation: 'Events Kinshasa Organization',
    typeOrganisation: 'Association',
    siret: '12345678901234',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z'
  },
  {
    id: 2,
    userId: 3,
    userName: 'organizer2',
    userEmail: 'organizer2@example.com',
    userPhone: '243821234567',
    roleDemande: 'ORGANIZER',
    statut: 'APPROVED',
    documents: [
      MOCK_DOCUMENTS[0],
      MOCK_DOCUMENTS[2]
    ],
    nomOrganisation: 'Festival Productions SARL',
    typeOrganisation: 'SARL',
    siret: '98765432109876',
    createdAt: '2024-02-05T10:30:00Z',
    updatedAt: '2024-02-08T14:00:00Z'
  },
  {
    id: 3,
    userId: 6,
    userName: 'controler_user',
    userEmail: 'controler@example.com',
    userPhone: '243891234567',
    roleDemande: 'CONTROLER',
    statut: 'REJECTED',
    motifRejet: 'Documents incomplets ou illisibles',
    documents: [
      MOCK_DOCUMENTS[0]
    ],
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  }
];

// ============================================================================
// MOCK FREEMIUM CONFIG
// ============================================================================
export const MOCK_FREEMIUM_CONFIG: FreemiumConfig = {
  id: 1,
  maxParticipants: 500,
  maxEvenementsParMois: 5,
  maxBilletsParEvenement: 1000,
  commissionRate: 0.05,
  dureeEvenementMaxJours: 90,
  notificationsEnabled: true,
  analyticsEnabled: true,
  exportEnabled: false,
  updatedAt: '2024-03-01T10:00:00Z'
};

// ============================================================================
// MOCK ACTIVITY ITEMS
// ============================================================================
export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    type: 'EVENT_CREATED',
    description: 'Un nouvel événement a été créé: Concert Live',
    timestamp: '2024-02-20T14:30:00Z'
  },
  {
    id: 2,
    type: 'USER_REGISTERED',
    description: 'Nouvel utilisateur enregistré: participant1',
    timestamp: '2024-02-19T11:15:00Z'
  },
  {
    id: 3,
    type: 'PAYMENT_RECEIVED',
    description: 'Paiement reçu pour l\'événement Concert Live',
    timestamp: '2024-02-18T09:45:00Z'
  },
  {
    id: 4,
    type: 'EVENT_VALIDATED',
    description: 'L\'événement Festival de Musique a été validé',
    timestamp: '2024-02-17T16:20:00Z'
  },
  {
    id: 5,
    type: 'USER_SUSPENDED',
    description: 'L\'utilisateur suspended_user a été suspendu',
    timestamp: '2024-02-16T13:00:00Z'
  }
];

// ============================================================================
// MOCK DASHBOARD STATS
// ============================================================================
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 245,
  totalOrganizers: 35,
  totalParticipants: 210,
  activeEvents: 12,
  ticketsSold: 4250,
  totalRevenue: 187500000,
  pendingValidations: 3,
  monthlyRevenue: [12000000, 15000000, 18000000, 25000000, 32000000, 45000000],
  revenueLabels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
  usersByRole: [
    { role: 'ADMIN', count: 5 },
    { role: 'ORGANIZER', count: 35 },
    { role: 'PARTICIPANT', count: 205 }
  ],
  recentActivity: MOCK_ACTIVITY
};

// ============================================================================
// MOCK NOTIFICATIONS
// ============================================================================
export const MOCK_NOTIFICATIONS: KikNotification[] = [
  {
    id: 1,
    titre: 'Bienvenue sur KikEvent Admin',
    message: 'Nous sommes heureux de vous accueillir sur la plateforme de gestion',
    cible: 'ALL',
    statut: 'SENT',
    sentAt: '2024-02-01T10:00:00Z',
    createdAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 2,
    titre: 'Nouvel événement à valider',
    message: 'Un nouvel événement attend votre validation',
    cible: 'SPECIFIC',
    cibleUserId: 1,
    statut: 'SENT',
    sentAt: '2024-02-20T15:30:00Z',
    createdAt: '2024-02-20T14:00:00Z'
  },
  {
    id: 3,
    titre: 'Maintenance système',
    message: 'Une maintenance est prévue demain de 2h à 4h du matin',
    cible: 'ALL',
    statut: 'SCHEDULED',
    scheduledAt: '2024-04-10T02:00:00Z',
    createdAt: '2024-04-05T10:00:00Z'
  }
];

// ============================================================================
// EXPORT ALL MOCK DATA
// ============================================================================
export const MOCK_DATA = {
  loginResponse: MOCK_LOGIN_RESPONSE,
  currentUser: MOCK_CURRENT_USER,
  users: MOCK_USERS,
  events: MOCK_EVENTS,
  billets: MOCK_BILLETS,
  paiements: MOCK_PAIEMENTS,
  documents: MOCK_DOCUMENTS,
  onboardingRequests: MOCK_ONBOARDING_REQUESTS,
  freemiumConfig: MOCK_FREEMIUM_CONFIG,
  activity: MOCK_ACTIVITY,
  dashboardStats: MOCK_DASHBOARD_STATS,
  notifications: MOCK_NOTIFICATIONS
};


// ============================================================================
