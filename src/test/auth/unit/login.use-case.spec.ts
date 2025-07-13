import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../../../../src/modules/auth/use-cases/login.use-case';
import { HashService } from '../../../../src/modules/auth/services/hash.service';
import { JwtService } from '../../../../src/modules/auth/services/jwt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../src/modules/users/entity/user.entity';
import { LoginDTO } from '../../../modules/auth/dtos/login.dto';
import { AuthResponseDTO } from '../../../modules/auth/dtos/auth-response.dto';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<Repository<User>>;
  let hashService: jest.Mocked<HashService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    displayName: 'Test User',
    bio: undefined,
    avatar: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    tweets: [],
    likes: [],
    following: [],
    followers: [],
    tweetsCount: 0,
    followingCount: 0,
    followersCount: 0,
    likesCount: 0,
    isVerified: false,
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
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
      generateSalt: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      signRefreshToken: jest.fn(),
      verify: jest.fn(),
      verifyRefreshToken: jest.fn(),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(getRepositoryToken(User));
    hashService = module.get(HashService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully login a user with valid credentials', async () => {
      userRepository.findOne.mockImplementation(({ where }) => {
        if (where && typeof where === 'object' && 'email' in where) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });
      hashService.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token-123');
      jwtService.signRefreshToken.mockReturnValue('refresh-token-123');

      const result = await useCase.execute(mockLoginInput);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(hashService.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: mockUser.id });
      expect(jwtService.signRefreshToken).toHaveBeenCalledWith({ userId: mockUser.id });

      expect(result).toBeInstanceOf(AuthResponseDTO);
      expect(result.token).toBe('jwt-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.username).toBe(mockUser.username);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.displayName).toBe(mockUser.displayName);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(mockLoginInput)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(hashService.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(useCase.execute(mockLoginInput)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(hashService.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mockLoginInput)).rejects.toThrow('Database error');
    });

    it('should handle hash service errors gracefully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockRejectedValue(new Error('Hash error'));

      await expect(useCase.execute(mockLoginInput)).rejects.toThrow('Hash error');
    });

    it('should handle JWT service errors gracefully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT error');
      });

      await expect(useCase.execute(mockLoginInput)).rejects.toThrow('JWT error');
    });

    it('should handle refresh token JWT service errors gracefully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token-123');
      jwtService.signRefreshToken.mockImplementation(() => {
        throw new Error('Refresh JWT error');
      });

      await expect(useCase.execute(mockLoginInput)).rejects.toThrow('Refresh JWT error');
    });
  });
}); 