import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindFollowersUseCase } from '../../../modules/follows/use-cases/find-followers.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../../../modules/follows/repositories/follow-repository.interface';
import { User } from '../../../modules/users/entity/user.entity';
import { Follow } from '../../../modules/follows/entities/follow.entity';
import { NotFoundException } from '@nestjs/common';

describe('FindFollowersUseCase', () => {
  let useCase: FindFollowersUseCase;
  let followRepository: FollowRepository;
  let userRepository: Repository<User>;

  const mockFollowRepository = {
    findByFollowing: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindFollowersUseCase,
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

    useCase = module.get<FindFollowersUseCase>(FindFollowersUseCase);
    followRepository = module.get<FollowRepository>(FOLLOW_REPOSITORY);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should find followers successfully', async () => {
      const userId = 'user-id';
      const limit = 10;
      const offset = 0;
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollows = [
        { id: 'follow-1', followerId: 'follower-1', followingId: userId } as Follow,
        { id: 'follow-2', followerId: 'follower-2', followingId: userId } as Follow,
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollowing.mockResolvedValue(mockFollows);

      const result = await useCase.execute(userId, limit, offset);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).toHaveBeenCalledWith(userId, limit, offset);
      expect(result).toEqual(mockFollows);
    });

    it('should find followers with default pagination', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollows = [
        { id: 'follow-1', followerId: 'follower-1', followingId: userId } as Follow,
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollowing.mockResolvedValue(mockFollows);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual(mockFollows);
    });

    it('should return empty array when user has no followers', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollows: Follow[] = [];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollowing.mockResolvedValue(mockFollows);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-user';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).not.toHaveBeenCalled();
    });
  });
}); 