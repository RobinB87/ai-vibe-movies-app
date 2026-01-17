# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 movie tracking application with session-based authentication, using Prisma ORM with PostgreSQL and Redis for session storage.

## Commands

All commands must be run from the `movies-app/` directory:

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Testing
npx jest                           # Run all tests
npx jest path/to/test.ts           # Run single test file
npx jest --watch                   # Watch mode

# Database
npx prisma generate                # Generate Prisma client after schema changes
npx prisma migrate dev             # Create and apply migrations
npx prisma studio                  # Visual database browser (http://localhost:51212)

# Infrastructure
docker-compose up -d               # Start Redis container
```

## Architecture

### Directory Structure (movies-app/)
- `app/` - Next.js App Router pages and API routes
- `app/api/` - REST API endpoints
- `app/api/auth/core/` - Session and password hashing utilities
- `app/context/` - React context providers (MovieContext for global state)
- `app/generated/prisma/` - Auto-generated Prisma client (do not edit)
- `components/` - Reusable React components
- `lib/` - Shared utilities (prisma client, redis client, hooks)
- `types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

### Authentication Flow
Session-based auth using Redis:
1. Login/signup API creates session in Redis with 7-day expiry
2. Session ID stored in httpOnly secure cookie
3. `getUserFromSession()` retrieves user from cookie on server
4. `getCurrentUser()` (cached with React) for server components

### Data Models
- **User** - Authentication with salted password hashing
- **Movie** - Films with metadata, linked to creator user
- **UserMoviePreference** - Per-user ratings, reviews, watchlist status (many-to-many)

### Key Patterns
- API routes use Next.js Route Handlers (`app/api/**/route.ts`)
- Tests co-located with implementation in `__tests__/` folders
- Prisma client generated to `app/generated/prisma/` (custom output path)
- MovieContext provides global movie state with debounced search

## Environment Variables

Required in `.env` (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection (defaults: 127.0.0.1:6379)
- `CORS_ALLOWED_ORIGIN` - Allowed origins for CORS

## Development Methodology

This project uses TDD (Test-Driven Development). Write tests before implementation.
