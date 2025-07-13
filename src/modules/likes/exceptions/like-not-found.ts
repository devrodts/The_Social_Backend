import { NotFoundException } from '@nestjs/common';

export class LikeNotFoundException extends NotFoundException {
  constructor(userId: string, tweetId: string) {
    super(`Like not found for user ${userId} and tweet ${tweetId}`);
  }
}