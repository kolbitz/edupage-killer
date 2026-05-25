#!/usr/bin/env bash
#
# Orchestrate backend + frontend so Playwright runs against real services.
# Spins up postgres/redis via docker-compose only if they aren't already
# reachable (lets CI provide them as service containers).
#
# Usage:
#   scripts/e2e.sh [extra playwright args...]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKEND_PORT=8000
FRONTEND_PORT=5173
PG_PORT=5432
REDIS_PORT=6379

BACKEND_PID=""
FRONTEND_PID=""
STARTED_COMPOSE=0

log() { printf '\033[1;34m>>\033[0m %s\n' "$*"; }

cleanup() {
  local rc=$?
  log "Cleaning up background services..."
  if [ -n "$FRONTEND_PID" ]; then
    pkill -P "$FRONTEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    pkill -P "$BACKEND_PID" 2>/dev/null || true
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  if [ "$STARTED_COMPOSE" = "1" ]; then
    log "Stopping docker-compose infra (db, redis)..."
    docker compose stop db redis >/dev/null 2>&1 || true
  fi
  exit "$rc"
}
trap cleanup EXIT INT TERM

port_open() {
  # Portable TCP check that doesn't depend on nc flags.
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && { exec 3>&-; return 0; } || return 1
}

wait_for_port() {
  local port=$1 name=$2
  for _ in $(seq 1 60); do
    if port_open "$port"; then return 0; fi
    sleep 1
  done
  echo "Timed out waiting for $name on port $port" >&2
  return 1
}

wait_for_http() {
  local url=$1 name=$2 code
  for _ in $(seq 1 60); do
    code=$(curl -so /dev/null -w '%{http_code}' --max-time 2 "$url" || echo 000)
    if [ "$code" -ge 200 ] && [ "$code" -lt 500 ]; then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for $name at $url (last status: $code)" >&2
  return 1
}

# 1. Infrastructure: bring up postgres + redis if they aren't already reachable.
if port_open "$PG_PORT" && port_open "$REDIS_PORT"; then
  log "Reusing existing postgres ($PG_PORT) and redis ($REDIS_PORT)"
else
  log "Starting postgres + redis via docker compose..."
  docker compose up -d db redis
  STARTED_COMPOSE=1
  wait_for_port "$PG_PORT" "postgres"
  wait_for_port "$REDIS_PORT" "redis"
fi

# 2. Env. .env is needed by docker-compose; for the host-side Django/Vite
# processes we override the docker-only hostnames to point at localhost.
if [ ! -f .env ]; then
  cp .env.example .env
fi

export POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379/0}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.development}"
export DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-e2e-secret-key}"
export DJANGO_ALLOWED_HOSTS="${DJANGO_ALLOWED_HOSTS:-localhost,127.0.0.1}"

# 3. Backend: migrate + serve.
log "Running migrations..."
(cd backend && uv run python manage.py migrate --noinput)

log "Starting backend on :$BACKEND_PORT..."
(cd backend && exec uv run python manage.py runserver "0.0.0.0:$BACKEND_PORT" --noreload) \
  >/tmp/e2e-backend.log 2>&1 &
BACKEND_PID=$!

# 4. Frontend: build + preview (matches the production-style server used in CI).
log "Building frontend..."
(cd frontend && pnpm run build)

log "Starting frontend preview on :$FRONTEND_PORT..."
(cd frontend && exec pnpm exec vite preview --port "$FRONTEND_PORT" --strictPort) \
  >/tmp/e2e-frontend.log 2>&1 &
FRONTEND_PID=$!

# 5. Readiness checks.
log "Waiting for backend (admin login)..."
wait_for_http "http://localhost:$BACKEND_PORT/admin/login/" "backend"
log "Waiting for frontend..."
wait_for_http "http://localhost:$FRONTEND_PORT/" "frontend"

# 6. Tests. E2E_EXTERNAL_SERVERS tells playwright.config.ts to skip its own
# webServer block so it doesn't try to re-bind 5173.
log "Running Playwright tests..."
cd frontend
E2E_EXTERNAL_SERVERS=1 exec pnpm exec playwright test "$@"
