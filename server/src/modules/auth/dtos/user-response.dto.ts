
import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class UserResponseDTO {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  followersCount: number;

  @Field()
  followingCount: number;

  @Field()
  tweetsCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}