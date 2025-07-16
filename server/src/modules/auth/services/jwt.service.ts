import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  sign(payload: { userId: string }): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  signRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }

  decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}