import { ObjectType, Field } from '@nestjs/graphql';
import { Like } from '../entities/like.entity';

@ObjectType()
export class LikeResponse {
  @Field(() => Like)
  like: Like;

  @Field()
  message: string;

  @Field()
  success: boolean;
}