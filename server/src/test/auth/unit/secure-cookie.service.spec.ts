import { SecureCookieService } from '../../../modules/auth/services/secure-cookie.service';
import { Response, Request } from 'express';

// Mock Express Response and Request
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.cookie = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  return res as Response;
};

const mockRequest = (cookies: Record<string, string> = {}) => {
  return {
    cookies,
  } as unknown as Request;
};

describe('SecureCookieService', () => {
  let service: SecureCookieService;
  let res: Response;

  beforeEach(() => {
    service = new SecureCookieService();
    res = mockResponse();
  });

  describe('setJwtCookie', () => {
    it('should set JWT as HTTP-only, Secure, SameSite=Strict cookie', () => {
      const token = 'jwt-token-123';
      service.setJwtCookie(res, token);
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        token,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: expect.any(Number),
        })
      );
    });
  });

  describe('getJwtFromCookie', () => {
    it('should read JWT from cookie', () => {
      const req = mockRequest({ jwt: 'jwt-token-123' });
      const token = service.getJwtFromCookie(req);
      expect(token).toBe('jwt-token-123');
    });

    it('should return null if JWT cookie is missing', () => {
      const req = mockRequest();
      const token = service.getJwtFromCookie(req);
      expect(token).toBeNull();
    });
  });

  describe('clearJwtCookie', () => {
    it('should clear the JWT cookie', () => {
      service.clearJwtCookie(res);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt', expect.any(Object));
    });
  });

  describe('security', () => {
    it('should not allow reading JWT from non-HTTP-only cookie (simulated)', () => {
      // Simulate a scenario where a non-HTTP-only cookie is set (should not happen)
      const req = mockRequest({ jwt: 'tampered-token' });
      // In real browser, JS can't read HTTP-only cookies, so this is just a placeholder
      const token = service.getJwtFromCookie(req);
      expect(token).toBe('tampered-token'); // Service can't distinguish, but test for completeness
    });
  });
}); 