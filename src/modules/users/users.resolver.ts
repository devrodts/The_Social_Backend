import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { RegisterUserDTO } from './dtos/create-user/create-user.dto';

import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { TweetsService } from '@/tweets/tweets.service';
// import { FollowsService } from '@/follows/follows.service';


@Resolver(() => User)
export class UsersResolver {

  constructor(

    private readonly usersService: UsersService,
    // private readonly tweetsService: TweetsService,
    // private readonly followsService: FollowsService,

  ) {}

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User | null> {
    return await this.usersService.findOne(id);
  }

  // @Query(() => [User])
  // async users(
  //   @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  //   @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  // ): Promise<User[]> {
  //   return await this.usersService.findMany(limit, offset);
  // }

  // @Query(() => [User])
  // async searchUsers(
  //   @Args('query') query: string,
  //   @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  // ): Promise<User[]> {
  //   return await this.usersService.searchUsers(query, limit);
  // }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  // Resolve computed fields
  // @ResolveField(() => Int)
  // async tweetsCount(@Parent() user: User): Promise<number> {
  //   return await this.tweetsService.countByUser(user.id);
  // }

  // @ResolveField(() => Int)
  // async followingCount(@Parent() user: User): Promise<number> {
  //   return await this.followsService.countFollowing(user.id);
  // }

  // @ResolveField(() => Int)
  // async followersCount(@Parent() user: User): Promise<number> {
  //   return await this.followsService.countFollowers(user.id);
  // }
}