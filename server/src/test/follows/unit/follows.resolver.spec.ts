import { Test, TestingModule } from '@nestjs/testing';
import { FollowsResolver } from '../../../modules/follows/follows.resolver';
import { FollowUserUseCase } from '../../../modules/follows/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '../../../modules/follows/use-cases/unfollow-user.use-case';
import { FindFollowersUseCase } from '../../../modules/follows/use-cases/find-followers.use-case';
import { FindFollowingUseCase } from '../../../modules/follows/use-cases/find-following.use-case';
import { Follow } from '../../../modules/follows/entities/follow.entity';
import { User } from '../../../modules/users/entity/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FollowsResolver', () => {
  let resolver: FollowsResolver;
  let followUserUseCase: FollowUserUseCase;
  let unfollowUserUseCase: UnfollowUserUseCase;
  let findFollowersUseCase: FindFollowersUseCase;
  let findFollowingUseCase: FindFollowingUseCase;

  const mockFollowUserUseCase = {
    execute: jest.fn(),
  };

  const mockUnfollowUserUseCase = {
    execute: jest.fn(),
  };

  const mockFindFollowersUseCase = {
    execute: jest.fn(),
  };

  const mockFindFollowingUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsResolver,
        {
          provide: FollowUserUseCase,
          useValue: mockFollowUserUseCase,
        },
        {
          provide: UnfollowUserUseCase,
          useValue: mockUnfollowUserUseCase,
        },
        {
          provide: FindFollowersUseCase,
          useValue: mockFindFollowersUseCase,
        },
        {
          provide: FindFollowingUseCase,
          useValue: mockFindFollowingUseCase,
        },
      ],
    }).compile();

    resolver = module.get<FollowsResolver>(FollowsResolver);
    followUserUseCase = module.get<FollowUserUseCase>(FollowUserUseCase);
    unfollowUserUseCase = module.get<UnfollowUserUseCase>(UnfollowUserUseCase);
    findFollowersUseCase = module.get<FindFollowersUseCase>(FindFollowersUseCase);
    findFollowingUseCase = module.get<FindFollowingUseCase>(FindFollowingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const mockUser = { id: followerId } as User;
      const mockFollow = { id: 'follow-id', followerId, followingId, createdAt: new Date() } as Follow;

      mockFollowUserUseCase.execute.mockResolvedValue(mockFollow);

      const result = await resolver.followUser(mockUser, followingId);

      expect(mockFollowUserUseCase.execute).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toEqual(mockFollow);
    });

    it('should throw ConflictException when trying to follow yourself', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId } as User;
      const error = new ConflictException('Cannot follow yourself');

      mockFollowUserUseCase.execute.mockRejectedValue(error);

      await expect(resolver.followUser(mockUser, userId)).rejects.toThrow(ConflictException);
      expect(mockFollowUserUseCase.execute).toHaveBeenCalledWith(userId, userId);
    });

    it('should throw NotFoundException when follower not found', async () => {
      const followerId = 'non-existent-follower';
      const followingId = 'following-id';
      const mockUser = { id: followerId } as User;
      const error = new NotFoundException('Follower not found');

      mockFollowUserUseCase.execute.mockRejectedValue(error);

      await expect(resolver.followUser(mockUser, followingId)).rejects.toThrow(NotFoundException);
      expect(mockFollowUserUseCase.execute).toHaveBeenCalledWith(followerId, followingId);
    });

    it('should throw ConflictException when already following', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const mockUser = { id: followerId } as User;
      const error = new ConflictException('Already following this user');

      mockFollowUserUseCase.execute.mockRejectedValue(error);

      await expect(resolver.followUser(mockUser, followingId)).rejects.toThrow(ConflictException);
      expect(mockFollowUserUseCase.execute).toHaveBeenCalledWith(followerId, followingId);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const mockUser = { id: followerId } as User;

      mockUnfollowUserUseCase.execute.mockResolvedValue(true);

      const result = await resolver.unfollowUser(mockUser, followingId);

      expect(mockUnfollowUserUseCase.execute).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when follow relationship not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const mockUser = { id: followerId } as User;
      const error = new NotFoundException('Follow relationship not found');

      mockUnfollowUserUseCase.execute.mockRejectedValue(error);

      await expect(resolver.unfollowUser(mockUser, followingId)).rejects.toThrow(NotFoundException);
      expect(mockUnfollowUserUseCase.execute).toHaveBeenCalledWith(followerId, followingId);
    });
  });

  describe('findFollowers', () => {
    it('should find followers successfully', async () => {
      const userId = 'user-id';
      const limit = 10;
      const offset = 0;
      const mockFollows = [
        { id: 'follow-1', followerId: 'follower-1', followingId: userId } as Follow,
        { id: 'follow-2', followerId: 'follower-2', followingId: userId } as Follow,
      ];

      mockFindFollowersUseCase.execute.mockResolvedValue(mockFollows);

      const result = await resolver.findFollowers(userId, limit, offset);

      expect(mockFindFollowersUseCase.execute).toHaveBeenCalledWith(userId, limit, offset);
      expect(result).toEqual(mockFollows);
    });

    it('should return empty array when user has no followers', async () => {
      const userId = 'user-id';
      const mockFollows: Follow[] = [];

      mockFindFollowersUseCase.execute.mockResolvedValue(mockFollows);

      const result = await resolver.findFollowers(userId);

      expect(mockFindFollowersUseCase.execute).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('findFollowing', () => {
    it('should find following successfully', async () => {
      const userId = 'user-id';
      const limit = 10;
      const offset = 0;
      const mockFollows = [
        { id: 'follow-1', followerId: userId, followingId: 'following-1' } as Follow,
        { id: 'follow-2', followerId: userId, followingId: 'following-2' } as Follow,
      ];

      mockFindFollowingUseCase.execute.mockResolvedValue(mockFollows);

      const result = await resolver.findFollowing(userId, limit, offset);

      expect(mockFindFollowingUseCase.execute).toHaveBeenCalledWith(userId, limit, offset);
      expect(result).toEqual(mockFollows);
    });

    it('should return empty array when user follows no one', async () => {
      const userId = 'user-id';
      const mockFollows: Follow[] = [];

      mockFindFollowingUseCase.execute.mockResolvedValue(mockFollows);

      const result = await resolver.findFollowing(userId);

      expect(mockFindFollowingUseCase.execute).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });
  });
}); 