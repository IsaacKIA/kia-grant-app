# KIA Grant Management System 2.0 — Standard Operational Runbook

**Practice Location:** Accra, Greater Accra Region, Ghana  
**Practice Entity:** KIA-START UP CONSULT LTD  
**System Version:** 2.5.0-final  
**Effective Date:** November 2026  
**Audience:** All Staff (Management, Team Leader, Grant Officers, Finance & Administration)

---

## 1. Executive Summary & Purpose

This Standard Operational Runbook governs the daily use of **KIA Grant Management System 2.0**.  
The system is built on an enterprise hybrid operating model:
- **Internal Staff Management:** Research, screening, readiness diagnostic assessments, narrative & budget preparation, supervisory QA, submission, and follow-up.
- **Client Secure Access:** Password-less, cryptographic upload links (`?token=tok_live_...`) to submit documents, review required corrections, and receive updates without password friction.

---

## 2. Staff Roles & Segregation of Duties

| Staff Member | System Role | Primary Responsibilities | Non-Negotiable Boundary |
| :--- | :--- | :--- | :--- |
| **Kwame Boateng** | Founder / CEO (`ceo`) | High-level practice supervision, final approval of Level 2 escalations, commercial fee policies, quarterly strategy. | Has full administrative override, but must preserve immutable audit trail. |
| **Abena Osei** | Grant Application Team Leader (`team_leader`) | Daily task assignment, Level 1 escalation resolution, mandatory 5-point Internal QA Review gate sign-off, proposal quality assurance. | Only Abena or Kwame can approve proposals for submission. Officers cannot approve their own drafts. |
| **Kofi Mensah** | Senior Grant Officer (`application_officer`) | Client case ownership, onboarding interviews, document inspection & verification, proposal drafting, submission evidence recording. | Cannot verify fee payments; cannot approve internal QA without Team Leader sign-off. |
| **Efua Addo** | Grant Application Officer (`application_officer`) | Client case ownership, document inspection, proposal drafting, client follow-up, evidence logging. | Same operational boundaries as Kofi Mensah. |
| **Emmanuel Darko** | Finance & Admin Officer (`finance_officer`) | Invoicing (engagement fees & success fees), MoMo & bank transaction reconciliation, fee verification. | **Exclusive Authority:** Only Emmanuel or the CEO can verify payments and clear financial ledgers. |

---

## 3. Daily Standard Operating Routine

### 08:30 GMT — Morning Operations Routine
1. **Team Leader (Abena Osei):**
   - Open **Executive Radar** (`ceo_dashboard`).
   - Check **Tasks & Accountability** tab for Level 1 escalations (>1 business day overdue) and reassign or intervene immediately.
   - Check **Documents Hub** for pending files uploaded overnight.
2. **Grant Officers (Kofi & Efua):**
   - Open **Tasks & Accountability** -> Filter: "My Tasks".
   - Address "Due Today" and "Overdue" tasks as highest priority.
   - Inspect newly uploaded client documents in "Under Review Queue".
3. **Finance Officer (Emmanuel Darko):**
   - Open **Finance Desk** -> Tab: "Payment Receipts".
   - Check "Pending Verification Queue" against MTN Mobile Money merchant portal and GCB online banking alerts.
   - Clear verified payments with reference audit notes.

---

## 4. Operational Workflows & Protocols

### 4.1 Client Intake & Engagement Protocol
1. Client arrives via referral, consultation, or website.
2. Officer opens **Client CRM** -> Clicks **"Onboard Client"**.
3. Complete Step 1 (Organization), Step 2 (Founder Details), and Step 3 (Assignment & Fees).
   - **Crucial Rule:** Never enter synthetic or default scores. New cases start with unverified status.
4. Issue Initial Engagement Fee Invoice (GH₵ 200).
5. Open case dossier -> Documents Tab -> Click **"Generate Client Upload Link"**.
6. Send the generated cryptographic URL to client via WhatsApp or Email.

### 4.2 Document Inspection & Verification Protocol
1. Client submits documents via their secure link.
2. Officer opens **Documents Hub** -> "Under Review Queue".
3. Click **"Review / Audit"** on the target document.
4. Inspect against strict criteria:
   - **ORC/RGD Certificate:** Must show valid Form 3 annual renewal.
   - **Bank Statements:** Must be official bank-stamped reflecting consecutive 12 months.
   - **TIN/Ghana Card:** Must match registered company directors.
5. If compliant: Click **"Verify Document"** (audited with officer stamp).
6. If deficient: Click **"Request Correction"**, specify exact reason (e.g. *"Uploaded statement is missing pages 3-5"*), which triggers a client update.

### 4.3 20-Metric Readiness Assessment Protocol
1. Access **Readiness Diagnostic** (`calculator`).
2. Select client case.
3. Assess all 10 pillars (20 metrics) strictly against verified evidence.
4. For criteria where the client entity is exempt by law or funder rules, select **Not Applicable (N/A)** with written justification.
5. Save assessment with assessor electronic attribution.
6. Print/Export official A4 **Diagnostic Report** for client delivery.

### 4.4 Explainable Grant Matching & Adoption
1. Access **Grant Matcher** (`matcher`).
2. Select client case. The engine executes deterministic rule evaluation across:
   - Sector alignment.
   - Entity legal structure (SME vs NGO vs Cooperative).
   - Regional geographic boundaries (e.g. USAID Northern Ghana mandate).
   - Readiness score threshold.
   - Document completeness.
3. Review transparent "Satisfied Criteria" and "Outstanding Gaps".
4. When aligned, click **"Adopt Opportunity"** to launch application acquisition.

### 4.5 Proposal Preparation & Internal QA Review Gate
1. Officer moves application through:
   - `opportunity_selected` -> `proposal_drafting` -> `budget_prep` -> `internal_qa`.
2. When ready for submission, officer submits application to **Internal QA Gate**.
3. **Team Leader (Abena Osei)** inspects:
   - RFP call alignment.
   - Budget consistency with narrative milestones.
   - Supporting document attachments.
   - Formatting and presentation.
4. If revisions needed: Team Leader rejects with actionable corrective tasks.
5. If approved: Team Leader marks **"Approved for Submission"**.

### 4.6 Submission Evidence Recording (Zero Lost Submissions)
1. Officer submits proposal on funder portal or delivers physical dossier.
2. Officer opens **Applications Pipeline** -> Click **"Record Submission"**.
3. **Mandatory Fields:**
   - Official Funder Confirmation Reference Number (e.g. `GIZ-GH-2026-98124`).
   - Official Submission Portal URL.
   - Funder Acknowledgement PDF / Confirmation Email Screenshot.
4. The system permanently transitions case to "Submitted to Funder" and dispatches a follow-up task.

### 4.7 Grant Outcome & Success Fee Trigger
1. Upon funder award letter receipt:
   - Officer opens application -> Click **"Record Outcome"** -> Select "Awarded".
   - Enter verified award amount (e.g. GH₵ 150,000).
2. The system triggers celebratory feedback and automatically creates:
   - An official **5% Contractual Success Fee Invoice** in the Finance Desk.
   - An urgent collection and reconciliation task assigned to Emmanuel Darko.

---

## 5. Automated Background Surveillance & Alert Responses

The system continuously scans operations via `automationService`:

| Trigger Condition | Automatic System Action | Mandatory Staff Response |
| :--- | :--- | :--- |
| **Case Inactivity > 7 Days** | Inactivity warning badge applied in CRM. | Assigned officer must contact client or document valid waiting reason. |
| **Case Inactivity > 14 Days** | **Critical CEO Escalation** task dispatched to Kwame & Abena. | Team Leader convenes case review; determines case reactivation or formal closure. |
| **Application Deadline < 14 Days** | Priority promoted to High. | Officer confirms narrative and budget timeline with client. |
| **Application Deadline < 3 Days** | Priority promoted to Urgent; Team Leader notified. | Proposal must enter Internal QA within 24 hours. |
| **Client Documents Incomplete > 3 Days** | Missing document chase trigger logged. | Officer issues WhatsApp/SMS reminder with fresh upload link. |

---

## 6. Backup, Security & Disaster Recovery

1. **Daily Operational State:** Stored centrally in Supabase PostgreSQL with local offline fallback.
2. **Local Backup Export:**
   - At 17:00 GMT daily, Finance/Admin exports full system state via Executive Radar -> System Backup.
3. **Ghana Data Protection Act (Act 843):**
   - Client financial records and Ghana Card images are strictly protected.
   - Client upload links expire automatically after 72 hours.
   - Every staff action, document inspection, fee verification, and status change is immutably logged with actor identity, timestamp, and details in the audit ledger.

---

*KIA Grant Management System 2.0 • Confidential & Proprietary to KIA-START UP CONSULT LTD • Accra, Ghana*
