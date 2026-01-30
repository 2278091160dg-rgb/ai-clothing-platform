# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo containing two AI-powered applications**:

1. **AI Clothing Platform** (`ai-clothing-platform/`) - Next.js 16 App Router application for AI-powered clothing image generation with Feishu integration
2. **AI Scene Generator** (`ai-scene-generator/`) - Vite React SPA for product scene generation

## Common Commands

### AI Clothing Platform

```bash
cd ai-clothing-platform

# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Database
npx prisma generate      # Generate Prisma client (auto-runs postinstall)
npx prisma db push       # Push schema changes to database
npx prisma migrate dev   # Create and apply migration

# Deployment
./deploy.sh              # Simple deployment
./migrate-and-deploy.sh  # Migration + deployment
./full-deploy.sh         # Complete deployment
```

### AI Scene Generator

```bash
cd ai-scene-generator

npm run dev              # Start Vite dev server (localhost:3000)
npm run build            # TypeScript + Vite build
npm run preview          # Preview production build
```

## Architecture

### AI Clothing Platform

**Technology Stack:**
- Next.js 16.1.5 with App Router
- TypeScript 5 (strict mode enabled)
- Tailwind CSS v4
- Prisma ORM with SQLite (local) / PostgreSQL (production via Supabase)
- Custom password-based authentication (not NextAuth)

**Key Architecture Patterns:**

1. **Service-Repository Pattern**: Business logic in `src/lib/services/`, data access via Prisma repositories
2. **Custom Hooks**: State management encapsulated in `src/hooks/` (e.g., `use-task-management.ts`, `use-image-upload.ts`)
3. **API Routes**: Backend operations in `src/app/api/`
4. **Dual Database**: SQLite for local dev, PostgreSQL for production

**Directory Structure:**
```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── page.tsx         # Main workspace (Bento Grid layout)
│   ├── login/           # Login page with customization
│   ├── ai-chat/         # AI conversation interface
│   └── api/             # API routes
├── components/
│   ├── login/           # Login settings (3 tabs: Logo, Text, Background)
│   ├── settings/        # Configuration panels
│   ├── workspace/       # Main workspace UI
│   └── ui/              # Reusable UI components (Radix-based)
├── lib/
│   ├── services/        # Business logic (n8n, feishu, ai-conversation, task)
│   ├── repositories/    # Data access layer
│   └── utils/           # Utility functions
└── hooks/               # Custom React hooks
```

**External Integrations:**
- **N8N Workflows**: AI image generation via webhooks
- **Feishu/Lark**: Enterprise collaboration platform integration
- **DeerAPI**: Image hosting service
- **Supabase**: Production PostgreSQL database

**Data Flow:**
1. User uploads images + configures parameters
2. Task created in database with PENDING status
3. N8N webhook triggered with task details
4. N8N processes: downloads images → AI generation → uploads results
5. Callback updates task with results
6. Frontend polls for status updates
7. Results displayed and synced to Feishu

### AI Scene Generator

**Technology Stack:**
- React 18 + Vite 5
- TypeScript
- Tailwind CSS v3.4
- Zustand for state management
- Framer Motion for animations
- React Dropzone for file uploads

**Architecture:**
- Simpler React SPA with direct n8n webhook integration
- Proxy configuration (`vite.config.ts`) for CORS handling

## Code Quality Constraints

**File Size Limits (Strictly Enforced):**
- Page components: **max 250 lines** (error if exceeded)
- Functional components: max 200 lines (warn)
- UI components: max 150 lines (warn)
- Hooks: max 150 lines (warn)

**Complexity Limits:**
- Cyclomatic complexity: ≤15
- Nesting depth: ≤4
- Function parameters: ≤4
- Max statements per function: ≤30

**Before Committing:**
1. Run `npm run build` - must succeed
2. Run `npm run format` - format all code
3. Run `npm run lint` - no warnings
4. Remove all `console.log` (keep `console.error` and `console.warn`)
5. No `.old`, `.bak`, or `.disabled` files
6. New files must be under 250 lines
7. Use absolute imports (`@/`) for internal imports

**Large File Refactor Pattern:**
- Page components → Split into sub-components + hooks
- Form components → Split into controlled components + UI components
- List components → Split into container + list items + hooks
- Modal/Dialog → Split into Content component + hooks

## Database Schema

**Key Models:**
- `User` - User accounts with Feishu integration
- `Task` - AI generation tasks with prompt optimization support
- `PromptConversation` - Multi-turn AI conversations for prompt optimization
- `LoginPageConfig` - Customizable login page configuration
- `SyncLog` - Feishu synchronization tracking
- `AuditLog` - Audit trail

**Concurrency Control:**
- Optimistic locking via `version` field on Task model
- `lastModifiedBy` and `lastModifiedAt` for conflict detection

## Environment Variables

**Required:**
- `DATABASE_URL` - Database connection (SQLite for local, PostgreSQL for production)
- `ACCESS_TOKEN` - Application access password
- `N8N_WEBHOOK_URL` - N8N workflow endpoint
- `FEISHU_APP_ID`, `FEISHU_APP_SECRET` - Feishu integration

## Deployment

**Platform:** Vercel

**Pre-deployment Checklist:**
1. Update `prisma/schema.prisma`: change `provider` from `sqlite` to `postgresql`
2. Set `DATABASE_URL` environment variable in Vercel
3. Run `npx prisma db push` after first deployment
4. Access `/api/init-db` to initialize database if needed

## Important Notes

- **No test framework** is currently configured - manual testing only
- **Pre-commit hooks** via Husky are configured
- **Code is primarily documented in Chinese** - most markdown files are Chinese documentation
- **Conventional Commits** format is preferred for commit messages
- **Optimistic locking** is used for concurrent task updates - check `version` field before updating
- **Image uploads** go through DeerAPI for hosting
- **Feishu is the primary source of truth** for task data in production
