import { UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { ROLE, type Role } from '../../src/roles';

export const TEST_TOKENS = {
  STUDENT: 'student-token',
  INSTRUCTOR: 'instructor-token',
} as const;

const TEST_USER_BY_TOKEN: Record<string, { userId: string; role: Role }> = {
  [TEST_TOKENS.STUDENT]: { userId: 'student-1', role: ROLE.STUDENT },
  [TEST_TOKENS.INSTRUCTOR]: { userId: 'instructor-1', role: ROLE.INSTRUCTOR },
};

export function mockAuthGuard(): CanActivate {
  return {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization as string | undefined;
      const token = authHeader?.split(' ')[1];

      if (!token || !TEST_USER_BY_TOKEN[token]) {
        throw new UnauthorizedException();
      }

      request.user = TEST_USER_BY_TOKEN[token];
      return true;
    },
  };
}

export function mockResolvedUserGuard(): CanActivate {
  return {
    canActivate(): boolean {
      return true;
    },
  };
}

export function mockOwnershipGuard(isOwner: boolean): CanActivate {
  return {
    canActivate(): boolean {
      return isOwner;
    },
  };
}
