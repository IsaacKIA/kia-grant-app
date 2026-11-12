# KIA Grant Management System 2.0 — Security & Data Protection Specification

**Standard:** Enterprise Security, Role-Based Access Control & Ghana Data Protection Compliance  
**Author:** Cybersecurity and Data Protection Engineer  
**Date:** November 12, 2026

---

## 1. Compliance with Ghana Data Protection Act (Act 843)

KIA-Start Up Consult processes sensitive corporate financial statements, tax records, identification cards (Ghana Cards, Passports), and intellectual property. The system implements controls to satisfy the 8 principles of Act 843:

1. **Accountability:** Full audit trail for all data processing actions.
2. **Lawfulness of Processing:** Client consent captured at onboarding with explicit terms of service.
3. **Specification of Purpose:** Documents collected strictly for grant eligibility and application readiness.
4. **Compatibility of Further Processing:** Client data cannot be shared across unauthorized third parties or other clients.
5. **Quality of Information:** Evidence-based verification workflows ensure data accuracy.
6. **Openness & Transparency:** Clients receive clear notices regarding document requests and statuses.
7. **Security Safeguards:** Cryptographic encryption at rest and in transit, strict access control, and hashed token authorization.
8. **Data Subject Participation:** Clients can review requested and verified documentation.

---

## 2. Authentication & Authorization

### 2.1 Staff Authentication
- Handled via Supabase Auth with secure JWT tokens.
- Passwords must meet minimum complexity (minimum 10 characters, upper/lower, numbers, special characters).
- Sessions expire after inactivity; refresh tokens rotated securely in `HttpOnly` cookies.
- MFA (TOTP) supported and recommended for CEO and Admin roles.

### 2.2 Role-Based Access Control (RBAC) Matrix

| Resource / Action | CEO / Admin | Team Leader | Application Officer | Finance Officer | Client (via Token) |
|---|---|---|---|---|---|
| View CEO Dashboard & Aggregate Metrics | **Full** | Workload Only | No | Financial Only | No |
| Create & Edit Clients / Organizations | **Full** | **Full** | Assigned Only | Read Only | No |
| Assign / Reassign Cases | **Full** | **Full** | No | No | No |
| Request Client Documents | **Full** | **Full** | Assigned Only | No | No |
| Upload Documents via Secure Link | No | No | No | No | **Assigned Link Only** |
| Verify / Reject Documents | **Full** | **Full** | Assigned Only | No | No |
| Conduct Readiness Assessment | **Full** | **Full** | Assigned Only | No | No |
| Create & Verify Grant Opportunities | **Full** | **Full** | Create Draft | View Only | No |
| Submit Application to QA Gate | **Full** | **Full** | Assigned Only | No | No |
| QA Approval for Submission | **Full** | **Full** | No | No | No |
| Record Submission Reference & Evidence | **Full** | **Full** | Assigned Only | No | No |
| Issue Invoices & Record Payments | **Full** | View Only | View Only | **Full** | No |
| Verify Payments & Reconcile Balances | **Full** | No | No | **Full** | No |
| View System Audit Logs | **Full** | Team Events | Assigned Events | Financial Events | No |

---

## 3. Row Level Security (RLS) Implementation

All tables have RLS enabled:
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
```

### Example RLS Policy for Cases:
```sql
-- CEO, Admin, Team Leader can see all cases
CREATE POLICY staff_case_access ON cases
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM staff_users 
        WHERE staff_users.id = auth.uid() 
        AND staff_users.role IN ('ceo', 'admin', 'team_leader', 'finance_officer')
    )
    OR current_officer_id = auth.uid()
);
```

---

## 4. Secure Client Upload Token Architecture

To ensure clients can upload documents securely without passwords:

1. **Token Generation:** The server generates a 256-bit unguessable random string using a cryptographically secure pseudorandom number generator:
   ```javascript
   const rawToken = crypto.randomBytes(32).toString('hex');
   ```
2. **One-Way Hashing:** The system computes the SHA-256 hash of `rawToken` and stores only the hash in the `upload_requests` table:
   ```javascript
   const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
   ```
3. **Time-To-Live (TTL):** Default token expiration is 72 hours (`expires_at = now() + interval '72 hours'`).
4. **Scope Limitation:** The token is linked strictly to a single `case_id` and specific requested `target_requirements`.
5. **Single-Use Revocation:** Tokens can be revoked at any time by staff, and expire automatically after successful upload or upon manual cancellation.
6. **Brute Force Defense:** Token lookup endpoints enforce strict IP rate-limiting (maximum 5 failed lookups per minute).

---

## 5. Storage Security & File Handling

- **Private Storage Bucket:** Files reside in a dedicated private Supabase storage bucket (`grant-documents`). Public read access is strictly disabled.
- **Allowed MIME Types:** `.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`, `.xlsx`. Executable files (`.exe`, `.bat`, `.js`, `.sh`, `.vbs`) are rejected immediately.
- **Size Limits:** Maximum 25MB per document to prevent denial-of-service.
- **Access via Signed URLs:** Download links are signed URLs with a maximum lifespan of 15 minutes, generated only for authorized staff members.
- **Path Isolation:** Files are named with unique UUIDs and organized by tenant case:
  `grant-documents/{case_id}/{requirement_id}/{uuid}-{sanitized_filename}`

---

## 6. Audit Trail & Non-Repudiation

The `audit_events` table maintains an immutable ledger of critical system operations:
- Every payment verification, document rejection, readiness score change, application QA approval, and task reassignment creates an audit event.
- Captured metadata: Actor ID, role, action, target entity, timestamp, IP address, user agent, before-and-after JSON state snapshots.
- Direct updates or deletions on `audit_events` are blocked by PostgreSQL database triggers.

