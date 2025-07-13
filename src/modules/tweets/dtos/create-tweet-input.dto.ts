import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateTweetInputDTO {
  @Field()
  @IsNotEmpty({ message: 'Tweet content cannot be empty' })
  @IsString({ message: 'Tweet content must be a string' })
  @MaxLength(280, { message: 'Tweet content cannot exceed 280 characters' })
  content: string;
} 