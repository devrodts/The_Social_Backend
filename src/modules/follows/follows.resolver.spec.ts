import { Test, TestingModule } from '@nestjs/testing';
import { FollowsResolver } from './follows.resolver';
import { FollowUserUseCase } from './use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './use-cases/unfollow-user.use-case';
import { FindFollowersUseCase } from './use-cases/find-followers.use-case';
import { FindFollowingUseCase } from './use-cases/find-following.use-case';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entity/user.entity';
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
      const mockFollow = new Follow();
      mockFollow.id = 'follow-id';
      mockFollow.followerId = followerId;
      mockFollow.followingId = followingId;
      mockFollow.createdAt = new Date();

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

    it('should throw NotFoundException when user to follow not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'non-existent-following';
      const mockUser = { id: followerId } as User;
      const error = new NotFoundException('User to follow not found');

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
      expect(result).toEqual(true);
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
    it('should return followers of a user', async () => {
      const userId = 'user-id';
      const mockFollowers = [
        {
          id: 'follow-id-1',
          follower: { id: 'follower-1', username: 'follower1' } as User,
          following: { id: userId, username: 'user' } as User,
          createdAt: new Date(),
        },
        {
          id: 'follow-id-2',
          follower: { id: 'follower-2', username: 'follower2' } as User,
          following: { id: userId, username: 'user' } as User,
          createdAt: new Date(),
        },
      ];

      mockFindFollowersUseCase.execute.mockResolvedValue(mockFollowers);

      const result = await resolver.findFollowers(userId);

      expect(mockFindFollowersUseCase.execute).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual(mockFollowers);
    });

    it('should return empty array when user has no followers', async () => {
      const userId = 'user-id';
      const mockFollowers: any[] = [];

      mockFindFollowersUseCase.execute.mockResolvedValue(mockFollowers);

      const result = await resolver.findFollowers(userId);

      expect(mockFindFollowersUseCase.execute).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('findFollowing', () => {
    it('should return users that a user follows', async () => {
      const userId = 'user-id';
      const mockFollowing = [
        {
          id: 'follow-id-1',
          follower: { id: userId, username: 'user' } as User,
          following: { id: 'following-1', username: 'following1' } as User,
          createdAt: new Date(),
        },
        {
          id: 'follow-id-2',
          follower: { id: userId, username: 'user' } as User,
          following: { id: 'following-2', username: 'following2' } as User,
          createdAt: new Date(),
        },
      ];

      mockFindFollowingUseCase.execute.mockResolvedValue(mockFollowing);

      const result = await resolver.findFollowing(userId);

      expect(mockFindFollowingUseCase.execute).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual(mockFollowing);
    });

    it('should return empty array when user follows no one', async () => {
      const userId = 'user-id';
      const mockFollowing: any[] = [];

      mockFindFollowingUseCase.execute.mockResolvedValue(mockFollowing);

      const result = await resolver.findFollowing(userId);

      expect(mockFindFollowingUseCase.execute).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });
  });
}); 