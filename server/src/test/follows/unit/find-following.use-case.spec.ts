import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindFollowingUseCase } from '../../../modules/follows/use-cases/find-following.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../../../modules/follows/repositories/follow-repository.interface';
import { User } from '../../../modules/users/entity/user.entity';
import { Follow } from '../../../modules/follows/entities/follow.entity';
import { NotFoundException } from '@nestjs/common';

describe('FindFollowingUseCase', () => {
  let useCase: FindFollowingUseCase;
  let followRepository: FollowRepository;
  let userRepository: Repository<User>;

  const mockFollowRepository = {
    findByFollower: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindFollowingUseCase,
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

    useCase = module.get<FindFollowingUseCase>(FindFollowingUseCase);
    followRepository = module.get<FollowRepository>(FOLLOW_REPOSITORY);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should find following successfully', async () => {
      const userId = 'user-id';
      const limit = 10;
      const offset = 0;
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollows = [
        { id: 'follow-1', followerId: userId, followingId: 'following-1' } as Follow,
        { id: 'follow-2', followerId: userId, followingId: 'following-2' } as Follow,
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollower.mockResolvedValue(mockFollows);

      const result = await useCase.execute(userId, limit, offset);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollower).toHaveBeenCalledWith(userId, limit, offset);
      expect(result).toEqual(mockFollows);
    });

    it('should find following with default pagination', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollows = [
        { id: 'follow-1', followerId: userId, followingId: 'following-1' } as Follow,
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollower.mockResolvedValue(mockFollows);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollower).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual(mockFollows);
    });

    it('should return empty array when user follows no one', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollows: Follow[] = [];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollower.mockResolvedValue(mockFollows);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollower).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-user';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollower).not.toHaveBeenCalled();
    });
  });
}); 