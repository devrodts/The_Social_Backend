import { ObjectType, Field } from '@nestjs/graphql';
import { UUID } from "crypto";

@ObjectType()
export class UserResponse {
  @Field(() => String)
  id: UUID;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  displayName: string;
}

@ObjectType()
export class AuthResponseDTO {
  @Field()
  token: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field(() => UserResponse)
  user: UserResponse;
}