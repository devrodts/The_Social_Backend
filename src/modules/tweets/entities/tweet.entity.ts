import { Field, ObjectType, ID } from "@nestjs/graphql";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "../../users/entity/user.entity";
import { Like } from "../../likes/entities/like.entity";

@ObjectType()
@Entity('tweets')
export class Tweet {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ type: 'text' })
    content: string;

    @Field()
    @Column({ default: 0 })
    likesCount: number;

    @Field()
    @Column({ default: 0 })
    retweetsCount: number;

    @Field()
    @Column({ default: 0 })
    commentsCount: number;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => User)
    @ManyToOne(() => User, user => user.tweets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authorId' })
    author: User;

    @Column()
    authorId: string;

    @Field(() => [Like])
    @OneToMany(() => Like, like => like.tweet)
    likes: Like[];
}