
// src/likes/repositories/like.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../entities/like.entity';
import { LikeRepository } from './like.repository';

@Injectable()
export class LikeRepositoryImpl implements LikeRepository {
  constructor(
    @InjectRepository(Like)
    private readonly repository: Repository<Like>,
  ) {}

  async findByUserAndTweet(userId: string, tweetId: string): Promise<Like | null> {
    return await this.repository.findOne({
      where: { userId, tweetId },
      relations: ['user', 'tweet'],
    });
  }

  async create(userId: string, tweetId: string): Promise<Like> {
    const like = this.repository.create({ userId, tweetId });
    return await this.repository.save(like);
  }

  async remove(userId: string, tweetId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, tweetId });
  return (result.affected || 0) > 0;
}

  async findByTweet(tweetId: string, limit: number = 10, offset: number = 0): Promise<Like[]> {
    return await this.repository.find({
      where: { tweetId },
      relations: ['user'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string, limit: number = 10, offset: number = 0): Promise<Like[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['tweet', 'tweet.author'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async countByTweet(tweetId: string): Promise<number> {
    return await this.repository.count({ where: { tweetId } });
  }

  async countByUser(userId: string): Promise<number> {
    return await this.repository.count({ where: { userId } });
  }

  async existsByUserAndTweet(userId: string, tweetId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { userId, tweetId },
    });
    return count > 0;
  }
}