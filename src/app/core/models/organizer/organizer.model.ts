/**
 * Modèles Organizer — alignés sur les tables:
 *   organizer_profiles, legal_documents, company_details
 */

export type OrganizerType           = 'INDIVIDUAL' | 'COMPANY';
export type OrganizerRequestStatus  = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentStatus          = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Table company_details */
export interface CompanyDetails {
  id?: number;
  legalName: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  headOfficeAddress: string;
  contactEmail: string;
  phoneNumber: string;
  legalRepresentativeName: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Table organizer_profiles */
export interface OrganizerProfile {
  id: number;
  userId: number;
  type: OrganizerType;
  displayName: string;
  biography: string;
  websiteUrl: string | null;
  isVerified: boolean;
  rating: number | null;
  companyDetails: CompanyDetails | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Table legal_documents */
export interface OrganizerDocument {
  id: number;
  organizerProfileId: number;
  documentType: string;
  fileUrl: string;
  documentNumber: string | null;
  status: DocumentStatus;
  rejectionReason: string | null;
  uploadedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Demande organizer complète
 * Retournée par GET /admin/organizer-requests et GET /admin/organizer-requests/{userId}
 */
export interface OrganizerRequest {
  id: number;
  userId: number;
  profile: OrganizerProfile;
  document: OrganizerDocument;
  status: OrganizerRequestStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string | null;
}
