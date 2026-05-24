import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { extractRole, normalizeRole, ROLE } from './roles';

const ROLES_FILE_PATH = path.join(process.cwd(), 'upgraded_roles.json');
const PROFILES_FILE_PATH = path.join(process.cwd(), 'user_profiles.json');

function getUpgradedRoles(): Record<string, string> {
  if (!fs.existsSync(ROLES_FILE_PATH)) {
    fs.writeFileSync(ROLES_FILE_PATH, JSON.stringify({}), 'utf-8');
  }
  try {
    const content = fs.readFileSync(ROLES_FILE_PATH, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (e) {
    return {};
  }
}

function saveUpgradedRole(userId: string, role: string) {
  const roles = getUpgradedRoles();
  roles[userId] = normalizeRole(role);
  fs.writeFileSync(ROLES_FILE_PATH, JSON.stringify(roles, null, 2), 'utf-8');
}

function getUserProfiles(): Record<string, { name: string; avatarUrl: string }> {
  if (!fs.existsSync(PROFILES_FILE_PATH)) {
    fs.writeFileSync(PROFILES_FILE_PATH, JSON.stringify({}), 'utf-8');
  }
  try {
    const content = fs.readFileSync(PROFILES_FILE_PATH, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (e) {
    return {};
  }
}

function saveUserProfile(userId: string, name: string, avatarUrl: string) {
  const profiles = getUserProfiles();
  profiles[userId] = { name, avatarUrl };
  fs.writeFileSync(PROFILES_FILE_PATH, JSON.stringify(profiles, null, 2), 'utf-8');
}

@Controller()
export class AppController {
  @GrpcMethod('UserService', 'ValidateToken')
  validateToken(data: { token: string }) {
    try {
      const decodedToken = jwt.decode(data.token);
      const decoded =
        decodedToken && typeof decodedToken === 'object'
          ? (decodedToken as Record<string, unknown>)
          : {};
      const userId = typeof decoded.sub === 'string' ? decoded.sub : '';
      
      // Consultar si el rol fue ascendido localmente
      const upgradedRoles = getUpgradedRoles();
      let role = upgradedRoles[userId] ? normalizeRole(upgradedRoles[userId]) : '';

      if (!role) {
        role = extractRole(decoded);
      }

      return {
        isValid: true,
        userId,
        role,
      };
    } catch (e) {
      return { isValid: false, userId: '', role: '' };
    }
  }

  @GrpcMethod('UserService', 'BecomeInstructor')
  becomeInstructor(data: { token: string }) {
    try {
      const decodedToken = jwt.decode(data.token);
      const decoded =
        decodedToken && typeof decodedToken === 'object'
          ? (decodedToken as Record<string, unknown>)
          : {};
      const userId = typeof decoded.sub === 'string' ? decoded.sub : '';
      
      if (!userId) {
        return { success: false, role: ROLE.STUDENT };
      }

      // Guardar ascenso en base de datos local JSON (persistencia para la demo)
      saveUpgradedRole(userId, ROLE.INSTRUCTOR);

      return {
        success: true,
        role: ROLE.INSTRUCTOR,
      };
    } catch (e) {
      return { success: false, role: ROLE.STUDENT };
    }
  }

  @GrpcMethod('UserService', 'GetUsersByIds')
  getUsersByIds(data: { userIds: string[] }) {
    const ids = data.userIds || [];
    const profiles = getUserProfiles();
    const users = ids.map(id => {
      const profile = profiles[id];
      if (profile) {
        return {
          id,
          name: profile.name,
          avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${id}`,
        };
      }

      let name = 'Usuario Demo';
      if (id.startsWith('auth0|')) {
        name = `Usuario ${id.substring(6, 12)}`;
      } else {
        name = `Usuario ${id.substring(0, 6)}`;
      }
      return {
        id,
        name,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${id}`,
      };
    });
    return { users };
  }

  @GrpcMethod('UserService', 'SyncProfile')
  syncProfile(data: { userId: string; name: string; avatarUrl: string; role?: string }) {
    try {
      if (data.userId && data.name) {
        saveUserProfile(data.userId, data.name, data.avatarUrl || '');
        const upgradedRoles = getUpgradedRoles();
        const role = upgradedRoles[data.userId]
          ? normalizeRole(upgradedRoles[data.userId])
          : data.role
            ? normalizeRole(data.role)
            : ROLE.STUDENT;
        return { success: true, role };
      }
      return { success: false, role: ROLE.STUDENT };
    } catch (e) {
      return { success: false, role: ROLE.STUDENT };
    }
  }
}
