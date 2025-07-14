import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { LikesModule } from "./modules/likes/likes.module";
import { TweetsModule } from "./modules/tweets/tweets.module";
import { FollowsModule } from "./modules/follows/follows.module";
import { User } from "./modules/users/entity/user.entity";
import { Tweet } from "./modules/tweets/entities/tweet.entity";
import { Like } from "./modules/likes/entities/like.entity";
import { Follow } from "./modules/follows/entities/follow.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite' as const,
        database: ':memory:',
        entities: [User, Tweet, Like, Follow],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: true,
      debug: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    AuthModule,
    UsersModule,
    LikesModule,
    TweetsModule,
    FollowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
