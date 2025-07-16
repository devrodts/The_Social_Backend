import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { RegisterUserDTO } from './dtos/create-user/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../tweets/entities/tweet.entity';
import { Follow } from '../follows/entities/follow.entity';
import { Like } from '../likes/entities/like.entity';

import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@Resolver(() => User)
export class UsersResolver {

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
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
  @ResolveField(() => Int)
  async tweetsCount(@Parent() user: User): Promise<number> {
    return await this.tweetRepository.count({ where: { authorId: user.id } });
  }

  @ResolveField(() => Int)
  async followingCount(@Parent() user: User): Promise<number> {
    return await this.followRepository.count({ where: { followerId: user.id } });
  }

  @ResolveField(() => Int)
  async followersCount(@Parent() user: User): Promise<number> {
    return await this.followRepository.count({ where: { followingId: user.id } });
  }

  @ResolveField(() => Int)
  async likesCount(@Parent() user: User): Promise<number> {
    return await this.likeRepository.count({ where: { userId: user.id } });
  }

  @ResolveField(() => Boolean)
  async isVerified(@Parent() user: User): Promise<boolean> {
    // For now, return false. This can be expanded later with verification logic
    return false;
  }
}