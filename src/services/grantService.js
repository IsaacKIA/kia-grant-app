import { auditService } from './auditService';
import { authService } from './authService';

const LOCAL_GRANTS_KEY = 'kia_grant_opportunities_v2';

export const SEEDED_GRANTS = [
  {
    id: 'grant-01',
    opportunityCode: 'GRANT-YOUSTART-2026',
    title: 'GEA / World Bank YouStart (High-Growth SME Window)',
    fundingOrganization: 'Ghana Enterprises Agency & World Bank',
    officialSourceUrl: 'https://gea.gov.gh/youstart',
    description: 'Concessionary funding and non-repayable catalytic grant window targeting high-potential Ghanaian youth and female-led enterprises in commercial agriculture, manufacturing, and tech.',
    targetSectors: ['Agribusiness', 'Manufacturing', 'Technology & Services', 'Tourism'],
    eligibleApplicantTypes: ['SME', 'Startup'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 50000,
    maxFundingAmount: 500000,
    currency: 'GHS',
    minReadinessScore: 60,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Sole Proprietorship'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-01-15',
    closingDate: '2026-12-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'GEA Official Online Portal',
    hasApplicationFee: false,
    status: 'verified_open', // Verified open!
    verifiedBy: 'staff-02', // Abena Osei (TL)
    verifiedAt: '2026-01-14T10:00:00Z',
    donorFocus: 'Youth employment generation, import substitution, and local industrial manufacturing.',
    internalNotes: 'Rolling evaluation batches; applicants must complete GEA Business Development Services training.'
  },
  {
    id: 'grant-02',
    opportunityCode: 'GRANT-HAPPY-2026',
    title: 'Mastercard Foundation / Agri-Impact (HAPPY Project)',
    fundingOrganization: 'Mastercard Foundation & Agri-Impact',
    officialSourceUrl: 'https://agri-impact.com/happy-project',
    description: 'Catalytic matching grant and technical assistance initiative empowering Ghanaian agribusinesses to engage youth in outgrower and value addition networks across primary commodity chains.',
    targetSectors: ['Agribusiness'],
    eligibleApplicantTypes: ['SME', 'Cooperative'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['Ashanti', 'Eastern', 'Northern', 'Volta', 'Bono East'],
    minFundingAmount: 100000,
    maxFundingAmount: 1200000,
    currency: 'GHS',
    minReadinessScore: 75,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Cooperative Union'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-02-01',
    closingDate: '2026-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Competitive Proposal Submission via Email & Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-02',
    verifiedAt: '2026-02-01T09:00:00Z',
    donorFocus: 'Creation of 326,000 dignified and fulfilling jobs for youth, focusing on rice, soya, tomato, and poultry value chains.',
    internalNotes: 'Requires verified off-taker agreements or proof of youth outgrower network contracts.'
  },
  {
    id: 'grant-03',
    opportunityCode: 'GRANT-NEIP-B6',
    title: 'NEIP National Innovation & SME Challenge Fund (Batch 6)',
    fundingOrganization: 'National Entrepreneurship & Innovation Programme (NEIP)',
    officialSourceUrl: 'https://neip.gov.gh/challenge-fund',
    description: 'Government catalytic seed capital grant for early-stage and innovative Ghanaian entrepreneurs providing grassroots solutions.',
    targetSectors: ['Agribusiness', 'Technology & Services', 'Beauty & Personal Care', 'General Commerce & Services'],
    eligibleApplicantTypes: ['Startup', 'SME', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 20000,
    maxFundingAmount: 150000,
    currency: 'GHS',
    minReadinessScore: 50,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Sole Proprietorship', 'Enterprise'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-04-01',
    closingDate: '2026-07-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'NEIP National Web Portal',
    hasApplicationFee: false,
    status: 'upcoming',
    verifiedBy: 'staff-02',
    verifiedAt: '2026-01-20T14:30:00Z',
    donorFocus: 'Catalyzing grassroots innovation and startup survival across all 16 Ghanaian regions.',
    internalNotes: 'Batch 6 call expected to open formally in April 2026. Pre-screen applicants now.'
  },
  {
    id: 'grant-04',
    opportunityCode: 'GRANT-TEF-2026',
    title: 'Tony Elumelu Foundation (TEF) Entrepreneurship Programme',
    fundingOrganization: 'The Tony Elumelu Foundation',
    officialSourceUrl: 'https://tefconnect.net',
    description: 'Premier African entrepreneurship initiative providing $5,000 non-refundable equity-free seed capital, intensive mentorship, and 12-week business management training.',
    targetSectors: ['Agribusiness', 'Technology & Services', 'Beauty & Personal Care', 'Healthcare & Sanitation', 'General Commerce & Services'],
    eligibleApplicantTypes: ['Startup', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All African Countries including Ghana'],
    minFundingAmount: 75000, // ~$5,000 USD converted to GHS
    maxFundingAmount: 75000,
    currency: 'GHS',
    minReadinessScore: 55,
    requiresRegistration: false, // Accepts idea stage!
    requiredLegalTypes: ['Any'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-01-01',
    closingDate: '2026-03-31',
    deadlineTimezone: 'Africa/Lagos',
    applicationMethod: 'TEFConnect Online Platform',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-03', // Kofi Mensah
    verifiedAt: '2026-01-02T11:00:00Z',
    donorFocus: 'Empowering early-stage African entrepreneurs to lead economic transformation through Africapitalism.',
    internalNotes: 'Founder must be at least 18 years old. Pitch deck and online psychometric test required.'
  },
  {
    id: 'grant-05',
    opportunityCode: 'GRANT-USAID-FTF-2026',
    title: 'USAID Feed the Future Ghana Trade & Ag Activity',
    fundingOrganization: 'USAID / US Government',
    officialSourceUrl: 'https://www.usaid.gov/ghana/economic-growth',
    description: 'High-value sub-grant and technical co-investment facility targeting commercial agriculture processors and logistics operators.',
    targetSectors: ['Agribusiness'],
    eligibleApplicantTypes: ['SME'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['Northern Region', 'Upper East', 'Upper West', 'North East'],
    minFundingAmount: 375000, // ~$25,000 USD
    maxFundingAmount: 2250000, // ~$150,000 USD
    currency: 'GHS',
    minReadinessScore: 80,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-02-15',
    closingDate: '2026-05-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'USAID RFP Submission Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-02',
    verifiedAt: '2026-02-10T16:00:00Z',
    donorFocus: 'Northern Ghana agricultural resilience, farmer income growth, and export trade facilitation.',
    internalNotes: 'Strict environmental mitigation review and child labor compliance certification required.'
  },
  {
    id: 'grant-06',
    opportunityCode: 'GRANT-DEVELOPPP-2026',
    title: 'GIZ / develoPPP Ventures (Ghana Window)',
    fundingOrganization: 'German Federal Ministry (BMZ) & DEG Impulse',
    officialSourceUrl: 'https://www.developpp.de/en/ventures',
    description: 'Matching grant funding up to €100,000 for innovative Ghanaian scale-ups with positive socio-economic and environmental impacts.',
    targetSectors: ['Technology & Services', 'Agribusiness', 'Manufacturing'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 500000,
    maxFundingAmount: 1600000, // ~€100,000 EUR
    currency: 'GHS',
    minReadinessScore: 80,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-05-15',
    closingDate: '2026-06-30',
    deadlineTimezone: 'Europe/Berlin',
    applicationMethod: 'develoPPP Online Application Platform',
    hasApplicationFee: false,
    status: 'upcoming',
    verifiedBy: 'staff-02',
    verifiedAt: '2026-01-25T12:00:00Z',
    donorFocus: 'Green technology, renewable energy, circular economy, and tech-enabled agricultural processing.',
    internalNotes: 'Requires private co-financing commitment or matching equity proof.'
  },
  {
    id: 'grant-07',
    opportunityCode: 'GRANT-KIC-2026',
    title: 'Kosmos Innovation Center (KIC) AgriTech Challenge Pro',
    fundingOrganization: 'Kosmos Energy & Mastercard Foundation',
    officialSourceUrl: 'https://kicghana.org/agritech-challenge',
    description: 'Acceleration fellowship and non-repayable seed award for youth-led technological innovations addressing agricultural bottlenecks.',
    targetSectors: ['Agribusiness', 'Technology & Services'],
    eligibleApplicantTypes: ['Startup', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 150000,
    maxFundingAmount: 750000,
    currency: 'GHS',
    minReadinessScore: 65,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Enterprise'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-01-10',
    closingDate: '2026-04-15',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'KIC Official Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-03',
    verifiedAt: '2026-01-12T09:30:00Z',
    donorFocus: 'Youth employment in agriculture through innovative digital tools, mechanization, and cold chain.',
    internalNotes: 'Bootcamp attendance mandatory before funding disbursement.'
  }
];

export const grantService = {
  getGrants() {
    const saved = localStorage.getItem(LOCAL_GRANTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved grants:', e);
      }
    }
    localStorage.setItem(LOCAL_GRANTS_KEY, JSON.stringify(SEEDED_GRANTS));
    return SEEDED_GRANTS;
  },

  saveGrants(list) {
    localStorage.setItem(LOCAL_GRANTS_KEY, JSON.stringify(list));
    return list;
  },

  getGrantById(grantId) {
    const grants = this.getGrants();
    return grants.find(g => g.id === grantId) || null;
  },

  async verifyGrantOpportunity(grantId, { officialSourceUrl, notes = '' }) {
    const currentStaff = authService.getCurrentUser();
    const grants = this.getGrants();
    const target = grants.find(g => g.id === grantId);
    if (!target) throw new Error('Grant not found');

    const updated = grants.map(g => {
      if (g.id === grantId) {
        return {
          ...g,
          status: 'verified_open',
          officialSourceUrl: officialSourceUrl || g.officialSourceUrl,
          verifiedBy: currentStaff.id,
          verifiedAt: new Date().toISOString(),
          internalNotes: notes ? `${g.internalNotes}\n${notes}` : g.internalNotes
        };
      }
      return g;
    });

    this.saveGrants(updated);

    await auditService.logEvent({
      entityType: 'grant_opportunity',
      entityId: grantId,
      action: 'verify_grant',
      newState: { status: 'verified_open', verifiedBy: currentStaff.id },
      notes: `Verified grant "${target.title}" against official source ${officialSourceUrl || target.officialSourceUrl}`
    });

    return updated.find(g => g.id === grantId);
  },

  async createGrantOpportunity(data) {
    const currentStaff = authService.getCurrentUser();
    const grants = this.getGrants();

    const newGrant = {
      id: `grant-${Date.now().toString().slice(-5)}`,
      opportunityCode: `GRANT-${Date.now().toString().slice(-4)}`,
      status: 'pending_verification',
      verifiedBy: null,
      verifiedAt: null,
      currency: 'GHS',
      minReadinessScore: 50,
      hasApplicationFee: false,
      deadlineTimezone: 'Africa/Accra',
      ...data,
      createdAt: new Date().toISOString()
    };

    const updated = [newGrant, ...grants];
    this.saveGrants(updated);

    await auditService.logEvent({
      entityType: 'grant_opportunity',
      entityId: newGrant.id,
      action: 'create_grant',
      newState: newGrant,
      notes: `Created grant opportunity draft "${newGrant.title}"`
    });

    return newGrant;
  }
};

