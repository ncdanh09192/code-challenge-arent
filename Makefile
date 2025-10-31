.PHONY: help start stop logs test build clean setup install dev

# Default target
help:
	@echo "Express API Demo - Available Commands"
	@echo "======================================"
	@echo "make setup          - Setup project (install deps and create .env)"
	@echo "make install        - Install dependencies using yarn"
	@echo "make build          - Build Docker image"
	@echo "make start          - Start all services (Docker Compose)"
	@echo "make stop           - Stop all services"
	@echo "make logs           - View logs from all containers"
	@echo "make logs-app       - View logs from app container"
	@echo "make logs-db        - View logs from MySQL container"
	@echo "make logs-redis     - View logs from Redis container"
	@echo "make test           - Run tests"
	@echo "make test-watch     - Run tests in watch mode"
	@echo "make test-coverage  - Run tests with coverage"
	@echo "make dev            - Run in development mode (local)"
	@echo "make clean          - Clean up containers, volumes and node_modules"
	@echo "make db-migrate     - Run Prisma migrations"
	@echo "make db-studio      - Open Prisma Studio"
	@echo "make shell-app      - Access app container shell"
	@echo "make shell-db       - Access MySQL container shell"
	@echo ""
	@echo "Database Credentials (from .env.example)"
	@echo "======================================"
	@echo "MySQL User: appuser"
	@echo "MySQL Password: apppassword"
	@echo "MySQL Port: 3307"
	@echo ""
	@echo "Endpoints"
	@echo "======================================"
	@echo "App: http://localhost:3003"
	@echo "API Docs: http://localhost:3003/api-docs"

# Setup project
setup: install
	@echo "Setup complete!"
	@echo "Run 'make start' to start the services"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build Docker image
build:
	@echo "Building Docker image..."
	docker-compose build

# Start all services
start:
	@echo "Starting services..."
	@docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo "App running at: http://localhost:3003"
	@echo "API Docs: http://localhost:3003/api-docs"
	@echo ""
	@echo "Demo login credentials:"
	@echo "  Email: demo@example.com"
	@echo "  Password: password"
	@echo ""
	@sleep 3
	@docker-compose logs --tail=20

# Stop all services
stop:
	@echo "Stopping services..."
	@docker-compose down
	@echo "✅ Services stopped!"

# View all logs
logs:
	@docker-compose logs -f

# View app logs
logs-app:
	@docker-compose logs -f app

# View database logs
logs-db:
	@docker-compose logs -f mysql

# View redis logs
logs-redis:
	@docker-compose logs -f redis

# Run tests
test:
	@echo "Running tests..."
	@npm test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	@npm run test:watch

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@npm run test -- --coverage

# Development mode (local, no Docker)
dev:
	@echo "Starting development server..."
	@npm run dev

# Database migration
db-migrate:
	@echo "Running Prisma migrations..."
	@docker-compose exec app npm run prisma:migrate

# Open Prisma Studio
db-studio:
	@echo "Opening Prisma Studio..."
	@docker-compose exec app npm run prisma:studio

# Access app container shell
shell-app:
	@docker-compose exec app sh

# Access MySQL container shell
shell-db:
	@docker-compose exec mysql mysql -u root -ppassword express_api_demo

# Clean up everything
clean:
	@echo "Cleaning up..."
	@docker-compose down -v
	@rm -rf node_modules
	@rm -rf .env
	@echo "✅ Cleanup complete!"

# List containers
ps:
	@docker-compose ps

# Restart services
restart: stop start

# Initialize environment file
env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env file from .env.example"; \
	else \
		echo ".env file already exists"; \
	fi

# Show service status
status:
	@echo "Service Status:"
	@docker-compose ps
	@echo ""
	@echo "Health checks:"
	@curl -s http://localhost:3003/health | jq . || echo "App not running"
