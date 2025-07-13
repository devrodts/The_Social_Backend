import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class RegisterInputDTO {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  displayName: string;
}
