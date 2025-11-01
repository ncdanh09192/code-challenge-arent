.PHONY: help start stop test migrate seed seeds install build dev clean logs db-reset check-docker

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
RED = \033[0;31m
NC = \033[0m # No Color

# Default target
help:
	@echo "$(BLUE)Health Management Backend API - Docker Based$(NC)"
	@echo "=================================================="
	@echo ""
	@echo "$(GREEN)Main Commands:$(NC)"
	@echo "  make check-docker   - Verify Docker is installed (run this first!)"
	@echo "  make start          - Start containers + migrate + dev server 🚀"
	@echo "  make stop           - Stop all containers"
	@echo "  make test           - Run all tests in container"
	@echo "  make migrate        - Run migrations in container"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev            - Start dev server (if containers running)"
	@echo "  make build          - Build Docker image for production"
	@echo "  make test-watch     - Run tests in watch mode (container)"
	@echo "  make logs           - Show app container logs"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make seed           - Seed database with 35+ days of demo data"
	@echo "  make db-reset       - Reset database completely"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make clean          - Remove containers, images, volumes"
	@echo "  make help           - Show this help message"
	@echo ""
	@echo "$(BLUE)Quick Start:$(NC)"
	@echo "  1. make check-docker # Verify Docker is installed"
	@echo "  2. make start        # Starts everything automatically"
	@echo "  3. Open http://localhost:3003/api-docs"
	@echo "  4. make seed         # (Optional) Add demo data"
	@echo "  5. make stop         # Stop when done"
	@echo ""

# ============= UTILITY FUNCTIONS =============

# Check if Docker is installed
check-docker:
	@command -v docker >/dev/null 2>&1 || (echo "$(RED)❌ Docker is not installed!$(NC)" && echo "" && echo "$(YELLOW)Please install Docker from: https://www.docker.com/products/docker-desktop$(NC)" && echo "" && exit 1)
	@command -v docker-compose >/dev/null 2>&1 || (echo "$(RED)❌ Docker Compose is not installed!$(NC)" && echo "" && echo "$(YELLOW)Please install Docker Desktop (includes Docker Compose)$(NC)" && echo "" && exit 1)
	@echo "$(GREEN)✅ Docker is installed and ready$(NC)"
	@echo "   Docker version: $$(docker --version)"
	@echo "   Docker Compose version: $$(docker-compose --version)"

# ============= MAIN COMMANDS =============

# Start everything: containers + dependencies + migrations (no seeding)
start: check-docker stop
	@clear
	@echo ""
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  Health Management Backend API - Starting Services            ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)[1/4] Removing old containers...$(NC)"
	@docker-compose down 2>/dev/null || true
	@docker volume rm code-challenge-arent_app_node_modules 2>/dev/null || true
	@sleep 1
	@echo "$(GREEN)✅ Old containers and volumes removed$(NC)"
	@echo ""
	@echo "$(BLUE)[2/4] Building and starting PostgreSQL and NestJS containers...$(NC)"
	docker-compose up -d --build
	@echo "$(YELLOW)⏳ Waiting for app container to be ready...$(NC)"
	@sleep 10
	@echo "$(GREEN)✅ Containers started$(NC)"
	@echo ""
	@echo "$(BLUE)[3/4] Running database migrations...$(NC)"
	docker-compose exec -T app npx prisma db push --skip-generate
	@echo "$(GREEN)✅ Migrations completed$(NC)"
	@echo ""
	@echo "$(BLUE)[4/4] Starting development server...$(NC)"
	docker-compose exec -T app sh -c 'npm run start:dev > /tmp/nest.log 2>&1 &'
	@echo "$(YELLOW)⏳ Waiting for server startup (checking health endpoint)...$(NC)"
	@bash -c 'for i in {1..30}; do if curl -s http://localhost:3003/health | grep -q ok; then echo "✅ Server is ready!"; break; fi; sleep 1; done'
	@echo "$(GREEN)✅ Dev server started$(NC)"
	@echo ""
	@echo ""
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  ✅ Application is ready!                                     ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📌 API Documentation:$(NC)"
	@echo "   http://localhost:3003/api-docs"
	@echo ""
	@echo "$(GREEN)📌 Health Check:$(NC)"
	@echo "   http://localhost:3003/health"
	@echo ""
	@echo "$(YELLOW)Demo Credentials:$(NC)"
	@echo "  📧 Email:    demo@example.com"
	@echo "  🔐 Password: demo123456"
	@echo ""
	@echo "$(YELLOW)Admin Account:$(NC)"
	@echo "  📧 Email:    admin@example.com"
	@echo "  🔐 Password: demo123456"
	@echo ""
	@echo "$(YELLOW)To seed database with demo data:$(NC)"
	@echo "  make seed          # Seed 35+ days of demo data"
	@echo ""


# Stop all containers
stop:
	@echo "$(YELLOW)Stopping all containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ All containers stopped$(NC)"

# Run tests inside container (non-interactive mode)
test: check-docker
	@echo "$(YELLOW)Running tests inside container...$(NC)"
	docker-compose exec -T app npm test
	@echo "$(GREEN)✅ Tests completed$(NC)"

# Run tests in watch mode inside container
test-watch:
	@echo "$(YELLOW)Running tests in watch mode...$(NC)"
	docker-compose exec app npm run test:watch

# ============= DATABASE COMMANDS =============

# Run migrations inside container
migrate:
	@echo "$(YELLOW)Running migrations inside container...$(NC)"
	docker-compose exec -T app npx prisma db push --skip-generate
	@echo "$(GREEN)✅ Migrations completed$(NC)"

# Seed database inside container (alias: seed)
seed seeds:
	@echo "$(YELLOW)Seeding database inside container...$(NC)"
	docker-compose exec -T app npx prisma db seed
	@echo "$(GREEN)✅ Database seeded$(NC)"

# Reset database inside container
db-reset:
	@echo "$(YELLOW)Resetting database inside container...$(NC)"
	docker-compose exec -T app npx prisma migrate reset --force
	@echo "$(GREEN)✅ Database reset$(NC)"

# ============= DEVELOPMENT COMMANDS =============

# Start dev server (assumes containers already running)
dev:
	@echo "$(YELLOW)Starting development server...$(NC)"
	docker-compose exec app npm run start:dev

# Build Docker image for production
build:
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker-compose build
	@echo "$(GREEN)✅ Docker image built$(NC)"

# Install dependencies inside container
install:
	@echo "$(YELLOW)Installing dependencies inside container...$(NC)"
	docker-compose exec -T app npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

# ============= UTILITY COMMANDS =============

# Show application logs
logs:
	@echo "$(YELLOW)Showing application logs (Ctrl+C to exit)...$(NC)"
	docker-compose logs -f app

# Clean up everything
clean:
	@echo "$(YELLOW)Cleaning up containers, images, and volumes...$(NC)"
	docker-compose down -v
	docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

# Show project info
info:
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Framework: NestJS + TypeScript"
	@echo "  Database: PostgreSQL"
	@echo "  ORM: Prisma"
	@echo "  Container: Docker"
	@echo ""
	@echo "$(BLUE)Container Status:$(NC)"
	@docker-compose ps
	@echo ""
