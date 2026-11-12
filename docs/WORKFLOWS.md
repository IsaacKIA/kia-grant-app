# KIA Grant Management System 2.0 — Standard Operating Workflows

**Document:** Operational State Machines & Automation Specifications  
**Audience:** Operational Staff, Team Leaders, Executive Management & Engineers  
**Date:** November 12, 2026

---

## 1. Client Onboarding & Engagement Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Intake : Client Registration Form
    Intake --> Agreement_Draft : Generate Service Agreement
    Agreement_Draft --> Invoice_Issued : Issue GH₵200 Engagement Fee Invoice
    Invoice_Issued --> Payment_Pending : Awaiting Client Payment
    Payment_Pending --> Payment_Verified : Finance Officer Verifies Receipt/MoMo
    Payment_Verified --> Officer_Assigned : Team Leader Assigns Officer
    Officer_Assigned --> Checklist_Generated : Dynamic Document Checklist Auto-Generated
    Checklist_Generated --> Active_Case : Onboarding Complete
```

### Operational Rules:
- **No Unverified Free Passes:** A case cannot advance to `Active_Case` until payment has been verified by the Finance Officer or CEO.
- **Configurable Fees:** Default is GH₵200 commitment fee, but configurable per client tier (e.g., SME vs Corporate).
- **Mandatory Ownership:** No case can advance without an assigned responsible officer and an explicit next action due date.

---

## 2. Document Collection & Verification Workflow

```mermaid
stateDiagram-v2
    [*] --> Missing : Checklist Requirement Created
    Missing --> Requested : Staff Sends Upload Request Link
    Requested --> Uploaded : Client Submits Files via Token Link
    Uploaded --> Under_Review : System Alerts Assigned Officer
    Under_Review --> Verified : Officer Confirms Legitimacy
    Under_Review --> Correction_Required : Officer Notes Discrepancy
    Correction_Required --> Requested : Client Notified with Specific Fix
    Verified --> Expired : Certificate Reaches Validity End
```

### Automatic Actions:
1. **Upload Trigger:** When a client submits a file via their token link:
   - Document status updates to `Uploaded`.
   - File is stored in Supabase private bucket `grant-documents/{case_id}/{req_id}/...`.
   - A verification task is automatically spawned for the assigned officer (due within 24 hours).
   - Case `last_activity_at` updates to `now()`.
2. **Rejection Safeguard:** When an officer marks a document `Correction_Required`, they **must** specify the exact reason (e.g., "ORC Form 3 page 2 is missing signature"). An automated notification is queued for the client with a refreshed upload link.

---

## 3. Grant Readiness Assessment Workflow

```mermaid
flowchart TD
    A["Initiate Readiness Diagnostic"] --> B["Evaluate 10 Pillars & 20 Sub-Criteria (0-5 Scale)"]
    B --> C["Attach Supporting Documents / Proof to Responses"]
    C --> D["Mark N/A for Irrelevant Criteria with Documented Policy"]
    D --> E["Calculate Normalized Total Score (0-100)"]
    E --> F{"Readiness Tier"}
    F -->|80-100| G["Highly Ready: Target International & Competitive Grants"]
    F -->|60-79| H["Moderately Ready: Target Domestic SME Grants"]
    F -->|40-59| I["Low Readiness: Require Business Structuring & Remediation"]
    F -->|<40| J["Not Ready: Foundational Formalization Required"]
    G & H & I & J --> K["Generate Action Roadmap & Official A4 PDF Report"]
```

### Safeguards:
- Default scores are **never** populated automatically.
- High scores do **not** automatically mark physical documents as verified.
- Readiness scores alone do **not** guarantee grant eligibility.

---

## 4. Grant Opportunity & Matching Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Opportunity_Draft : Research Officer Discovers Grant
    Opportunity_Draft --> Pending_Verification : Official Guidelines & Source URL Attached
    Pending_Verification --> Verified_Open : Team Leader Verifies Source & Dates
    Verified_Open --> Upcoming : Opening Date in Future
    Verified_Open --> Closed : Deadline Passed
    Closed --> Archived : Retained for Historical Matching Records
```

### Explainable Matching Rules:
The system evaluates each open grant against verified case attributes:
1. **Applicant Structure Match:** Company legal type (LLC, Sole Prop, NGO) must match grant criteria.
2. **Sector & Geography Match:** Case sector and operational region must match funder target zones.
3. **Turnover & Age Constraints:** Must satisfy funder operating track record requirements.
4. **Readiness Threshold:** Client score must meet or exceed `grant.min_readiness_score`.
5. **Output:** Clear classification: `Eligible Verified`, `Information Required`, or `Disqualified`, detailing exactly which criteria passed or failed.

---

## 5. Application Preparation & Submission Workflow

```mermaid
stateDiagram-v2
    [*] --> Opportunity_Selected : Matched Grant Formally Adopted
    Opportunity_Selected --> Proposal_Prep : Narrative & Pitch Drafting
    Proposal_Prep --> Budget_Prep : Milestone Financial Budgeting
    Budget_Prep --> Internal_Review : Application Submitted to QA Gate
    Internal_Review --> Revisions_Needed : QA Team Leader Flags Issues
    Revisions_Needed --> Proposal_Prep : Revisions Executed
    Internal_Review --> Client_Confirmed : Client Approves Final Draft
    Client_Confirmed --> Approved_For_Submission : Team Leader Grants Final Approval
    Approved_For_Submission --> Submitted : Officer Submits on Funder Portal
    Submitted --> Under_Funder_Review : Funder Acknowledges Receipt
    Under_Funder_Review --> Awarded : Official Award Notice Received
    Under_Funder_Review --> Rejected : Rejection Notice Received
```

### Critical Submission Safeguards:
- An application **cannot** be marked `Approved_For_Submission` unless:
  - All mandatory grant documents are verified.
  - Team Leader QA sign-off is logged in `application_reviews`.
  - Client confirmation timestamp is recorded.
- An application **cannot** be marked `Submitted` without:
  - Funder submission reference number.
  - Attached submission confirmation screenshot/receipt.
  - Submitting officer attribution and timestamp.

---

## 6. Team Tasks & Multi-Level Escalation Engine

```mermaid
flowchart TD
    T["Active Task Created with Due Date"] --> CHK{"Deadline Check"}
    CHK -->|On Schedule| OK["Task In Progress"]
    CHK -->|Due Today| ALERT1["Officer Dashboard: Due Today Alert"]
    CHK -->|1 Working Day Overdue| ESC1["Escalation Level 1: Alert Team Leader"]
    CHK -->|3 Working Days Overdue| ESC2["Escalation Level 2: Alert CEO & Flag Inactive Case"]
    ESC1 --> REASSIGN["Team Leader Reassigns or Intervenes"]
    ESC2 --> MGMT["Executive Intervention & Resource Reallocation"]
```

### Inactivity Detection:
- Active cases with no logged audit events, document updates, or task completions for >7 days trigger a warning to the officer.
- Cases inactive for >14 days are flagged on the CEO Dashboard as **Bottlenecks Requiring Intervention**.

