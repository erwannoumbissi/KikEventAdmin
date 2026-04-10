/**
 * DTOs Admin — payloads exacts selon le Swagger de api.vps.jbis.cm
 * + interfaces réexportées pour la compatibilité avec auth.service.ts
 */

// ══════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════════════════════════════

/**
 * PATCH /admin/users/{id}/status
 * Swagger: AdminUpdateUserStatusRequest → { enabled: boolean }
 */
export interface UpdateUserStatusRequest {
  enabled: boolean;
}

/**
 * PATCH /admin/users/{id}/password
 * Swagger: AdminResetPasswordRequestT → { newPassword: string (min 8) }
 */
export interface ResetUserPasswordRequest {
  newPassword: string;
}

/**
 * PATCH /admin/users/{id}/roles/assign | /roles/remove
 * Swagger: AdminRoleRequest → { roleName: string }
 */
export interface AssignRoleRequest  { roleName: string; }
export interface RemoveRoleRequest  { roleName: string; }

// ══════════════════════════════════════════════════════════════════
// ORGANIZER REQUESTS
// ══════════════════════════════════════════════════════════════════

/**
 * PATCH /admin/organizer-requests/{userId}/decision
 * Swagger: DemandeDécisionDeAdminOrganisateur → { approved, rejectionReason }
 */
export interface OrganizerRequestDecisionRequest {
  approved: boolean;
  rejectionReason: string | null;
}

// ══════════════════════════════════════════════════════════════════
// SELF-SERVICE (me)
// ══════════════════════════════════════════════════════════════════

/**
 * PATCH /me/password
 * Swagger: ChangeRequêteMot de Passe → { currentPassword (min 1), newPassword (min 8) }
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * POST /organiser/request
 * Swagger: DemandaVérificationOrganisateur
 */
export interface SubmitOrganizerRequest {
  type: 'INDIVIDUAL' | 'COMPANY';
  displayName: string;
  biography: string;
  websiteUrl?: string;
  companyDetails?: {
    legalName: string;
    registrationNumber: string;
    taxIdentificationNumber: string;
    headOfficeAddress: string;
    contactEmail: string;
    phoneNumber: string;
    legalRepresentativeName: string;
  };
  documentType: string;
  fileUrl: string;
  documentNumber: string;
}

// ══════════════════════════════════════════════════════════════════
// PROFILES
// ══════════════════════════════════════════════════════════════════

/**
 * Profil utilisateur — table user_profiles
 * GET/PUT /profiles/me | /admin/profiles/{id}
 * Swagger: RequestProfilUtilisateur → { firstName, lastName, avatarUrl, bio }
 */
export interface UserProfile {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Payload PUT /profiles/me et PUT /admin/profiles/{id}
 * Swagger: RequestProfilUtilisateur
 */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
}

// ══════════════════════════════════════════════════════════════════
// RÉPONSE PAGINÉE
// ══════════════════════════════════════════════════════════════════

/** Enveloppe paginée Spring Data */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;    // page courante (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
