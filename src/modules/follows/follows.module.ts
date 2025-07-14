import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsResolver } from './follows.resolver';
import { FollowUserUseCase } from './use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './use-cases/unfollow-user.use-case';
import { FindFollowersUseCase } from './use-cases/find-followers.use-case';
import { FindFollowingUseCase } from './use-cases/find-following.use-case';
import { FollowRepositoryImpl } from './repositories/follow-repository.impl';
import { FOLLOW_REPOSITORY } from './repositories/follow-repository.interface';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
  ],
  providers: [
    FollowsResolver,
    FollowUserUseCase,
    UnfollowUserUseCase,
    FindFollowersUseCase,
    FindFollowingUseCase,
    {
      provide: FOLLOW_REPOSITORY,
      useClass: FollowRepositoryImpl,
    },
  ],
  exports: [
    FollowUserUseCase,
    UnfollowUserUseCase,
    FindFollowersUseCase,
    FindFollowingUseCase,
    FOLLOW_REPOSITORY,
    TypeOrmModule,
  ],
})
export class FollowsModule {} 