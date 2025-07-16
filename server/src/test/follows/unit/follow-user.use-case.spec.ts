import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUserUseCase } from '../../../modules/follows/use-cases/follow-user.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../../../modules/follows/repositories/follow-repository.interface';
import { User } from '../../../modules/users/entity/user.entity';
import { Follow } from '../../../modules/follows/entities/follow.entity';
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
      const mockFollow = { id: 'follow-id', followerId, followingId, createdAt: new Date() } as Follow;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower) // first call for follower
        .mockResolvedValueOnce(mockFollowing); // second call for following
      mockFollowRepository.existsByFollowerAndFollowing.mockResolvedValue(false);
      mockFollowRepository.create.mockResolvedValue(mockFollow);

      const result = await useCase.execute(followerId, followingId);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(1, { where: { id: followerId } });
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: followingId } });
      expect(mockFollowRepository.existsByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.create).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toEqual(mockFollow);
    });

    it('should throw ConflictException when trying to follow yourself', async () => {
      const userId = 'user-id';

      await expect(useCase.execute(userId, userId)).rejects.toThrow(
        new ConflictException('Cannot follow yourself')
      );
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

    it('should throw NotFoundException when user to follow not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'non-existent-following';
      const mockFollower = { id: followerId, username: 'follower' } as User;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(null);

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new NotFoundException('User to follow not found')
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
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

      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new ConflictException('Already following this user')
      );
      expect(mockFollowRepository.existsByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });
  });
}); 