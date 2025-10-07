import { findUserByEmail, createUser, createSession, getDatabaseStats } from '@/lib/api/mocks/mock-database';
import { mockDatabase } from '@/lib/api/mocks/mock-database';

describe('Mock Database', () => {
  beforeEach(() => {
    // Reset database before each test
    mockDatabase.users = [];
    mockDatabase.sessions = [];
    mockDatabase.loginAttempts = [];
    mockDatabase.auditLogs = [];
    mockDatabase.rateLimits.clear();
  });

  describe('User Management', () => {
    it('should find user by email', () => {
      const user = createUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
        isActive: true,
        isEmailVerified: false,
        lastLoginAt: null,
      });

      const foundUser = findUserByEmail('test@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should create user with proper defaults', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as const,
        isActive: true,
        isEmailVerified: false,
        lastLoginAt: null,
      };

      const user = createUser(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('Session Management', () => {
    it('should create session with proper structure', () => {
      const user = createUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
        isActive: true,
        isEmailVerified: false,
        lastLoginAt: null,
      });

      const session = createSession(user.id, '192.168.1.1', 'Test User Agent');

      expect(session.id).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.token).toBeDefined();
      expect(session.refreshToken).toBeDefined();
      expect(session.isActive).toBe(true);
    });
  });

  describe('Database Stats', () => {
    it('should return accurate stats', () => {
      // Create test data
      const user1 = createUser({
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One',
        role: 'VIEWER',
        isActive: true,
        isEmailVerified: false,
        lastLoginAt: null,
      });

      const user2 = createUser({
        email: 'user2@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Two',
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
      });

      createSession(user1.id, '192.168.1.1', 'User Agent 1');
      createSession(user2.id, '192.168.1.2', 'User Agent 2');

      const stats = getDatabaseStats();

      expect(stats.users).toBe(2);
      expect(stats.activeSessions).toBe(2);
      expect(stats.sessions).toBe(2);
    });
  });
}); 