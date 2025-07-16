import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowRepository, FOLLOW_REPOSITORY } from '../repositories/follow-repository.interface';
import { User } from '../../users/entity/user.entity';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(followerId: string, followingId: string): Promise<boolean> {
    // Check if follower exists
    const follower = await this.userRepository.findOne({ where: { id: followerId } });
    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    // Check if user to unfollow exists
    const following = await this.userRepository.findOne({ where: { id: followingId } });
    if (!following) {
      throw new NotFoundException('User to unfollow not found');
    }

    // Check if follow relationship exists
    const existingFollow = await this.followRepository.findByFollowerAndFollowing(followerId, followingId);
    if (!existingFollow) {
      throw new NotFoundException('Follow relationship not found');
    }

    // Remove the follow relationship
    return await this.followRepository.remove(followerId, followingId);
  }
} 