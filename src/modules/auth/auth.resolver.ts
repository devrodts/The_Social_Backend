// src/presentation/graphql/resolvers/auth.resolver.ts

import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { RegisterUseCase, LoginUseCase } from "./use-cases";
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { RegisterDTO } from './dtos/register.interface.dto';
import { LoginDTO } from './dtos/login.dto';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';
import { CurrentUser } from './decorators/current-user.decorator';


@Resolver(() => AuthResponseDTO)
export class AuthResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Mutation(() => AuthResponseDTO)
  async register(
    @Args('input', ValidationPipe) input: RegisterDTO,
  ): Promise<AuthResponseDTO> {
    return this.registerUseCase.execute(input);
  }

  @Mutation(() => AuthResponseDTO)
  async login(
    @Args('input', ValidationPipe) input: LoginDTO,
  ): Promise<AuthResponseDTO> {
    return this.loginUseCase.execute(input);
  }

  @Mutation(() => AuthResponseDTO)
  async refreshToken(
    @Args('input', ValidationPipe) input: RefreshTokenDTO,
  ): Promise<AuthResponseDTO> {
    return this.refreshTokenUseCase.execute(input);
  }

  @Query(() => String)
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: User): Promise<string> {
    return `Hello ${user.displayName}!`;
  }
}