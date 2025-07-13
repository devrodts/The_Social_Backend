import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";

// Import modules
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { LikesModule } from "./modules/likes/likes.module";
import { TweetsModule } from "./modules/tweets/tweets.module";

// Import entities
import { User } from "./modules/users/entity/user.entity";
import { Tweet } from "./modules/tweets/entities/tweet.entity";
import { Like } from "./modules/likes/entities/like.entity";

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
        entities: [User, Tweet, Like],
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
    }),
    AuthModule,
    UsersModule,
    LikesModule,
    TweetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
