# Health Management Backend API

A comprehensive health tracking and wellness management API built with NestJS, Prisma, and PostgreSQL. The system enables users to track body measurements, meals, exercises, diary entries, and daily achievement goals.

## 🎯 Features

- **NestJS Framework** - Enterprise-grade Node.js framework with TypeScript
- **PostgreSQL** - Relational database for data persistence
- **JWT Authentication** - Secure API endpoints with access/refresh tokens
- **Prisma ORM** - Type-safe database management
- **Swagger/OpenAPI** - Auto-generated API documentation
- **Role-Based Access Control** - Admin and User roles
- **Docker Compose** - Complete containerized setup
- **Jest** - Testing framework
- **35+ Days of Demo Data** - Pre-populated database with realistic health data

## 📋 Prerequisites

- **Docker & Docker Compose** (required - all dependencies run in containers)
  - Download: https://www.docker.com/products/docker-desktop
  - Verify installation: `make check-docker`
- **Make** (for running commands)
  - On macOS/Linux: usually pre-installed
  - On Windows: install via WSL or Git Bash

## ⚡ Quick Start

### 1. Verify Docker Installation

```bash
# Check that Docker is installed and ready
make check-docker
```

If Docker is not installed, download it from [docker.com](https://www.docker.com/products/docker-desktop)

### 2. Start the Application

```bash
# This will:
# - Start PostgreSQL and NestJS containers
# - Install all dependencies
# - Run database migrations
# - Start the development server
make start
```

The application will be available at: **http://localhost:3003/api-docs*

### 3. Login with Demo Credentials

```
Email:    demo@example.com
Password: demo123456
```

### 4. Stop When Done

```bash
make stop
```

## 📦 Available Make Commands

All commands run inside Docker containers:

```bash
# Docker Setup
make check-docker          # Verify Docker is installed (run this first!)

# Core Operations
make start                 # Start all services + install + migrate
make stop                  # Stop all containers
make test                  # Run integration tests inside container
make logs                  # View application logs

# Database Operations
make migrate               # Run Prisma migrations
make seed                  # Seed database with 35+ days of demo data
make db-reset              # Reset database completely

# Development
make dev                   # Start dev server (if containers running)
make test-watch            # Run tests in watch mode
make build                 # Build Docker image

# Cleanup
make clean                 # Remove containers, images, volumes
make info                  # Show project information
```

## 🔐 Demo Credentials

**Regular User**
```
Email: demo@example.com
Password: demo123456
```

**Admin User**
```
Email: admin@example.com
Password: demo123456
```

## 📡 API Endpoints Overview

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns tokens)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user (protected)

### Body Records (`/body-records`)
- `POST /body-records` - Create record (protected)
- `GET /body-records` - Get all records (protected)
- `GET /body-records/latest` - Get latest record (protected)
- `GET /body-records/trend` - Get 6-month trend (protected)
- `GET /body-records/stats` - Get statistics (protected)
- `GET /body-records/:id` - Get by ID (protected)
- `PUT /body-records/:id` - Update (protected)
- `DELETE /body-records/:id` - Delete (protected)

### Meals (`/meals`)
- `GET /meals/presets` - Get all presets (public)
- `GET /meals/presets/categories` - Get categories (public)
- `POST /meals/user` - Log meal (protected)
- `GET /meals/user` - Get meals (protected)
- `GET /meals/user/date/:date` - Get by date (protected)
- `GET /meals/user/stats/:date` - Get daily stats (protected)
- `PUT/DELETE /meals/user/:id` - Update/delete (protected)

### Exercises (`/exercises`)
- `GET /exercises/presets` - Get all presets (public)
- `POST /exercises/user` - Log exercise (protected)
- `GET /exercises/user` - Get exercises (protected)
- `GET /exercises/user/date/:date` - Get by date (protected)
- `GET /exercises/user/stats/:date` - Get daily stats (protected)
- `PUT/DELETE /exercises/user/:id` - Update/delete (protected)

### Diary (`/diary`)
- `POST /diary/entries` - Create entry (protected)
- `GET /diary/entries` - Get entries (protected)
- `GET /diary/entries/date/:date` - Get by date (protected)
- `GET /diary/goals/date/:date` - Get daily goal (protected)
- `GET /diary/achievement/date/:date` - Get achievement rate (protected)
- `GET /diary/achievement/stats` - Get achievement stats (protected)
- `PUT/DELETE /diary/entries/:id` - Update/delete (protected)

### Columns (`/columns`)
- `GET /columns` - Get published columns (public)
- `GET /columns/categories` - Get categories (public)
- `GET /columns/category/:categoryId` - Get by category (public)
- `GET /columns/:id` - Get details (public, increments views)
- `POST /columns` - Create (admin only)
- `PUT/DELETE /columns/:id` - Update/delete (admin only)

## 📦 Environment Variables

Create `.env` file from `.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/health_app_db

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key

# Application
NODE_ENV=development
PORT=3000
```

## 🐳 Docker Compose Services

### PostgreSQL Database
- **Container**: health-postgres
- **Port**: 5432
- **User**: postgres (default)
- **Password**: postgres (default)
- **Database**: health_app_db
- **Volumes**: postgres-data (persistent)

## 📝 Project Structure

```
src/
├── auth/                      # Authentication module
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── dtos/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── auth.module.ts

├── body-records/              # Body measurements tracking
│   ├── body-records.service.ts
│   ├── body-records.controller.ts
│   ├── dtos/
│   │   └── create-body-record.dto.ts
│   └── body-records.module.ts

├── meals/                     # Meal tracking
│   ├── meals.service.ts
│   ├── meals.controller.ts
│   ├── dtos/
│   │   └── create-user-meal.dto.ts
│   └── meals.module.ts

├── exercises/                 # Exercise tracking
│   ├── exercises.service.ts
│   ├── exercises.controller.ts
│   ├── dtos/
│   │   └── create-user-exercise.dto.ts
│   └── exercises.module.ts

├── diary/                     # Diary & Daily Goals
│   ├── diary.service.ts
│   ├── diary.controller.ts
│   ├── dtos/
│   │   └── create-diary-entry.dto.ts
│   └── diary.module.ts

├── columns/                   # Health Articles/Blog
│   ├── columns.service.ts
│   ├── columns.controller.ts
│   ├── dtos/
│   │   ├── create-column.dto.ts
│   │   └── update-column.dto.ts
│   └── columns.module.ts

├── common/                    # Shared utilities
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── roles.decorator.ts
│       └── current-user.decorator.ts

├── app.controller.ts          # Root controller
├── app.service.ts
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
└── prisma.service.ts          # Prisma client management

prisma/
├── schema.prisma              # Database schema (11 models)
└── seed.ts                    # Database seeding script

tests/                         # Test files

.
├── docker-compose.yml         # PostgreSQL configuration
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🔄 Achievement Rate Calculation

The system automatically calculates daily achievement rates with this formula:

```
Achievement Rate (%) = (meals_logged + exercises_logged + diary_written) /
                       (target_meals + target_exercises + target_diary) * 100

Example:
- Logged today: 3 meals + 1 exercise + 1 diary = 5 completed
- Daily targets: 3 meals + 1 exercise + 1 diary = 5 targets
- Achievement Rate = (5 ÷ 5) × 100 = 100%
```

When users create meals, exercises, or diary entries, the system automatically updates the `DailyGoal` record with current counts and recalculates the achievement rate.

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:cov
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth with access/refresh pattern
- **Password Hashing** - bcrypt with 10 rounds salt
- **Role-Based Access Control** - Admin vs User roles with guards
- **Ownership Verification** - Users can only access their own data
- **Input Validation** - class-validator decorators on all DTOs
- **Error Handling** - Secure error responses without sensitive info
- **CORS** - Cross-Origin Resource Sharing configuration

## 🚀 Performance Features

- **Pagination** - Automatic pagination on list endpoints
- **Pagination** - Skip/take parameters for efficient data loading
- **Sorting** - Date-based sorting on time-series data
- **Connection Pooling** - Prisma handles database connection pooling
- **Async/Await** - Non-blocking async operations
- **Database Indexes** - Strategic indexes on userId, date, published fields
- **Cascade Deletes** - Efficient cleanup on user deletion

## 📊 Seed Data

The seed script populates the database with realistic demo data:

- **2 Users**: 1 regular user + 1 admin (both with password: demo123456)
- **11 Meal Presets**: Breakfast, Lunch, Dinner, and Snack options
- **7 Exercise Presets**: Running, Cycling, Swimming, Weights, Yoga, HIIT, Walking
- **4 Column Categories**: Health Tips, Diet Advice, Exercise Guide, Wellness
- **3 Sample Articles**: Published for public viewing
- **35 Days of Data**: Realistic health tracking across all categories

Run with: `npm run prisma:seed`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3003
lsof -i :3003

# Kill the process using that port (get PID from above)
kill -9 <PID>

# Or stop Docker containers
make stop
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
```

### Migration Issues
```bash
# Reset database to clean state
npm run db:reset

# Or manually reset and reseed
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
```

### Tests Failing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Run tests again
npm test
```

## 📚 Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Swagger/OpenAPI](https://swagger.io/)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

---

**Built with ❤️ using NestJS | Prisma | PostgreSQL | TypeScript**
