import { Injectable } from '@nestjs/common';
import { LikeRepositoryImpl } from '../repositories/like-repository.impl';
import { Like } from '../entities/like.entity';

@Injectable()
export class FindLikesUseCase {
  constructor(private readonly likeRepository: LikeRepositoryImpl) {}

  async findByTweet(tweetId: string, limit: number = 10, offset: number = 0): Promise<Like[]> {
    return await this.likeRepository.findByTweet(tweetId, limit, offset);
  }

  async findByUser(userId: string, limit: number = 10, offset: number = 0): Promise<Like[]> {
    return await this.likeRepository.findByUser(userId, limit, offset);
  }

  async countByTweet(tweetId: string): Promise<number> {
    return await this.likeRepository.countByTweet(tweetId);
  }

  async countByUser(userId: string): Promise<number> {
    return await this.likeRepository.countByUser(userId);
  }

  async isLikedByUser(userId: string, tweetId: string): Promise<boolean> {
    return await this.likeRepository.existsByUserAndTweet(userId, tweetId);
  }
}