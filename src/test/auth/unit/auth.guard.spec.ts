import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Repository } from 'typeorm';
import { AuthGuard } from '../../../modules/auth/guards/auth.guard';
import { JwtService } from '../../../modules/auth/services/jwt.service';
import { SecureCookieService } from '../../../modules/auth/services/secure-cookie.service';
import { User } from '../../../modules/users/entity/user.entity';

// Mock GqlExecutionContext
jest.mock('@nestjs/graphql', () => {
  const actual = jest.requireActual('@nestjs/graphql');
  return {
    ...actual,
    GqlExecutionContext: {
      create: jest.fn(),
    },
  };
});

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockSecureCookieService: jest.Mocked<SecureCookieService>;
  let mockExecutionContext: ExecutionContext;
  let mockGqlContext: any;
  let mockRequest: any;

  beforeEach(() => {
    // Mock user data
    const mockUser = new User();
    mockUser.id = 'test-user-id';
    mockUser.username = 'testuser';
    mockUser.email = 'test@example.com';
    mockUser.displayName = 'Test User';
    mockUser.bio = 'Test bio';
    mockUser.avatar = 'test-avatar.jpg';
    mockUser.createdAt = new Date();
    mockUser.updatedAt = new Date();

    // Mock request
    mockRequest = {
      headers: {
        authorization: 'Bearer valid-jwt-token',
      },
      cookies: {
        jwt: 'valid-cookie-jwt-token',
      },
    };

    // Mock GraphQL context
    mockGqlContext = {
      req: mockRequest,
    };

    // Mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as any;

    // Mock dependencies
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    } as any;

    mockJwtService = {
      verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
    } as any;

    mockSecureCookieService = {
      getJwtFromCookie: jest.fn().mockReturnValue('valid-cookie-jwt-token'),
    } as any;

    // Setup GqlExecutionContext mock
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: jest.fn().mockReturnValue(mockGqlContext),
    });

    // Create guard instance
    authGuard = new AuthGuard(
      mockUserRepository,
      mockJwtService,
      mockSecureCookieService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate with valid JWT token from Authorization header', async () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer valid-jwt-token';
    mockRequest.cookies = {};

    // Act
    const result = await authGuard.canActivate(mockExecutionContext);

    // Assert
    expect(result).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
    });
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.id).toBe('test-user-id');
  });

  it('should authenticate with valid JWT token from cookie', async () => {
    // Arrange
    mockRequest.headers.authorization = undefined;
    mockRequest.cookies = { jwt: 'valid-cookie-jwt-token' };

    // Act
    const result = await authGuard.canActivate(mockExecutionContext);

    // Assert
    expect(result).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid-cookie-jwt-token');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
    });
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.id).toBe('test-user-id');
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    // Arrange
    mockRequest.headers.authorization = undefined;
    mockRequest.cookies = {};

    // Act & Assert
    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when JWT verification fails', async () => {
    // Arrange
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Act & Assert
    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    // Arrange
    mockUserRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should prioritize Authorization header over cookie', async () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer header-token';
    mockRequest.cookies = { jwt: 'cookie-token' };

    // Act
    const result = await authGuard.canActivate(mockExecutionContext);

    // Assert
    expect(result).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('header-token');
    expect(mockJwtService.verify).not.toHaveBeenCalledWith('cookie-token');
  });

  it('should extract token from Authorization header correctly', async () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer extracted-token';

    // Act
    await authGuard.canActivate(mockExecutionContext);

    // Assert
    expect(mockJwtService.verify).toHaveBeenCalledWith('extracted-token');
  });

  it('should handle malformed Authorization header', async () => {
    // Arrange
    mockRequest.headers.authorization = 'InvalidFormat token';

    // Act & Assert
    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
}); 