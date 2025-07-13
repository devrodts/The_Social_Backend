# Twitter Clone API

A modern, scalable Twitter-like API built with NestJS, TypeORM, GraphQL, and PostgreSQL/SQLite. This application provides a complete social media backend with user authentication, tweet management, likes, and following functionality.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Tweet Management**: Create, read, update, and delete tweets
- **Like System**: Like and unlike tweets with real-time counters
- **Follow System**: Follow/unfollow users with relationship management
- **GraphQL API**: Modern GraphQL interface with Apollo Server
- **Database Support**: PostgreSQL and SQLite support with TypeORM
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Modern Stack**: NestJS, TypeScript, Node.js v22+

## Prerequisites

- **Node.js**: v22.17.0 or higher
- **npm**: v10+ or **yarn**
- **Database**: PostgreSQL or SQLite (SQLite for development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twitter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_TYPE=sqlite
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=twitter_clone
   DATABASE_SYNCHRONIZE=true
   DATABASE_LOGGING=true

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # Application Configuration
   PORT=3000
   CORS_ORIGIN=*
   ```

4. **Database Setup**
   - For **SQLite** (development): The database file will be created automatically
   - For **PostgreSQL**: Create a database and update the connection settings

## Running the Application

### Development Mode
```bash
npm run start:dev
```
The application will be available at `http://localhost:3000`

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Debug Tests
```bash
npm run test:debug
```

## API Documentation

### GraphQL Playground
Access the interactive GraphQL playground at: `http://localhost:3000/graphql`

### Authentication Endpoints

#### Register User
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    user {
      id
      username
      email
      displayName
      bio
      avatar
      createdAt
    }
    token
    refreshToken
  }
}
```

**Variables:**
```json
{
  "input": {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "displayName": "John Doe",
    "bio": "Software Developer"
  }
}
```

#### Login User
```graphql
mutation Login($input: LoginDto!) {
  login(input: $input) {
    user {
      id
      username
      email
      displayName
    }
    token
    refreshToken
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "john@example.com",
    "password": "securepassword123"
  }
}
```

#### Refresh Token
```graphql
mutation RefreshToken($input: RefreshTokenDto!) {
  refreshToken(input: $input) {
    token
    refreshToken
  }
}
```

### Tweet Endpoints

#### Create Tweet
```graphql
mutation CreateTweet($input: CreateTweetInput!) {
  createTweet(input: $input) {
    id
    content
    authorId
    createdAt
    likesCount
    retweetsCount
    commentsCount
  }
}
```

#### Get Tweets
```graphql
query GetTweets {
  tweets {
    id
    content
    authorId
    createdAt
    likesCount
    retweetsCount
    commentsCount
    author {
      id
      username
      displayName
      avatar
    }
  }
}
```

### Like Endpoints

#### Like Tweet
```graphql
mutation LikeTweet($input: CreateLikeDto!) {
  likeTweet(input: $input) {
    id
    userId
    tweetId
    createdAt
  }
}
```

#### Unlike Tweet
```graphql
mutation UnlikeTweet($input: CreateLikeDto!) {
  unlikeTweet(input: $input) {
    success
    message
  }
}
```

## Project Structure

```
src/
├── config/                 # Configuration modules
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   │   ├── dtos/         # Data Transfer Objects
│   │   ├── guards/       # Authentication guards
│   │   ├── services/     # Authentication services
│   │   ├── strategies/   # JWT strategies
│   │   └── use-cases/    # Business logic
│   ├── users/            # User management
│   ├── tweets/           # Tweet management
│   └── likes/            # Like system
├── test/                 # Test files
│   ├── auth/            # Authentication tests
│   ├── likes/           # Like system tests
│   └── jest-e2e.json    # E2E test configuration
└── main.ts              # Application entry point
```

## Configuration

### Database Configuration
The application supports both PostgreSQL and SQLite:

- **SQLite** (default for development): File-based database
- **PostgreSQL**: Production-ready database with connection pooling

### JWT Configuration
- **Secret Key**: Configure via `JWT_SECRET` environment variable
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 7 days)

### CORS Configuration
- **Origin**: Configurable via `CORS_ORIGIN` environment variable
- **Methods**: GET, HEAD, PUT, PATCH, POST, DELETE
- **Credentials**: Enabled

## Docker Support

### Using Docker Compose
```bash
docker-compose up -d
```

### Building Docker Image
```bash
docker build -t twitter-clone .
docker run -p 3000:3000 twitter-clone
```

## Development Guidelines

### Code Style
- **Linting**: ESLint with Prettier integration
- **Formatting**: Run `npm run format` to format code
- **Linting**: Run `npm run lint` to check and fix issues

### Testing Strategy
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete user workflows

### Commit Guidelines
- Use conventional commit messages
- Include tests for new features
- Update documentation when necessary

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Class-validator for request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: TypeORM parameterized queries

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_HOST=your_db_host
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name
DATABASE_SYNCHRONIZE=false
JWT_SECRET=your_very_secure_jwt_secret
CORS_ORIGIN=https://yourdomain.com
```

### Build for Production
```bash
npm run build
npm run start:prod
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Author

**Rodolfo Rodrigues**

## Support

For support and questions:
- Create an issue in the repository
- Check the GraphQL playground for API exploration
- Review the test files for usage examples

---

**Happy coding!**
