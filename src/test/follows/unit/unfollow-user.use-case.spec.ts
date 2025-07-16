import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnfollowUserUseCase } from '../../../modules/follows/use-cases/unfollow-user.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../../../modules/follows/repositories/follow-repository.interface';
import { User } from '../../../modules/users/entity/user.entity';
import { Follow } from '../../../modules/follows/entities/follow.entity';
import { NotFoundException } from '@nestjs/common';

describe('UnfollowUserUseCase', () => {
  let useCase: UnfollowUserUseCase;
  let followRepository: FollowRepository;
  let userRepository: Repository<User>;

  const mockFollowRepository = {
    findByFollowerAndFollowing: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnfollowUserUseCase,
        {
          provide: FOLLOW_REPOSITORY,
          useValue: mockFollowRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UnfollowUserUseCase>(UnfollowUserUseCase);
    followRepository = module.get<FollowRepository>(FOLLOW_REPOSITORY);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should unfollow a user successfully', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const mockFollower = { id: followerId, username: 'follower' } as User;
      const mockFollowing = { id: followingId, username: 'following' } as User;
      const mockFollow = { id: 'follow-id', followerId, followingId } as Follow;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      mockFollowRepository.findByFollowerAndFollowing.mockResolvedValue(mockFollow);
      mockFollowRepository.remove.mockResolvedValue(true);

      const result = await useCase.execute(followerId, followingId);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(1, { where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: followingId } });
      expect(mockFollowRepository.findByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.remove).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when follower not found', async () => {
      const followerId = 'non-existent-follower';
      const followingId = 'following-id';

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new NotFoundException('Follower not found')
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
    });

    it('should throw NotFoundException when user to unfollow not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'non-existent-following';
      const mockFollower = { id: followerId, username: 'follower' } as User;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new NotFoundException('User to unfollow not found')
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when follow relationship not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const mockFollower = { id: followerId, username: 'follower' } as User;
      const mockFollowing = { id: followingId, username: 'following' } as User;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      mockFollowRepository.findByFollowerAndFollowing.mockResolvedValue(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new NotFoundException('Follow relationship not found')
      );
      expect(mockFollowRepository.findByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.remove).not.toHaveBeenCalled();
    });
  });
}); 