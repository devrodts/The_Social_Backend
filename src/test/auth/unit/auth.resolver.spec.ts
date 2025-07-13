import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthResolver } from '../../../modules/auth/auth.resolver';
import { RegisterUseCase, LoginUseCase } from '../../../modules/auth/use-cases';
import { RefreshTokenUseCase } from '../../../modules/auth/use-cases/refresh-token.use-case';
import { RegisterInputDTO } from '../../../modules/auth/dtos/register-input.dto';
import { LoginDTO } from '../../../modules/auth/dtos/login.dto';
import { AuthResponseDTO } from '../../../modules/auth/dtos/auth-response.dto';

jest.mock('../../../modules/auth/guards/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;

  const mockRegisterInput: RegisterInputDTO = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
  };

  const mockLoginInput: LoginDTO = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockAuthResponse: AuthResponseDTO = {
    token: 'jwt-token-123',
    refreshToken: 'refresh-token-123',
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  };

  beforeEach(async () => {
    const mockRegisterUseCase = {
      execute: jest.fn(),
    };

    const mockLoginUseCase = {
      execute: jest.fn(),
    };

    const mockRefreshTokenUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: RegisterUseCase,
          useValue: mockRegisterUseCase,
        },
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: RefreshTokenUseCase,
          useValue: mockRefreshTokenUseCase,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    registerUseCase = module.get(RegisterUseCase);
    loginUseCase = module.get(LoginUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      registerUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await resolver.register(mockRegisterInput);

      expect(registerUseCase.execute).toHaveBeenCalledWith(mockRegisterInput);
      expect(result).toBe(mockAuthResponse);
      expect(result.token).toBe('jwt-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should handle registration conflicts', async () => {
      registerUseCase.execute.mockRejectedValue(
        new ConflictException('Username already exists'),
      );

      await expect(resolver.register(mockRegisterInput)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );

      expect(registerUseCase.execute).toHaveBeenCalledWith(mockRegisterInput);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      loginUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(mockLoginInput);

      expect(loginUseCase.execute).toHaveBeenCalledWith(mockLoginInput);
      expect(result).toBe(mockAuthResponse);
      expect(result.token).toBe('jwt-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should handle invalid credentials', async () => {
      loginUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(resolver.login(mockLoginInput)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(loginUseCase.execute).toHaveBeenCalledWith(mockLoginInput);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh a token', async () => {
      const refreshInput = { refreshToken: 'old-refresh-token' };
      refreshTokenUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await resolver.refreshToken(refreshInput);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(refreshInput);
      expect(result).toBe(mockAuthResponse);
    });

    it('should handle invalid refresh token', async () => {
      const refreshInput = { refreshToken: 'invalid-token' };
      refreshTokenUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );
      await expect(resolver.refreshToken(refreshInput)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });
  });
}); 