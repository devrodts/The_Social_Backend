import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/users/entity/user.entity';
import { Tweet } from '../../modules/tweets/entities/tweet.entity';
import { Like } from '../../modules/likes/entities/like.entity';

describe('TypeORM Configuration', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('database.host'),
            port: configService.get('database.port'),
            username: configService.get('database.username'),
            password: configService.get('database.password'),
            database: configService.get('database.database'),
            entities: [User, Tweet, Like],
            synchronize: false, // Don't synchronize in tests
            logging: false,
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should load database configuration', () => {
    expect(configService.get('database.host')).toBeDefined();
    expect(configService.get('database.port')).toBeDefined();
    expect(configService.get('database.username')).toBeDefined();
    expect(configService.get('database.database')).toBeDefined();
  });

  it('should have correct database configuration values', () => {
    expect(configService.get('database.host')).toBe('localhost');
    expect(configService.get('database.port')).toBe(5432);
    expect(configService.get('database.username')).toBe('postgres');
    expect(configService.get('database.database')).toBe('twitter_clone');
  });

  it('should have JWT configuration', () => {
    expect(configService.get('jwt.secret')).toBeDefined();
    expect(configService.get('jwt.expiresIn')).toBeDefined();
    expect(configService.get('jwt.refreshSecret')).toBeDefined();
    expect(configService.get('jwt.refreshExpiresIn')).toBeDefined();
  });

  it('should have Redis configuration', () => {
    expect(configService.get('redis.host')).toBeDefined();
    expect(configService.get('redis.port')).toBeDefined();
    expect(configService.get('redis.url')).toBeDefined();
  });
}); 