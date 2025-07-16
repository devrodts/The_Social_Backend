import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../../../modules/tweets/entities/tweet.entity';
import { CreateTweetUseCase } from '../../../modules/tweets/use-cases/create-tweet.use-case';
import { CreateTweetInputDTO } from '../../../modules/tweets/dtos/create-tweet-input.dto';
import { User } from '../../../modules/users/entity/user.entity';
import { SanitizationService } from '../../../modules/common/services/sanitization.service';

describe('CreateTweetUseCase', () => {
  let useCase: CreateTweetUseCase;
  let tweetRepository: Repository<Tweet>;
  let userRepository: Repository<User>;

  const mockTweetRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const mockSanitizationService = {
      sanitizeTweetContent: jest.fn((input) => input.trim()),
    };

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
    tweetRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a tweet successfully', async () => {
      // Arrange
      const userId = 'user-id-123';
      const input: CreateTweetInputDTO = {
        content: 'Test tweet content',
      };

      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
      } as User;

      const mockTweet = {
        id: 'tweet-id-123',
        content: input.content,
        authorId: userId,
        likesCount: 0,
        retweetsCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Tweet;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTweetRepository.create.mockReturnValue(mockTweet);
      mockTweetRepository.save.mockResolvedValue(mockTweet);

      // Act
      const result = await useCase.execute(input, userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockTweetRepository.create).toHaveBeenCalledWith({
        content: input.content,
        author: mockUser,
      });
      expect(mockTweetRepository.save).toHaveBeenCalledWith(mockTweet);
      expect(result).toEqual(mockTweet);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const input: CreateTweetInputDTO = {
        content: 'Test tweet content',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input, userId)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error when content is empty', async () => {
      // Arrange
      const userId = 'user-id-123';
      const input: CreateTweetInputDTO = {
        content: '',
      };

      // Act & Assert
      await expect(useCase.execute(input, userId)).rejects.toThrow(
        'Tweet content cannot be empty',
      );
    });

    it('should throw error when content is too long', async () => {
      // Arrange
      const userId = 'user-id-123';
      const input: CreateTweetInputDTO = {
        content: 'a'.repeat(281), // More than 280 characters
      };

      // Act & Assert
      await expect(useCase.execute(input, userId)).rejects.toThrow(
        'Tweet content cannot exceed 280 characters',
      );
    });
  });
}); 