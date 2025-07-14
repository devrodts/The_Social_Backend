import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowRepository, FOLLOW_REPOSITORY } from '../repositories/follow-repository.interface';
import { User } from '../../users/entity/user.entity';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class FindFollowingUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(userId: string, limit?: number, offset?: number): Promise<Follow[]> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find following with pagination
    return await this.followRepository.findByFollower(userId, limit, offset);
  }
} 