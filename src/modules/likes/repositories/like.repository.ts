import { Like } from '../entities/like.entity';

export interface LikeRepository {
  findByUserAndTweet(userId: string, tweetId: string): Promise<Like | null>;
  create(userId: string, tweetId: string): Promise<Like>;
  remove(userId: string, tweetId: string): Promise<boolean>;
  findByTweet(tweetId: string, limit?: number, offset?: number): Promise<Like[]>;
  findByUser(userId: string, limit?: number, offset?: number): Promise<Like[]>;
  countByTweet(tweetId: string): Promise<number>;
  countByUser(userId: string): Promise<number>;
  existsByUserAndTweet(userId: string, tweetId: string): Promise<boolean>;
}