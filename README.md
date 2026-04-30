# Project & Task Management App

Simple internal web app for small teams to track projects and tasks with clear assignee visibility.

## Tech Stack

- Frontend: Next.js + Tailwind CSS (`/frontend`)
- Backend: Node.js + Express + MongoDB Atlas (`/backend`)

## Core Features

- Email/password login with JWT
- Shared project dashboard for all users
- Task management with status (`To Do`, `In Progress`, `Done`)
- Assignee name displayed clearly on every task (`assigned_to_name`)
- Task comments with commenter name
- Last updated by user name and lightweight activity log

## Backend Setup

1. Go to `backend` folder.
2. Copy `.env.example` to `.env` and fill values.
3. Install deps:
   - `npm install`
4. (Optional) Seed admin user:
   - `npm run seed`
5. Start backend:
   - `npm run dev`

Backend URL: `http://localhost:5000`

## Frontend Setup

1. Go to `frontend` folder.
2. Copy `.env.local.example` to `.env.local`.
3. Update API URL if needed:
   - `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
4. Install deps:
   - `npm install`
5. Start frontend:
   - `npm run dev`

Frontend URL: `http://localhost:3000`

## API Endpoints

- `POST /api/login`
- `GET /api/me`
- `GET/POST/PUT /api/projects`
- `GET/POST/PUT /api/tasks`
- `PATCH /api/tasks/:id/status`
- `POST /api/tasks/:id/comments`
- `GET /api/users`
- `POST/DELETE /api/users` (admin only)

## MongoDB Atlas Deployment Steps

1. Create a MongoDB Atlas cluster.
2. Add database user and IP access.
3. Copy connection string into `backend/.env` as `MONGO_URI`.
4. Deploy backend to Render or Railway.
5. Set backend env vars in deployment platform.
6. Deploy frontend to Vercel.
7. Set `NEXT_PUBLIC_API_URL` in Vercel to deployed backend `/api` URL.

## Focus of This Build

- Fast implementation
- Clear UI for "who is doing what"
- Minimal complexity
