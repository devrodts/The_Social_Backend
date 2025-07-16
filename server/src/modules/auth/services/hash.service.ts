import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltRounds: number = 12; 
  private readonly oldSaltRounds: number = 10; 

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

    if (!this.isValidBcryptHash(hashedText)) {
      throw new Error('Invalid hash format');
    }

    try {
      const result = await bcrypt.compare(plainText, hashedText);
     
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

  async needsMigration(hashedText: string): Promise<boolean> {
    if (!hashedText) {
      return false;
    }

    try {
      const costFactor = this.extractCostFactor(hashedText);
      return costFactor < this.saltRounds;
    } catch (error) {
      // If we can't parse the hash, assume it needs migration
      return true;
    }
  }


  async migrateHash(plainText: string, hashedText: string): Promise<string | null> {
    if (!plainText || !hashedText) {
      return null;
    }

    const needsMigration = await this.needsMigration(hashedText);
    if (!needsMigration) {
      return null;
    }

    const isValid = await this.compare(plainText, hashedText);
    if (!isValid) {
      return null;
    }

    return await this.hash(plainText);
  }


  private extractCostFactor(hashedText: string): number {

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

  private isValidBcryptHash(hash: string): boolean {
    return typeof hash === 'string' && hash.length === 60 && /^\$2[aby]\$\d{2}\$/.test(hash);
  }

  getSaltRounds(): number {
    return this.saltRounds;
  }

  getOldSaltRounds(): number {
    return this.oldSaltRounds;
  }
}