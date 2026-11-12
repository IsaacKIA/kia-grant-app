# KIA Grant Management System 2.0 — Deployment & Operations Guide

**System:** KIA Grant Management System 2.0  
**Environment:** Development, Staging, and Production  
**Date:** November 12, 2026

---

## 1. Hosting Architecture

The system utilizes a secure, modern serverless cloud architecture:

```
[ Clients / Staff ]
       │
       ▼  HTTPS / TLS 1.3
[ Vercel / Netlify Edge CDN ] ────► Static Single-Page App (React 19 + Vite + Tailwind)
       │
       ▼  Direct Secure API (HTTPS / WSS)
[ Supabase Cloud (AWS eu-west-1 / Ireland or af-south-1 / Cape Town) ]
       ├── PostgreSQL 15 Database (Encrypted at rest, RLS enabled)
       ├── Supabase Auth (JWT, Session refresh)
       ├── Supabase Private Storage (grant-documents bucket)
       └── Supabase Edge Functions / pg_cron (Hourly & Daily Automation)
```

---

## 2. Environment Configuration

Create a `.env` file in the project root (`F:\PROJECTS\kia-grant-app\.env`):

```bash
# Frontend Public Environment Variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_TITLE="KIA Grant Management System"
VITE_APP_TIMEZONE="Africa/Accra"
VITE_DEFAULT_CURRENCY="GHS"

# Backend / Migration / Automation Keys (NEVER commit to client bundle)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_...
```

Ensure `.env` and `.env.local` are explicitly excluded in `.gitignore`.

---

## 3. Database Migration Sequence

Database migrations must be applied sequentially via the Supabase SQL Editor or Supabase CLI:

1. `migrations/001_initial_schema.sql`: Extensions, ENUM types, and core tables.
2. `migrations/002_row_level_security.sql`: RLS enablement and role-based policies.
3. `migrations/003_triggers_and_automation.sql`: `updated_at` triggers, audit event logger, and inactivity calculators.
4. `migrations/004_seed_readiness_framework.sql`: 10 Pillars and 20 Sub-Criteria from `criteria.js`.
5. `migrations/005_seed_grant_opportunities.sql`: Seed verified grants from `grantsData.js`.
6. `migrations/006_legacy_client_staging.sql`: Quarantine the 14 unverified baseline clients for review.

---

## 4. Storage Bucket Configuration

1. In Supabase Dashboard -> **Storage**:
   - Create bucket: `grant-documents`
   - Set **Public Bucket** to `FALSE` (Private).
   - Set file size limit: `25MB`.
   - Allowed MIME types:
     `application/pdf`, `image/png`, `image/jpeg`, `image/jpg`,
     `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
     `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
2. Apply Storage RLS Policy allowing authenticated staff read access and token-validated upload access.

---

## 5. Scheduled Automation (Cron)

Set up periodic cron tasks using Supabase `pg_cron` or scheduled Edge Functions:

```sql
-- Run daily at 06:00 GMT (Africa/Accra)
SELECT cron.schedule(
    'daily-deadline-and-escalation-check',
    '0 6 * * *',
    $$ SELECT execute_daily_escalation_rules(); $$
);

-- Run hourly between 08:00 and 18:00 GMT on weekdays
SELECT cron.schedule(
    'hourly-inactivity-and-task-monitor',
    '0 8-18 * * 1-5',
    $$ SELECT execute_hourly_task_checks(); $$
);
```

---

## 6. Backup, Retention & Disaster Recovery

- **Automated Backups:** Daily automated database backups retained for 30 days.
- **Point-in-Time Recovery (PITR):** Available for production database to restore to any second within 7 days.
- **Monthly Recovery Drill:** Staff test restoring database snapshots into a staging environment to guarantee recovery viability.
- **Data Retention Policy:** In compliance with Act 843, client files for closed cases are archived for 7 years for tax and audit compliance, after which they are flagged for secure cryptographic destruction.

