import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { User } from '../../modules/users/entity/user.entity';
// import { Tweet } from '../../modules/tweets/entities/tweet.entity';
// import { Like } from '../../modules/likes/entities/like.entity';
import configuration from '../../config/configuration';

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRootAsync: jest.fn().mockReturnValue({
      module: class MockTypeOrmModule {},
      providers: [],
    }),
  },
}));

describe('TypeORM Configuration', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeAll(async () => {
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USERNAME = 'postgres';
    process.env.DATABASE_PASSWORD = 'password';
    process.env.DATABASE_NAME = 'twitter_clone';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.REDIS_URL = 'redis://localhost:6379';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
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
    expect(configService.get('database.database')).toBe('the_social');
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