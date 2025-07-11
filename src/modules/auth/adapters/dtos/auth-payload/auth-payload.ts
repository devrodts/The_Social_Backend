import { ObjectType, Field } from "@nestjs/graphql";
import { User } from "src/modules/users/domain/entity/user.entity";

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
