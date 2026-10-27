# Pan-African Expansion Intelligence

Standalone LOG_ON intelligence workspace for monitoring, verifying, scoring, and operationalising Pan-African market-expansion signals.

## Features

- Expansion signal queue and country radar
- Evidence confidence, expansion intent, commercial relevance, urgency, and contactability scoring
- Country profiles and verification tracks
- Protected signal-ingestion API (`POST /api/pan-african`)
- Optional Supabase persistence and SQL schema
- Development fixtures for local UI evaluation

## Run locally

Requirements: Node.js 20+ and pnpm (or npm).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. The root route redirects to `/pan-african`.

Without Supabase credentials, the dashboard uses included development fixtures. To enable persistence, configure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then apply `database/pan_african_expansion.sql` to the Supabase/Postgres project.

Set `EXPANSION_INGEST_SECRET` before using `POST /api/pan-african`. Send `Authorization: Bearer <secret>` and a JSON body containing a non-empty `signals` array.

**Security:** `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in client code. Fixture data is for development/evaluation, not independently verified live market intelligence. Verify regulatory, payment, and market-entry claims against primary sources before acting.
