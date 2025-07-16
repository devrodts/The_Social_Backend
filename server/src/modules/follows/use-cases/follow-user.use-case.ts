import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowRepository, FOLLOW_REPOSITORY } from '../repositories/follow-repository.interface';
import { User } from '../../users/entity/user.entity';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class FollowUserUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(followerId: string, followingId: string): Promise<Follow> {
    // Check if trying to follow yourself
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }

    // Check if follower exists
    const follower = await this.userRepository.findOne({ where: { id: followerId } });
    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    // Check if user to follow exists
    const following = await this.userRepository.findOne({ where: { id: followingId } });
    if (!following) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if already following
    const existingFollow = await this.followRepository.existsByFollowerAndFollowing(followerId, followingId);
    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create the follow relationship
    return await this.followRepository.create(followerId, followingId);
  }
} 