import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, MinLength, IsNotEmpty, Matches, MaxLength } from "class-validator";

@InputType()
export class RegisterInputDTO {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers and underscores' })
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
