import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class LoginInputDTO {
  @Field()
  username: string;

  @Field()
  password: string;
}
