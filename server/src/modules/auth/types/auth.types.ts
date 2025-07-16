
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { UUID } from 'crypto';

@ObjectType()
export class LoginResponse {
  @Field()
  token: string;

  @Field()
  refreshToken: string;

  @Field()
  user: UserType;
}


@ObjectType()
export class UserType {

  @Field()
  id: UUID;

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

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  displayName: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
