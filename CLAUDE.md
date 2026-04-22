# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LOG** is a full-stack media tracking web app (films, TV, anime, games, books, manga, etc.) inspired by Letterboxd, MAL, Goodreads, and Backloggd.

- Live: https://log-media-tracker.vercel.app/dashboard (demo: `demo_user` / `password1`)
- Frontend: React 18 + Vite, plain CSS (no Tailwind)
- Backend: Python FastAPI + PostgreSQL + SQLAlchemy 2 + Alembic

## Commands

### Frontend
```bash
cd frontend
npm install
npm start          # dev server on port 3000
npm run build
```

### Backend
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head        # run migrations
python main.py              # starts on port 6443
# or with reload:
python -m uvicorn main:app --host 0.0.0.0 --port 6443 --reload
```

### Environment
- Frontend `.env`: `VITE_API_BASE=http://localhost:6443`
- Backend `.env`: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, optional API keys for TMDB, IGDB, Google Books, RAWG, ComicVine

## Architecture

### Backend (`backend/`)
- `main.py` — FastAPI app setup, CORS, lifespan hooks
- `routers.py` — All route handlers (auth, entries, search, stats, import/export)
- `models.py` — SQLAlchemy ORM models (`User`, `Entry`)
- `schemas.py` — Pydantic request/response schemas
- `constants.py` — Canonical values for statuses, mediums, origins (must stay in sync with `frontend/utils.jsx`)
- `services/` — Business logic separated from routes:
  - `auth_service.py`, `entry_service.py`, `stats_service.py`
  - `search_service.py` — Coordinates `services/search_providers/`
  - `export_service.py`, `import_service.py`, `import_mal_service.py`
- `services/search_providers/` — One file per external API (tmdb, anilist, jikan, igdb, google_books, etc.)
- `alembic/versions/` — Migration history; use `alembic revision` for schema changes

### Frontend (`frontend/`)
- `app.jsx` — Root router, auth state, theme toggle
- `api.jsx` — Centralized fetch helpers; all API calls go through here
- `utils.jsx` — Constants (statuses, mediums, origins); must stay in sync with `backend/constants.py`
- `design.css` — CSS variables for light/dark theme
- `pages/` — `Dashboard.jsx`, `Library.jsx`, `Statistics.jsx`
- `pages/components/` — Modals: Add/Edit/Detail/Confirm entry, Import (CSV, auto-search, MAL), Auth, Settings

## Key Patterns

- **All entry queries are scoped by authenticated username.** Ownership is verified on every read/update/delete in `entry_service.py`.
- **Auth state** is stored in `localStorage` (`auth_token`, `auth_username`). The frontend sends `Authorization: Bearer <token>` on every protected request.
- **SSE streams** are used for long-running imports (`/entries/import/auto`, `/entries/import/mal`) — the backend yields events as it processes rows.
- **`completed_at`** is automatically managed by the backend when `status` changes to/from `"completed"`.
- **Search provider fallback:** `search_service.py` fans out to multiple providers and deduplicates results.
- **No test suite currently exists** in the repo.
