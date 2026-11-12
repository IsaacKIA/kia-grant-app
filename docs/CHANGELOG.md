# CHANGELOG — KIA Grant Management System 2.0

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0-final] - 2026-11-12

### Added
- **Automated End-to-End Operational Verification Suite (`src/tests/e2eVerification.js`)**:
  - Validates all 8 core business scenarios defined in `docs/TEST_PLAN.md` programmatically.
  - 29 out of 29 operational assertions executed with 100% pass rate.
  - Added `"test": "vite-node src/tests/e2eVerification.js"` to `package.json`.
- **Standard Operational Runbook (`docs/OPERATIONAL_RUNBOOK.md`)**:
  - Comprehensive standard operating procedures for Accra practice operations (Founder/CEO Kwame Boateng, Team Leader Abena Osei, Officers Kofi Mensah and Efua Addo, Finance Officer Emmanuel Darko).
  - Protocols for daily morning review, client intake, document verification, readiness assessment, grant matching, internal QA gate, verifiable submission recording, fee reconciliation, and disaster recovery.
- **Executive Handover Report**:
  - Detailed system transformation documentation and architectural specifications prepared for executive leadership.

## [2.4.0-phase4] - 2026-11-12

### Added
- **Finance, Invoicing & Segregation of Duties Engine (`src/services/financeService.js`, `src/components/FinanceDeskView.jsx`)**:
  - Centralized accounting & fee reconciliation ledger with separation of duties: only Finance Officer Emmanuel Darko or the CEO can verify payments and clear ledgers.
  - Onboarding engagement fee management with configurable baseline (GH₵ 200).
  - Contractual success fee invoicing (3–10%, default 5%) tied to verified grant award outcomes.
  - Official commercial invoice generation with professional KIA-START UP CONSULT letterhead, tax/fee itemization, MTN MoMo merchant number, and GCB Bank account details.
  - Printable / PDF invoice document modal.
  - Payment receipt capture and verification audit desk for MoMo and bank transaction references.
- **Autonomous Operational Background Radar (`src/services/automationService.js`, `src/components/AutomationControlView.jsx`)**:
  - Scheduled background surveillance policies simulating cron/worker execution.
  - Case dormancy scanner flagging inactive cases at >7 days (Warning) and >14 days (Critical CEO Escalation creating immediate intervention tasks).
  - Grant submission deadline countdown radar issuing high-priority alerts at 14d, 7d, 3d, and 1d to funder closing dates.
  - Missing document chase trigger for clients onboarded >3 days with incomplete checklists.
  - "Run Scheduled Audit Now" interactive simulator with live telemetry metrics and execution findings trace.
- **Executive & Operational Reporting Suite (`src/components/OperationalReportsView.jsx`)**:
  - Daily Operational Briefing: active case count, overdue task escalation breakdown, document queues, and day-start priorities.
  - Weekly Operational Velocity Digest: applications in preparation, verified submissions, grants awarded, and team velocity.
  - Monthly Strategic Management Review: pipeline conversion rates, realized vs projected revenue, compliance integrity, and official executive electronic sign-offs.
  - Full print/export styling formatted for board meetings and executive review.

## [2.3.0-phase3] - 2026-11-12

### Added
- **Verified Grant Opportunity Catalogue (`src/services/grantService.js`, `src/components/GrantCatalogueView.jsx`)**:
  - Centralized database of donor grant programs with mandatory verification workflows (`verified_open`, `upcoming`, `pending_verification`, `closed`).
  - Pre-vetted high-profile funding opportunities (Mastercard Foundation Africa, USAID Feed the Future, GIZ Agribusiness, Tony Elumelu Foundation, AfDB AFAWA, GEPA Export Support).
  - Mandatory official source URL and verification audit tracking before opportunities can be matched.
  - Granular eligibility criteria matrices (sectors, applicant entity types, regional geographic restrictions, turnover brackets, readiness thresholds).
- **Explainable Rule-Based Matching Engine (`src/services/matchingService.js`, `src/components/GrantMatcher.jsx`)**:
  - Deterministic qualification evaluation (Highly Qualified, Qualified, Information Required, Disqualified) replacing arbitrary score guessing.
  - Transparent rule-by-rule breakdowns identifying specific criteria passed, documentation gaps, and hard disqualifiers (e.g. USAID Northern Ghana geographic mandate).
  - Direct 1-click adoption of matched grants into active client preparation cases.
- **Enterprise Grant Application Pipeline (`src/services/applicationService.js`, `src/components/ApplicationPipelineView.jsx`)**:
  - 8-stage operational acquisition workflow: `opportunity_selected` → `eligibility_confirmed` → `proposal_drafting` → `budget_prep` → `internal_qa` → `submitted` → `under_funder_review` → `awarded`/`unsuccessful`.
  - Dual view modes: Interactive drag-and-drop styled Kanban Board and structured Data Table.
  - Search and officer assignment filters with live stage counts.
- **Internal Quality Assurance (QA) Gate Desk (`src/components/QaReviewModal.jsx`)**:
  - Strict supervisory sign-off mechanism reserved for Team Leader (Abena Osei) and CEO (Kwame Boateng).
  - 5-point formal quality checklist: RFP compliance, budget-narrative consistency, verified supporting documents, formatting & presentation, and risk review.
  - Revision request workflow with mandatory actionable corrective feedback sent to the drafting officer.
- **Verifiable Submission Record Desk (`src/components/SubmissionRecordModal.jsx`)**:
  - Proof-of-submission requirement: officer must supply official funder submission confirmation code, submission timestamp, portal URL, and proof document before an application can be transitioned to "Submitted".
  - Strictly prevents "lost" or unverified application submissions.
- **Contractual Success Fee Trigger Desk**:
  - When an application achieves "Awarded" status, an official 5% contractual success fee invoice is automatically created in the finance ledger with celebratory confetti feedback.

## [2.2.0-phase2] - 2026-11-12

### Added
- **Intelligent Document Hub Service (`src/services/documentService.js`)**: Dynamic document requirement templates based on applicant type (SME, Startup, NGO, Cooperative, Individual), case requirement generation, and real-time completeness percentage calculators.
- **Cryptographic One-Time Upload Link System**: Time-limited (72h) random token generator (`/upload?token=...`), SHA-256 token hashing, token revocation, and rate-limited token validation.
- **Client-Facing Secure Upload Portal (`src/components/ClientUploadPortal.jsx`)**: Password-less, mobile-optimized upload portal for clients with drag-and-drop file uploader, file format validation, and client remark attachments.
- **Staff Document Verification Desk (`src/components/DocumentReviewModal.jsx`, `src/components/DocumentHubView.jsx`)**: Comprehensive inspection desk enabling officers to verify compliant documents or issue detailed correction notices (triggering client follow-up).
- **Dossier Embedded Checklist (`src/components/CaseDossierModal.jsx`)**: Dynamic checklist tab inside every client case dossier, live completeness progress bar, and 1-click client link generator.
- **Evidence-Based Readiness Assessment Engine (`src/services/readinessService.js`, `src/components/ReadinessCalculator.jsx`)**:
  - Enforced assessor staff attribution (assessor ID, role, assessment date).
  - Implemented Not-Applicable (N/A) policy with documented justifications.
  - Linked criteria evaluations directly to supporting document references.
  - Full historical assessment snapshots.
- **Official A4 Diagnostic Report Refactor (`src/components/PrintableReport.jsx`)**: Official letterhead diagnostic audit backed by live assessment records, prioritized gap roadmap, and electronic assessor sign-off block.

## [2.1.0-phase1] - 2026-11-12

### Added
- **Supabase Client & Local Service Layer (`src/lib/supabase.js`)**: Direct typed client for PostgreSQL with automatic fallback adapter for offline development.
- **PostgreSQL Core Schema Migration (`supabase/migrations/20261112000001_core_schema.sql`)**: 32 relational tables, custom enums, foreign keys, and triggers.
- **Staff Authentication & RBAC Switcher (`src/services/authService.js`, `src/components/RoleSwitcherBar.jsx`)**: Active session management across 5 roles (CEO Kwame Boateng, Team Leader Abena Osei, Officers Kofi Mensah and Efua Addo, Finance Officer Emmanuel Darko).
- **Client Relationship Management (CRM) (`src/services/crmService.js`, `src/components/CrmCasesView.jsx`)**: Centralized repository of applicant organizations, contact information, case status tracking, and duplicate client detection.
- **Multi-Step Client Intake Wizard (`src/components/NewClientIntakeModal.jsx`)**: Professional 3-step registration wizard (Organization -> Founder -> Assignment/Fee) strictly eliminating synthetic default scores.
- **Client Case Dossier (`src/components/CaseDossierModal.jsx`)**: Replaced prototype modal with full tabbed case manager (Overview, Mandatory Action Plan, Engagement Fee Ledger & Verification, Tasks, Audit History).
- **Team Tasks & Escalation Engine (`src/services/taskService.js`, `src/components/TasksView.jsx`)**: Complete operational workbench with "My Tasks", "Due Today", "Overdue", and automated Level 1 (Team Leader, 1d) and Level 2 (CEO, 3d) escalations with mandatory completion evidence.
- **CEO Management Control Center (`src/services/dashboardService.js`, `src/components/CeoDashboardView.jsx`)**: 30-second operational radar tracking active velocity, overdue workload, inactivity flags (>7d), verified fee revenue, and staff workload distribution.
- **Legacy Client Recovery Desk (`src/services/legacyRecoveryService.js`, `src/components/LegacyRecoveryView.jsx`)**: Quarantined staging and audit workbench for the 14 baseline clients, enabling structured evidence reconciliation before live case activation.
- **Immutable Audit Service (`src/services/auditService.js`)**: Real-time logging of user actions, state transitions, fee verifications, and case reassignments.

## [2.0.0-phase0] - 2026-11-12

### Added
- **Phase 0 Comprehensive Project Audit (`docs/PROJECT_AUDIT.md`)**: Full evaluation of existing prototype, technical debt, vulnerabilities, and component disposition matrix.
- **Target Architecture Specification (`docs/ARCHITECTURE.md`)**: Hybrid client-upload & staff-managed system, Supabase PostgreSQL, private storage, and automation architecture.
- **Database Schema & DDL Specification (`docs/DATABASE_SCHEMA.md`)**: Complete 32-entity relational PostgreSQL schema with UUID keys, RLS, triggers, and audit logging.
- **Operational Workflows Specification (`docs/WORKFLOWS.md`)**: Detailed state machines for client onboarding, document verification, readiness assessment, grant matching, application QA, and task escalation.
- **Security & Data Protection Specification (`docs/SECURITY.md`)**: Ghana Data Protection Act (Act 843) compliance, RBAC matrix, token-based upload security, and immutable audit trails.
- **Implementation Roadmap (`docs/IMPLEMENTATION_PLAN.md`)**: Phased WBS (Phases 0 through 5) with concrete milestones and acceptance criteria.
- **Quality Assurance & Test Plan (`docs/TEST_PLAN.md`)**: Unit, integration, security test matrices, and 8 operational end-to-end scenarios.
- **Deployment & Operations Guide (`docs/DEPLOYMENT.md`)**: Hosting, environment variables, database migrations, storage policies, and backup/disaster recovery guidelines.
- **Git Version Control Baseline**: Initialized git repository and created root commit (`b628691`) preserving baseline prototype state.

### Analyzed & Quarantined
- Identified 14 hardcoded legacy clients in `src/data/initialClients.js` requiring migration staging and manual evidence verification before live activation.
- Flagged unverified `commitmentFeePaid` flags and default readiness score injection in `NewClientModal.jsx`.
- Verified that existing build compiles cleanly with zero errors via Vite 8.3.

