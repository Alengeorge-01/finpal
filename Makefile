# FinPal Development Makefile

.PHONY: help setup dev clean test build deploy

# Default target
help:
	@echo "FinPal Development Commands:"
	@echo ""
	@echo "  setup     - Initial project setup"
	@echo "  dev       - Start development servers"
	@echo "  clean     - Clean up generated files"
	@echo "  test      - Run all tests"
	@echo "  build     - Build for production"
	@echo "  deploy    - Deploy with Docker"
	@echo ""

# Initial setup
setup:
	@echo "🔧 Setting up FinPal development environment..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ Setup complete! Run 'make dev' to start development."

# Start development servers
dev:
	@echo "🚀 Starting FinPal development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo ""
	docker-compose up -d

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down
	cd frontend && rm -rf .next node_modules/.cache
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete
	@echo "✅ Cleanup complete!"

# Run tests
test:
	@echo "🧪 Running tests..."
	cd backend && python manage.py test
	cd frontend && npm run test
	@echo "✅ Tests complete!"

# Build for production
build:
	@echo "🏗️ Building for production..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

# Deploy with Docker
deploy:
	@echo "🚢 Deploying FinPal..."
	docker-compose -f docker-compose.yml up -d --build
	@echo "✅ Deployment complete!"

# Development shortcuts
logs:
	docker-compose logs -f

restart:
	docker-compose restart

status:
	docker-compose ps
