# KIA Grant Management System 2.0
## Enterprise-Grade Grant Application Management, Workflow Automation & Operational Recovery

**Entity:** KIA-START UP CONSULT (Accra, Ghana)  
**System Version:** 2.0.0 (Phase 0 Complete)  
**Operating Model:** Hybrid Client-Upload & Staff-Managed System  
**Frontend:** React 19 • Vite 8 • Tailwind CSS 4 • Lucide Icons  
**Backend & Database:** Supabase PostgreSQL 15 • Row Level Security • Private Storage • Background Automation

---

## 🎯 Executive Overview

KIA-Start Up Consult assists startups, SMEs, entrepreneurs, NGOs, and cooperatives across Ghana and West Africa in identifying, preparing, and winning competitive grant financing.

The **KIA Grant Management System 2.0** transitions the organization from an unverified, single-user client-side prototype to an enterprise-grade operational platform. The system is engineered to solve core business bottlenecks:

1. **Eliminate Document Stalls:** Password-less, secure cryptographic upload links (`/upload?token=...`) allowing clients to submit and replace required documents directly from mobile or desktop.
2. **Absolute Task Accountability:** Every case has an assigned officer, explicit current status, next action due date, and automated escalation to the Team Leader (1 working day overdue) and CEO (3 working days overdue).
3. **Evidence-Based Records:** Financial payments (GH₵200 commitment fee, success fees) and submitted grant applications require verified receipts, transaction IDs, and funder references before status changes can occur.
4. **Transparent Readiness Diagnostics:** Full 10-pillar, 20-metric readiness diagnostic framework (0–100 scale) with evidence attachments and printable executive A4 PDF reports.
5. **CEO 30-Second Radar:** Executive dashboard providing immediate operational visibility into bottlenecks, overdue workload, approaching deadlines, and financial health.

---

## 📚 Architectural & Technical Documentation

Full system specifications are maintained in the [`docs/`](./docs) directory:

| Document | Purpose |
|---|---|
| [**Project Audit**](./docs/PROJECT_AUDIT.md) | In-depth audit of existing code, dependencies, vulnerabilities, and component disposition. |
| [**Target Architecture**](./docs/ARCHITECTURE.md) | High-level system design, hybrid access model, and data flow diagrams. |
| [**Database Schema (DDL)**](./docs/DATABASE_SCHEMA.md) | PostgreSQL schema, 32 relational entities, UUID keys, triggers, and audit logging. |
| [**Workflows & Lifecycles**](./docs/WORKFLOWS.md) | State machine specifications for onboarding, documents, readiness, matching, QA, and tasks. |
| [**Security & Compliance**](./docs/SECURITY.md) | Ghana Data Protection Act (Act 843), RBAC matrix, token security, and private storage. |
| [**Implementation Plan**](./docs/IMPLEMENTATION_PLAN.md) | Phased delivery backlog (Phases 0 to 5) with concrete acceptance criteria. |
| [**Quality Assurance & Test Plan**](./docs/TEST_PLAN.md) | Unit, integration, security test matrices, and 8 operational end-to-end scenarios. |
| [**Deployment Guide**](./docs/DEPLOYMENT.md) | Supabase setup, migrations, storage buckets, cron automation, and disaster recovery. |
| [**Changelog**](./docs/CHANGELOG.md) | Version history and evolution log. |

---

## 💻 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ or 20+
- Git

### 2. Installation
```bash
git clone <repo-url>
cd kia-grant-app
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open your browser to: **`http://localhost:5173`**

### 4. Running Production Build & Linters
```bash
npm run lint    # Runs oxlint
npm run build   # Compiles production bundle with Vite
```

---

## 🗓️ Implementation Phases

- [x] **Phase 0 — Technical & Operational Audit** (Completed)
- [ ] **Phase 1 — Core Operations & Foundation** (Database, Auth, CRM, Tasks, CEO Dashboard, Legacy Recovery)
- [ ] **Phase 2 — Documents & Readiness** (Dynamic Checklists, Token Uploads, Evidence Review, Diagnostic Reports)
- [ ] **Phase 3 — Grant Discovery & Applications** (Verified Catalog, Matching Engine, QA Gates, Submission Evidence)
- [ ] **Phase 4 — Automation & Finance** (Automated Escalations, Reminders, Invoices, MoMo/Bank Reconciliation)
- [ ] **Phase 5 — Pilot, Optimization & Production Rollout** (End-to-End Drills, Security Hardening, Training)

---

## 🔒 Confidentiality & Intellectual Property
*© 2026 KIA-START UP CONSULT • Accra, Ghana • All Rights Reserved.*  
*Confidential and proprietary operational system.*
