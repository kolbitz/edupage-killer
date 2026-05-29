---
name: edupage-killer project
description: Context about the edupage-killer project — what it is, tech stack, and architecture decisions
type: project
---

EduPage alternative school management app called "EduPageKiller".

**Why:** Replace EduPage (https://www.edupage.org/) with an open, self-hosted system for high-school classes.

**Tech stack:**
- Backend: Python 3.12, Django 5, DRF + Strawberry GraphQL, Django Channels (WebSocket), Celery + Redis
- Frontend: TypeScript, Vite, React 18, TanStack Query, Apollo Client, Zustand, Tailwind CSS
- Database: PostgreSQL 16
- Auth: django-allauth (Google, Facebook, GitHub) + JWT (simplejwt)
- EduPage sync: edupage-api library (bidirectional: pull timetable/users/grades/homework; push homework completion)

**Personas:** student, parent, teacher, admin

**Features:** login, timetable, attendance, materials (per-lesson sharing), Discord-like chat (WebSocket), assignments/exams/grades, class notes

**Architecture decisions:**
- Monorepo: `backend/` (uv) + `frontend/` + `docker/`
- Both REST (`/api/`) and GraphQL (`/graphql/`) APIs — mobile-ready for future app
- WebSocket chat at `ws://host/ws/chat/<channel_id>/`
- EduPage sync runs via Celery tasks, triggered by celery-beat or POST `/api/edupage-sync/trigger/`
- `apps/accounts.User` is custom AUTH_USER_MODEL
- Each Django app has: models, serializers, views, urls, admin, schema (GraphQL stub)

**How to apply:** When the user asks to add features, extend existing apps rather than creating new ones. Mobile app will come later — keep APIs clean.
