import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnfollowUserUseCase } from './unfollow-user.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../repositories/follow-repository.interface';
import { User } from '../../users/entity/user.entity';
import { Follow } from '../entities/follow.entity';
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
      const mockFollow = new Follow();
      mockFollow.id = 'follow-id';
      mockFollow.followerId = followerId;
      mockFollow.followingId = followingId;
      mockFollow.createdAt = new Date();

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      mockFollowRepository.findByFollowerAndFollowing.mockResolvedValue(mockFollow);
      mockFollowRepository.remove.mockResolvedValue(true);

      const result = await useCase.execute(followerId, followingId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(mockFollowRepository.findByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.remove).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toEqual(true);
    });

    it('should throw NotFoundException when follower not found', async () => {
      const followerId = 'non-existent-follower';
      const followingId = 'following-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockFollowRepository.findByFollowerAndFollowing).not.toHaveBeenCalled();
      expect(mockFollowRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user to unfollow not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'non-existent-following';
      
      const mockFollower = { id: followerId, username: 'follower' } as User;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(mockFollowRepository.findByFollowerAndFollowing).not.toHaveBeenCalled();
      expect(mockFollowRepository.remove).not.toHaveBeenCalled();
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

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(mockFollowRepository.findByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.remove).not.toHaveBeenCalled();
    });
  });
}); 