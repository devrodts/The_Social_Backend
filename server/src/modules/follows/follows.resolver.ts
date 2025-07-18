import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FollowUserUseCase } from './use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './use-cases/unfollow-user.use-case';
import { FindFollowersUseCase } from './use-cases/find-followers.use-case';
import { FindFollowingUseCase } from './use-cases/find-following.use-case';
import { Follow } from './entities/follow.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entity/user.entity';

@Resolver(() => Follow)
export class FollowsResolver {
  constructor(
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    private readonly findFollowersUseCase: FindFollowersUseCase,
    private readonly findFollowingUseCase: FindFollowingUseCase,
  ) {}

  @Mutation(() => Follow)
  @UseGuards(GqlAuthGuard)
  async followUser(
    @CurrentUser() currentUser: User,
    @Args('followingId') followingId: string,
  ): Promise<Follow> {
    return await this.followUserUseCase.execute(currentUser.id, followingId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async unfollowUser(
    @CurrentUser() currentUser: User,
    @Args('followingId') followingId: string,
  ): Promise<boolean> {
    return await this.unfollowUserUseCase.execute(currentUser.id, followingId);
  }

  @Query(() => [Follow])
  async findFollowers(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Follow[]> {
    return await this.findFollowersUseCase.execute(userId, limit, offset);
  }

  @Query(() => [Follow])
  async findFollowing(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Follow[]> {
    return await this.findFollowingUseCase.execute(userId, limit, offset);
  }
} 