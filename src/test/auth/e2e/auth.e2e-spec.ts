import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import * as request from 'supertest';
import { AuthModule } from '../../../modules/auth/auth.module';
import { UsersModule } from '../../../modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../modules/users/entity/user.entity';
import { Tweet } from '../../../modules/tweets/entities/tweet.entity';
import { Like } from '../../../modules/likes/entities/like.entity';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          playground: false,
          debug: false,
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Basic Health Check', () => {
    it('should be able to create the application', () => {
      expect(app).toBeDefined();
    });
  });

  describe('GraphQL Auth Mutations', () => {
    describe('register', () => {
      const registerMutation = `
        mutation Register($input: RegisterInputDTO!) {
          register(input: $input) {
            token
            refreshToken
            user {
              id
              username
              email
              displayName
            }
          }
        }
      `;

      it('should successfully register a new user', async () => {
        const registerInput = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: registerMutation,
            variables: { input: registerInput },
          })
          .expect(200);

        const { data } = response.body;
        expect(data.register).toBeDefined();
        expect(data.register.token).toBeDefined();
        expect(data.register.refreshToken).toBeDefined();
        expect(data.register.user).toBeDefined();
        expect(data.register.user.username).toBe('testuser');
        expect(data.register.user.email).toBe('test@example.com');
        expect(data.register.user.displayName).toBe('Test User');
      });

      it('should fail to register with duplicate username', async () => {
        const registerInput = {
          username: 'testuser',
          email: 'test2@example.com',
          password: 'password123',
          displayName: 'Test User 2',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: registerMutation,
            variables: { input: registerInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
        expect(errors[0].message).toContain('Username already exists');
      });

      it('should fail to register with duplicate email', async () => {
        const registerInput = {
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User 2',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: registerMutation,
            variables: { input: registerInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
        expect(errors[0].message).toContain('Email already exists');
      });

      it('should fail to register with invalid email', async () => {
        const registerInput = {
          username: 'testuser3',
          email: 'invalid-email',
          password: 'password123',
          displayName: 'Test User 3',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: registerMutation,
            variables: { input: registerInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
      });

      it('should fail to register with short password', async () => {
        const registerInput = {
          username: 'testuser4',
          email: 'test4@example.com',
          password: '123',
          displayName: 'Test User 4',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: registerMutation,
            variables: { input: registerInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
      });
    });

    describe('login', () => {
      const loginMutation = `
        mutation Login($input: LoginDTO!) {
          login(input: $input) {
            token
            refreshToken
            user {
              id
              username
              email
              displayName
            }
          }
        }
      `;

      it('should successfully login with valid credentials', async () => {
        const loginInput = {
          email: 'test@example.com',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: loginMutation,
            variables: { input: loginInput },
          })
          .expect(200);

        const { data } = response.body;
        expect(data.login).toBeDefined();
        expect(data.login.token).toBeDefined();
        expect(data.login.refreshToken).toBeDefined();
        expect(data.login.user).toBeDefined();
        expect(data.login.user.username).toBe('testuser');
        expect(data.login.user.email).toBe('test@example.com');
      });

      it('should fail to login with invalid email', async () => {
        const loginInput = {
          email: 'nonexistent@example.com',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: loginMutation,
            variables: { input: loginInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
        expect(errors[0].message).toContain('Invalid credentials');
      });

      it('should fail to login with invalid password', async () => {
        const loginInput = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: loginMutation,
            variables: { input: loginInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
        expect(errors[0].message).toContain('Invalid credentials');
      });

      it('should fail to login with invalid email format', async () => {
        const loginInput = {
          email: 'invalid-email',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: loginMutation,
            variables: { input: loginInput },
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
      });
    });

    describe('me query', () => {
      const meQuery = `
        query Me {
          me
        }
      `;

      it('should return user info when authenticated', async () => {
        const registerInput = {
          username: 'authuser',
          email: 'auth@example.com',
          password: 'password123',
          displayName: 'Auth User',
        };

        const registerResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: `
              mutation Register($input: RegisterInputDTO!) {
                register(input: $input) {
                  token
                  user {
                    id
                    username
                    email
                    displayName
                  }
                }
              }
            `,
            variables: { input: registerInput },
          })
          .expect(200);

        const token = registerResponse.body.data.register.token;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: meQuery,
          })
          .expect(200);

        const { data } = response.body;
        expect(data.me).toBeDefined();
        expect(data.me).toBe('Hello Auth User!');
      });

      it('should fail to access me query without authentication', async () => {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: meQuery,
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
        expect(errors[0].message).toContain('Unauthorized');
      });

      it('should fail to access me query with invalid token', async () => {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', 'Bearer invalid-token')
          .send({
            query: meQuery,
          })
          .expect(200);

        const { errors } = response.body;
        expect(errors).toBeDefined();
        expect(errors[0].message).toContain('Unauthorized');
      });
    });
  });
}); 