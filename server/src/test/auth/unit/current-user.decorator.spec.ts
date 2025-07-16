import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { extractCurrentUserFromContext } from '../../../modules/auth/decorators/current-user.decorator';

// Mock the User entity to avoid GraphQL decorator issues
jest.mock('../../../modules/users/entity/user.entity', () => ({
  User: class MockUser {
    id: string;
    username: string;
    email: string;
    displayName: string;
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
  },
}));

// Mock GqlExecutionContext
jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('extractCurrentUserFromContext', () => {
  let mockExecutionContext: ExecutionContext;
  let mockGqlContext: any;
  let mockRequest: any;

  beforeEach(() => {
    // Mock user data
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      bio: 'Test bio',
      avatar: 'test-avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock request with user
    mockRequest = {
      user: mockUser,
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

    // Setup GqlExecutionContext mock
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: jest.fn().mockReturnValue(mockGqlContext),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user from request context', () => {
    // Act
    const result = extractCurrentUserFromContext(mockExecutionContext);

    // Assert
    expect(result).toBe(mockRequest.user);
    expect((result as any).id).toBe('test-user-id');
    expect((result as any).username).toBe('testuser');
    expect((result as any).email).toBe('test@example.com');
    expect((result as any).displayName).toBe('Test User');
  });

  it('should return null when user is not in request context', () => {
    // Arrange
    mockRequest.user = null;

    // Act
    const result = extractCurrentUserFromContext(mockExecutionContext);

    // Assert
    expect(result).toBeNull();
  });

  it('should return undefined when request is not available', () => {
    // Arrange
    mockGqlContext.req = null;

    // Act
    const result = extractCurrentUserFromContext(mockExecutionContext);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should handle incomplete user object', () => {
    // Arrange
    const incompleteUser = {
      id: 'test-user-id',
      username: 'testuser',
      // Missing other fields
    };
    mockRequest.user = incompleteUser;

    // Act
    const result = extractCurrentUserFromContext(mockExecutionContext);

    // Assert
    expect(result).toBe(incompleteUser);
    expect((result as any).id).toBe('test-user-id');
    expect((result as any).username).toBe('testuser');
  });
}); 