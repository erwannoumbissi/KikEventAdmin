export interface Evenement {
  id: number; titre: string; description: string; date: string;
  lieu: string; statut: 'PENDING' | 'VALIDATED' | 'REFUSED' | 'CANCELLED';
  capacite: number; billetsVendus: number;
  organisateurId: number; organisateurNom: string; createdAt: string;
}

export interface Billet {
  id: number; type: string; prix: number;
  statut: 'VALIDE' | 'UTILISE' | 'ANNULE' | 'REMBOURSE';
  evenementId: number; evenementTitre: string;
  acheteurNom: string; acheteurEmail: string; createdAt: string;
}

export interface Paiement {
  id: number; reference: string; montant: number; commission: number;
  statut: 'SUCCES' | 'ECHEC' | 'EN_ATTENTE' | 'REMBOURSE';
  methode: string; billetId: number;
  evenementTitre: string; payeurNom: string; date: string;
}

export interface KikDocument {
  id: number; nom: string;
  type: 'CNI' | 'REGISTRE_COMMERCE' | 'STATUTS' | 'AUTRE';
  url: string; uploadedAt: string;
}

export interface OnboardingRequest {
  id: number; userId: number; userName: string; userEmail: string;
  userPhone?: string; roleDemande: 'ORGANIZER' | 'CONTROLER';
  statut: 'PENDING' | 'APPROVED' | 'REJECTED';
  motifRejet?: string; documents: KikDocument[];
  createdAt: string; updatedAt?: string;
  nomOrganisation?: string; typeOrganisation?: string; siret?: string;
}

export interface FreemiumConfig {
  id: number; maxParticipants: number; maxEvenementsParMois: number;
  maxBilletsParEvenement: number; commissionRate: number;
  dureeEvenementMaxJours: number; notificationsEnabled: boolean;
  analyticsEnabled: boolean; exportEnabled: boolean; updatedAt: string;
}

export interface ActivityItem {
  id: number; type: string; description: string; timestamp: string;
}

export interface DashboardStats {
  totalUsers: number; totalOrganizers: number; totalParticipants: number;
  activeEvents: number; ticketsSold: number; totalRevenue: number;
  pendingValidations: number; monthlyRevenue: number[];
  revenueLabels: string[];
  usersByRole: Array<{ role: string; count: number }>;
  recentActivity: ActivityItem[];
}

export interface KikNotification {
  id: number; titre: string; message: string;
  cible: 'ALL' | 'ORGANIZERS' | 'PARTICIPANTS' | 'SPECIFIC';
  cibleUserId?: number;
  statut: 'SENT' | 'SCHEDULED' | 'DRAFT';
  scheduledAt?: string; sentAt?: string; createdAt: string;
}
