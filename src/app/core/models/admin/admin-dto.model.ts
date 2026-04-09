/**
 * DTOs admin — Modèles pour les opérations d'administration
 * Conformes à la documentation backend
 */

// ───────────────────────────────────────────
// USER MANAGEMENT
// ───────────────────────────────────────────

/** Payload pour PATCH /admin/users/{id}/status */
export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED';
}

/** Payload pour PATCH /admin/users/{id}/password */
export interface ResetUserPasswordRequest {
  newPassword: string;
}

/** Payload pour PATCH /admin/users/{id}/roles/assign */
export interface AssignRoleRequest {
  roleName: string;
}

/** Payload pour PATCH /admin/users/{id}/roles/remove */
export interface RemoveRoleRequest {
  roleName: string;
}

// ───────────────────────────────────────────
// ORGANIZER REQUESTS
// ───────────────────────────────────────────

/** Payload pour PATCH /admin/organizer-requests/{userId}/decision */
export interface OrganizerRequestDecisionRequest {
  approved: boolean;
  rejectionReason: string | null;
}

/** Réponse paginée */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type OrganizerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
