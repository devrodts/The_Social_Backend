import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../modules/auth/auth.module';
import { UsersModule } from '../../../modules/users/users.module';
import { User } from '../../../modules/users/entity/user.entity';
import { Tweet } from '../../../modules/tweets/entities/tweet.entity';
import { Like } from '../../../modules/likes/entities/like.entity';

describe('Auth Module Dependencies', () => {
  let module: TestingModule;

  it('should compile the auth module with all dependencies', async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Tweet, Like],
          synchronize: true,
          logging: false,
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    expect(module).toBeDefined();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });
}); 