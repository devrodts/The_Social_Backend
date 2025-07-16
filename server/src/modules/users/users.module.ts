// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UsersResolver } from './users.resolver';
import { FollowsModule } from '../follows/follows.module';
import { Tweet } from '../tweets/entities/tweet.entity';
import { Follow } from '../follows/entities/follow.entity';
import { Like } from '../likes/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tweet, Follow, Like]), FollowsModule],
  providers: [
    UsersResolver,
    UsersService,
    CreateUserUseCase,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}