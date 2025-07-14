import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindFollowersUseCase } from './find-followers.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../repositories/follow-repository.interface';
import { User } from '../../users/entity/user.entity';
import { Follow } from '../entities/follow.entity';
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
    it('should return followers of a user', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollowers = [
        {
          id: 'follow-id-1',
          follower: { id: 'follower-1', username: 'follower1' } as User,
          following: mockUser,
          createdAt: new Date(),
        },
        {
          id: 'follow-id-2',
          follower: { id: 'follower-2', username: 'follower2' } as User,
          following: mockUser,
          createdAt: new Date(),
        },
      ] as Follow[];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollowing.mockResolvedValue(mockFollowers);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual(mockFollowers);
    });

    it('should return followers with pagination', async () => {
      const userId = 'user-id';
      const limit = 10;
      const offset = 5;
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollowers = [
        {
          id: 'follow-id-1',
          follower: { id: 'follower-1', username: 'follower1' } as User,
          following: mockUser,
          createdAt: new Date(),
        },
      ] as Follow[];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollowing.mockResolvedValue(mockFollowers);

      const result = await useCase.execute(userId, limit, offset);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).toHaveBeenCalledWith(userId, limit, offset);
      expect(result).toEqual(mockFollowers);
    });

    it('should return empty array when user has no followers', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, username: 'user' } as User;
      const mockFollowers: Follow[] = [];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowRepository.findByFollowing.mockResolvedValue(mockFollowers);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-user';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockFollowRepository.findByFollowing).not.toHaveBeenCalled();
    });
  });
}); 