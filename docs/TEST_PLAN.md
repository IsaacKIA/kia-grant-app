# KIA Grant Management System 2.0 — Quality Assurance & Test Plan

**Scope:** Unit, Integration, Security, and End-to-End Operational Validation  
**Author:** QA and Testing Engineer  
**Date:** November 12, 2026

---

## 1. Quality Assurance Strategy

The KIA Grant Management System 2.0 enforces strict operational accountability and financial integrity. The testing strategy combines:
1. **Automated Unit Tests:** Pure functions (scoring, completeness, deadline diffs, fee balances).
2. **Database Integration Tests:** Foreign key integrity, RLS policies, trigger executions, audit trails.
3. **Security Test Cases:** Cross-client isolation, token expiration/revocation, file injection defense.
4. **End-to-End Operational Scenarios:** Simulating realistic day-to-day staff and client activities in Accra.

---

## 2. Unit Testing Matrix

| Test Suite | Target Function / Module | Test Conditions & Assertions |
|---|---|---|
| `UT-SCORE-01` | `calculateReadiness()` | Sub-criteria scores 0–5 sum correctly to 100 points maximum. |
| `UT-SCORE-02` | `calculateReadiness()` | Assigns correct tier label (Highly Ready, Moderately Ready, Low Readiness, Not Ready). |
| `UT-SCORE-03` | `calculateReadiness()` | Correctly identifies all criteria with score < 4 as gap items with appropriate fix action. |
| `UT-DOC-01` | Document Completeness | Calculates received, verified, missing, and expired percentages accurately. |
| `UT-DOC-02` | Mandatory vs Optional | Rejects application advancement if mandatory documents are missing, regardless of optional count. |
| `UT-FIN-01` | Balance Calculation | Invoice `amount_due - amount_paid = outstanding_balance`; handles partial payments. |
| `UT-TIME-01` | Escalation Timers | Calculates working days elapsed excluding weekends and Ghanaian national holidays. |
| `UT-MATCH-01` | Eligibility Matching | Evaluates rules (sector, legal type, minimum score, age constraints) without false positives. |

---

## 3. Security & Access Control Test Cases

| Test ID | Vulnerability Tested | Test Procedure | Expected Result |
|---|---|---|---|
| `SEC-AUTH-01` | Unauthenticated API Access | Call REST endpoints without JWT authorization header. | Returns `401 Unauthorized`. |
| `SEC-RLS-01` | Cross-Client Isolation | Officer A attempts to query cases assigned exclusively to Officer B. | Query returns only Officer A's cases. |
| `SEC-RLS-02` | Financial Role Protection | Application Officer attempts to update `payments.status = 'verified'`. | RLS or trigger blocks execution with `403 Forbidden`. |
| `SEC-TOK-01` | Expired Upload Token | Access `/upload?token=...` with expired timestamp. | Displays "Link has expired. Please contact your grant officer." |
| `SEC-TOK-02` | Revoked Upload Token | Staff revokes token; client immediately attempts upload. | Request rejected with revocation notice. |
| `SEC-FILE-01` | Malicious File Type | Client attempts to upload `exploit.exe` or `script.js`. | Client-side and server-side validation reject file; only allowed MIME types accepted. |
| `SEC-AUDIT-01` | Tamper-Resistant Log | Direct SQL update attempted on `audit_events`. | PostgreSQL trigger raises exception blocking modification. |

---

## 4. End-to-End Operational Scenarios

### Scenario 1: New Client Full Lifecycle
- **Action:** Officer registers "Adwumapa Agro Ent."
- **Expected Flow:** Service agreement generated -> GH₵200 invoice issued -> Client pays via MTN MoMo -> Finance Officer verifies payment -> Team Leader assigns officer -> Dynamic checklist populated.
- **Pass Criteria:** Case transitions to `Active_Case` with clear officer ownership and next action date.

### Scenario 2: Missing Documents & Follow-Up
- **Action:** Client fails to upload ORC Form 3 after 3 days.
- **Expected Flow:** System flags document as `Missing` -> Generates upload token link -> Sends reminder notice -> Updates next follow-up date -> Creates task for officer.
- **Pass Criteria:** Document stall is clearly visible on Team Leader and Officer dashboards.

### Scenario 3: Inactive Officer & Multi-Level Escalation
- **Action:** Assigned officer fails to review uploaded business plan for 3 working days.
- **Expected Flow:** Day 1 overdue: Task flagged yellow; Team Leader receives alert. Day 3 overdue: Task escalates to Level 2 (Red); surfaces prominently on CEO Dashboard.
- **Pass Criteria:** Team Leader can reassign the task or case with logged reassignment reason.

### Scenario 4: Grant Application Quality Assurance & Submission
- **Action:** Officer completes proposal for GEA / World Bank YouStart.
- **Expected Flow:** Officer submits draft to QA gate -> Team Leader reviews and approves -> Client confirms details -> Officer submits on official GEA portal -> Officer uploads submission confirmation receipt and enters reference number.
- **Pass Criteria:** System strictly blocks `Submitted` status until valid receipt image and reference number are saved.

### Scenario 5: Multiple Simultaneous Applications
- **Action:** Single client "Amacares" applies for both Mastercard Foundation HAPPY and Tony Elumelu Foundation.
- **Expected Flow:** Two independent application records exist under the same case, with distinct deadlines, assigned officers, submission statuses, and outcomes.
- **Pass Criteria:** Progress in one application does not overwrite or interfere with the other.

### Scenario 6: Staff Reassignment with Intact History
- **Action:** Team Leader reassigns 5 cases from Departing Officer to New Officer.
- **Expected Flow:** `case_assignments` logs change; all historical audit logs, uploaded documents, and completed tasks remain attributed to previous officer; new pending tasks route to New Officer.
- **Pass Criteria:** Zero data loss or history truncation.

### Scenario 7: Financial Verification & Success Fee Trigger
- **Action:** Client awarded GH₵250,000 grant.
- **Expected Flow:** Award letter uploaded -> Outcome marked `Awarded` -> System calculates 5% contractual success fee (GH₵12,500) -> Draft invoice generated -> Finance notified.
- **Pass Criteria:** Clear financial ledger entry created without manual calculation errors.

### Scenario 8: Failed Notification Resilience
- **Action:** Transactional email provider returns HTTP 500.
- **Expected Flow:** System logs failure in `automation_executions` -> Retries with exponential backoff -> Prevents duplicate notification if successful on retry.
- **Pass Criteria:** Idempotency preserved; no duplicate emails sent to client.
