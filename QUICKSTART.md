# 🚀 Quick Start Guide - Health Management Backend API

## ✅ Prerequisites

Before starting, make sure you have:

1. **Docker & Docker Compose** installed
   ```bash
   make check-docker
   ```
   If not installed, download from: https://www.docker.com/products/docker-desktop

2. **Make** command available (pre-installed on macOS/Linux)

---

## 🎯 Get Started in 3 Steps

### Step 1️⃣: Verify Docker Installation

```bash
make check-docker
```

**Expected output:**
```
✅ Docker is installed and ready
   Docker version: Docker version 28.3.3, build 980b856
   Docker Compose version: Docker Compose version v2.39.2
```

If you get an error, install Docker from https://www.docker.com/products/docker-desktop

---

### Step 2️⃣: Start the Application

```bash
make start
```

**This will (~30-35 seconds):**
- ✅ Build Docker image & start containers (~20s)
- ✅ Install dependencies (npm install) - cached after first run
- ✅ Run database migrations (~2s)
- ✅ Start development server (~15s)

**Expected final output:**
```
╔═══════════════════════════════════════════════════════════════╗
║  ✅ Application is ready!                                     ║
╚═══════════════════════════════════════════════════════════════╝

📌 API Documentation:
   http://localhost:3003/api-docs

📌 Health Check:
   http://localhost:3003/health

Demo Credentials:
  📧 Email:    demo@example.com
  🔐 Password: demo123456

Admin Account:
  📧 Email:    admin@example.com
  🔐 Password: demo123456

To seed database with demo data:
  make seed          # Seed 35+ days of demo data
```

---

### Step 3️⃣: (Optional) Seed Demo Data

If you want to add 35+ days of demo health tracking data to your database:

```bash
make seed
```

This will populate the database with realistic health data including meals, exercises, body measurements, and diary entries. This step is optional and takes about 8 seconds.

---

### Step 4️⃣: Access the Application

**API Swagger UI:** http://localhost:3003/api-docs
- Click "Authorize" button
- Use demo credentials to login
- Test any endpoint

**Health Check:** http://localhost:3003/health
- Returns: `{"status":"ok"}`

---

## 🔑 Demo Credentials

**Regular User:**
```
Email:    demo@example.com
Password: demo123456
```

**Admin User:**
```
Email:    admin@example.com
Password: demo123456
```

---

## 📦 Essential Commands

### ⏹️ Stop the Application

```bash
make stop
```

Stops and removes all containers.

---

### 🧪 Run Integration Tests

```bash
make test
```

Runs all tests **inside the container** (no Node.js needed on your machine).

**Expected output:**
```
Tests: 37 passed, 7 failed (84% pass rate)
Time: ~10 seconds
```

---

### 📊 View Application Logs

```bash
make logs
```

Shows real-time logs from the NestJS application.

---

### 🔄 Run Database Migrations

```bash
make migrate
```

Applies any new database schema changes.

---

### 🌱 Reseed Database

```bash
make seed
```

Re-populates database with demo data.

---

### 🗑️ Clean Up Everything

```bash
make clean
```

Removes containers, images, and volumes. Good for fresh restart.

---

## 🔑 Important Information

### Port Configuration
- **Application Port:** 3003
- **Database Port:** 5432
- **API Documentation:** http://localhost:3003/api-docs

### Database Details
- **Type:** PostgreSQL 15
- **Database:** health_app_db
- **User:** postgres
- **Password:** postgres
- **Host:** postgres (internal container network)

### Tech Stack
- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **API Docs:** Swagger/OpenAPI
- **Tests:** Jest + Supertest
- **Containerization:** Docker & Docker Compose

---

## 📡 API Quick Examples

### 1. Login and Get Token

```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123456"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid...",
    "email": "demo@example.com",
    "name": "Demo User"
  }
}
```

### 2. Get Current User (Protected)

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:3003/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get User Body Records (Protected)

```bash
TOKEN="your-access-token-here"

curl -X GET "http://localhost:3003/body-records?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Use Swagger UI (Easiest)

Simply visit: http://localhost:3003/api
- Click "Authorize" button
- Enter token from login response
- Click on any endpoint and click "Try it out"

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Option 1: Stop the service using port 3000
lsof -i :3000
kill -9 <PID>

# Option 2: Clean up and restart
make clean
make start
```

### Docker Not Starting

```bash
# Check Docker daemon is running
docker ps

# If error, restart Docker Desktop and retry:
make start
```

### Tests Are Failing

```bash
# Restart containers and run tests again
make clean
make start
make test
```

### Can't Connect to API

1. Check containers are running: `docker-compose ps`
2. Check logs: `make logs`
3. Verify health: `curl http://localhost:3003/health`

---

## 📚 Available Make Commands

See all available commands:

```bash
make help
```

**Key commands:**
```bash
make check-docker   # Verify Docker is installed
make start          # Start everything
make stop           # Stop all containers
make test           # Run tests in container
make logs           # View app logs
make migrate        # Run database migrations
make seed          # Seed database
make db-reset       # Reset database completely
make clean          # Clean up everything
```

---

## 🎓 Next Steps

1. **Explore API:** Visit http://localhost:3003/api
2. **Test Endpoints:** Use Swagger UI to test all endpoints
3. **Read Database:** 35+ days of demo data is ready to explore
4. **Run Tests:** `make test` to see test coverage
5. **Stop Service:** `make stop` when done

---

## 🆘 Need Help?

- **API Docs:** http://localhost:3003/api
- **Health Check:** http://localhost:3003/health
- **View Logs:** `make logs`
- **Read README:** See `README.md` for detailed documentation

---

## ✨ What's Included

✅ NestJS backend with TypeScript
✅ PostgreSQL database (pre-configured)
✅ 35+ days of demo health data
✅ JWT authentication (access + refresh tokens)
✅ 6 feature modules: auth, body-records, meals, exercises, diary, columns
✅ Swagger/OpenAPI documentation
✅ 44 integration tests (84% pass rate)
✅ Role-based access control (admin/user)
✅ Docker containerization

---

Happy coding! 🎉

For more details, see `README.md` and `Makefile`.
