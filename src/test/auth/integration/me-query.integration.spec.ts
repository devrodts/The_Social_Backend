import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';

describe('Me Query (integration)', () => {
  let app: INestApplication;
  let server: any;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // Removido: await getConnection().synchronize(true);

    // Registrar e logar usuário para obter JWT
    const registerMutation = `
      mutation {
        register(input: {
          email: \"mequery@example.com\"
          username: \"mequeryuser\"
          password: \"password123\"
          displayName: \"Me Query User\"
        }) {
          token
        }
      }
    `;
    const res = await request(server)
      .post('/graphql')
      .send({ query: registerMutation });
    jwtToken = res.body.data.register.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return user data for authenticated request (Authorization header)', async () => {
    const query = `
      query {
        me {
          id
          email
          username
          displayName
        }
      }
    `;
    const res = await request(server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ query });
    expect(res.body.data.me).toBeDefined();
    expect(res.body.data.me.email).toBe('mequery@example.com');
    expect(res.body.data.me.username).toBe('mequeryuser');
    expect(res.body.data.me.displayName).toBe('Me Query User');
  });

  it('should fail for unauthenticated request', async () => {
    const query = `
      query {
        me {
          id
          email
        }
      }
    `;
    const res = await request(server)
      .post('/graphql')
      .send({ query });
    expect(res.body.errors).toBeDefined();
    expect(res.body.data).toBeNull();
  });
}); 