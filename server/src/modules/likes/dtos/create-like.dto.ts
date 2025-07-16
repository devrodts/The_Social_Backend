import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateLikeInputDTO {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  tweetId: string;
}
