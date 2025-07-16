import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class RefreshTokenDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}