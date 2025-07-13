import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../../../modules/tweets/entities/tweet.entity';
import { User } from '../../../modules/users/entity/user.entity';
import { FindTweetsUseCase } from '../../../modules/tweets/use-cases/find-tweets.use-case';

describe('FindTweetsUseCase', () => {
  let useCase: FindTweetsUseCase;
  let tweetRepository: Repository<Tweet>;

  const mockTweetRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindTweetsUseCase,
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockTweetRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindTweetsUseCase>(FindTweetsUseCase);
    tweetRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all tweets with author information', async () => {
      // Arrange
      const mockTweets = [
        {
          id: 'tweet-1',
          content: 'First tweet',
          createdAt: new Date(),
          author: {
            id: 'user-1',
            username: 'user1',
            displayName: 'User One',
          },
        },
        {
          id: 'tweet-2',
          content: 'Second tweet',
          createdAt: new Date(),
          author: {
            id: 'user-2',
            username: 'user2',
            displayName: 'User Two',
          },
        },
      ] as Tweet[];

      mockTweetRepository.find.mockResolvedValue(mockTweets);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockTweetRepository.find).toHaveBeenCalledWith({
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockTweets);
    });

    it('should return empty array when no tweets exist', async () => {
      // Arrange
      mockTweetRepository.find.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockTweetRepository.find).toHaveBeenCalledWith({
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([]);
    });
  });
}); 