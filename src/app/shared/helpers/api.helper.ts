import { PagedResponse } from '../../core/models/admin/admin-dto.model';

/**
 * Extrait le tableau de contenu d'une réponse API qui peut être:
 * - Une réponse paginée Spring Data: { content: T[], totalElements, ... }
 * - Un tableau direct: T[]
 * - null / undefined
 */
export function extractContent<T>(data: PagedResponse<T> | T[] | null | undefined): T[] {
  if (!data) { return []; }
  if (Array.isArray(data)) { return data; }
  return (data as PagedResponse<T>).content ?? [];
}

/**
 * Extrait le total d'éléments d'une réponse paginée
 */
export function extractTotal<T>(data: PagedResponse<T> | T[] | null | undefined): number {
  if (!data) { return 0; }
  if (Array.isArray(data)) { return data.length; }
  return (data as PagedResponse<T>).totalElements ?? 0;
}
