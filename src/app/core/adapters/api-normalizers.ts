import { ResponseType } from '../models/api_resp.model';
import { PagedResponse } from '../models/admin/admin-dto.model';
import { User, UserProfile } from '../models/user/User.model';
import { OrganizerRequest } from '../models/organizer/organizer.model';

type UnknownRecord = Record<string, any>;

function asRecord(value: any): UnknownRecord {
  return (value && typeof value === 'object') ? value as UnknownRecord : {};
}

function get(obj: UnknownRecord, key: string): any {
  return obj[key];
}

function pickFirst<T>(...values: T[]): T | undefined {
  return values.find(v => v !== undefined && v !== null);
}

function toArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function toBool(value: any): boolean {
  if (typeof value === 'boolean') { return value; }
  if (typeof value === 'number') { return value === 1; }
  if (typeof value === 'string') { return ['1', 'true', 'yes'].includes(value.toLowerCase()); }
  return false;
}

function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringValue(value: any, fallback = ''): string {
  return (typeof value === 'string' && value.trim().length > 0) ? value : fallback;
}

function normalizeRole(value: any): { id: number; name: string } {
  if (typeof value === 'string') {
    return { id: 0, name: value };
  }
  const r = asRecord(value);
  return {
    id: toNumber(pickFirst(get(r, 'id'), get(r, 'roleId')), 0),
    name: toStringValue(pickFirst(get(r, 'name'), get(r, 'roleName')), '')
  };
}

function normalizePermission(value: any): { id: number; name: string } {
  if (typeof value === 'string') {
    return { id: 0, name: value };
  }
  const p = asRecord(value);
  return {
    id: toNumber(pickFirst(get(p, 'id'), get(p, 'permissionId')), 0),
    name: toStringValue(pickFirst(get(p, 'name'), get(p, 'permissionName')), '')
  };
}

export function normalizeUser(input: any): User {
  const v = asRecord(input);
  return {
    id: toNumber(pickFirst(get(v, 'id'), get(v, 'userId'))),
    username: toStringValue(pickFirst(get(v, 'username'), get(v, 'userName'), get(v, 'name'))),
    email: toStringValue(get(v, 'email')),
    emailVerifiedAt: pickFirst(get(v, 'emailVerifiedAt'), get(v, 'email_verified_at'), null) ?? null,
    phoneNumber: pickFirst(get(v, 'phoneNumber'), get(v, 'phone_number'), null) ?? null,
    enabled: toBool(pickFirst(get(v, 'enabled'), get(v, 'isEnabled'), get(v, 'active'))),
    createdAt: toStringValue(pickFirst(get(v, 'createdAt'), get(v, 'created_at'))),
    updatedAt: pickFirst(get(v, 'updatedAt'), get(v, 'updated_at'), null) ?? null,
    roles: toArray<any>(get(v, 'roles')).map(normalizeRole).filter(x => !!x.name),
    permissions: toArray<any>(get(v, 'permissions')).map(normalizePermission).filter(x => !!x.name)
  };
}

export function normalizeUserProfile(input: any): UserProfile {
  const v = asRecord(input);
  return {
    userId: toNumber(pickFirst(get(v, 'userId'), get(v, 'user_id'), get(v, 'id'))),
    firstName: pickFirst(get(v, 'firstName'), get(v, 'first_name'), null) ?? null,
    lastName: pickFirst(get(v, 'lastName'), get(v, 'last_name'), null) ?? null,
    avatarUrl: pickFirst(get(v, 'avatarUrl'), get(v, 'avatar_url'), null) ?? null,
    bio: pickFirst(get(v, 'bio'), null) ?? null,
    createdAt: pickFirst(get(v, 'createdAt'), get(v, 'created_at'), null) ?? null,
    updatedAt: pickFirst(get(v, 'updatedAt'), get(v, 'updated_at'), null) ?? null
  };
}

function normalizeOrganizerProfile(input: any): any {
  const p = asRecord(input);
  const c = asRecord(pickFirst(get(p, 'companyDetails'), get(p, 'company_details'), {}));
  const companyDetails = Object.keys(c).length === 0 ? null : {
    id: toNumber(get(c, 'id'), 0),
    legalName: toStringValue(pickFirst(get(c, 'legalName'), get(c, 'legal_name'))),
    registrationNumber: toStringValue(pickFirst(get(c, 'registrationNumber'), get(c, 'registration_number'))),
    taxIdentificationNumber: toStringValue(pickFirst(get(c, 'taxIdentificationNumber'), get(c, 'tax_identification_number'))),
    headOfficeAddress: toStringValue(pickFirst(get(c, 'headOfficeAddress'), get(c, 'head_office_address'))),
    contactEmail: toStringValue(pickFirst(get(c, 'contactEmail'), get(c, 'contact_email'))),
    phoneNumber: toStringValue(pickFirst(get(c, 'phoneNumber'), get(c, 'phone_number'))),
    legalRepresentativeName: toStringValue(pickFirst(get(c, 'legalRepresentativeName'), get(c, 'legal_representative_name'))),
    createdAt: pickFirst(get(c, 'createdAt'), get(c, 'created_at'), null) ?? null,
    updatedAt: pickFirst(get(c, 'updatedAt'), get(c, 'updated_at'), null) ?? null
  };

  return {
    id: toNumber(pickFirst(get(p, 'id'), get(p, 'organizerProfileId'))),
    userId: toNumber(pickFirst(get(p, 'userId'), get(p, 'user_id'))),
    type: toStringValue(pickFirst(get(p, 'type'), 'INDIVIDUAL')) as 'INDIVIDUAL' | 'COMPANY',
    displayName: toStringValue(pickFirst(get(p, 'displayName'), get(p, 'display_name'))),
    biography: toStringValue(pickFirst(get(p, 'biography'), '')),
    websiteUrl: pickFirst(get(p, 'websiteUrl'), get(p, 'website_url'), null) ?? null,
    isVerified: toBool(pickFirst(get(p, 'isVerified'), get(p, 'is_verified'))),
    rating: pickFirst(get(p, 'rating'), null) ?? null,
    companyDetails,
    createdAt: toStringValue(pickFirst(get(p, 'createdAt'), get(p, 'created_at'))),
    updatedAt: pickFirst(get(p, 'updatedAt'), get(p, 'updated_at'), null) ?? null
  };
}

function normalizeOrganizerDocument(input: any): any {
  const d = asRecord(input);
  return {
    id: toNumber(get(d, 'id')),
    organizerProfileId: toNumber(pickFirst(get(d, 'organizerProfileId'), get(d, 'organizer_profile_id'))),
    documentType: toStringValue(pickFirst(get(d, 'documentType'), get(d, 'document_type'))),
    fileUrl: toStringValue(pickFirst(get(d, 'fileUrl'), get(d, 'file_url'))),
    documentNumber: pickFirst(get(d, 'documentNumber'), get(d, 'document_number'), null) ?? null,
    status: toStringValue(pickFirst(get(d, 'status'), 'PENDING')) as 'PENDING' | 'APPROVED' | 'REJECTED',
    rejectionReason: pickFirst(get(d, 'rejectionReason'), get(d, 'rejection_reason'), null) ?? null,
    uploadedAt: pickFirst(get(d, 'uploadedAt'), get(d, 'uploaded_at'), null) ?? null,
    createdAt: toStringValue(pickFirst(get(d, 'createdAt'), get(d, 'created_at'))),
    updatedAt: pickFirst(get(d, 'updatedAt'), get(d, 'updated_at'), null) ?? null
  };
}

export function normalizeOrganizerRequest(input: any): OrganizerRequest {
  const v = asRecord(input);
  const profileRaw = pickFirst(get(v, 'profile'), get(v, 'organizerProfile'), get(v, 'organizer_profile'), {});
  const documentRaw = pickFirst(get(v, 'document'), get(v, 'legalDocument'), get(v, 'legal_document'), {});
  const profileObj = asRecord(profileRaw);
  const documentObj = asRecord(documentRaw);

  return {
    id: toNumber(get(v, 'id')),
    userId: toNumber(pickFirst(get(v, 'userId'), get(v, 'user_id'), get(profileObj, 'userId'), get(profileObj, 'user_id'))),
    profile: normalizeOrganizerProfile(profileRaw),
    document: normalizeOrganizerDocument(documentRaw),
    status: toStringValue(pickFirst(get(v, 'status'), get(documentObj, 'status'), 'PENDING')) as 'PENDING' | 'APPROVED' | 'REJECTED',
    rejectionReason: pickFirst(get(v, 'rejectionReason'), get(v, 'rejection_reason'), get(documentObj, 'rejectionReason'), get(documentObj, 'rejection_reason'), null) ?? null,
    createdAt: toStringValue(pickFirst(get(v, 'createdAt'), get(v, 'created_at'))),
    updatedAt: pickFirst(get(v, 'updatedAt'), get(v, 'updated_at'), null) ?? null
  };
}

export function normalizePagedOrArray<T>(raw: any, itemNormalizer: (v: any) => T): PagedResponse<T> | T[] {
  if (Array.isArray(raw)) {
    return raw.map(itemNormalizer);
  }

  const r = asRecord(raw);
  const content = pickFirst(get(r, 'content'), get(r, 'items'), get(r, 'results'), get(r, 'rows'));
  if (Array.isArray(content)) {
    return {
      content: content.map(itemNormalizer),
      totalElements: toNumber(pickFirst(get(r, 'totalElements'), get(r, 'total_elements'), get(r, 'total'), content.length), content.length),
      totalPages: toNumber(pickFirst(get(r, 'totalPages'), get(r, 'total_pages'), 1), 1),
      number: toNumber(pickFirst(get(r, 'number'), get(r, 'page'), 0), 0),
      size: toNumber(pickFirst(get(r, 'size'), content.length), content.length),
      first: toBool(pickFirst(get(r, 'first'), true)),
      last: toBool(pickFirst(get(r, 'last'), true)),
      empty: toBool(pickFirst(get(r, 'empty'), content.length === 0))
    };
  }

  return [];
}

export function normalizeBaseResponse<T>(
  raw: any,
  dataNormalizer: (data: any) => T,
  fallbackMessage = 'OK'
): ResponseType<T> {
  const r = asRecord(raw);
  const status = toNumber(pickFirst(get(r, 'status'), 200), 200);
  const message = toStringValue(pickFirst(get(r, 'message'), fallbackMessage), fallbackMessage);
  const dataRaw = pickFirst(get(r, 'data'), get(r, 'payload'), get(r, 'result'), get(r, 'results'), {});
  return {
    status,
    message,
    data: dataNormalizer(dataRaw)
  };
}
