import { Role } from '../authorize/role.model';
import { Permission } from '../authorize/permission.model';

/**
 * Modèle User — table `users` de kikevent_db
 * + relations user_has_roles, user_has_permissions
 */
export interface User {
  id: number;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  phoneNumber: number | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string | null;
  roles: Role[];
  permissions: Permission[];
}

/**
 * Profil utilisateur — table `user_profiles`
 * Swagger: GET/PUT /profiles/me | /admin/profiles/{id}
 * Champs: firstName, lastName, avatarUrl, bio
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
