# EduPageKiller

An open-source alternative to [EduPage](https://www.edupage.org/) for high-school classes, with bidirectional sync.

## Features

- **Login** via Google, Facebook, GitHub (plus email/password)
- **Timetable** — weekly grid view with substitutions
- **Attendance** — per-lesson tracking with justification flow
- **Class Materials** — file/link sharing per lesson, with comments (teacher→student, student→student)
- **Chat** — Discord-like channels per class/subject with real-time WebSocket messaging
- **Assignments & Grades** — homework, exams, submissions, grading
- **Notes** — private or shared class notes

## Personas

| Role | Access |
|------|--------|
| Student | own timetable, attendance, materials, assignments, notes, chat |
| Teacher | manage attendance, upload materials, create assignments, grade |
| Parent | read-only view of child's attendance & grades |
| Admin | full access, EduPage sync management |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, Django 5, DRF, Strawberry GraphQL, Django Channels |
| Frontend | TypeScript, Vite, React 18, TanStack Query, Apollo Client, Tailwind CSS |
| Database | PostgreSQL 16 |
| Queue | Celery + Redis |
| Real-time | Django Channels + Redis channel layer (WebSocket) |
| Auth | django-allauth (Google, Facebook, GitHub) + JWT |
| EduPage sync | [edupage-api](https://github.com/EdupageAPI/edupage-api) via Celery tasks |

## Getting Started

```bash
# 1. Clone and copy env
cp .env.example .env
# Edit .env with your credentials

# 2. Start everything
make dev
```

Services:
- Backend API: http://localhost:8000/api/
- GraphQL playground: http://localhost:8000/graphql/
- Django admin: http://localhost:8000/admin/
- Frontend: http://localhost:5173

## Local Development

```bash
make install        # install dependencies (uv + npm)
make dev            # docker compose up --build
make migrate        # run migrations
make createsuperuser
make shell          # Django shell
make lint           # ruff + eslint
make format         # black + prettier
make typecheck      # mypy + tsc
make test           # pytest + vitest
make sync-edupage   # trigger EduPage sync manually
```

## EduPage Bidirectional Sync

Set these in `.env`:
```
EDUPAGE_SERVER=your-school.edupage.org
EDUPAGE_USERNAME=admin@school.edu
EDUPAGE_PASSWORD=secret
```

**Pull (EduPage → our DB):**
- Timetable / subjects
- Students and teachers
- Grades
- Homework assignments

**Push (our DB → EduPage):**
- Homework completion status (where API supports it)

Sync runs automatically every night via celery-beat, or trigger manually:
```bash
make sync-edupage
# or via admin: POST /api/edupage-sync/trigger/
```

## API

### REST
```
GET  /api/accounts/me/
GET  /api/timetable/my/
GET  /api/attendance/my/
GET  /api/materials/
GET  /api/chat/channels/
GET  /api/assignments/
GET  /api/notes/
```

### GraphQL
```
POST /graphql/
# Playground available in DEBUG mode
```

### WebSocket (chat)
```
ws://localhost:8000/ws/chat/<channel_id>/
```

## Mobile App

Architecture is prepared for a mobile app (to be built separately):
- REST + GraphQL APIs are mobile-ready (JSON, JWT auth)
- WebSocket for real-time chat works natively in React Native / Swift / Kotlin
- File upload endpoints support multipart

## Project Structure

```
edupage-killer/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # Users, personas, school classes
│   │   ├── timetable/      # Subjects, rooms, periods, schedule
│   │   ├── attendance/     # Presence tracking, justifications
│   │   ├── materials/      # File/link sharing per lesson
│   │   ├── chat/           # Discord-like channels + WebSocket consumers
│   │   ├── assignments/    # Homework, exams, submissions, grades
│   │   ├── notes/          # Shared class notes
│   │   └── edupage_sync/   # Bidirectional EduPage sync service
│   └── config/             # Django settings, URLs, ASGI, Celery, GraphQL schema
├── frontend/
│   └── src/
│       ├── api/            # Axios clients per domain
│       ├── pages/          # One page component per feature
│       ├── components/     # Shared layout + UI components
│       ├── store/          # Zustand auth store
│       └── types/          # Shared TypeScript types
├── docker/                 # Dockerfiles for backend + frontend
├── docker-compose.yml
└── Makefile
```
