import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards as UseNestGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTweetUseCase } from './use-cases/create-tweet.use-case';
import { FindTweetsUseCase } from './use-cases/find-tweets.use-case';
import { CreateTweetInputDTO } from './dtos/create-tweet-input.dto';
import { Tweet } from './entities/tweet.entity';
import { UserPayload } from '../auth/value-objects/user-payload';

@Resolver(() => Tweet)
export class TweetsResolver {
  constructor(
    private readonly createTweetUseCase: CreateTweetUseCase,
    private readonly findTweetsUseCase: FindTweetsUseCase,
  ) {}

  @Query(() => [Tweet])
  async tweets(): Promise<Tweet[]> {
    return await this.findTweetsUseCase.execute();
  }

  @Mutation(() => Tweet)
  @UseNestGuards(GqlAuthGuard)
  async createTweet(
    @Args('input') input: CreateTweetInputDTO,
    @CurrentUser() user: UserPayload,
  ): Promise<Tweet> {
    return await this.createTweetUseCase.execute(input, user.userId);
  }
} 