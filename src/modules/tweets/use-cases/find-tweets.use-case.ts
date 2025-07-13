import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../entities/tweet.entity';

@Injectable()
export class FindTweetsUseCase {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
  ) {}

  async execute(): Promise<Tweet[]> {
    return await this.tweetRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }
} 