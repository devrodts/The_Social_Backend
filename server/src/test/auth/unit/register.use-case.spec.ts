import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from '../../../modules/auth/use-cases/register.use-case';
import { HashService } from '../../../modules/auth/services/hash.service';
import { JwtService } from '../../../modules/auth/services/jwt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../modules/users/entity/user.entity';
import { RegisterInputDTO } from '../../../modules/auth/dtos/register-input.dto';
import { AuthResponseDTO } from '../../../modules/auth/dtos/auth-response.dto';
import { SanitizationService } from '../../../modules/common/services/sanitization.service';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<Repository<User>>;
  let hashService: jest.Mocked<HashService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'newuser',
    email: 'new@example.com',
    password: 'hashedPassword123',
    displayName: 'New User',
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

  const mockRegisterInput: RegisterInputDTO = {
    username: 'newuser',
    email: 'new@example.com',
    password: 'password123',
    displayName: 'New User',
  };

  const mockAuthResponse: AuthResponseDTO = {
    token: 'jwt-token-123',
    refreshToken: 'refresh-token-123',
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'newuser',
      email: 'new@example.com',
      displayName: 'New User',
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

    const mockSanitizationService = {
      sanitizeUsername: jest.fn((input) => input),
      sanitizeEmail: jest.fn((input) => input),
      sanitizeDisplayName: jest.fn((input) => input),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SanitizationService, useValue: mockSanitizationService },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(getRepositoryToken(User));
    hashService = module.get(HashService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully register a new user', async () => {
      userRepository.findOne.mockImplementation(({ where }) => {
        if (where && typeof where === 'object' && 'username' in where) return Promise.resolve(null);
        if (where && typeof where === 'object' && 'email' in where) return Promise.resolve(null);
        return Promise.resolve(null);
      });
      hashService.hash.mockResolvedValue('hashedPassword123');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token-123');
      jwtService.signRefreshToken.mockReturnValue('refresh-token-123');

      const result = await useCase.execute(mockRegisterInput);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'newuser' } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
      expect(hashService.hash).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'hashedPassword123',
        displayName: 'New User',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
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

    it('should throw ConflictException when username already exists', async () => {
      userRepository.findOne.mockImplementation(({ where }) => {
        if (where && typeof where === 'object' && 'username' in where) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      await expect(useCase.execute(mockRegisterInput)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'newuser' } });
      expect(userRepository.findOne).not.toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
      expect(hashService.hash).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findOne.mockImplementation(({ where }) => {
        if (where && typeof where === 'object' && 'username' in where) return Promise.resolve(null);
        if (where && typeof where === 'object' && 'email' in where) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      await expect(useCase.execute(mockRegisterInput)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'newuser' } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
      expect(hashService.hash).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mockRegisterInput)).rejects.toThrow('Database error');
    });

    it('should handle hash service errors gracefully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      hashService.hash.mockRejectedValue(new Error('Hash error'));

      await expect(useCase.execute(mockRegisterInput)).rejects.toThrow('Hash error');
    });

    it('should handle JWT service errors gracefully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashedPassword123');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT error');
      });

      await expect(useCase.execute(mockRegisterInput)).rejects.toThrow('JWT error');
    });
  });
}); 