.PHONY: help install dev stop logs migrate makemigrations createsuperuser shell lint lint-fix format typecheck test test-e2e build clean sync-edupage

BACKEND_DIR := backend
FRONTEND_DIR := frontend

help:
	@echo "edupage-killer dev commands"
	@echo ""
	@echo "  install           Install all dependencies"
	@echo "  dev               Start all services in Docker"
	@echo "  stop              Stop all services"
	@echo "  logs              Tail Docker logs"
	@echo "  migrate           Run Django migrations"
	@echo "  makemigrations    Create Django migrations"
	@echo "  createsuperuser   Create Django admin user"
	@echo "  shell             Open Django shell"
	@echo "  lint              Run ruff + black --check + eslint"
	@echo "  lint-fix          Run ruff + black + eslint with auto-fix"
	@echo "  format            Run black + biome"
	@echo "  typecheck         Run mypy + tsc"
	@echo "  test              Run all tests"
	@echo "  test-e2e          Run Playwright E2E tests with backend+frontend running"
	@echo "  build             Build production images"
	@echo "  clean             Remove containers and volumes"
	@echo "  sync-edupage      Trigger EduPage sync"

install:
	cd $(BACKEND_DIR) && uv sync
	cd $(FRONTEND_DIR) && pnpm install

dev:
	cp -n .env.example .env 2>/dev/null || true
	docker compose up --build

dev-bg:
	cp -n .env.example .env 2>/dev/null || true
	docker compose up --build -d

stop:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec backend uv run python manage.py migrate

makemigrations:
	docker compose exec backend uv run python manage.py makemigrations

makemigrations-local:
	cd $(BACKEND_DIR) && uv run python manage.py makemigrations

createsuperuser:
	docker compose exec backend uv run python manage.py createsuperuser

shell:
	docker compose exec backend uv run python manage.py shell

lint:
	cd $(BACKEND_DIR) && uv run ruff check . && uv run black --check .
	cd $(FRONTEND_DIR) && pnpm run lint

lint-fix:
	cd $(BACKEND_DIR) && uv run ruff check --fix . && uv run black .
	cd $(FRONTEND_DIR) && pnpm exec eslint . --fix && pnpm exec biome format --write src

format:
	cd $(BACKEND_DIR) && uv run black . && uv run ruff check --fix .
	cd $(FRONTEND_DIR) && pnpm run format

typecheck:
	cd $(BACKEND_DIR) && uv run mypy .
	cd $(FRONTEND_DIR) && pnpm run typecheck

test:
	cd $(BACKEND_DIR) && uv run pytest
	cd $(FRONTEND_DIR) && pnpm run test

test-e2e:
	./scripts/e2e.sh

build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

clean:
	docker compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true

sync-edupage:
	docker compose exec backend uv run python manage.py sync_edupage

backend-local:
	cd $(BACKEND_DIR) && uv run python manage.py runserver 0.0.0.0:8000

frontend-local:
	cd $(FRONTEND_DIR) && pnpm run dev
