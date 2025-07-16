import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../../../modules/tweets/entities/tweet.entity';
import { User } from '../../../modules/users/entity/user.entity';
import { CreateTweetUseCase } from '../../../modules/tweets/use-cases/create-tweet.use-case';
import { CreateTweetInputDTO } from '../../../modules/tweets/dtos/create-tweet-input.dto';
import { SanitizationService } from '../../../modules/common/services/sanitization.service';

describe('CreateTweetUseCase - Sanitization', () => {
  let useCase: CreateTweetUseCase;
  let tweetRepository: jest.Mocked<Repository<Tweet>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let sanitizationService: any;

  const mockTweetRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockSanitizationService = {
    sanitizeTweetContent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTweetUseCase,
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockTweetRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: SanitizationService,
          useValue: mockSanitizationService,
        },
      ],
    }).compile();

    useCase = module.get<CreateTweetUseCase>(CreateTweetUseCase);
    tweetRepository = module.get(getRepositoryToken(Tweet));
    userRepository = module.get(getRepositoryToken(User));
    sanitizationService = module.get(SanitizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    const mockUser = {
      id: 'user-id-123',
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
    } as User;

    const mockTweet = {
      id: 'tweet-id-123',
      content: 'Sanitized tweet content',
      authorId: 'user-id-123',
      likesCount: 0,
      retweetsCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Tweet;

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTweetRepository.create.mockReturnValue(mockTweet);
      mockTweetRepository.save.mockResolvedValue(mockTweet);
    });

    it('should sanitize tweet content before saving', async () => {
      const maliciousInput: CreateTweetInputDTO = {
        content: '<script>alert("XSS in tweet!")</script>This is my tweet content',
      };

      const sanitizedContent = 'This is my tweet content';
      mockSanitizationService.sanitizeTweetContent.mockReturnValue(sanitizedContent);

      await useCase.execute(maliciousInput, 'user-id-123');

      expect(mockSanitizationService.sanitizeTweetContent).toHaveBeenCalledWith(maliciousInput.content);
      expect(mockTweetRepository.create).toHaveBeenCalledWith({
        content: sanitizedContent,
        author: mockUser,
      });
    });

    it('should prevent XSS attacks in tweet content', async () => {
      const xssPayload: CreateTweetInputDTO = {
        content: '<img src=x onerror=alert("XSS")>Check out my profile!',
      };

      const sanitizedContent = 'Check out my profile!';
      mockSanitizationService.sanitizeTweetContent.mockReturnValue(sanitizedContent);

      await useCase.execute(xssPayload, 'user-id-123');

      expect(mockSanitizationService.sanitizeTweetContent).toHaveBeenCalledWith(xssPayload.content);
      expect(mockTweetRepository.create).toHaveBeenCalledWith({
        content: sanitizedContent,
        author: mockUser,
      });
    });

    it('should sanitize dangerous HTML tags but preserve tweet content', async () => {
      const maliciousInput: CreateTweetInputDTO = {
        content: 'Check this out: <script>fetch("/api/users").then(r=>r.json()).then(d=>alert(JSON.stringify(d)))</script> Amazing stuff!',
      };

      const sanitizedContent = 'Check this out: Amazing stuff!';
      mockSanitizationService.sanitizeTweetContent.mockReturnValue(sanitizedContent);

      await useCase.execute(maliciousInput, 'user-id-123');

      expect(mockSanitizationService.sanitizeTweetContent).toHaveBeenCalledWith(maliciousInput.content);
      expect(mockTweetRepository.create).toHaveBeenCalledWith({
        content: sanitizedContent,
        author: mockUser,
      });
    });

    it('should handle SQL injection attempts in tweet content', async () => {
      const sqlInjectionInput: CreateTweetInputDTO = {
        content: 'My tweet content UNION SELECT password FROM users WHERE admin=true; DROP TABLE tweets;',
      };

      const sanitizedContent = 'My tweet content password FROM users WHERE admin=true; tweets;';
      mockSanitizationService.sanitizeTweetContent.mockReturnValue(sanitizedContent);

      await useCase.execute(sqlInjectionInput, 'user-id-123');

      expect(mockSanitizationService.sanitizeTweetContent).toHaveBeenCalledWith(sqlInjectionInput.content);
      expect(mockTweetRepository.create).toHaveBeenCalledWith({
        content: sanitizedContent,
        author: mockUser,
      });
    });

    it('should return sanitized content in the response', async () => {
      const maliciousInput: CreateTweetInputDTO = {
        content: '<iframe src="javascript:alert(\'Hacked!\')"></iframe>Normal tweet text',
      };

      const sanitizedContent = 'Normal tweet text';
      mockSanitizationService.sanitizeTweetContent.mockReturnValue(sanitizedContent);
      
      const expectedTweet = { ...mockTweet, content: sanitizedContent };
      mockTweetRepository.save.mockResolvedValue(expectedTweet);

      const result = await useCase.execute(maliciousInput, 'user-id-123');

      expect(result.content).toBe(sanitizedContent);
      expect(result.content).not.toContain('<iframe>');
      expect(result.content).not.toContain('javascript:');
    });
  });
}); 