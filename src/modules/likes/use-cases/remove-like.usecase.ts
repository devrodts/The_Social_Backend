import { Injectable } from '@nestjs/common';
import { LikeRepositoryImpl } from '../repositories/like-repository.impl';
import { LikeNotFoundException } from '../exceptions/like-not-found';


@Injectable()
export class RemoveLikeUseCase {
  constructor(private readonly likeRepository: LikeRepositoryImpl) {}

  async execute(userId: string, tweetId: string): Promise<boolean> {
    
    const existingLike = await this.likeRepository.existsByUserAndTweet(userId, tweetId);
    
    if (!existingLike) {
      throw new LikeNotFoundException(userId, tweetId);
    }

    return await this.likeRepository.remove(userId, tweetId);
  }
}