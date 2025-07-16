import { Follow } from '../entities/follow.entity';

export interface FollowRepository {
  findByFollowerAndFollowing(followerId: string, followingId: string): Promise<Follow | null>;
  create(followerId: string, followingId: string): Promise<Follow>;
  remove(followerId: string, followingId: string): Promise<boolean>;
  findByFollower(followerId: string, limit?: number, offset?: number): Promise<Follow[]>;
  findByFollowing(followingId: string, limit?: number, offset?: number): Promise<Follow[]>;
  countByFollower(followerId: string): Promise<number>;
  countByFollowing(followingId: string): Promise<number>;
  existsByFollowerAndFollowing(followerId: string, followingId: string): Promise<boolean>;
}

export const FOLLOW_REPOSITORY = Symbol('FollowRepository'); 