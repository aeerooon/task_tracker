# Task Tracker

A small multi-user task management app: sign up, sign in, organize tasks into
categories, and filter/search/paginate through them. Each user only ever sees
their own tasks.

**Stack:** React (Vite) frontend, Node.js/Express backend, MySQL via Sequelize —
the default stack from the exam brief, used as-is.

## Project structure

```
task-tracker/
  backend/     Express API (routes, controllers, models, middleware)
  frontend/    React app (Vite)
```

## Local setup

### Prerequisites
- Node.js 18+
- A running MySQL server (locally, via Docker, or a cloud instance)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your DB credentials + a JWT secret
```

Create the database and a user (adjust to your MySQL setup):

```sql
CREATE DATABASE task_tracker;
CREATE USER 'task_app'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON task_tracker.* TO 'task_app'@'localhost';
FLUSH PRIVILEGES;
```

Then start the API (this also runs `sequelize.sync()` to create tables):

```bash
npm run dev        # nodemon, auto-restart
# or
npm start
```

Optional — seed a reviewer test account with sample data:

```bash
npm run db:seed
```

The API runs on `http://localhost:4000` by default. Check
`http://localhost:4000/api/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Test account

If you ran `npm run db:seed` in the backend:

- **Email:** `reviewer@example.com`
- **Password:** `password123`

It comes with 3 categories and 4 sample tasks. Otherwise, just register a new
account from the Sign Up page.

## Tech stack used

- **Frontend:** React 19 + Vite, React Router, Axios, plain CSS
- **Backend:** Node.js, Express, Sequelize (MySQL dialect via `mysql2`)
- **Auth:** JWT (7-day expiry), passwords hashed with bcrypt
- **Validation:** Manual checks in controllers (required fields, enum status
  values, category existence) — kept intentionally lightweight rather than
  pulling in a schema-validation library, since the surface area is small
- **Bonus implemented:** rate limiting on `/api/auth/login` (10 attempts /
  15 min per IP) via `express-rate-limit`

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create account (name, email, password) |
| POST | `/api/auth/login` | Public | Sign in, returns JWT (rate-limited) |
| GET | `/api/auth/me` | JWT | Current authenticated user |
| GET | `/api/categories` | JWT | List all categories |
| POST | `/api/categories` | JWT | Create a category |
| GET | `/api/tasks` | JWT | List the caller's tasks. Query params: `status`, `category_id`, `search` (matches title), `page`, `limit` |
| GET | `/api/tasks/:id` | JWT | Get one task (must belong to caller), includes its category |
| POST | `/api/tasks` | JWT | Create a task |
| PUT | `/api/tasks/:id` | JWT | Update a task (must belong to caller) |
| DELETE | `/api/tasks/:id` | JWT | Delete a task (must belong to caller) |

All task/category-mutating routes reject requests without a valid JWT (401).
Tasks are always scoped to `req.user.id` server-side — a user can never read
or modify another user's tasks by guessing an ID (verified: returns 404, not
someone else's data).

## Known limitations / trade-offs

- **`sequelize.sync()` instead of migrations.** Fine for this scope, but in a
  real project I'd switch to `sequelize-cli` migrations (listed as a bonus —
  not done here to keep the timeline reasonable).
- **Categories are global, not per-user.** The brief's schema has `Category.name`
  as globally unique, so any user can see/add categories and they're shared
  across accounts. This matches the spec as written, but in a real product
  categories would likely be scoped per-user too.
- **No automated tests.** Backend was verified manually end-to-end (auth flow,
  CRUD, search/filter/pagination, and cross-user data isolation) via direct
  API calls rather than an automated test suite.
- **Client-side 401 handling is passive.** On a 401, the Axios interceptor
  clears the stored token, but doesn't force-navigate immediately — the user
  lands on Sign In on their next route change/action rather than instantly.
- **No password reset flow** (listed as a bonus, not implemented).
- **Debounced search** waits 300ms after the last keystroke before calling
  the API, so very fast typers may notice a brief lag before results update.
