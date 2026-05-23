export const ROLE = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

const ROLE_CLAIM_NAMESPACE = 'https://udemyclone.com/roles';

export function normalizeRole(rawRole: string): Role {
  const normalized = rawRole.trim().toLowerCase();

  if (normalized === ROLE.INSTRUCTOR) {
    return ROLE.INSTRUCTOR;
  }

  return ROLE.STUDENT;
}

export function extractRole(decodedToken: Record<string, unknown>): Role {
  const claimRoles = decodedToken[ROLE_CLAIM_NAMESPACE];
  if (Array.isArray(claimRoles) && claimRoles.length > 0 && typeof claimRoles[0] === 'string') {
    return normalizeRole(claimRoles[0]);
  }

  const payloadRole = decodedToken.role;
  if (typeof payloadRole === 'string') {
    return normalizeRole(payloadRole);
  }

  return ROLE.STUDENT;
}
