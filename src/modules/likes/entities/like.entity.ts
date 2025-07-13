import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { User } from '../../users/entity/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@ObjectType()
@Entity('likes')
@Unique(['userId', 'tweetId'])

export class Like {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.likes, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Tweet)
  @ManyToOne(() => Tweet, tweet => tweet.likes, { eager: true })
  @JoinColumn({ name: 'tweetId' })
  tweet: Tweet;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  // Foreign keys for query optimization
  userId: string;
  tweetId: string;
}
