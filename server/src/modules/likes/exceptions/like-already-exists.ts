import { ConflictException } from '@nestjs/common';

export class LikeAlreadyExistsException extends ConflictException {
  constructor(userId: string, tweetId: string) {
    super(`User ${userId} already liked tweet ${tweetId}`);
  }
}