.PHONY: help containers docker-up docker-down docker-logs prisma-generate prisma-migrate prisma backend frontend dev

help:
	@echo "Available commands:"
	@echo "  make containers       - Start Postgres and Redis containers"
	@echo "  make docker-down      - Stop Postgres and Redis containers"
	@echo "  make docker-logs      - View container logs"
	@echo "  make prisma-generate  - Generate Prisma Client"
	@echo "  make prisma-migrate   - Run Prisma database migrations"
	@echo "  make prisma           - Run Prisma migrate and generate"
	@echo "  make backend          - Start backend development server"
	@echo "  make frontend         - Start frontend development server"
	@echo "  make dev              - Start containers, run Prisma, and start backend + frontend"

containers docker-up:
	cd backend && docker compose up -d

docker-down:
	cd backend && docker compose down

docker-logs:
	cd backend && docker compose logs -f

prisma-generate:
	cd backend && npx prisma generate

prisma-migrate:
	cd backend && npx prisma migrate dev

prisma: prisma-migrate prisma-generate

backend:
	cd backend && npm run dev

frontend:
	cd frontend && npm run dev

dev: containers prisma
	@trap 'kill 0' INT; \
	(cd backend && npm run dev) & \
	(cd frontend && npm run dev) & \
	wait
