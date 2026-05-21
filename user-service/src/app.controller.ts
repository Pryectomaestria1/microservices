import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

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
  roles[userId] = role;
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
      const decoded: any = jwt.decode(data.token);
      const userId = decoded?.sub || '';
      
      // Consultar si el rol fue ascendido localmente
      const upgradedRoles = getUpgradedRoles();
      let role = upgradedRoles[userId];

      if (!role) {
        // Fallback al claim personalizado de Auth0 o Student
        role = decoded?.['https://udemyclone.com/roles']?.[0] || 'Student';
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
      const decoded: any = jwt.decode(data.token);
      const userId = decoded?.sub || '';
      
      if (!userId) {
        return { success: false, role: 'Student' };
      }

      // Guardar ascenso en base de datos local JSON (persistencia para la demo)
      saveUpgradedRole(userId, 'Instructor');

      return {
        success: true,
        role: 'Instructor',
      };
    } catch (e) {
      return { success: false, role: 'Student' };
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
  syncProfile(data: { userId: string; name: string; avatarUrl: string }) {
    try {
      if (data.userId && data.name) {
        saveUserProfile(data.userId, data.name, data.avatarUrl || '');
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      return { success: false };
    }
  }
}
