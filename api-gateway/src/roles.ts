export const ROLE = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

const ROLE_CLAIM_NAMESPACE = 'https://udemyclone.com/roles';

function normalizeRoleValue(rawRole: string): Role {
  const normalized = rawRole.trim().toLowerCase();

  if (normalized === ROLE.INSTRUCTOR) {
    return ROLE.INSTRUCTOR;
  }

  return ROLE.STUDENT;
}

export function extractRole(payload: Record<string, unknown>): Role {
  const claimRoles = payload[ROLE_CLAIM_NAMESPACE];
  if (Array.isArray(claimRoles) && claimRoles.length > 0 && typeof claimRoles[0] === 'string') {
    return normalizeRoleValue(claimRoles[0]);
  }

  const payloadRole = payload.role;
  if (typeof payloadRole === 'string') {
    return normalizeRoleValue(payloadRole);
  }

  return ROLE.STUDENT;
}
