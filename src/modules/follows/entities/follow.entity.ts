import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entity/user.entity';

@ObjectType()
@Entity('follows')
@Unique(['followerId', 'followingId'])
export class Follow {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.following)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Field(() => User)
  @ManyToOne(() => User, user => user.followers)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  followerId: string;

  @Field()
  @Column()
  followingId: string;
} 