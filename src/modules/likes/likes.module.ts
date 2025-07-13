import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesResolver } from 'src/likes.resolver';
import { Like } from './entities/like.entity';
import { CreateLikeUseCase, FindLikesUseCase, RemoveLikeUseCase } from './use-cases';
import { LikeRepositoryImpl } from './repositories/like-repository.impl';


@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  providers: [
    LikesResolver,
    LikesService,
    CreateLikeUseCase,
    FindLikesUseCase,
    RemoveLikeUseCase,
    {
      provide: 'ILikeRepository',
      useClass: LikeRepositoryImpl,
    },
  ],
  exports: [LikesService, LikeRepositoryImpl],
})

export class LikesModule {}