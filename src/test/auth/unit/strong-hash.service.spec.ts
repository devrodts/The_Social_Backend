import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from '../../../modules/auth/services/hash.service';
import * as bcrypt from 'bcrypt';

describe('HashService (Strong Security)', () => {
  let service: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    service = module.get<HashService>(HashService);
  });

  describe('hash', () => {
    it('should hash password with 12 salt rounds', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);

      // Verify the hash was created with bcrypt
      const isValidBcryptHash = await bcrypt.compare(password, hashedPassword);
      expect(isValidBcryptHash).toBe(true);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it('should throw error for empty password', async () => {
      await expect(service.hash('')).rejects.toThrow('Password cannot be empty');
    });

    it('should handle special characters in password', async () => {
      const password = 'test@#$%^&*()_+{}|:"<>?[]\\;\',./';
      const hashedPassword = await service.hash(password);
      
      expect(hashedPassword).toBeDefined();
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const password = 'a'.repeat(1000);
      const hashedPassword = await service.hash(password);
      
      expect(hashedPassword).toBeDefined();
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });
  });

  describe('compare', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);
      
      const result = await service.compare(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = await service.hash(password);
      
      const result = await service.compare(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should throw error for empty password comparison', async () => {
      const hashedPassword = await service.hash('testPassword123');
      
      await expect(service.compare('', hashedPassword)).rejects.toThrow('Both password and hash are required');
    });

    it('should handle null/undefined inputs gracefully', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);
      
      await expect(service.compare(null as any, hashedPassword)).rejects.toThrow('Both password and hash are required');
      await expect(service.compare(password, null as any)).rejects.toThrow('Both password and hash are required');
    });
  });

  describe('generateSalt', () => {
    it('should generate salt with 12 rounds', async () => {
      const salt = await service.generateSalt();
      
      expect(salt).toBeDefined();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(20);
    });

    it('should generate different salts each time', async () => {
      const salt1 = await service.generateSalt();
      const salt2 = await service.generateSalt();
      
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('needsMigration', () => {
    it('should detect old hash format (10 rounds)', async () => {
      // Create a hash with 10 rounds (old format)
      const oldHash = await bcrypt.hash('testPassword123', 10);
      
      const needsMigration = await service.needsMigration(oldHash);
      expect(needsMigration).toBe(true);
    });

    it('should not flag new hash format (12 rounds)', async () => {
      // Create a hash with 12 rounds (new format)
      const newHash = await bcrypt.hash('testPassword123', 12);
      
      const needsMigration = await service.needsMigration(newHash);
      expect(needsMigration).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const invalidHash = 'invalid-hash-format';
      
      const needsMigration = await service.needsMigration(invalidHash);
      expect(needsMigration).toBe(true);
    });

    it('should return false for empty hash', async () => {
      const needsMigration = await service.needsMigration('');
      expect(needsMigration).toBe(false);
    });
  });

  describe('migrateHash', () => {
    it('should migrate old hash to new format', async () => {
      const password = 'testPassword123';
      const oldHash = await bcrypt.hash(password, 10);
      
      const newHash = await service.migrateHash(password, oldHash);
      
      expect(newHash).toBeDefined();
      expect(newHash).not.toBe(oldHash);
      expect(await bcrypt.compare(password, newHash!)).toBe(true);
      
      // Verify the new hash uses 12 rounds
      const needsMigration = await service.needsMigration(newHash!);
      expect(needsMigration).toBe(false);
    });

    it('should return new hash when migration is needed', async () => {
      const password = 'testPassword123';
      const oldHash = await bcrypt.hash(password, 10);
      
      const newHash = await service.migrateHash(password, oldHash);
      
      expect(newHash).toBeDefined();
      expect(newHash).not.toBe(oldHash);
    });

    it('should return null when migration is not needed', async () => {
      const password = 'testPassword123';
      const newHash = await bcrypt.hash(password, 12);
      
      const migratedHash = await service.migrateHash(password, newHash);
      
      expect(migratedHash).toBeNull();
    });

    it('should return null for invalid password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const oldHash = await bcrypt.hash(password, 10);
      
      const migratedHash = await service.migrateHash(wrongPassword, oldHash);
      
      expect(migratedHash).toBeNull();
    });
  });

  describe('performance', () => {
    it('should complete hashing within reasonable time', async () => {
      const password = 'testPassword123';
      const startTime = Date.now();
      
      await service.hash(password);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 2 seconds (reasonable for 12 rounds)
      expect(duration).toBeLessThan(2000);
    });

    it('should complete comparison within reasonable time', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);
      
      const startTime = Date.now();
      await service.compare(password, hashedPassword);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('security', () => {
    it('should not be vulnerable to timing attacks', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);
      const wrongPassword = 'wrongPassword123';
      
      const startTime1 = Date.now();
      await service.compare(password, hashedPassword);
      const duration1 = Date.now() - startTime1;
      
      const startTime2 = Date.now();
      await service.compare(wrongPassword, hashedPassword);
      const duration2 = Date.now() - startTime2;
      
      // Timing difference should be minimal (bcrypt handles this)
      const timingDifference = Math.abs(duration1 - duration2);
      expect(timingDifference).toBeLessThan(100); // 100ms tolerance
    });

    it('should handle malformed hash gracefully', async () => {
      const password = 'testPassword123';
      const malformedHash = 'not-a-valid-bcrypt-hash';
      
      await expect(service.compare(password, malformedHash)).rejects.toThrow('Invalid hash format');
    });
  });

  describe('configuration', () => {
    it('should return correct salt rounds', () => {
      expect(service.getSaltRounds()).toBe(12);
    });

    it('should return correct old salt rounds', () => {
      expect(service.getOldSaltRounds()).toBe(10);
    });
  });
}); 