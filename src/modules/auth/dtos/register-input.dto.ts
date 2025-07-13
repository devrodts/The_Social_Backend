import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, MinLength, IsNotEmpty } from "class-validator";

@InputType()
export class RegisterInputDTO {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @Field()
  @IsNotEmpty()
  displayName: string;
}
