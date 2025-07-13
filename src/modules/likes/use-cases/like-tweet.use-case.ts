import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeRepositoryImpl } from '../repositories/like-repository.impl';
import { LikeAlreadyExistsException } from '../exceptions/like-already-exists';
import { LikeNotFoundException } from '../exceptions/like-not-found';
import { Like } from '../entities/like.entity';
import { User } from '../../users/entity/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@Injectable()
export class LikeTweetUseCase {
  constructor(
    private readonly likeRepository: LikeRepositoryImpl,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
  ) {}

  async likeTweet(userId: string, tweetId: string): Promise<Like> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if tweet exists
    const tweet = await this.tweetRepository.findOne({ where: { id: tweetId } });
    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

    // Check if like already exists
    const existingLike = await this.likeRepository.existsByUserAndTweet(userId, tweetId);
    if (existingLike) {
      throw new LikeAlreadyExistsException(userId, tweetId);
    }

    // Create the like
    const like = await this.likeRepository.create(userId, tweetId);

    // Update tweet's likesCount
    await this.tweetRepository.update(tweetId, {
      likesCount: tweet.likesCount + 1
    });

    return like;
  }

  async unlikeTweet(userId: string, tweetId: string): Promise<{ success: boolean; message: string }> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if tweet exists
    const tweet = await this.tweetRepository.findOne({ where: { id: tweetId } });
    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }
    
    // Check if like exists
    const existingLike = await this.likeRepository.existsByUserAndTweet(userId, tweetId);
    if (!existingLike) {
      throw new LikeNotFoundException(userId, tweetId);
    }

    // Remove the like
    const removed = await this.likeRepository.remove(userId, tweetId);
    
    if (removed) {
      // Update tweet's likesCount
      await this.tweetRepository.update(tweetId, {
        likesCount: Math.max(0, tweet.likesCount - 1)
      });
    }

    return { success: true, message: 'Like removed' };
  }
} 