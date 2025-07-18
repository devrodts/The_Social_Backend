import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { FollowRepository } from './follow-repository.interface';

@Injectable()
export class FollowRepositoryImpl implements FollowRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly repository: Repository<Follow>,
  ) {}

  async findByFollowerAndFollowing(followerId: string, followingId: string): Promise<Follow | null> {
    return await this.repository.findOne({
      where: { followerId, followingId },
      relations: ['follower', 'following'],
    });
  }

  async create(followerId: string, followingId: string): Promise<Follow> {
    const follow = this.repository.create({
      followerId: followerId,
      followingId: followingId,
    });
    const savedFollow = await this.repository.save(follow);
    
    // Reload with relations to avoid null field errors
    return await this.repository.findOne({
      where: { id: savedFollow.id },
      relations: ['follower', 'following'],
    }) as Follow;
  }

  async remove(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.repository.delete({ followerId, followingId });
    return (result.affected || 0) > 0;
  }

  async findByFollower(followerId: string, limit: number = 10, offset: number = 0): Promise<Follow[]> {
    return await this.repository.find({
      where: { followerId },
      relations: ['following'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findByFollowing(followingId: string, limit: number = 10, offset: number = 0): Promise<Follow[]> {
    return await this.repository.find({
      where: { followingId },
      relations: ['follower'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async countByFollower(followerId: string): Promise<number> {
    return await this.repository.count({
      where: { followerId },
    });
  }

  async countByFollowing(followingId: string): Promise<number> {
    return await this.repository.count({
      where: { followingId },
    });
  }

  async existsByFollowerAndFollowing(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { followerId, followingId },
    });
    return count > 0;
  }
} 