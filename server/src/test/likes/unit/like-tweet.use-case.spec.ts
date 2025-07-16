import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from '../../../modules/likes/entities/like.entity';
import { Tweet } from '../../../modules/tweets/entities/tweet.entity';
import { User } from '../../../modules/users/entity/user.entity';
import { LikeTweetUseCase } from '../../../modules/likes/use-cases/like-tweet.use-case';
import { LikeRepositoryImpl } from '../../../modules/likes/repositories/like-repository.impl';

describe('LikeTweetUseCase', () => {
  let useCase: LikeTweetUseCase;
  let likeRepository: any;
  let tweetRepository: any;
  let userRepository: any;

  const mockLikeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    existsByUserAndTweet: jest.fn(),
    remove: jest.fn(),
  };
  const mockTweetRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeTweetUseCase,
        { provide: LikeRepositoryImpl, useValue: mockLikeRepository },
        { provide: getRepositoryToken(Like), useValue: mockLikeRepository },
        { provide: getRepositoryToken(Tweet), useValue: mockTweetRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<LikeTweetUseCase>(LikeTweetUseCase);
    likeRepository = mockLikeRepository;
    tweetRepository = mockTweetRepository;
    userRepository = mockUserRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('likeTweet', () => {
    it('should like a tweet successfully', async () => {
      const userId = 'user-1';
      const tweetId = 'tweet-1';
      const mockUser = { id: userId } as User;
      const mockTweet = { id: tweetId, likesCount: 0 } as Tweet;
      const mockLike = { id: 'like-1', userId, tweetId } as Like;

      likeRepository.existsByUserAndTweet.mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue(mockUser);
      tweetRepository.findOne.mockResolvedValue(mockTweet);
      likeRepository.create.mockResolvedValue(mockLike);
      tweetRepository.update.mockResolvedValue(undefined);

      const result = await useCase.likeTweet(userId, tweetId);
      expect(result).toEqual(mockLike);
      expect(likeRepository.create).toHaveBeenCalledWith(userId, tweetId);
      expect(tweetRepository.update).toHaveBeenCalledWith(tweetId, { likesCount: 1 });
    });

    it('should not allow duplicate like', async () => {
      const userId = 'user-1';
      const tweetId = 'tweet-1';
      likeRepository.existsByUserAndTweet.mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue({ id: userId });
      tweetRepository.findOne.mockResolvedValue({ id: tweetId });
      await expect(useCase.likeTweet(userId, tweetId)).rejects.toThrow('User user-1 already liked tweet tweet-1');
    });

    it('should throw if tweet does not exist', async () => {
      const userId = 'user-1';
      const tweetId = 'tweet-1';
      likeRepository.existsByUserAndTweet.mockResolvedValue(false);
      tweetRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue({ id: userId });
      await expect(useCase.likeTweet(userId, tweetId)).rejects.toThrow('Tweet not found');
    });

    it('should throw if user does not exist', async () => {
      const userId = 'user-1';
      const tweetId = 'tweet-1';
      likeRepository.existsByUserAndTweet.mockResolvedValue(false);
      tweetRepository.findOne.mockResolvedValue({ id: tweetId });
      userRepository.findOne.mockResolvedValue(null);
      await expect(useCase.likeTweet(userId, tweetId)).rejects.toThrow('User not found');
    });
  });

  describe('unlikeTweet', () => {
    it('should unlike a tweet successfully', async () => {
      const userId = 'user-1';
      const tweetId = 'tweet-1';
      const mockTweet = { id: tweetId, likesCount: 1 } as Tweet;
      likeRepository.existsByUserAndTweet.mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue({ id: userId });
      tweetRepository.findOne.mockResolvedValue(mockTweet);
      likeRepository.remove.mockResolvedValue(true);
      tweetRepository.update.mockResolvedValue(undefined);
      const result = await useCase.unlikeTweet(userId, tweetId);
      expect(result).toEqual({ success: true, message: 'Like removed' });
      expect(likeRepository.remove).toHaveBeenCalledWith(userId, tweetId);
      expect(tweetRepository.update).toHaveBeenCalledWith(tweetId, { likesCount: 0 });
    });
    it('should throw if like does not exist', async () => {
      const userId = 'user-1';
      const tweetId = 'tweet-1';
      likeRepository.existsByUserAndTweet.mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue({ id: userId });
      tweetRepository.findOne.mockResolvedValue({ id: tweetId });
      await expect(useCase.unlikeTweet(userId, tweetId)).rejects.toThrow('Like not found for user user-1 and tweet tweet-1');
    });
  });
}); 