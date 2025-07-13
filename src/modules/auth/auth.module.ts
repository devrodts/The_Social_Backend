
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth.resolver';
import { RefreshTokenUseCase, RegisterUseCase, LoginUseCase } from './use-cases';
import { HashService } from './services/hash.service';
import { AuthGuard } from './guards/auth.guard';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { UsersModule } from '../users/users.module';
import { JwtService } from './services';
import { User } from '../users/entity/user.entity';
import { JwtStrategy } from './strategies/jwt/jwt-strategy';
import { SecureCookieService } from './services/secure-cookie.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  providers: [
    AuthResolver,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    HashService,
    JwtService,
    AuthGuard,
    GqlAuthGuard,
    JwtStrategy,
    SecureCookieService,
  ],
  exports: [AuthGuard, GqlAuthGuard, JwtService],
})
export class AuthModule {}