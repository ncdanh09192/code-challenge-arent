# Express API Demo

A comprehensive Express.js API demonstration project with MySQL database, Redis cache, JWT authentication, Docker Compose setup, and Swagger API documentation.

## 🚀 Features

- **Express.js** - Modern Node.js web framework
- **MySQL** - Relational database
- **Redis** - Caching layer
- **JWT Authentication** - Secure API endpoints
- **Prisma ORM** - Database management
- **Swagger/OpenAPI** - API documentation
- **Pino** - Lightweight JSON logging
- **Docker Compose** - Complete containerized setup
- **Jest** - Testing framework
- **Vanilla HTML/CSS/JS** - Demo UI for testing APIs

## 📋 Prerequisites

- **Node.js** >= 22.0.0
- **Yarn** >= 4.0.0
- **Docker & Docker Compose**

## ⚡ Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone and setup
make setup

# Start all services
make start

# Access the application
# - UI: http://localhost:3003
# - API Docs: http://localhost:3003/api-docs
```

### Option 2: Local Development

```bash
# Install dependencies
yarn install

# Create .env file
cp .env.example .env

# Start MySQL and Redis containers only
docker-compose up -d mysql redis

# Run migrations (optional, if database is set up)
yarn prisma:migrate

# Start development server
yarn dev

# Access at http://localhost:3003
```

## 📚 Available Commands

### Service Management

```bash
make start          # Start all containers
make stop           # Stop all containers
make restart        # Restart all containers
make logs           # View all container logs
make logs-app       # View app container logs
make logs-db        # View MySQL logs
make logs-redis     # View Redis logs
make ps             # List running containers
make status         # Show service status
```

### Development

```bash
make dev            # Run local development server
make install        # Install dependencies
make build          # Build Docker images
make clean          # Remove containers and volumes
```

### Testing & Debugging

```bash
make test           # Run test suite
make test-watch     # Run tests in watch mode
make test-coverage  # Run tests with coverage report
make db-studio      # Open Prisma Studio
make shell-app      # Access app container shell
make shell-db       # Access MySQL container shell
```

## 🔐 Authentication

### Default Test Account

```
Email: demo@example.com
Password: password
```

### JWT Flow

1. **Login** - POST `/api/auth/login` with email and password
2. **Get Token** - Response includes JWT token
3. **Use Token** - Include in `Authorization: Bearer <token>` header
4. **Verify** - POST `/api/auth/verify` to validate token

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token

### Posts (Protected)
- `GET /api/posts` - Get all posts (cached in Redis)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post (requires auth)
- `PUT /api/posts/:id` - Update post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)

### System
- `GET /health` - Health check
- `GET /api-docs` - Swagger API documentation

## 🗄️ Database Schema

### User Table
```sql
- id (Primary Key)
- email (Unique)
- username (Unique)
- password
- firstName
- lastName
- createdAt
- updatedAt
```

### Post Table
```sql
- id (Primary Key)
- title
- content
- published (Boolean)
- createdAt
- updatedAt
```

## 📦 Environment Variables

Create `.env` file from `.env.example`:

```env
NODE_ENV=development
APP_PORT=3003
DATABASE_URL=mysql://appuser:apppassword@mysql:3307/express_api_demo
REDIS_URL=redis://redis:6380
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=7d
SWAGGER_ENABLED=true
LOG_LEVEL=debug
```

## 🐳 Docker Compose Services

### MySQL Database
- **Container**: express-api-mysql
- **Port**: 3307
- **User**: appuser
- **Password**: apppassword
- **Database**: express_api_demo

### Redis Cache
- **Container**: express-api-redis
- **Port**: 6380
- **Persistence**: Enabled with AOF

### Express App
- **Container**: express-api-app
- **Port**: 3003
- **Volume**: Current directory (live reload)

## 📝 Project Structure

```
.
├── docker/
│   └── Dockerfile              # App container configuration
├── prisma/
│   └── schema.prisma           # Database schema
├── public/
│   └── index.html              # Demo UI
├── src/
│   ├── config/
│   │   ├── index.js            # Configuration
│   │   ├── logger.js           # Pino logger setup
│   │   ├── prisma.js           # Prisma client
│   │   ├── redis.js            # Redis client
│   │   └── swagger.js          # Swagger configuration
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── errorHandler.js     # Error handling
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   └── posts.js            # Posts routes
│   └── server.js               # Main server file
├── tests/
│   ├── auth.test.js            # Authentication tests
│   └── health.test.js          # Health check tests
├── .env.example                # Environment variables template
├── docker-compose.yml          # Docker Compose configuration
├── jest.config.js              # Jest configuration
├── Makefile                    # Make commands
├── package.json                # Project dependencies
└── README.md                   # This file
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
make test

# Run tests in watch mode
make test-watch

# Run tests with coverage report
make test-coverage
```

### Test Coverage

Tests are located in the `tests/` directory and cover:
- Authentication endpoints
- Health checks
- 404 error handling
- Token verification

## 🔍 Logging

The application uses **Pino** for lightweight JSON logging. Configure with `LOG_LEVEL` environment variable:

- `fatal` - Fatal errors
- `error` - Errors
- `warn` - Warnings
- `info` - Information
- `debug` - Debug information
- `trace` - Detailed trace

## 🛡️ Security Features

- **Helmet.js** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing
- **JWT** - JSON Web Token authentication
- **Password hashing ready** - Use bcrypt in production
- **Input validation** - Request validation
- **Error handling** - Secure error messages

## 🚀 Performance Features

- **Redis caching** - Cache posts and reduce database queries
- **Connection pooling** - Prisma handles connection pooling
- **Async/await** - Non-blocking operations
- **Compression ready** - Easy to add gzip compression
- **Rate limiting ready** - Easy to add request rate limiting

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3003/health
```

### View Logs

```bash
# All services
make logs

# Specific service
make logs-app
make logs-db
make logs-redis
```

### Check Service Status

```bash
make status
```

## 🔧 Development Workflow

1. **Start services**
   ```bash
   make start
   ```

2. **Make changes** - Files are live-reloaded in Docker

3. **Check logs**
   ```bash
   make logs-app
   ```

4. **Run tests**
   ```bash
   make test
   ```

5. **Stop when done**
   ```bash
   make stop
   ```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3003

# Or use different ports in docker-compose.yml
```

### Database Connection Failed
```bash
# Check MySQL is running
docker-compose logs mysql

# Verify database credentials in .env
```

### Redis Connection Failed
```bash
# Check Redis is running
docker-compose logs redis

# Verify Redis URL in .env
```

### Tests Failing
```bash
# Make sure you're in the project directory
# Clear cache and reinstall
make clean
make setup
make test
```

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Swagger/OpenAPI](https://swagger.io/)

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy coding!** 🎉
