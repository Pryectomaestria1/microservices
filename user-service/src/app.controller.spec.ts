import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('AppController', () => {
  let appController: AppController;
  const fsMock = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (String(filePath).endsWith('user_profiles.json')) {
        return '{}';
      }
      if (String(filePath).endsWith('upgraded_roles.json')) {
        return '{}';
      }
      return '{}';
    });
    fsMock.writeFileSync.mockImplementation(() => undefined);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('gRPC controller shape', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });

  describe('SyncProfile', () => {
    it('returns instructor role when upgraded role exists', () => {
      fsMock.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (String(filePath).endsWith('user_profiles.json')) {
          return '{}';
        }
        if (String(filePath).endsWith('upgraded_roles.json')) {
          return JSON.stringify({ 'user-1': 'Instructor' });
        }
        return '{}';
      });

      const response = appController.syncProfile({
        userId: 'user-1',
        name: 'Jane Doe',
        avatarUrl: '',
      });

      expect(response).toEqual({ success: true, role: 'instructor' });
    });

    it('returns student role when no upgraded role exists', () => {
      fsMock.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (String(filePath).endsWith('user_profiles.json')) {
          return '{}';
        }
        if (String(filePath).endsWith('upgraded_roles.json')) {
          return '{}';
        }
        return '{}';
      });

      const response = appController.syncProfile({
        userId: 'user-2',
        name: 'John Doe',
        avatarUrl: '',
      });

      expect(response).toEqual({ success: true, role: 'student' });
    });

    it('uses claim/token role fallback when no upgraded role exists', () => {
      fsMock.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (String(filePath).endsWith('user_profiles.json')) {
          return '{}';
        }
        if (String(filePath).endsWith('upgraded_roles.json')) {
          return '{}';
        }
        return '{}';
      });

      const response = appController.syncProfile({
        userId: 'user-claim-1',
        name: 'Claim Role User',
        avatarUrl: '',
        role: 'Instructor',
      });

      expect(response).toEqual({ success: true, role: 'instructor' });
    });

    it('falls back to student role when upgraded roles file is missing', () => {
      fsMock.existsSync.mockImplementation((filePath: fs.PathLike) => !String(filePath).endsWith('upgraded_roles.json'));

      const response = appController.syncProfile({
        userId: 'user-3',
        name: 'Missing File',
        avatarUrl: '',
      });

      expect(response).toEqual({ success: true, role: 'student' });
    });

    it('returns success false with student role for invalid input', () => {
      const response = appController.syncProfile({
        userId: '',
        name: '',
        avatarUrl: '',
      });

      expect(response).toEqual({ success: false, role: 'student' });
    });

    it('returns success false with student role on filesystem error', () => {
      fsMock.writeFileSync.mockImplementation(() => {
        throw new Error('disk error');
      });

      const response = appController.syncProfile({
        userId: 'user-4',
        name: 'File Error',
        avatarUrl: '',
      });

      expect(response).toEqual({ success: false, role: 'student' });
    });
  });
});
