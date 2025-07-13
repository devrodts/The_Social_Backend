
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '../services/jwt.service';
import { SecureCookieService } from '../services/secure-cookie.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly secureCookieService: SecureCookieService,
  ) {}

  // Static factory method for testing
  static create(
    userRepository: Repository<User>,
    jwtService: JwtService,
    secureCookieService: SecureCookieService,
  ): AuthGuard {
    return new AuthGuard(userRepository, jwtService, secureCookieService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user) {
        throw new UnauthorizedException();
      }
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: any): string | undefined {
    // First try to extract from Authorization header
    const headerToken = this.extractTokenFromHeader(request);
    if (headerToken) {
      return headerToken;
    }

    // If no header token, try to extract from cookie
    const cookieToken = this.secureCookieService.getJwtFromCookie(request);
    return cookieToken || undefined;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}