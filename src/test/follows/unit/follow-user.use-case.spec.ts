import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUserUseCase } from '../../../modules/follows/use-cases/follow-user.use-case';
import { FollowRepository, FOLLOW_REPOSITORY } from '../../../modules/follows/repositories/follow-repository.interface';
import { User } from '../../../modules/users/entity/user.entity';
import { Follow } from '../../../modules/follows/entities/follow.entity';

describe('FollowUserUseCase', () => {
  let useCase: FollowUserUseCase;
  let followRepository: jest.Mocked<FollowRepository>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockFollowRepository = {
      existsByFollowerAndFollowing: jest.fn(),
      create: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

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
    followRepository = module.get(FOLLOW_REPOSITORY);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('execute', () => {
    const followerId = 'follower-1';
    const followingId = 'following-1';

    it('should follow a user successfully', async () => {
      // Arrange
      const mockFollower = { id: followerId, username: 'follower' } as User;
      const mockFollowing = { id: followingId, username: 'following' } as User;
      const mockFollow = { id: 'follow-1', followerId, followingId } as Follow;

      userRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      followRepository.existsByFollowerAndFollowing.mockResolvedValue(false);
      followRepository.create.mockResolvedValue(mockFollow);

      // Act
      const result = await useCase.execute(followerId, followingId);

      // Assert
      expect(result).toEqual(mockFollow);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
      expect(followRepository.existsByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
      expect(followRepository.create).toHaveBeenCalledWith(followerId, followingId);
    });

    it('should throw NotFoundException when follower does not exist', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new NotFoundException('Follower not found')
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: followerId } });
    });

    it('should throw NotFoundException when user to follow does not exist', async () => {
      // Arrange
      const mockFollower = { id: followerId, username: 'follower' } as User;
      userRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new NotFoundException('User to follow not found')
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: followingId } });
    });

    it('should throw ConflictException when already following the user', async () => {
      // Arrange
      const mockFollower = { id: followerId, username: 'follower' } as User;
      const mockFollowing = { id: followingId, username: 'following' } as User;

      userRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      followRepository.existsByFollowerAndFollowing.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(followerId, followingId)).rejects.toThrow(
        new ConflictException('Already following this user')
      );
      expect(followRepository.existsByFollowerAndFollowing).toHaveBeenCalledWith(followerId, followingId);
    });

    it('should throw ConflictException when trying to follow yourself', async () => {
      // Act & Assert
      await expect(useCase.execute(followerId, followerId)).rejects.toThrow(
        new ConflictException('Cannot follow yourself')
      );
    });
  });
}); 