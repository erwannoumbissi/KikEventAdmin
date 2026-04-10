/**
 * Modèles pour les demandes organizer
 */

export type OrganizerType = 'INDIVIDUAL' | 'COMPANY';
export type OrganizerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Détails d'une entreprise */
export interface CompanyDetails {
  legalName: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  headOfficeAddress: string;
  contactEmail: string;
  phoneNumber: string;
  legalRepresentativeName: string;
}

/** Profil organisateur (individu ou entreprise) */
export interface OrganizerProfile {
  id: number;
  userId: number;
  type: OrganizerType;
  displayName: string;
  biography: string;
  websiteUrl?: string;
  companyDetails?: CompanyDetails;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Document justificatif */
export interface OrganizerDocument {
  id: number;
  requestId: number;
  documentType: string; // ex: 'CNI', 'RCCM', 'PASSPORT'
  fileUrl: string;
  documentNumber: string;
  status: DocumentStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/** Demande organizer complète */
export interface OrganizerRequest {
  id: number;
  userId: number;
  profile: OrganizerProfile;
  document: OrganizerDocument;
  status: OrganizerRequestStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}
