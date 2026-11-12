# CHANGELOG — KIA Grant Management System 2.0

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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

