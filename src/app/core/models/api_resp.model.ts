/**
 * Format de réponse standard depuis le backend
 * Correspond au BaseResponse du backend Spring Boot
 */
export interface ResponseType<T = any> {
  status: number;  // Code HTTP (200, 201, 401, 404, 422, 500, etc.)
  message: string; // Message explicite lisible
  data: T;         // Payload utile (objet, liste, map vide, etc.)
}

export default ResponseType;
// src\app\core\models\api_resp.model.ts