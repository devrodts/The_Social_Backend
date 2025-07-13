import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltRounds: number = 12; // Increased from 10 to 12 for better security
  private readonly oldSaltRounds: number = 10; // For migration detection

  async hash(plainText: string): Promise<string> {
    if (!plainText) {
      throw new Error('Password cannot be empty');
    }
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    if (!plainText || !hashedText) {
      throw new Error('Both password and hash are required');
    }

    // Check if the hash is malformed before comparing
    if (!this.isValidBcryptHash(hashedText)) {
      throw new Error('Invalid hash format');
    }

    try {
      const result = await bcrypt.compare(plainText, hashedText);
      // If result is false, check if the hash is malformed (should not happen here, but double check)
      if (!result && !this.isValidBcryptHash(hashedText)) {
        throw new Error('Invalid hash format');
      }
      return result;
    } catch (error) {
      // Handle malformed hash gracefully
      throw new Error('Invalid hash format');
    }
  }

  async generateSalt(): Promise<string> {
    return bcrypt.genSalt(this.saltRounds);
  }

  /**
   * Check if a hash needs migration from old format (10 rounds) to new format (12 rounds)
   */
  async needsMigration(hashedText: string): Promise<boolean> {
    if (!hashedText) {
      return false;
    }

    try {
      // Extract the cost factor from the hash
      const costFactor = this.extractCostFactor(hashedText);
      return costFactor < this.saltRounds;
    } catch (error) {
      // If we can't parse the hash, assume it needs migration
      return true;
    }
  }

  /**
   * Migrate an old hash to the new format if needed
   * Returns the new hash if migration was performed, null otherwise
   */
  async migrateHash(plainText: string, hashedText: string): Promise<string | null> {
    if (!plainText || !hashedText) {
      return null;
    }

    const needsMigration = await this.needsMigration(hashedText);
    if (!needsMigration) {
      return null;
    }

    // Verify the old hash is valid before migrating
    const isValid = await this.compare(plainText, hashedText);
    if (!isValid) {
      return null;
    }

    // Generate new hash with current salt rounds
    return await this.hash(plainText);
  }

  /**
   * Extract the cost factor from a bcrypt hash
   */
  private extractCostFactor(hashedText: string): number {
    // bcrypt hash format: $2b$10$...
    const parts = hashedText.split('$');
    if (parts.length < 4) {
      throw new Error('Invalid bcrypt hash format');
    }

    const costFactor = parseInt(parts[2], 10);
    if (isNaN(costFactor)) {
      throw new Error('Invalid cost factor in hash');
    }

    return costFactor;
  }

  /**
   * Check if a string is a valid bcrypt hash
   */
  private isValidBcryptHash(hash: string): boolean {
    // bcrypt hashes are typically 60 characters and start with $2a$, $2b$, or $2y$
    return typeof hash === 'string' && hash.length === 60 && /^\$2[aby]\$\d{2}\$/.test(hash);
  }

  /**
   * Get the current salt rounds configuration
   */
  getSaltRounds(): number {
    return this.saltRounds;
  }

  /**
   * Get the old salt rounds for migration purposes
   */
  getOldSaltRounds(): number {
    return this.oldSaltRounds;
  }
}