# I&D Awareness Agent

AI-powered Inclusion & Diversity awareness-day research, email drafting, and distribution platform.

## Project overview

The I&D Awareness Agent automates the discovery of upcoming awareness days (e.g. World Mental Health Day, Pride Month), generates professional internal-communications email drafts using Claude, and distributes approved messages to subscribers via AWS SES.

The target users are DEI / I&D team members who manage awareness communications at a large organisation.

## Architecture & tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Prisma ORM |
| AI | Anthropic Claude (claude-sonnet-4-20250514) with web search |
| Email | AWS SES |
| Auth | NextAuth v4 (JWT strategy, Credentials provider) |
| Styling | Tailwind CSS with glassmorphism design system |

### Directory layout

```
/
├── agent/           # AI agent modules (research, drafting, prompts)
├── app/             # Next.js App Router pages and API routes
│   ├── (dashboard)/ # Protected dashboard pages
│   ├── api/         # API routes (auth, agent, cron, subscribers)
│   └── auth/        # Auth pages (signin)
├── actions/         # Server actions (mutations)
├── components/      # React components (ui/, layout/, dashboard/)
├── lib/             # Shared utilities (config, prisma, auth, audit, validations)
├── mailer/          # Email sending (SES client, HTML templates)
├── prisma/          # Schema and seed data
└── scheduler/       # Cron job definitions
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in the required values (see .env.example for descriptions)

# 3. Set up the database
npx prisma migrate dev

# 4. Seed the database with sample data
npx prisma db seed

# 5. Start the dev server
npm run dev
```

The app runs at http://localhost:3000. Dev credentials: `admin@company.com` / `admin123`.

## Code conventions

- **TypeScript strict** — all files use strict TypeScript; avoid `any` where possible.
- **Server Components by default** — only add `"use client"` when the component needs interactivity (state, effects, event handlers).
- **Server Actions for mutations** — data writes go through Next.js server actions in `actions/`, not API routes.
- **API routes for external integrations** — cron triggers, webhook endpoints, and the agent runner use route handlers in `app/api/`.
- **Zod for validation** — all user input is validated with Zod schemas in `lib/validations.ts`.
- **Audit logging** — every significant action (create, update, approve, reject, send) is recorded via `lib/audit.ts`.

## Key workflows

### Adding a new theme

1. Navigate to the Themes page in the dashboard.
2. Click "Add Theme", fill in the label, description, and colour.
3. The theme will be included in the next research run.

### Triggering research

Research discovers new awareness days for a given quarter:

```
POST /api/agent/run
{ "action": "research", "quarter": "Q2 2026" }
```

Or trigger from the dashboard Agent banner.

### Triggering draft generation

Drafts are auto-generated for confirmed awareness days that lack a draft:

```
POST /api/agent/run
{ "action": "draft", "awarenessDayId": "<id>" }
```

### Approval flow

1. Drafts appear in the Approvals queue with status `pending`.
2. An editor reviews and either approves or rejects (with feedback).
3. Rejected drafts can be re-generated incorporating the feedback.
4. Approved drafts become eligible for sending.

### Sending emails

Approved drafts are sent via the cron endpoint or manually:

```
POST /api/cron/send
```

Emails are delivered through AWS SES to all active subscribers.

## Security conventions

- All dashboard routes are protected by NextAuth middleware.
- Environment variables with secrets are validated at startup via `lib/config.ts`.
- API keys and credentials are never exposed to the client.
- Audit logs capture the actor for every mutation.
- Input validation with Zod on all user-facing forms and API endpoints.
- CSRF protection is handled by NextAuth.
- Rate limiting should be added at the infrastructure layer (e.g. Vercel, CloudFront) for production.
