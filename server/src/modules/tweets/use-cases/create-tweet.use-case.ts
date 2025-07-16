import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../entities/tweet.entity';
import { User } from '../../users/entity/user.entity';
import { CreateTweetInputDTO } from '../dtos/create-tweet-input.dto';
import { SanitizationService } from '../../common/services/sanitization.service';

@Injectable()
export class CreateTweetUseCase {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async execute(input: CreateTweetInputDTO, userId: string): Promise<Tweet> {
    // Validate input
    if (!input.content || input.content.trim() === '') {
      throw new BadRequestException('Tweet content cannot be empty');
    }

    if (input.content.length > 280) {
      throw new BadRequestException('Tweet content cannot exceed 280 characters');
    }

    // Sanitize tweet content to prevent XSS and other attacks
    const sanitizedContent = this.sanitizationService.sanitizeTweetContent(input.content);

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create tweet with sanitized content
    const tweet = this.tweetRepository.create({
      content: sanitizedContent,
      author: user,
    });

    // Save tweet
    return await this.tweetRepository.save(tweet);
  }
} 