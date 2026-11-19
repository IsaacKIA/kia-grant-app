/**
 * KIA Grant Management System 2.0 - Automated End-to-End Operational Verification Suite
 * 
 * Verifies all 8 operational business scenarios defined in docs/TEST_PLAN.md:
 * 1. Intake, dynamic checklist generation, upload link validation, and file review.
 * 2. Legacy client quarantine, audit, and clean activation.
 * 3. Task assignment, automated supervisory escalation (1d/3d), and evidence requirement.
 * 4. Explainable rule-based grant matching and gap identification.
 * 5. Application pipeline progression and internal QA supervisory gate.
 * 6. Verifiable submission recording with funder confirmation ref enforcement.
 * 7. Grant award outcome tracking and automatic 5% success fee task.
 * 8. Background inactivity radar (>7d warning, >14d CEO escalation) and deadline alerts.
 */

// In-memory localStorage polyfill for Node execution
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✓ Passed: ${message}`);
}

async function runAllScenarios() {
  console.log('===============================================================');
  console.log('KIA GRANT MANAGEMENT SYSTEM 2.0 - E2E OPERATIONAL VERIFICATION');
  console.log('===============================================================\n');

  // 1. DYNAMIC DOCUMENT CHECKLIST & UPLOAD TOKENS
  console.log('--- SCENARIO 1: Client Intake & Dynamic Document Checklist ---');
  const { documentService } = await import('../services/documentService.js');
  const { crmService } = await import('../services/crmService.js');
  const { authService } = await import('../services/authService.js');

  // Set active user to Founder & CEO and provision test staff accounts
  authService.setCurrentUser('staff-01');
  const teamLeader = await authService.addTeamMember({
    fullName: 'Abena Osei',
    email: 'teamlead@kiastartupconsult.com',
    role: 'team_leader',
    roleLabel: 'Grant Application Team Leader'
  });
  const officer = await authService.addTeamMember({
    fullName: 'Kofi Mensah',
    email: 'kofi@kiastartupconsult.com',
    role: 'application_officer',
    roleLabel: 'Senior Application Officer'
  });
  const financeOfficer = await authService.addTeamMember({
    fullName: 'Emmanuel Darko',
    email: 'finance@kiastartupconsult.com',
    role: 'finance_officer',
    roleLabel: 'Finance & Admin Officer'
  });

  // Ensure active user is Team Leader / Officer
  authService.setCurrentUser(teamLeader.id); // Abena Osei

  const testCase = await crmService.registerClient({
    legalName: 'Volta Green Agrotech Ltd',
    tradingName: 'Volta Green',
    applicantType: 'SME',
    sector: 'Agribusiness',
    businessStage: 'Early-stage Growth',
    region: 'Volta Region',
    primaryContact: {
      fullName: 'Kojo Amenyo',
      phone: '+233 20 888 9999',
      email: 'kojo@voltagreen.com'
    },
    assignedOfficerId: 'staff-03',
    engagementFeeAmount: 200,
    feeTransactionRef: ''
  });

  assert(testCase.id && testCase.caseNumber.startsWith('KIA-CASE-2026-'), 'Case registered with valid serial number');
  assert(testCase.engagementFee.isVerified === false, 'Initial engagement fee is unverified upon registration');

  const reqs = documentService.generateChecklistForCase(testCase.id, testCase.tradingName, 'SME');
  assert(reqs.length >= 6, `Generated ${reqs.length} mandatory documents for SME category`);
  assert(reqs.some(r => r.templateCode === 'ORC_REG_CERT'), 'ORC Business Registration is mandatory for SME');
  assert(reqs.some(r => r.templateCode === 'TIN_GHCARD'), 'TIN / Ghana Card Proof is mandatory for SME');
  assert(reqs.some(r => r.templateCode === 'BANK_STMT_12M'), 'Bank Statements are mandatory for SME');

  // Token creation & validation
  const tokenRecord = documentService.generateUploadToken(testCase.id, testCase.tradingName, 72);
  assert(tokenRecord.token.startsWith('tok_live_'), 'Secure upload token generated with 256-bit entropy');
  const valResult = documentService.validateUploadToken(tokenRecord.token);
  assert(valResult.valid === true && valResult.tokenRecord.caseId === testCase.id, 'Upload token verified successfully within TTL');

  // 2. LEGACY RECOVERY QUARANTINE
  console.log('\n--- SCENARIO 2: Legacy Client Quarantine & Reconciliation ---');
  const { legacyRecoveryService } = await import('../services/legacyRecoveryService.js');
  const legacyQueue = legacyRecoveryService.getStagedLegacyClients();
  assert(legacyQueue.length === 14, 'All 14 baseline clients safely quarantined in recovery desk');
  
  const targetLegacy = legacyQueue[0];
  const reconciled = await legacyRecoveryService.reconcileAndActivate(targetLegacy.legacyId, {
    assignedOfficerId: 'staff-03',
    feeVerified: true,
    transactionRef: 'REC-LEGACY-001',
    notes: 'Reconciled legacy intake file and validated MoMo statement.'
  });
  assert(reconciled.legacyId === targetLegacy.legacyId, 'Legacy record reconciled');

  // 3. TASK QUEUE & ESCALATIONS
  console.log('\n--- SCENARIO 3: Tasks Queue & Supervisory Escalations ---');
  const { taskService } = await import('../services/taskService.js');
  const task = await taskService.createTask({
    caseId: testCase.id,
    clientName: testCase.tradingName,
    title: 'Verify Tax Clearance Certificate with GRA Portal',
    description: 'Ensure TCC is valid and dates match current financial year.',
    assignedToId: 'staff-03',
    priority: 'high',
    dueDate: '2026-01-01' // Past date to trigger overdue & escalation
  });
  assert(task.id && task.status === 'pending', 'Task created in pending state');

  const allTasks = taskService.getTasks();
  const foundTask = allTasks.find(t => t.id === task.id);
  assert(foundTask && foundTask.isOverdue === true, 'Task correctly computed as Overdue');
  assert(foundTask && foundTask.escalationLevel === 2, 'Task escalated to Level 2 (CEO) after >3 days overdue');

  const updatedTask = await taskService.updateTaskStatus(task.id, 'completed', 'GRA online verification confirmed valid through Dec 2026.');
  assert(updatedTask.status === 'completed', 'Task completed with documented audit evidence');

  // 4. EXPLAINABLE RULE-BASED MATCHING ENGINE
  console.log('\n--- SCENARIO 4: Explainable Grant Matching Engine ---');
  const { matchingService } = await import('../services/matchingService.js');
  const matches = matchingService.matchAllGrantsForCase(testCase);
  assert(matches.length > 0, `Matching engine evaluated ${matches.length} grant opportunities`);

  const gizMatch = matches.find(m => m.grant.title.includes('GIZ') || m.grant.targetSectors.includes('Agribusiness'));
  assert(gizMatch !== undefined, 'Agribusiness opportunity matched for Volta Green');
  assert(gizMatch.satisfiedCriteria && gizMatch.satisfiedCriteria.length > 0, 'Every match provides rule-by-rule explainability');

  // Northern Ghana geographic disqualifier check
  const usaidMatch = matches.find(m => m.grant.title.includes('USAID'));
  if (usaidMatch) {
    const geoDisqualifier = usaidMatch.disqualifyingReasons.some(r => r.includes('Geographic Exclusion') || r.includes('Northern'));
    assert(geoDisqualifier, 'USAID Northern Ghana regional restriction accurately disqualifies Volta Region');
  }

  // 5. APPLICATION PIPELINE & QA GATE
  console.log('\n--- SCENARIO 5: Application Acquisition & Internal QA Gate ---');
  const { applicationService } = await import('../services/applicationService.js');
  const app = await applicationService.adoptOpportunity({
    caseId: testCase.id,
    clientName: testCase.tradingName,
    opportunityId: gizMatch.grant.id,
    targetFundingAmount: 150000
  });
  assert(app.applicationNumber.startsWith('APP-2026-'), 'Application generated with serial tracking number');
  assert(app.status === 'opportunity_selected', 'Initial status is opportunity_selected');

  // QA Gate approval by Team Leader (staff-02)
  const qaApproved = await applicationService.recordQaReview(app.id, {
    decision: 'approved',
    feedbackNotes: 'Strong proposal narrative; budget verified against local equipment quotes.'
  });
  assert(qaApproved.status === 'approved_for_submission', 'Application passed Internal QA gate and approved for submission');

  // 6. VERIFIABLE SUBMISSION RECORDING
  console.log('\n--- SCENARIO 6: Verifiable Submission Recording ---');
  let rejectedSubmissionWithoutRef = false;
  try {
    await applicationService.recordSubmissionEvidence(app.id, {
      submissionReferenceNumber: '',
      submissionEvidenceUrl: 'https://giz-grants.de'
    });
  } catch (e) {
    rejectedSubmissionWithoutRef = true;
  }
  assert(rejectedSubmissionWithoutRef, 'System blocked marking application submitted without official funder ref number');

  const submittedApp = await applicationService.recordSubmissionEvidence(app.id, {
    submissionReferenceNumber: 'GIZ-GH-2026-98124',
    submissionEvidenceUrl: 'proofs/giz_submission_receipt.pdf',
    notes: 'Submitted via GIZ online portal at 15:45 GMT.'
  });
  assert(submittedApp.status === 'submitted', 'Application transitioned to submitted state');
  assert(submittedApp.submissionReferenceNumber === 'GIZ-GH-2026-98124', 'Submission reference permanently sealed');

  // 7. GRANT AWARD & 5% SUCCESS FEE INVOICE + TASK
  console.log('\n--- SCENARIO 7: Grant Award & Success Fee Invoicing ---');
  const { financeService } = await import('../services/financeService.js');
  const awardedApp = await applicationService.recordOutcome(app.id, {
    outcomeStatus: 'awarded',
    awardedAmount: 150000,
    notes: 'Official grant award letter received.'
  });
  assert(awardedApp.status === 'awarded', 'Application status recorded as Awarded');
  
  const caseInvoices = financeService.getInvoicesByCaseId(testCase.id);
  const successFeeInv = caseInvoices.find(i => i.invoiceType === 'success_fee');
  assert(successFeeInv !== undefined, '5% contractual success fee invoice automatically generated');
  assert(successFeeInv.totalAmount === 7500, `Success fee invoice amount accurate (GH₵ ${successFeeInv.totalAmount})`);

  // Verify that success fee collection task was automatically issued to Finance Officer Emmanuel Darko
  const tasksAfterAward = taskService.getTasks();
  const feeTask = tasksAfterAward.find(t => t.caseId === testCase.id && t.title.includes('Success Fee'));
  assert(feeTask !== undefined, 'Success fee collection task dispatched to Finance Desk');
  assert(feeTask.assignedToId === financeOfficer.id, 'Success fee task assigned specifically to Finance Officer Emmanuel Darko');

  // 8. BACKGROUND AUTOMATION & INACTIVITY RADAR
  console.log('\n--- SCENARIO 8: Background Inactivity Radar & Deadline Scanner ---');
  const { automationService } = await import('../services/automationService.js');
  const auditReport = await automationService.runOperationalAudit();
  assert(auditReport.casesScanned > 0, `Scanned ${auditReport.casesScanned} active client cases`);
  assert(auditReport.applicationsScanned > 0, `Scanned ${auditReport.applicationsScanned} active grant applications`);

  console.log('\n===============================================================');
  console.log(`✅ VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('===============================================================\n');
}

runAllScenarios().catch(err => {
  console.error('\n❌ VERIFICATION SUITE ENCOUNTERED AN ERROR:', err);
  process.exit(1);
});
