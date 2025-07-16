# The Social Network 🐦

A modern, secure, and scalable Twitter-like social media API built with **NestJS**, **TypeORM**, **GraphQL**, and **PostgreSQL/SQLite**. This application provides a complete social media backend with enterprise-grade security, comprehensive input sanitization, and robust testing coverage.

## 🚀 Features

### Core Functionality
- **🔐 Secure Authentication**: JWT-based authentication with refresh tokens and secure cookie handling
- **📝 Tweet Management**: Create, read, and manage tweets with real-time counters
- **❤️ Like System**: Like and unlike tweets with optimized database operations
- **👥 Follow System**: Follow/unfollow users with relationship management
- **🔍 User Profiles**: Rich user profiles with bio, avatar, and social metrics
- **📊 Social Metrics**: Real-time counters for tweets, likes, followers, and following

### Security & Sanitization
- **🛡️ XSS Protection**: Comprehensive HTML/script tag removal and entity encoding
- **💉 Injection Prevention**: SQL, NoSQL, and command injection pattern detection
- **🧹 Input Sanitization**: Context-aware sanitization for usernames, emails, display names, and tweet content
- **🔒 Password Security**: bcrypt hashing with configurable salt rounds
- **🍪 Secure Cookies**: HttpOnly, Secure, SameSite cookies for JWT storage
- **🛡️ CORS Protection**: Configurable cross-origin resource sharing
- **🔐 JWT Security**: Secure token-based authentication with expiration

### API & Development
- **📡 GraphQL API**: Modern GraphQL interface with Apollo Server
- **🗄️ Database Support**: PostgreSQL and SQLite with TypeORM
- **🧪 Comprehensive Testing**: 228 tests (Unit, Integration, E2E) with 2,587 lines of test code
- **🐳 Docker Support**: Complete containerization with Docker Compose
- **📊 Health Checks**: Database and Redis health monitoring
- **🔧 Modern Stack**: NestJS, TypeScript, Node.js v22+

## 📋 Prerequisites

- **Node.js**: v22.17.0 or higher
- **npm**: v10+ or **yarn**
- **Database**: PostgreSQL or SQLite (SQLite for development)
- **Redis**: For caching and session management (optional)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd twitter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
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
NODE_ENV=development
```

### 4. Database Setup
- **SQLite** (development): The database file will be created automatically
- **PostgreSQL**: Create a database and update the connection settings

## 🚀 Running the Application

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

### Docker Deployment
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or build and run manually
docker build -t twitter-clone .
docker run -p 3000:3000 twitter-clone
```

## 🧪 Testing

### Test Coverage
- **Total Tests**: 228 tests across 16 test suites
- **Test Lines**: 2,587 lines of test code
- **Coverage**: Unit, Integration, and E2E tests

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

## 📡 API Documentation

### GraphQL Playground
Access the interactive GraphQL playground at: `http://localhost:3000/graphql`

### Authentication

#### Register User
```graphql
mutation Register($input: RegisterInputDTO!) {
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
mutation Login($input: LoginDTO!) {
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

#### Refresh Token
```graphql
mutation RefreshToken($input: RefreshTokenDTO!) {
  refreshToken(input: $input) {
    token
    refreshToken
  }
}
```

#### Get Current User
```graphql
query Me {
  me {
    id
    username
    email
    displayName
    bio
    avatar
    tweetsCount
    followersCount
    followingCount
    likesCount
    isVerified
    createdAt
  }
}
```

### Tweet Management

#### Create Tweet
```graphql
mutation CreateTweet($input: CreateTweetInputDTO!) {
  createTweet(input: $input) {
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

#### Get All Tweets
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
    likes {
      id
      user {
        id
        username
      }
    }
  }
}
```

### Like System

#### Like Tweet
```graphql
mutation LikeTweet($input: CreateLikeInputDTO!) {
  likeTweet(input: $input) {
    id
    userId
    tweetId
    createdAt
    user {
      id
      username
    }
    tweet {
      id
      content
    }
  }
}
```

#### Unlike Tweet
```graphql
mutation UnlikeTweet($tweetId: ID!) {
  unlikeTweet(tweetId: $tweetId)
}
```

#### Get Tweet Likes
```graphql
query GetTweetLikes($tweetId: ID!, $limit: Int!, $offset: Int!) {
  tweetLikes(tweetId: $tweetId, limit: $limit, offset: $offset) {
    id
    user {
      id
      username
      displayName
      avatar
    }
    createdAt
  }
}
```

#### Check if Liked
```graphql
query IsLiked($tweetId: ID!) {
  isLiked(tweetId: $tweetId)
}
```

### User Management

#### Get User Profile
```graphql
query GetUser($id: String!) {
  user(id: $id) {
    id
    username
    email
    displayName
    bio
    avatar
    tweetsCount
    followersCount
    followingCount
    likesCount
    isVerified
    createdAt
    tweets {
      id
      content
      createdAt
      likesCount
    }
    followers {
      id
      username
      displayName
    }
    following {
      id
      username
      displayName
    }
  }
}
```

## 🏗️ Project Structure

```
src/
├── config/                 # Configuration modules
│   ├── config.module.ts   # Configuration module setup
│   └── configuration.ts   # Environment configuration
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   │   ├── dtos/         # Data Transfer Objects
│   │   ├── guards/       # Authentication guards
│   │   ├── services/     # Authentication services
│   │   ├── strategies/   # JWT strategies
│   │   ├── use-cases/    # Business logic
│   │   └── value-objects/# Value objects
│   ├── common/           # Shared modules
│   │   └── services/     # Common services
│   │       └── sanitization.service.ts # Input sanitization
│   ├── users/            # User management
│   │   ├── dtos/         # User DTOs
│   │   ├── entity/       # User entity
│   │   ├── use-cases/    # User business logic
│   │   └── services/     # User services
│   ├── tweets/           # Tweet management
│   │   ├── dtos/         # Tweet DTOs
│   │   ├── entities/     # Tweet entity
│   │   ├── use-cases/    # Tweet business logic
│   │   └── repositories/ # Tweet repositories
│   └── likes/            # Like system
│       ├── dtos/         # Like DTOs
│       ├── entities/     # Like entity
│       ├── use-cases/    # Like business logic
│       └── repositories/ # Like repositories
├── test/                 # Test files
│   ├── auth/            # Authentication tests
│   ├── common/          # Common service tests
│   ├── likes/           # Like system tests
│   ├── tweets/          # Tweet tests
│   └── jest-e2e.json    # E2E test configuration
├── app.controller.ts    # Main controller
├── app.module.ts        # Root module
├── app.service.ts       # App service
├── main.ts             # Application entry point
└── schema.gql          # Generated GraphQL schema
```

## 🔒 Security Features

### Input Sanitization
The application includes a comprehensive `SanitizationService` that provides:

- **XSS Prevention**: Removes dangerous HTML/script tags and encodes entities
- **SQL Injection Protection**: Detects and removes SQL injection patterns
- **NoSQL Injection Protection**: Removes MongoDB operator patterns
- **Command Injection Protection**: Removes shell command patterns
- **Context-Aware Sanitization**: Different rules for usernames, emails, display names, and tweet content

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh mechanism
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies
- **Password Hashing**: bcrypt with configurable salt rounds
- **Input Validation**: Class-validator for request validation

### Database Security
- **TypeORM**: Parameterized queries prevent SQL injection
- **Entity Validation**: Automatic validation of database entities
- **Connection Security**: Secure database connections with SSL support

## 🐳 Docker Configuration

### Services
- **PostgreSQL**: Production database with health checks
- **Redis**: Caching and session management
- **App**: NestJS application with hot reload

### Health Checks
All services include health checks for reliable deployment:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## 🔧 Configuration

### Database Configuration
- **SQLite** (development): File-based database with automatic creation
- **PostgreSQL** (production): Production-ready database with connection pooling
- **TypeORM**: Entity synchronization and migration support

### JWT Configuration
- **Secret Key**: Configure via `JWT_SECRET` environment variable
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 7 days)
- **Refresh Tokens**: Automatic token refresh with secure storage

### CORS Configuration
- **Origin**: Configurable via `CORS_ORIGIN` environment variable
- **Methods**: GET, HEAD, PUT, PATCH, POST, DELETE
- **Credentials**: Enabled for secure cookie handling

## 🚀 Deployment

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
REDIS_URL=redis://your_redis_host:6379
```

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Production Deployment
```bash
# Build production image
docker build -t twitter-clone:prod .

# Run with production environment
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  twitter-clone:prod
```

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test module interactions and database operations
- **E2E Tests**: Test complete user workflows and API endpoints
- **Security Tests**: Test authentication, authorization, and input validation

### Test Categories
- **Authentication Tests**: Login, registration, token refresh
- **Sanitization Tests**: Input validation and XSS prevention
- **Tweet Tests**: CRUD operations and business logic
- **Like Tests**: Like/unlike functionality and counters
- **User Tests**: Profile management and social features

## 📈 Performance Features

- **Database Optimization**: Efficient queries with proper indexing
- **Caching**: Redis integration for session and data caching
- **Connection Pooling**: Optimized database connections
- **Health Monitoring**: Service health checks and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your feature
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- **Code Style**: ESLint with Prettier integration
- **Testing**: Write tests for all new features
- **Documentation**: Update documentation when necessary
- **Security**: Follow security best practices

## 📄 License

This project is licensed under the General Public License v3.0 & MIT - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rodolfo Rodrigues**

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the GraphQL playground for API exploration
- Review the test files for usage examples
- Check the security documentation for best practices

---

**Happy coding! 🚀**
