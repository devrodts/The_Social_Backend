import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { Like } from './entities/like.entity';
import { User } from '../users/entity/user.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { CreateLikeUseCase, FindLikesUseCase, RemoveLikeUseCase } from './use-cases';
import { LikeRepositoryImpl } from './repositories/like-repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([Like, User, Tweet])],
  providers: [
    LikesResolver,
    LikesService,
    CreateLikeUseCase,
    FindLikesUseCase,
    RemoveLikeUseCase,
    LikeRepositoryImpl,
  ],
  exports: [LikesService, LikeRepositoryImpl],
})
export class LikesModule {}