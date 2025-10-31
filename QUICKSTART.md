# 🚀 Quick Start Guide

## Setup Completed! ✅

Your project is fully configured with all essential components.

## 📋 Configuration Details

### Database
- **Type**: MySQL 8.0
- **Port**: 3307
- **Database**: express_api_demo
- **User**: appuser
- **Password**: apppassword

### Cache
- **Type**: Redis 7
- **Port**: 6380

### App Server
- **Framework**: Express.js
- **Port**: 3003
- **Node.js**: v22+

## 🎯 Main Commands

### 1️⃣ Start the entire project

```bash
make start
```

**Result:**
- MySQL container will run
- Redis container will run
- Express app will run on `http://localhost:3003`

### 2️⃣ Stop the project

```bash
make stop
```

### 3️⃣ View logs from services

```bash
# View all logs
make logs

# View app logs only
make logs-app

# View database logs
make logs-db

# View redis logs
make logs-redis
```

### 4️⃣ Run tests

```bash
# Run all tests
make test

# Run tests with coverage report
make test-coverage

# Run tests in watch mode
make test-watch
```

### 5️⃣ Development mode (local, without Docker)

```bash
# First, start MySQL & Redis in Docker
docker-compose up -d mysql redis

# Then run app locally
make dev
```

## 🔐 Demo Account

Use this account to test login on the UI:

```
Email: demo@example.com
Password: password
```

## 🌐 URLs

- **UI/API Test**: http://localhost:3003
- **API Documentation (Swagger)**: http://localhost:3003/api-docs
- **Health Check**: http://localhost:3003/health

## 📡 API Endpoints

### Authentication (No token required)
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token

### Posts (JWT token required)
- `GET /api/posts` - Get all posts (with Redis caching)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post (requires auth)
- `PUT /api/posts/:id` - Update post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)

## 📁 Important File Structure

```
project/
├── src/
│   ├── server.js           # Entry point
│   ├── config/
│   │   ├── logger.js       # Pino logging setup
│   │   ├── prisma.js       # Database client
│   │   ├── redis.js        # Redis client
│   │   └── swagger.js      # API documentation
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware
│   │   └── errorHandler.js # Global error handling
│   └── routes/
│       ├── auth.js         # Authentication endpoints
│       └── posts.js        # Posts endpoints
├── public/
│   └── index.html          # Demo UI
├── prisma/
│   └── schema.prisma       # Database schema
├── docker-compose.yml      # Docker services configuration
├── Makefile                # Make commands
└── .env                    # Environment variables
```

## 🔧 Adding New Middleware / Routes

### Add New Route

1. Create file `src/routes/yourroute.js`:

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * /api/yourroute:
 *   get:
 *     summary: Your endpoint description
 *     tags:
 *       - YourRoute
 */
router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));

export default router;
```

2. Import in `src/server.js`:

```javascript
import yourRoutes from './routes/yourroute.js';
app.use('/api/yourroute', yourRoutes);
```

### Add Database Model

1. Edit `prisma/schema.prisma`:

```prisma
model YourModel {
  id    Int     @id @default(autoincrement())
  name  String
  createdAt DateTime @default(now())
  @@map("your_models")
}
```

2. Run migration:

```bash
make db-migrate
```

## 🧪 Testing API

### Method 1: Use UI (Vanilla JS)
- Visit http://localhost:3003
- Login with demo account
- Test API endpoints directly from UI

### Method 2: Using cURL

```bash
# Login
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'

# Get token from response
TOKEN="your-token-here"

# Create post (requires auth)
curl -X POST http://localhost:3003/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test","content":"Content","published":true}'
```

### Method 3: Swagger UI
- Visit http://localhost:3003/api-docs
- Test APIs directly from the interface

## 🐛 Debugging

### View realtime logs
```bash
make logs-app
```

### Access app container shell
```bash
make shell-app
```

### Access MySQL container
```bash
make shell-db
```

### Open Prisma Studio (GUI to browse database)
```bash
make db-studio
```

## 📊 Monitoring

```bash
# Check status of all services
make status

# List running containers
make ps

# Restart services
make restart
```

## 🛠️ Troubleshooting

### Port already in use

```bash
# Find which process is using the port
lsof -i :3003

# Or use different ports in docker-compose.yml
```

### Database connection error

```bash
# Check MySQL logs
make logs-db

# Verify .env file
cat .env
```

### Tests fail

```bash
# Clean and reinstall
make clean
make install
make test
```

## 📚 Documentation

- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Redis](https://redis.io/docs/)
- [JWT](https://jwt.io/)
- [Swagger/OpenAPI](https://swagger.io/)

## 🎓 Next Steps

1. **Database**: Add new models in `prisma/schema.prisma`
2. **Routes**: Create new endpoints in `src/routes/`
3. **Middleware**: Add custom middleware if needed
4. **Tests**: Write tests for new endpoints
5. **UI**: Update `public/index.html` to test new features

## ❓ Need Help?

See more details in `README.md` or run:

```bash
make help
```

---

Happy coding! 🎉
