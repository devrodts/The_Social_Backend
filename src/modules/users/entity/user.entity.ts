import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Tweet } from '../../tweets/entities/tweet.entity';
import { Like } from '../../likes/entities/like.entity';

// import { Follow } from '@/follows/entities/follow.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  displayName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;


  @Field(() => [Tweet])
  @OneToMany(() => Tweet, tweet => tweet.author)
  tweets: Tweet[];

  @Field(() => [Like])
  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @Field(() => [User])
  @ManyToMany(() => User, user => user.followers)
  @JoinTable({
    name: 'follows',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' }
  })
  following: User[];

  @Field(() => [User])
  @ManyToMany(() => User, user => user.following)
  followers: User[];


  @Field(() => Int)
  tweetsCount: number;

  @Field(() => Int)
  followingCount: number;

  @Field(() => Int)
  followersCount: number;

  @Field(() => Int)
  likesCount: number;

  @Field(() => Boolean)
  isVerified?: boolean;

}
