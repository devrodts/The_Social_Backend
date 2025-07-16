import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUseCase } from '../../../modules/auth/use-cases/register.use-case';
import { SanitizationService } from '../../../modules/common/services/sanitization.service';
import { HashService } from '../../../modules/auth/services/hash.service';
import { JwtService } from '../../../modules/auth/services/jwt.service';
import { User } from '../../../modules/users/entity/user.entity';
import { RegisterInputDTO } from '../../../modules/auth/dtos/register-input.dto';

describe('RegisterUseCase - Sanitization', () => {
  let useCase: RegisterUseCase;
  let userRepository: Repository<User>;
  let sanitizationService: SanitizationService;
  let hashService: HashService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSanitizationService = {
    sanitizeUsername: jest.fn(),
    sanitizeDisplayName: jest.fn(),
    sanitizeEmail: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: SanitizationService,
          useValue: mockSanitizationService,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    sanitizationService = module.get<SanitizationService>(SanitizationService);
    hashService = module.get<HashService>(HashService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    it('should sanitize username before checking existence', async () => {
      const maliciousInput: RegisterInputDTO = {
        username: '<script>alert("xss")</script>user',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const sanitizedUsername = 'scriptuser';
      mockSanitizationService.sanitizeUsername.mockReturnValue(sanitizedUsername);
      mockSanitizationService.sanitizeDisplayName.mockReturnValue('Test User');
      mockSanitizationService.sanitizeEmail.mockReturnValue('test@example.com');
      mockUserRepository.findOne.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue({ id: 'user-id' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-id' });

      await useCase.execute(maliciousInput);

      expect(mockSanitizationService.sanitizeUsername).toHaveBeenCalledWith(maliciousInput.username);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: sanitizedUsername } });
    });

    it('should sanitize display name before saving', async () => {
      const maliciousInput: RegisterInputDTO = {
        username: 'testuser',
        email: 'test@example.com', 
        password: 'password123',
        displayName: '<img src=x onerror=alert(1)>Evil Name',
      };

      const sanitizedDisplayName = 'Evil Name';
      mockSanitizationService.sanitizeUsername.mockReturnValue('testuser');
      mockSanitizationService.sanitizeDisplayName.mockReturnValue(sanitizedDisplayName);
      mockSanitizationService.sanitizeEmail.mockReturnValue('test@example.com');
      mockUserRepository.findOne.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue({ id: 'user-id' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-id' });

      await useCase.execute(maliciousInput);

      expect(mockSanitizationService.sanitizeDisplayName).toHaveBeenCalledWith(maliciousInput.displayName);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: sanitizedDisplayName,
        })
      );
    });

    it('should sanitize email before checking existence', async () => {
      const maliciousInput: RegisterInputDTO = {
        username: 'testuser',
        email: '<script>evil</script>test@example.com',
        password: 'password123', 
        displayName: 'Test User',
      };

      const sanitizedEmail = 'test@example.com';
      mockSanitizationService.sanitizeUsername.mockReturnValue('testuser');
      mockSanitizationService.sanitizeDisplayName.mockReturnValue('Test User');
      mockSanitizationService.sanitizeEmail.mockReturnValue(sanitizedEmail);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue({ id: 'user-id' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-id' });

      await useCase.execute(maliciousInput);

      expect(mockSanitizationService.sanitizeEmail).toHaveBeenCalledWith(maliciousInput.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: sanitizedEmail } });
    });

    it('should prevent XSS attacks in all user input fields', async () => {
      const xssPayload: RegisterInputDTO = {
        username: '<script>alert("username")</script>',
        email: '<script>alert("email")</script>@test.com',
        password: 'password123',
        displayName: '<script>alert("displayName")</script>',
      };

      mockSanitizationService.sanitizeUsername.mockReturnValue('');
      mockSanitizationService.sanitizeDisplayName.mockReturnValue('');
      mockSanitizationService.sanitizeEmail.mockReturnValue('@test.com');
      mockUserRepository.findOne.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue({ id: 'user-id' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-id' });

      await useCase.execute(xssPayload);

      expect(mockSanitizationService.sanitizeUsername).toHaveBeenCalledWith(xssPayload.username);
      expect(mockSanitizationService.sanitizeDisplayName).toHaveBeenCalledWith(xssPayload.displayName);
      expect(mockSanitizationService.sanitizeEmail).toHaveBeenCalledWith(xssPayload.email);
    });

    it('should handle malicious img tags in username', async () => {
      const imgXssInput: RegisterInputDTO = {
        username: '<img src=x onerror=alert(1)>hacker',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      mockSanitizationService.sanitizeUsername.mockReturnValue('hacker');
      mockSanitizationService.sanitizeDisplayName.mockReturnValue('Test User');
      mockSanitizationService.sanitizeEmail.mockReturnValue('test@example.com');
      mockUserRepository.findOne.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue({ id: 'user-id' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-id' });

      await useCase.execute(imgXssInput);

      expect(mockSanitizationService.sanitizeUsername).toHaveBeenCalledWith(imgXssInput.username);
    });
  });
}); 