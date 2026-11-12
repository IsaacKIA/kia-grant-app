# CHANGELOG — KIA Grant Management System 2.0

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
