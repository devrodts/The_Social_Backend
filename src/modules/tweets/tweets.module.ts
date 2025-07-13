import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entity/user.entity';
import { TweetsResolver } from './tweets.resolver';
import { CreateTweetUseCase } from './use-cases/create-tweet.use-case';
import { FindTweetsUseCase } from './use-cases/find-tweets.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, User])],
  providers: [TweetsResolver, CreateTweetUseCase, FindTweetsUseCase],
  exports: [TypeOrmModule],
})
export class TweetsModule {} 