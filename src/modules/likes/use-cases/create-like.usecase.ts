import { Injectable } from "@nestjs/common";
import { LikeRepositoryImpl } from "../repositories/like-repository.impl";
import { LikeAlreadyExistsException } from "../exceptions/like-already-exists";
import { Like } from "../entities/like.entity";

@Injectable()
export class CreateLikeUseCase{
    constructor(
        private readonly likeRepository: LikeRepositoryImpl
    ){}

    async execute(userId: string, tweetId: string): Promise<Like>{

        const existingLike = await this.likeRepository.existsByUserAndTweet(userId, tweetId);

        if(existingLike){
            throw new LikeAlreadyExistsException(userId, tweetId);
        }

        return await this.likeRepository.create(userId, tweetId);
    }
}