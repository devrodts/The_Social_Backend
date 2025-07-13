// src/presentation/graphql/resolvers/auth.resolver.ts

import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { RegisterUseCase, LoginUseCase } from "./use-cases";
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { RegisterInputDTO } from './dtos/register-input.dto';
import { LoginDTO } from './dtos/login.dto';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';
import { AuthResponseDTO } from './dtos/auth-response.dto';
import { UserResponseDTO } from './dtos/user-response.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entity/user.entity';
import { SecureCookieService } from './services/secure-cookie.service';

@Resolver(() => AuthResponseDTO)
export class AuthResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly secureCookieService: SecureCookieService,
  ) {}

  @Mutation(() => AuthResponseDTO)
  async register(
    @Args('input', ValidationPipe) input: RegisterInputDTO,
    @Context() context: any,
  ): Promise<AuthResponseDTO> {
    const result = await this.registerUseCase.execute(input);
    if (context?.res) {
      this.secureCookieService.setJwtCookie(context.res, result.token);
    }
    return result;
  }

  @Mutation(() => AuthResponseDTO)
  async login(
    @Args('input', ValidationPipe) input: LoginDTO,
    @Context() context: any,
  ): Promise<AuthResponseDTO> {
    const result = await this.loginUseCase.execute(input);

    if (context?.res) {
      this.secureCookieService.setJwtCookie(context.res, result.token);
    }
    return result;
  }

  @Mutation(() => AuthResponseDTO)
  async refreshToken(
    @Args('input', ValidationPipe) input: RefreshTokenDTO,
    @Context() context: any,
  ): Promise<AuthResponseDTO> {
    const result = await this.refreshTokenUseCase.execute(input);
    if (context?.res) {
      this.secureCookieService.setJwtCookie(context.res, result.token);
    }
    return result;
  }

  @Query(() => UserResponseDTO)
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: User): Promise<UserResponseDTO> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      followersCount: 0, // TODO: Implement when follows module is ready
      followingCount: 0, // TODO: Implement when follows module is ready
      tweetsCount: 0, // TODO: Implement when tweets module is ready
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}