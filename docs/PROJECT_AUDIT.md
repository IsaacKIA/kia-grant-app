# KIA Grant Management System 2.0 — Comprehensive Technical & Operational Audit

**Date:** November 12, 2026  
**Auditor:** Principal Software Architect & Multi-Disciplinary Engineering Team  
**System:** KIA Grant Management System  
**Target Repository:** `F:\PROJECTS\kia-grant-app`  
**Client Entity:** KIA-START UP CONSULT (Accra, Ghana)  
**Status:** Baseline Audit Completed — Phase 0

---

## 1. Executive Summary

KIA-Start Up Consult operates an advisory service in Accra, Ghana, supporting startups, SMEs, and NGOs in securing non-repayable grant capital and concessionary financing. While demand for services is high, the business faces acute operational bottlenecks:

1. **Weak Supervision & Visibility:** Management lacks central oversight of case progress and cannot pinpoint where applications stall.
2. **Client Information Stalls:** Clients pay the GH₵200 onboarding fee but subsequently fail to submit supporting documentation.
3. **No Systematic Follow-up or Accountability:** Tasks have no owners, deadlines, or escalation paths; inactive cases sit indefinitely without alerts.
4. **Unverified Records:** Operational claims (e.g. fees paid, documents submitted, grants won) are recorded as casual boolean toggles without supporting evidence.
5. **Architectural Fragility:** The existing software prototype is an entirely client-side single-page application relying on browser `localStorage`, with no multi-user access control, no database, no file storage, and no backend automation.

This audit evaluates the codebase across architecture, security, data integrity, operational coverage, and usability, establishing the baseline for migration to **KIA Grant Management System 2.0**.

---

## 2. Codebase & Dependency Analysis

### 2.1 File & Directory Inventory

```
F:\PROJECTS\kia-grant-app
├── .gitignore                    # Standard Node/Vite ignore rules
├── .oxlintrc.json                # Oxlint linter configuration
├── index.html                    # Root HTML mount point
├── package.json                  # Dependencies and build scripts
├── package-lock.json             # Locked dependency tree
├── vite.config.js                # Vite 8.3 build configuration with @tailwindcss/vite
├── public/                       # Static public assets (icons.svg, favicon.svg)
├── src/
│   ├── App.css                   # Print media queries and utility styles
│   ├── App.jsx                   # Central state orchestrator and tab router
│   ├── index.css                 # Tailwind CSS v4 import
│   ├── main.jsx                  # React 19 root bootstrap
│   ├── assets/                   # Images and logos (hero.png, react.svg, vite.svg)
│   ├── data/
│   │   ├── criteria.js           # 10 Pillars, 20 sub-criteria scoring matrix
│   │   ├── grantsData.js         # 7 hardcoded funding opportunities
│   │   └── initialClients.js     # 14 hardcoded seed client records
│   └── components/
│       ├── ClientDetailModal.jsx # Client inspector and stage/checklist updater
│       ├── GrantMatcher.jsx      # Sector/score filter component
│       ├── Navbar.jsx            # Top navigation and aggregated metric counters
│       ├── NewClientModal.jsx    # Client onboarding popup form
│       ├── PipelineView.jsx      # Kanban board and table view of clients
│       ├── PrintableReport.jsx   # A4 diagnostic PDF print layout
│       └── ReadinessCalculator.jsx # 20-criteria interactive scoring tool
```

### 2.2 Dependencies & Build Health

| Package | Version | Classification | Assessment |
|---|---|---|---|
| `react` | `^19.3.1` | Core Framework | Production-ready modern React with hooks. |
| `react-dom` | `^19.3.1` | Core DOM Renderer | Aligned with React 19. |
| `@tailwindcss/vite` | `^4.3.5` | CSS Build Plugin | Fast v4 compiler. |
| `tailwindcss` | `^4.3.5` | Styling Utility | Modern styling, responsive primitives. |
| `lucide-react` | `^1.71.0` | Iconography | High-quality, lightweight SVG icons. |
| `canvas-confetti` | `^1.9.4` | UI Animation | Used for grant won celebrations. Retain for success states. |
| `vite` | `^8.3.6` | Bundler | Builds clean production bundles in under 13 seconds. |
| `oxlint` | `^1.90.0` | Linter | Passed with 0 errors and 38 minor lint warnings (unused imports, effect deps). |

---

## 3. Detailed Component & Module Audit

### 3.1 State Management & Persistence (`src/App.jsx`)
- **Current State:** Reads from and writes to `localStorage` key `'kia_clients_v2'`. If unpopulated, falls back to `INITIAL_CLIENTS`.
- **Deficiencies:**
  - Zero multi-user support: Changes made by Officer A on one computer are completely invisible to Officer B or the CEO.
  - No transactional safety: Any browser storage purge, incognito browsing, or disk crash wipes operational data.
  - Hardcoded business rules: Fee totals are calculated via `clients.filter(c => c.commitmentFeePaid).length * 200`. Fee amounts cannot be varied or adjusted.
  - Side-effect data corruption: Scoring a client automatically mutates document verification flags (`regVerified: newScores.legal_reg >= 4`), creating false verification claims without physical document review.

### 3.2 Client Data & Pipeline (`src/data/initialClients.js` & `PipelineView.jsx`)
- **Current State:** 14 static clients representing Ghanaian businesses (e.g. Cocoveg Farms, Amacares, Union Farms, Yaapee Royal).
- **Deficiencies:**
  - 10 of 14 clients are stuck in Stage 1 (Onboarding), with no recorded reason for stall.
  - All 14 clients are assigned to a single generic label: `"Lead Consultant (Kia)"`. No individual staff ownership exists.
  - Client stages are single flat strings (`"Stage 1: Onboarding"`, `"Stage 2: Documentation"`, etc.). The model treats the client as having only one linear application, preventing clients from applying to multiple grants simultaneously.
  - `gdriveFolder` is a raw external Google Drive URL. There is no access control, no file status checking, and no link revocation.

### 3.3 Readiness Calculator (`src/data/criteria.js` & `ReadinessCalculator.jsx`)
- **Current State:** Implements 10 pillars and 20 sub-criteria on a 0–5 scale, totaling 100 points, categorized into 4 readiness tiers (Highly Ready, Moderately Ready, Low Readiness, Not Grant-Ready).
- **Strengths:**
  - Excellent domain-specific criteria tailored to the Ghanaian business environment (ORC registration, Form 3, Ghana Card/TIN, corporate bank accounts, 3-year projections, local content, and impact).
  - Clear remediation guidance (`fixAction`) for sub-par metrics.
- **Deficiencies:**
  - When creating a client in `NewClientModal.jsx`, synthetic scores (`legal_reg: 2`, `legal_bank: 2`, etc.) are assigned automatically, violating the core principle: "Never assign default readiness points to new clients without assessment."
  - Lacks evaluator identity, assessment date, evidence cross-referencing, versioning, and N/A handling.
  - Assessment is treated as a single mutable object on the client, rather than an append-only historical audit of diagnostic assessments over time.

### 3.4 Grant Catalogue & Matching Engine (`src/data/grantsData.js` & `GrantMatcher.jsx`)
- **Current State:** 7 hardcoded opportunities (YouStart, Mastercard Foundation HAPPY, NEIP Innovation Fund, TEF, USAID Feed the Future, GIZ develoPPP, KIC AgriTech).
- **Deficiencies:**
  - Matcher operates on naive filters: sector overlap + total score threshold.
  - Fails to check mandatory funder constraints: entity structure (Sole Prop vs LLC vs LBG), age of founder (youth criteria 18–35), geographical operational corridor (e.g. USAID Northern Ghana requirement), or matching capital requirements.
  - No verification of open vs. closed status; dead grant cycles can be presented as active.
  - Lacks official source URLs, funder submission guidelines, and verified deadline timezones.

### 3.5 Client Detail & Modal Controls (`src/components/ClientDetailModal.jsx`)
- **Current State:** Modal allowing toggling of stages, fees, checklists, and red flags.
- **Deficiencies:**
  - Critical financial state is a simple toggle button (`commitmentFeePaid`). No receipt number, payer name, bank/MoMo transaction ID, or finance officer sign-off.
  - Toggling `grantWon` simply triggers `canvas-confetti` animation. No grant award letter upload, no award value record, and no success fee reconciliation.
  - Checklists are flat booleans without reviewer timestamps or attached evidence files.

### 3.6 Printable Report (`src/components/PrintableReport.jsx`)
- **Current State:** Formatted A4 printable diagnostic report with letterhead, score breakdown, and gap analysis.
- **Strengths:**
  - Professional styling, high aesthetic quality, well-regarded by clients.
  - Retain and elevate into an official, signed, versioned diagnostic output backed by database records.

---

## 4. Component Disposition Matrix

| Component / File | Current Role | Disposition | Justification |
|---|---|---|---|
| `src/data/criteria.js` | 100-point scoring framework | **RETAIN & ENHANCE** | Core domain knowledge is solid. Needs N/A policy, versioning, and DB mapping. |
| `src/components/PrintableReport.jsx` | A4 diagnostic report | **RETAIN & REFACTOR** | Structure is clean and professional; refactor to pull verified database records. |
| `src/components/Navbar.jsx` | Top nav and summary metrics | **REFACTOR** | Replace static counters with live database-driven alerts, user session, and role switching. |
| `src/components/PipelineView.jsx` | Kanban & table views | **REFACTOR** | Adapt to support multi-application pipelines, ownership indicators, and SLA/delay flags. |
| `src/components/ReadinessCalculator.jsx` | Interactive scoring UI | **REFACTOR** | Convert to controlled form requiring evidence attachments, evaluator identity, and notes. |
| `src/components/GrantMatcher.jsx` | Basic sector/score filter | **REPLACE** | Replace with explainable rule-based matching engine verifying funder eligibility rules. |
| `src/components/ClientDetailModal.jsx` | Modal client editor | **REPLACE** | Replace with a dedicated Client Case Dossier view (CRM tabs, documents, finance, tasks). |
| `src/components/NewClientModal.jsx` | Popup intake modal | **REPLACE** | Replace with structured Onboarding Wizard (Company, Contact, Engagement, Invoice, Officer). |
| `src/App.jsx` (`localStorage` state) | Client-side state & routing | **REPLACE** | Replace with Supabase client, session auth, RBAC routing, and real-time query layer. |
| `src/data/initialClients.js` | Hardcoded client array | **QUARANTINE & MIGRATE** | Move to staging migration table for unverified recovery and manual reconciliation. |
| `src/data/grantsData.js` | Hardcoded grant list | **MIGRATE TO DATABASE** | Seed into PostgreSQL `grant_opportunities` table with verification status workflow. |

---

## 5. Security & Risk Vulnerabilities

1. **Unauthenticated Public Access:** Anyone loading the URL can view all client business plans, financial projections, and personal contact details.
2. **Insecure Data Storage:** Confidential business information stored in plaintext `localStorage`.
3. **No Row-Level Security (RLS) or RBAC:** No separation between CEO, Team Leader, Officer, Finance, or Client.
4. **Unregulated File Links:** Google Drive links cannot be audited, revoked, or time-delimited, risking data leakage.
5. **No Audit Trail:** Edits and deletions occur silently without actor attribution or historical snapshots.
6. **Data Loss Vulnerability:** Clearing browser cache or switching devices results in permanent data loss.

---

## 6. Audit Verdict & Next Steps

The existing prototype provides a solid visual design language and an excellent readiness diagnostic framework, but completely lacks enterprise data architecture, multi-user access control, task accountability, document verification, and financial controls.

**Phase 0 Architecture & Schema Specifications** must now be formalized in:
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/WORKFLOWS.md`
- `docs/SECURITY.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/TEST_PLAN.md`
- `docs/DEPLOYMENT.md`
- `docs/CHANGELOG.md`

