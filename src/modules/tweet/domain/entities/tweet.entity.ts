import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Tweet{

    @Field()
    id: number;

    @Field()
    author: string;

    @Field()
    likes: number; 

    @Field()
    content: string;
    
    comments: string[];

}