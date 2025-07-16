import { Injectable } from '@nestjs/common';
import { CreateLikeUseCase, RemoveLikeUseCase, FindLikesUseCase } from './use-cases';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    private readonly createLikeUseCase: CreateLikeUseCase,
    private readonly removeLikeUseCase: RemoveLikeUseCase,
    private readonly findLikesUseCase: FindLikesUseCase,
  ) {}

  async createLike(userId: string, tweetId: string): Promise<Like> {
    return await this.createLikeUseCase.execute(userId, tweetId);
  }

  async removeLike(userId: string, tweetId: string): Promise<{ success: boolean; message: string }> {
    return await this.removeLikeUseCase.execute(userId, tweetId);
  }

  async findLikesByTweet(tweetId: string, limit: number = 10, offset: number = 0): Promise<Like[]> {
    return await this.findLikesUseCase.findByTweet(tweetId, limit, offset);
  }

  async findLikesByUser(userId: string, limit: number = 10, offset: number = 0): Promise<Like[]> {
    return await this.findLikesUseCase.findByUser(userId, limit, offset);
  }

  async countLikesByTweet(tweetId: string): Promise<number> {
    return await this.findLikesUseCase.countByTweet(tweetId);
  }

  async countLikesByUser(userId: string): Promise<number> {
    return await this.findLikesUseCase.countByUser(userId);
  }

  async isLikedByUser(userId: string, tweetId: string): Promise<boolean> {
    return await this.findLikesUseCase.isLikedByUser(userId, tweetId);
  }
}