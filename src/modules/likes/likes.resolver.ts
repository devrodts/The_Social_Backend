import { Resolver, Mutation, Query, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { CreateLikeInputDTO } from './dtos/create-like.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entity/user.entity';

@Resolver(() => Like)
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @Mutation(() => Like)
  @UseGuards(GqlAuthGuard)
  async likeTweet(
    @Args('input') input: CreateLikeInputDTO,
    @CurrentUser() user: User,
  ): Promise<Like> {
    return await this.likesService.createLike(user.id, input.tweetId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async unlikeTweet(
    @Args('tweetId', { type: () => ID }) tweetId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const result = await this.likesService.removeLike(user.id, tweetId);
    return result.success;
  }

  @Query(() => [Like])
  async tweetLikes(
    @Args('tweetId', { type: () => ID }) tweetId: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<Like[]> {
    return await this.likesService.findLikesByTweet(tweetId, limit, offset);
  }

  @Query(() => [Like])
  @UseGuards(GqlAuthGuard)
  async userLikes(
    @Args('userId', { type: () => ID, nullable: true }) userId: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
    @CurrentUser() currentUser: User,
  ): Promise<Like[]> {
    const targetUserId = userId || currentUser.id;
    return await this.likesService.findLikesByUser(targetUserId, limit, offset);
  }

  @Query(() => Int)
  async likesCount(
    @Args('tweetId', { type: () => ID }) tweetId: string,
  ): Promise<number> {
    return await this.likesService.countLikesByTweet(tweetId);
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async isLiked(
    @Args('tweetId', { type: () => ID }) tweetId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.likesService.isLikedByUser(user.id, tweetId);
  }
}