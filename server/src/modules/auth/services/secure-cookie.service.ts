import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class SecureCookieService {
  private readonly cookieName = 'jwt';
  private readonly cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };

  setJwtCookie(res: Response, token: string): void {
    res.cookie(this.cookieName, token, this.cookieOptions);
  }

  getJwtFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies[this.cookieName]) {
      return req.cookies[this.cookieName];
    }
    return null;
  }

  clearJwtCookie(res: Response): void {
    res.clearCookie(this.cookieName, { ...this.cookieOptions, maxAge: undefined });
  }
} 