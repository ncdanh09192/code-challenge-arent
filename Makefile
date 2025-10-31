.PHONY: help start stop test migrate seeds install build dev clean

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Default target
help:
	@echo "$(BLUE)Health Management Backend API - Available Commands$(NC)"
	@echo "=================================================="
	@echo ""
	@echo "$(GREEN)Getting Started:$(NC)"
	@echo "  make install        - Install dependencies"
	@echo "  make migrate        - Run Prisma migrations"
	@echo "  make seeds          - Seed database with demo data"
	@echo "  make start          - Start dev server (migrate + seed + start) 🚀"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev            - Start dev server (without migrations)"
	@echo "  make build          - Build for production"
	@echo "  make test           - Run all tests"
	@echo "  make test-watch     - Run tests in watch mode"
	@echo "  make test-cov       - Run tests with coverage"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make db-studio      - Open Prisma Studio UI"
	@echo "  make db-reset       - Reset database (delete all data)"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-up      - Start PostgreSQL container"
	@echo "  make docker-down    - Stop PostgreSQL container"
	@echo "  make docker-logs    - View PostgreSQL logs"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make clean          - Remove node_modules and .env"
	@echo "  make help           - Show this help message"
	@echo ""
	@echo "$(BLUE)Quick Start:$(NC)"
	@echo "  1. docker-compose up -d          # Start PostgreSQL"
	@echo "  2. make start                     # Setup & start dev server"
	@echo "  3. Open http://localhost:3000/api # API Documentation"
	@echo ""
	@echo "$(BLUE)Demo Credentials:$(NC)"
	@echo "  Email: demo@example.com"
	@echo "  Password: demo123456"
	@echo ""

# Install dependencies
install:
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

# Run Prisma migrations
migrate:
	@echo "$(YELLOW)Running Prisma migrations...$(NC)"
	npx prisma migrate dev
	@echo "$(GREEN)✅ Migrations completed$(NC)"

# Seed database with demo data
seeds:
	@echo "$(YELLOW)Seeding database with demo data...$(NC)"
	npx prisma db seed
	@echo "$(GREEN)✅ Database seeded with 35+ days of data$(NC)"
	@echo "   Users: demo@example.com / admin@example.com"
	@echo "   Password: demo123456"

# Start development server (with automatic migrate)
start: migrate seeds
	@echo ""
	@echo "$(GREEN)🚀 Starting development server...$(NC)"
	@echo ""
	npm run start:dev

# Start development server (without migrations)
dev:
	@echo "$(YELLOW)Starting dev server...$(NC)"
	npm run start:dev

# Build for production
build:
	@echo "$(YELLOW)Building for production...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build completed$(NC)"

# Run all tests
test:
	@echo "$(YELLOW)Running tests...$(NC)"
	npm test

# Run tests in watch mode
test-watch:
	@echo "$(YELLOW)Running tests in watch mode...$(NC)"
	npm run test:watch

# Run tests with coverage
test-cov:
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	npm run test:cov

# Open Prisma Studio UI
db-studio:
	@echo "$(YELLOW)Opening Prisma Studio...$(NC)"
	npx prisma studio

# Reset database
db-reset:
	@echo "$(YELLOW)Resetting database...$(NC)"
	npx prisma migrate reset --force
	@echo "$(GREEN)✅ Database reset$(NC)"

# Docker PostgreSQL management
docker-up:
	@echo "$(YELLOW)Starting PostgreSQL container...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ PostgreSQL started on port 5432$(NC)"
	@sleep 2
	@docker-compose logs postgres

docker-down:
	@echo "$(YELLOW)Stopping PostgreSQL container...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ PostgreSQL stopped$(NC)"

docker-logs:
	@echo "$(YELLOW)PostgreSQL Logs:$(NC)"
	docker-compose logs -f postgres

# Lint code
lint:
	@echo "$(YELLOW)Running ESLint...$(NC)"
	npm run lint

# Format code
format:
	@echo "$(YELLOW)Formatting code...$(NC)"
	npm run format

# Clean up
clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	rm -rf node_modules
	rm -f .env
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

# Show current environment info
info:
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Framework: NestJS"
	@echo "  Database: PostgreSQL"
	@echo "  ORM: Prisma"
	@echo "  Language: TypeScript"
	@echo "  Node version: $$(node --version)"
	@echo "  npm version: $$(npm --version)"
	@echo ""
	@echo "$(BLUE)API Endpoints:$(NC)"
	@echo "  Local: http://localhost:3000"
	@echo "  API Docs: http://localhost:3000/api"
	@echo "  Health Check: http://localhost:3000/health"
