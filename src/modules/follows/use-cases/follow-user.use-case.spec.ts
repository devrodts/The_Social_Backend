import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUserUseCase } from './follow-user.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../repositories/follow-repository.interface';
import { User } from '../../users/entity/user.entity';
import { Follow } from '../entities/follow.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FollowUserUseCase', () => {
  let useCase: FollowUserUseCase;
  let followRepository: FollowRepository;
  let userRepository: Repository<User>;

  const mockFollowRepository = {
    existsByFollowerAndFollowing: jest.fn(),
    create: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUserUseCase,
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

    useCase = module.get<FollowUserUseCase>(FollowUserUseCase);
    followRepository = module.get<FollowRepository>(FOLLOW_REPOSITORY);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should follow a user successfully', async () => {
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
      mockFollowRepository.existsByFollowerAndFollowing.mockResolvedValue(false);
      mockFollowRepository.create.mockResolvedValue(mockFollow);

      const result = await useCase.execute(followerId, followingId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(mockFollowRepository.existsByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.create).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toEqual(mockFollow);
    });

    it('should throw ConflictException when trying to follow yourself', async () => {
      const userId = 'user-id';

      await expect(useCase.execute(userId, userId)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockFollowRepository.existsByFollowerAndFollowing).not.toHaveBeenCalled();
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when follower not found', async () => {
      const followerId = 'non-existent-follower';
      const followingId = 'following-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockFollowRepository.existsByFollowerAndFollowing).not.toHaveBeenCalled();
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user to follow not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'non-existent-following';
      
      const mockFollower = { id: followerId, username: 'follower' } as User;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(mockFollowRepository.existsByFollowerAndFollowing).not.toHaveBeenCalled();
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when already following', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      
      const mockFollower = { id: followerId, username: 'follower' } as User;
      const mockFollowing = { id: followingId, username: 'following' } as User;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      mockFollowRepository.existsByFollowerAndFollowing.mockResolvedValue(true);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(mockFollowRepository.existsByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });
  });
}); 