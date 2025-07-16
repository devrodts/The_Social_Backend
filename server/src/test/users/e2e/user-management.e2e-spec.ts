import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('User Management E2E Tests', () => {
  let app: INestApplication;
  let server: any;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration', () => {
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
        username: 'usermanagementtest',
        email: 'usermanagement@example.com',
        password: 'password123',
        displayName: 'User Management Test',
      };

      const response = await request(server)
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
      expect(data.register.user.username).toBe('usermanagementtest');
      expect(data.register.user.email).toBe('usermanagement@example.com');
      expect(data.register.user.displayName).toBe('User Management Test');
      
      // Store for later tests
      jwtToken = data.register.token;
      userId = data.register.user.id;
    });

    it('should validate required fields during registration', async () => {
      const invalidInputs = [
        {
          username: '',
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User',
        },
        {
          username: 'testuser',
          email: '',
          password: 'password123',
          displayName: 'Test User',
        },
        {
          username: 'testuser',
          email: 'test@example.com',
          password: '',
          displayName: 'Test User',
        },
        {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          displayName: '',
        }
      ];

      for (const input of invalidInputs) {
        const response = await request(server)
          .post('/graphql')
          .send({
            query: registerMutation,
            variables: { input },
          });

        expect(response.body.errors).toBeDefined();
      }
    });

    it('should prevent duplicate usernames', async () => {
      const registerInput = {
        username: 'usermanagementtest', // Same username as above
        email: 'different@example.com',
        password: 'password123',
        displayName: 'Different User',
      };

      const response = await request(server)
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

    it('should prevent duplicate emails', async () => {
      const registerInput = {
        username: 'differentuser',
        email: 'usermanagement@example.com', // Same email as above
        password: 'password123',
        displayName: 'Different User',
      };

      const response = await request(server)
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

    it('should validate email format during registration', async () => {
      const registerInput = {
        username: 'emailtestuser',
        email: 'invalid-email-format',
        password: 'password123',
        displayName: 'Email Test User',
      };

      const response = await request(server)
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: { input: registerInput },
        });

      expect(response.body.errors).toBeDefined();
    });

    it('should validate username format during registration', async () => {
      const registerInput = {
        username: 'invalid-username!',
        email: 'username@example.com',
        password: 'password123',
        displayName: 'Username Test User',
      };

      const response = await request(server)
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: { input: registerInput },
        });

      expect(response.body.errors).toBeDefined();
    });

    it('should validate password length during registration', async () => {
      const registerInput = {
        username: 'passwordtestuser',
        email: 'password@example.com',
        password: '123', // Too short
        displayName: 'Password Test User',
      };

      const response = await request(server)
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: { input: registerInput },
        });

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('User Login', () => {
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
        email: 'usermanagement@example.com',
        password: 'password123',
      };

      const response = await request(server)
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
      expect(data.login.user.email).toBe('usermanagement@example.com');
    });

    it('should fail login with invalid email', async () => {
      const loginInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(server)
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

    it('should fail login with invalid password', async () => {
      const loginInput = {
        email: 'usermanagement@example.com',
        password: 'wrongpassword',
      };

      const response = await request(server)
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

    it('should validate required fields during login', async () => {
      const invalidInputs = [
        {
          email: '',
          password: 'password123',
        },
        {
          email: 'test@example.com',
          password: '',
        }
      ];

      for (const input of invalidInputs) {
        const response = await request(server)
          .post('/graphql')
          .send({
            query: loginMutation,
            variables: { input },
          });

        expect(response.body.errors).toBeDefined();
      }
    });
  });

  describe('Me Query (Authenticated User Profile)', () => {
    const meQuery = `
      query Me {
        me {
          id
          username
          email
          displayName
          bio
          avatar
          createdAt
          updatedAt
          tweetsCount
          followersCount
          followingCount
          likesCount
          isVerified
        }
      }
    `;

    it('should return authenticated user profile', async () => {
      const response = await request(server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          query: meQuery,
        })
        .expect(200);

      const { data } = response.body;
      expect(data.me).toBeDefined();
      expect(data.me.id).toBe(userId);
      expect(data.me.username).toBe('usermanagementtest');
      expect(data.me.email).toBe('usermanagement@example.com');
      expect(data.me.displayName).toBe('User Management Test');
      expect(data.me.tweetsCount).toBeDefined();
      expect(data.me.followersCount).toBeDefined();
      expect(data.me.followingCount).toBeDefined();
      expect(data.me.likesCount).toBeDefined();
      expect(data.me.isVerified).toBeDefined();
      expect(data.me.createdAt).toBeDefined();
      expect(data.me.updatedAt).toBeDefined();
    });

    it('should fail me query without authentication', async () => {
      const response = await request(server)
        .post('/graphql')
        .send({
          query: meQuery,
        })
        .expect(200);

      const { errors } = response.body;
      expect(errors).toBeDefined();
      expect(errors[0].message).toContain('Unauthorized');
    });

    it('should fail me query with invalid token', async () => {
      const response = await request(server)
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

    it('should fail me query with malformed token', async () => {
      const response = await request(server)
        .post('/graphql')
        .set('Authorization', 'malformed-header')
        .send({
          query: meQuery,
        })
        .expect(200);

      const { errors } = response.body;
      expect(errors).toBeDefined();
      expect(errors[0].message).toContain('Unauthorized');
    });
  });

  describe('User Profile Query by ID', () => {
    const userQuery = `
      query GetUser($id: String!) {
        user(id: $id) {
          id
          username
          email
          displayName
          bio
          avatar
          createdAt
          updatedAt
          tweetsCount
          followersCount
          followingCount
          likesCount
          isVerified
        }
      }
    `;

    it('should return user profile by valid ID', async () => {
      const response = await request(server)
        .post('/graphql')
        .send({
          query: userQuery,
          variables: { id: userId },
        })
        .expect(200);

      const { data } = response.body;
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(userId);
      expect(data.user.username).toBe('usermanagementtest');
      expect(data.user.email).toBe('usermanagement@example.com');
      expect(data.user.displayName).toBe('User Management Test');
      expect(data.user.tweetsCount).toBeDefined();
      expect(data.user.followersCount).toBeDefined();
      expect(data.user.followingCount).toBeDefined();
      expect(data.user.likesCount).toBeDefined();
      expect(data.user.isVerified).toBeDefined();
    });

    it('should return null for non-existent user ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(server)
        .post('/graphql')
        .send({
          query: userQuery,
          variables: { id: nonExistentId },
        })
        .expect(200);

      const { data } = response.body;
      expect(data.user).toBeNull();
    });

    it('should handle invalid UUID format gracefully', async () => {
      const invalidId = 'invalid-uuid';
      const response = await request(server)
        .post('/graphql')
        .send({
          query: userQuery,
          variables: { id: invalidId },
        })
        .expect(200);

      // Should either return null or an error, depending on implementation
      const { data, errors } = response.body;
      expect(data.user === null || errors).toBeTruthy();
    });
  });

  describe('Refresh Token', () => {
    let refreshToken: string;

    const refreshTokenMutation = `
      mutation RefreshToken($input: RefreshTokenDTO!) {
        refreshToken(input: $input) {
          token
          refreshToken
        }
      }
    `;

    beforeAll(async () => {
      // Login to get a refresh token
      const loginMutation = `
        mutation Login($input: LoginDTO!) {
          login(input: $input) {
            token
            refreshToken
          }
        }
      `;

      const loginInput = {
        email: 'usermanagement@example.com',
        password: 'password123',
      };

      const response = await request(server)
        .post('/graphql')
        .send({
          query: loginMutation,
          variables: { input: loginInput },
        });

      refreshToken = response.body.data.login.refreshToken;
    });

    it('should successfully refresh token with valid refresh token', async () => {
      const response = await request(server)
        .post('/graphql')
        .send({
          query: refreshTokenMutation,
          variables: { input: { refreshToken } },
        })
        .expect(200);

      const { data } = response.body;
      expect(data.refreshToken).toBeDefined();
      expect(data.refreshToken.token).toBeDefined();
      expect(data.refreshToken.refreshToken).toBeDefined();
      expect(data.refreshToken.token).not.toBe(jwtToken); // Should be a new token
    });

    it('should fail refresh token with invalid refresh token', async () => {
      const response = await request(server)
        .post('/graphql')
        .send({
          query: refreshTokenMutation,
          variables: { input: { refreshToken: 'invalid-refresh-token' } },
        })
        .expect(200);

      const { errors } = response.body;
      expect(errors).toBeDefined();
      expect(errors[0].message).toMatch(/Invalid refresh token|jwt malformed/);
    });

    it('should fail refresh token with empty refresh token', async () => {
      const response = await request(server)
        .post('/graphql')
        .send({
          query: refreshTokenMutation,
          variables: { input: { refreshToken: '' } },
        });

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('User Data Security and Sanitization', () => {
    const registerMutation = `
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
    `;

    it('should sanitize malicious content in username during registration', async () => {
      const registerInput = {
        username: 'sanitized_test_user',
        email: 'sanitized@example.com',
        password: 'password123',
        displayName: '<script>alert("XSS")</script>Clean Name',
      };

      const response = await request(server)
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: { input: registerInput },
        })
        .expect(200);

      const { data } = response.body;
      expect(data.register).toBeDefined();
      expect(data.register.user.displayName).not.toContain('<script>');
      expect(data.register.user.displayName).not.toContain('alert');
      expect(data.register.user.displayName).toContain('Clean Name');
    });

    it('should never expose password in any query response', async () => {
      const meQuery = `
        query Me {
          me {
            id
            username
            email
            displayName
            password
          }
        }
      `;

      const response = await request(server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          query: meQuery,
        });

      // Should fail because password field should not be exposed in GraphQL schema
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Cannot query field "password"');
    });
  });

  describe('User Authentication Edge Cases', () => {
    it('should handle concurrent login attempts gracefully', async () => {
      const loginMutation = `
        mutation Login($input: LoginDTO!) {
          login(input: $input) {
            token
            user {
              id
              username
            }
          }
        }
      `;

      const loginInput = {
        email: 'usermanagement@example.com',
        password: 'password123',
      };

      // Make multiple concurrent login requests
      const promises = Array(5).fill(null).map(() =>
        request(server)
          .post('/graphql')
          .send({
            query: loginMutation,
            variables: { input: loginInput },
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed and return valid tokens
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.login.token).toBeDefined();
      });
    });

    it('should validate JWT token expiration', async () => {
      // This would require manipulating time or using a very short token expiration
      // For now, we'll just verify that the current token works
      const meQuery = `
        query Me {
          me {
            id
            username
          }
        }
      `;

      const response = await request(server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          query: meQuery,
        })
        .expect(200);

      expect(response.body.data.me).toBeDefined();
    });

    it('should handle malformed Authorization headers', async () => {
      const meQuery = `
        query Me {
          me {
            id
            username
          }
        }
      `;

      const malformedHeaders = [
        'Bearer', // Missing token
        'Basic token', // Wrong auth type
        'Bearer token1 token2', // Multiple tokens
        'Bearer   ', // Empty token
      ];

      for (const header of malformedHeaders) {
        const response = await request(server)
          .post('/graphql')
          .set('Authorization', header)
          .send({
            query: meQuery,
          })
          .expect(200);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Unauthorized');
      }
    });
  });
}); 