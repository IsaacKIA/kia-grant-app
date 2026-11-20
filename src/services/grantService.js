import { auditService } from './auditService';
import { authService } from './authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_GRANTS_KEY = 'kia_grant_opportunities_v9';

export const SEEDED_GRANTS = [
  // === November 2026 Grant Alert Additions (Ghana / Africa / Global Eligible & Verified Real) ===
  {
    id: 'grant-08',
    opportunityCode: 'GRANT-SFC-2027',
    title: 'Sustainable Food Challenge 2027',
    fundingOrganization: 'MassChallenge',
    officialSourceUrl: 'https://masschallenge.org',
    description: 'Connects agrifood startups and scaleups with global food corporations for proof-of-concept pilots, circular food systems, agtech, and regenerative agriculture.',
    targetSectors: ['Agribusiness', 'Manufacturing', 'Climate & Renewable Energy'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 1000,
    maxFundingAmount: 10000,
    currency: 'USD',
    minReadinessScore: 55,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Sole Proprietorship'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2026-11-23',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'MassChallenge Online Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Sustainable food, agtech, circular packaging, and valorization of agricultural sidestreams.',
    internalNotes: 'TRL 5+ prototype with traction required. Finalists outside Europe receive 1,000 CHF travel support to Switzerland.'
  },
  {
    id: 'grant-09',
    opportunityCode: 'GRANT-SET-2026',
    title: 'SET Award for Energy and Climate Tech Startups',
    fundingOrganization: 'Start Up Energy Transition (SET)',
    officialSourceUrl: 'https://www.startup-energy-transition.com',
    description: 'International competition recognizing clean energy, storage, digital energy, green construction, and clean mobility startups.',
    targetSectors: ['Climate & Renewable Energy', 'Technology & Services', 'Transport & Logistics', 'Construction & Real Estate'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 100000,
    currency: 'USD',
    minReadinessScore: 60,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-15',
    closingDate: '2026-11-29',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'SET Official Application Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Clean energy access, energy efficiency, and decarbonization.',
    internalNotes: 'Winners receive EUR 10,000 equity-free prize + flights & accommodation to Berlin for two finalists. Company founded Aug 2016 or later.'
  },
  {
    id: 'grant-10',
    opportunityCode: 'GRANT-HELLO-2026',
    title: 'Hello Tomorrow Global Challenge (Deep Tech)',
    fundingOrganization: 'Hello Tomorrow',
    officialSourceUrl: 'https://hello-tomorrow.org/global-challenge/',
    description: 'Global deep-tech startup competition offering equity-free/venture prizes, investor access, and corporate partnerships.',
    targetSectors: ['Technology & Services', 'Climate & Renewable Energy', 'Healthcare & Sanitation', 'Manufacturing'],
    eligibleApplicantTypes: ['Startup'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 100000,
    maxFundingAmount: 500000,
    currency: 'USD',
    minReadinessScore: 65,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-23',
    closingDate: '2026-11-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Hello Tomorrow Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Breakthrough science, engineering, industrial, or environmental technologies.',
    internalNotes: 'Grand prize includes EUR 200,000 equity prize from DeepBright Ventures and Paris Summit access.'
  },
  {
    id: 'grant-11',
    opportunityCode: 'GRANT-GSV-2026',
    title: 'GSV Cup for Digital Learning & Workforce Skills Startups',
    fundingOrganization: 'GSV',
    officialSourceUrl: 'https://www.asugsvsummit.com',
    description: 'Recognizes pre-seed and seed-stage EdTech and workforce-skills startups globally with summit demo access and investor matching.',
    targetSectors: ['Education & Training', 'Technology & Services'],
    eligibleApplicantTypes: ['Startup'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 50000,
    currency: 'USD',
    minReadinessScore: 50,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Sole Proprietorship'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2026-12-01',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'GSV Cup Nomination Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Digital learning, EdTech, and workforce skills development.',
    internalNotes: 'Pre-Series A startups only; includes ASU+GSV Summit tickets.'
  },
  {
    id: 'grant-12',
    opportunityCode: 'GRANT-JLMF-2026',
    title: 'Jim Leech Mastercard Foundation Fellowship on Entrepreneurship',
    fundingOrganization: "Dunin-Deshpande Innovation Centre at Queen's University",
    officialSourceUrl: 'https://www.queensu.ca/innovationcentre/',
    description: '8-month virtual entrepreneurship fellowship for African students and recent graduates with USD 350 stipend, mentorship, and up to $10,000 pitch prizes.',
    targetSectors: ['Agribusiness', 'Technology & Services', 'Education & Training', 'Healthcare & Sanitation', 'NGO / Social Enterprise', 'General Commerce & Services'],
    eligibleApplicantTypes: ['Startup', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 1000,
    maxFundingAmount: 10000,
    currency: 'USD',
    minReadinessScore: 40,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2026-12-01',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: "Queen's University Online Application",
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'African student and graduate entrepreneurs building high-impact ventures.',
    internalNotes: 'Open to African post-secondary students and recent graduates across all disciplines.'
  },
  {
    id: 'grant-14',
    opportunityCode: 'GRANT-SCI-2026',
    title: 'SCI Sustainability & Innovation Award Programs',
    fundingOrganization: 'SCI (Where Science Meets Business)',
    officialSourceUrl: 'https://www.soci.org',
    description: 'Global awards recognizing measurable sustainability and collaborative science-driven industrial innovation.',
    targetSectors: ['Climate & Renewable Energy', 'Healthcare & Sanitation', 'Manufacturing'],
    eligibleApplicantTypes: ['SME', 'Startup', 'NGO'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 25000,
    currency: 'USD',
    minReadinessScore: 60,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2026-12-04',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'SCI Online Self-Nomination Form',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Chemistry-related industrial sustainability, global health, and climate impact.',
    internalNotes: 'Requires demonstrable, measurable environmental or societal outcomes.'
  },
  {
    id: 'grant-15',
    opportunityCode: 'GRANT-VICTAM-2026',
    title: 'Victam Foundation Funding Program (Feed & Flour Milling)',
    fundingOrganization: 'Victam Foundation',
    officialSourceUrl: 'https://www.victamfoundation.org',
    description: 'Grants up to EUR 50,000 for projects advancing animal feed and flour milling value chains, with emphasis on developing countries.',
    targetSectors: ['Agribusiness', 'Manufacturing'],
    eligibleApplicantTypes: ['SME', 'Cooperative', 'NGO'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 55000,
    currency: 'USD',
    minReadinessScore: 65,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Cooperative Union', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-09-01',
    closingDate: '2026-12-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Victam Foundation Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Animal feed technology, flour milling efficiency, and developing-country agro-processing.',
    internalNotes: 'Strong fit for Ghanaian poultry/fish feed mills and grain/flour processors; co-financing valued.'
  },
  {
    id: 'grant-16',
    opportunityCode: 'GRANT-RICHHUB-2026',
    title: 'RICH Hub Climate AI Innovation (Africa)',
    fundingOrganization: 'Artificial Intelligence for Development (AI4D)',
    officialSourceUrl: 'https://africa.ai4d.ai',
    description: 'Supports African climate AI startups, researchers, and organizations with pilot coaching and scaling grants up to USD 200,000.',
    targetSectors: ['Climate & Renewable Energy', 'Technology & Services', 'Agribusiness'],
    eligibleApplicantTypes: ['Startup', 'SME', 'NGO'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 100000,
    maxFundingAmount: 500000,
    currency: 'USD',
    minReadinessScore: 60,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2026-12-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'AI4D Expression of Interest Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'African AI and data-driven solutions for climate resilience and agriculture.',
    internalNotes: 'Africa-specific call; submit Expression of Interest detailing stage and support needs.'
  },
  {
    id: 'grant-17',
    opportunityCode: 'GRANT-3D-2027',
    title: 'Third Derivative Climate Tech Accelerator Program',
    fundingOrganization: 'Third Derivative (RMI)',
    officialSourceUrl: 'https://www.third-derivative.org',
    description: '18-month virtual accelerator for for-profit climate tech startups worldwide with TRL 4+ prototype and 2+ full-time staff.',
    targetSectors: ['Climate & Renewable Energy', 'Technology & Services', 'Transport & Logistics', 'Construction & Real Estate'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 50000,
    maxFundingAmount: 250000,
    currency: 'USD',
    minReadinessScore: 60,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-15',
    closingDate: '2027-01-08',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Third Derivative Online Application',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Renewable power, batteries, clean mobility, low-carbon materials, and climate software.',
    internalNotes: 'Virtual global program; requires >=2 full-time employees and TRL 4+ working prototype.'
  },
  {
    id: 'grant-22',
    opportunityCode: 'GRANT-WEF-2027',
    title: 'World Economic Forum Technology Pioneers 2027',
    fundingOrganization: 'World Economic Forum',
    officialSourceUrl: 'https://www.weforum.org/communities/technology-pioneers/',
    description: 'Selects high-impact early-stage startups globally developing cutting-edge technologies to join the WEF Innovator Communities network.',
    targetSectors: ['Technology & Services', 'Climate & Renewable Energy', 'Financial Services & Fintech', 'Healthcare & Sanitation'],
    eligibleApplicantTypes: ['Startup'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 50000,
    maxFundingAmount: 500000,
    currency: 'USD',
    minReadinessScore: 70,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: true,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2027-01-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'WEF Innovator Communities Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Mission-driven frontier technologies with global impact.',
    internalNotes: 'Non-cash prestige & global investor/policy access program.'
  },
  {
    id: 'grant-24',
    opportunityCode: 'GRANT-SNOWFLAKE-2027',
    title: 'Snowflake Startup Challenge 2027',
    fundingOrganization: 'Snowflake Ventures',
    officialSourceUrl: 'https://www.snowflake.com/startup-challenge/',
    description: 'Global startup competition for pre-Series B startups building AI & data apps powered by Snowflake, with up to $1M potential investment.',
    targetSectors: ['Technology & Services', 'Financial Services & Fintech'],
    eligibleApplicantTypes: ['Startup'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 500000,
    maxFundingAmount: 1000000,
    currency: 'USD',
    minReadinessScore: 65,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-15',
    closingDate: '2027-02-19',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Snowflake Startup Challenge Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'AI Data Cloud applications by Series A or earlier startups.',
    internalNotes: 'Requires 5-minute demo video and application built on Snowflake.'
  },
  {
    id: 'grant-25',
    opportunityCode: 'GRANT-TIMBUKTOO-2027',
    title: 'Timbuktoo Launchpad for GreenTech Startups (UNDP)',
    fundingOrganization: 'United Nations Development Programme (UNDP)',
    officialSourceUrl: 'https://www.undp.org/africa/timbuktoo',
    description: 'Pan-African UNDP venture-building program for GreenTech startups with an MVP in clean energy, sustainable agriculture, circular economy, or green mobility.',
    targetSectors: ['Climate & Renewable Energy', 'Agribusiness', 'Transport & Logistics', 'Manufacturing'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 15000,
    maxFundingAmount: 100000,
    currency: 'USD',
    minReadinessScore: 50,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Sole Proprietorship'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'UNDP Timbuktoo SIGMA Platform',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'African women- and youth-led GreenTech and climate resilience startups.',
    internalNotes: 'Rolling intake; requires MVP and committed founding team based in Africa.'
  },
  {
    id: 'grant-26',
    opportunityCode: 'GRANT-AMS-IMPACT-2027',
    title: 'The Impact Accelerator for Young African Innovators',
    fundingOrganization: 'African Masterclass Series',
    officialSourceUrl: 'https://africanmasterclassseries.org',
    description: 'Free 12-week Pan-African accelerator for innovators aged 18-45 providing pathways to grants, blended finance, and angel capital.',
    targetSectors: ['Technology & Services', 'Agribusiness', 'Healthcare & Sanitation', 'Education & Training', 'Climate & Renewable Energy', 'NGO / Social Enterprise'],
    eligibleApplicantTypes: ['Startup', 'NGO', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 2000,
    maxFundingAmount: 50000,
    currency: 'USD',
    minReadinessScore: 40,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'African Masterclass Series Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Women, youth, and underrepresented African social entrepreneurs.',
    internalNotes: 'Rolling intake; free to attend, prioritizes ages 18-45.'
  },
  {
    id: 'grant-27',
    opportunityCode: 'GRANT-BELDEX-2027',
    title: 'Beldex Grants Program (Privacy & Web3 Tech)',
    fundingOrganization: 'Beldex',
    officialSourceUrl: 'https://www.beldex.io',
    description: 'Ongoing USD 1,000,000 grant pool supporting startups and developer teams worldwide building privacy-focused apps, payments, and tools on Beldex.',
    targetSectors: ['Technology & Services', 'Financial Services & Fintech'],
    eligibleApplicantTypes: ['Startup', 'SME', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 250000,
    currency: 'USD',
    minReadinessScore: 50,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-01-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Beldex Rolling Grant Proposal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:00:00Z',
    donorFocus: 'Privacy-preserving decentralized apps, payment tools, and developer SDKs.',
    internalNotes: 'Rolling review; projects must integrate with Beldex network.'
  },
  // === Recurring Annual Ghana/Africa-Eligible Grants (Auto-rolls to current year when opening month arrives) ===
  {
    id: 'grant-28',
    opportunityCode: 'GRANT-ANZISHA-ANNUAL',
    title: 'Anzisha Fellowship Program for Young African Entrepreneurs',
    fundingOrganization: 'Anzisha Prize / African Leadership Academy',
    officialSourceUrl: 'https://anzishaprize.org',
    description: 'Multi-year support, mentorship, and business acceleration for young African founders aged 15-22 leading active ventures across any sector.',
    targetSectors: ['Agribusiness', 'Technology & Services', 'Manufacturing', 'Education & Training', 'NGO / Social Enterprise', 'General Commerce & Services'],
    eligibleApplicantTypes: ['Startup', 'Individual', 'SME'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 2500,
    maxFundingAmount: 25000,
    currency: 'USD',
    minReadinessScore: 35,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2027-08-01',
    closingDate: '2027-11-10',
    isAnnualRecurring: true,
    typicalOpenMonth: 8,
    typicalCloseMonth: 11,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Anzisha Online Application',
    hasApplicationFee: false,
    status: 'upcoming',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:30:00Z',
    donorFocus: 'Africa-wide youth entrepreneurship (ages 15-22) creating jobs.',
    internalNotes: 'Annual recurring cycle (typically Aug-Nov). Automatically flags pending verification when opening month arrives.'
  },
  {
    id: 'grant-29',
    opportunityCode: 'GRANT-FOODTECH500-ANNUAL',
    title: 'FoodTech 500: AgriFoodTech Startups & Scaleups',
    fundingOrganization: 'Forward Fooding',
    officialSourceUrl: 'https://forwardfooding.com/foodtech500/',
    description: 'Global ranking and investor/corporate visibility platform for AgriFoodTech startups and scaleups across food, agtech, and sustainability.',
    targetSectors: ['Agribusiness', 'Technology & Services', 'Manufacturing'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 50000,
    currency: 'USD',
    minReadinessScore: 55,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2027-08-15',
    closingDate: '2027-11-15',
    isAnnualRecurring: true,
    typicalOpenMonth: 8,
    typicalCloseMonth: 11,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Forward Fooding Portal',
    hasApplicationFee: false,
    status: 'upcoming',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:30:00Z',
    donorFocus: 'AgriFoodTech innovation, sustainable food systems, and global investor exposure.',
    internalNotes: 'Annual recurring cycle (typically Aug-Nov).'
  },
  {
    id: 'grant-30',
    opportunityCode: 'GRANT-IMAGINEH2O-ANNUAL',
    title: 'Imagine H2O Accelerator for Water Startups',
    fundingOrganization: 'Imagine H2O',
    officialSourceUrl: 'https://www.imagineh2o.org',
    description: 'Global accelerator providing entrepreneurial training, pilot capital, and utility/corporate deployment access for water and WASH startups.',
    targetSectors: ['Healthcare & Sanitation', 'Climate & Renewable Energy', 'Agribusiness', 'Technology & Services'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 100000,
    currency: 'USD',
    minReadinessScore: 55,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2027-09-01',
    closingDate: '2027-11-20',
    isAnnualRecurring: true,
    typicalOpenMonth: 9,
    typicalCloseMonth: 11,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Imagine H2O Online Application',
    hasApplicationFee: false,
    status: 'upcoming',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T15:30:00Z',
    donorFocus: 'Water quality, wastewater, clean water access, and climate-resilient WASH.',
    internalNotes: 'Annual recurring cycle (typically Sep-Nov).'
  },
  // === Bilateral, Multilateral, AI/Tech, Peacebuilding & CSR Grant Alert Additions (Nov 2026) ===
  {
    id: 'grant-33',
    opportunityCode: 'GRANT-UNESCO-ALFOZAN-2026',
    title: 'UNESCO-Al Fozan International Prize for Young Scientists in STEM',
    fundingOrganization: 'UNESCO',
    officialSourceUrl: 'https://www.unesco.org/en/prizes/al-fozan',
    description: 'Biennial international prize awarding USD 50,000 each to 5 young scientists (under age 40, including Africa region) advancing STEM research, education, and sustainable development.',
    targetSectors: ['Education & Training', 'Technology & Services', 'Climate & Renewable Energy'],
    eligibleApplicantTypes: ['Individual', 'Startup'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 50000,
    maxFundingAmount: 50000,
    currency: 'USD',
    minReadinessScore: 55,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2026-11-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'UNESCO National Commission / Institutional Nomination Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'STEM excellence, gender equality in science, and research addressing societal challenges across five UNESCO regions including Africa.',
    internalNotes: 'Requires institutional/National Commission nomination; candidates must be under 40 years old.'
  },
  {
    id: 'grant-34',
    opportunityCode: 'GRANT-AGRECONUS-GH-2026',
    title: 'AgrEcoNUS+/LEAP - Agroecological NUS Value Chains (Ghana & Côte d\'Ivoire)',
    fundingOrganization: 'Italian Agency for Development Cooperation (AICS) / EU',
    officialSourceUrl: 'https://www.aics.gov.it',
    description: 'EU-backed call exceeding EUR 1M for agroecological Neglected and Underutilized Species (NUS) value chains in Ghana and Côte d\'Ivoire, with sub-grants up to EUR 60,000 for local cooperatives and MSMEs.',
    targetSectors: ['Agribusiness', 'Climate & Renewable Energy', 'NGO / Social Enterprise'],
    eligibleApplicantTypes: ['NGO', 'Cooperative', 'SME'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 60000,
    maxFundingAmount: 1000000,
    currency: 'EUR',
    minReadinessScore: 70,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)', 'Cooperative', 'Limited Liability'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-10-15',
    closingDate: '2026-12-16',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'AICS / EU Funding & Tenders Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Agroecology, neglected/underutilized crop value chains, rural cooperatives, and food system resilience in Ghana.',
    internalNotes: 'Lead applicant must be an eligible NGO with operational presence in Ghana & Côte d\'Ivoire, partnering with Ghanaian local co-applicants; includes EUR 60k third-party MSME/cooperative grants.'
  },
  {
    id: 'grant-35',
    opportunityCode: 'GRANT-USAFRICA-SIP-2027',
    title: 'U.S.-Africa Strategic Investment Program',
    fundingOrganization: 'U.S. Department of State - Bureau of African Affairs',
    officialSourceUrl: 'https://www.grants.gov',
    description: 'Large-scale funding ($5M–$50M) supporting sub-Saharan Africa commercial diplomacy, critical minerals value chains, infrastructure investment, and private-sector partnerships.',
    targetSectors: ['Mining & Natural Resources', 'Construction & Real Estate', 'Transport & Logistics', 'NGO / Social Enterprise'],
    eligibleApplicantTypes: ['NGO', 'SME', 'Large Enterprise'],
    eligibleBusinessStages: ['Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000000,
    maxFundingAmount: 50000000,
    currency: 'USD',
    minReadinessScore: 80,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-10-01',
    closingDate: '2027-05-27',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Grants.gov / U.S. State Department Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Critical minerals, commercial diplomacy, and strategic U.S.-Africa private sector investment partnerships.',
    internalNotes: 'Open to nonprofits, small businesses, and for-profit organizations operating in sub-Saharan Africa.'
  },
  {
    id: 'grant-36',
    opportunityCode: 'GRANT-TIP-CPC-2026',
    title: 'Child Protection Compact (CPC) Annual Program',
    fundingOrganization: 'U.S. Department of State - TIP Office',
    officialSourceUrl: 'https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/office-to-monitor-and-combat-trafficking-in-persons/',
    description: 'Ongoing multi-year program ($5M–$10M) supporting NGOs and CSOs globally to partner on preventing child trafficking, strengthening prosecution, and protecting survivors.',
    targetSectors: ['NGO / Social Enterprise', 'Education & Training', 'Healthcare & Sanitation'],
    eligibleApplicantTypes: ['NGO'],
    eligibleBusinessStages: ['Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000000,
    maxFundingAmount: 10000000,
    currency: 'USD',
    minReadinessScore: 75,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'SAMS Domestic / Grants.gov',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Child protection, anti-trafficking systems strengthening, and survivor care partnerships.',
    internalNotes: 'Ongoing rolling/annual bilateral compact program open to experienced NGOs and CSOs globally.'
  },
  {
    id: 'grant-37',
    opportunityCode: 'GRANT-TIP-PEMS-2026',
    title: 'Program to End Modern Slavery (PEMS) Annual Program',
    fundingOrganization: 'U.S. Department of State - TIP Office',
    officialSourceUrl: 'https://www.state.gov/office-to-monitor-and-combat-trafficking-in-persons',
    description: 'Ongoing funding ($500K–$8M) for nonprofits, NGOs, and universities worldwide implementing evidence-based interventions and research to reduce modern slavery.',
    targetSectors: ['NGO / Social Enterprise', 'Education & Training'],
    eligibleApplicantTypes: ['NGO'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 500000,
    maxFundingAmount: 8000000,
    currency: 'USD',
    minReadinessScore: 70,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'SAMS Domestic / Grants.gov',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Measurable reduction of modern slavery, forced labor prevention, and rigorous impact evaluation.',
    internalNotes: 'Ongoing program; open to nonprofits, NGOs, and academic institutions globally.'
  },
  {
    id: 'grant-38',
    opportunityCode: 'GRANT-TIP-INTL-2026',
    title: 'International Programs to Combat Human Trafficking',
    fundingOrganization: 'U.S. Department of State - TIP Office',
    officialSourceUrl: 'https://www.grants.gov',
    description: 'Grants of $1M–$10M for NGOs, CSOs, and think tanks worldwide addressing human trafficking prevention, victim protection, and cross-border justice.',
    targetSectors: ['NGO / Social Enterprise', 'Education & Training'],
    eligibleApplicantTypes: ['NGO'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 1000000,
    maxFundingAmount: 10000000,
    currency: 'USD',
    minReadinessScore: 70,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-09-01',
    closingDate: '2026-12-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'SAMS Domestic / Grants.gov',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Anti-trafficking victim services, legal protection, and prevention programs.',
    internalNotes: 'Current cycle closes Dec 31, 2026; open to NGOs, CSOs, and think tanks globally.'
  },
  {
    id: 'grant-39',
    opportunityCode: 'GRANT-ANIMAMUNDI-2026',
    title: 'Anima Mundi: The Soul of the World Meets the Machine',
    fundingOrganization: 'AI Hub for Sustainable Development',
    officialSourceUrl: 'https://www.aihubfordevelopment.org',
    description: 'Global AI and creative technology initiative aligned with the Italy-Africa Mattei Plan, inviting startups, individuals, and communities to build human-centric, culturally rooted AI solutions.',
    targetSectors: ['Technology & Services', 'Creative Arts & Media', 'Education & Training'],
    eligibleApplicantTypes: ['Individual', 'Startup', 'NGO'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 50000,
    currency: 'EUR',
    minReadinessScore: 40,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2026-12-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'AI Hub for Sustainable Development Online Submission',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Inclusive AI innovation, African digital ecosystems (Mattei Plan), and ethical technology for sustainable development.',
    internalNotes: 'Open to individuals, startups, and community innovators worldwide with strong Africa alignment.'
  },
  {
    id: 'grant-40',
    opportunityCode: 'GRANT-SWG-FLAGSHIP-2026',
    title: 'Startup Wise Guys Flagship Accelerator Program',
    fundingOrganization: 'Startup Wise Guys',
    officialSourceUrl: 'https://startupwiseguys.com',
    description: 'Ongoing B2B tech, AI, SaaS, and sustainability accelerator offering up to EUR 100,000 convertible investment plus up to EUR 250,000 follow-on funding for MVP-stage startups.',
    targetSectors: ['Technology & Services', 'Financial Services & Fintech', 'Climate & Renewable Energy'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 50000,
    maxFundingAmount: 100000,
    currency: 'EUR',
    minReadinessScore: 55,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Startup Wise Guys Accelerator Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'B2B software, AI, cybersecurity, fintech, and sustainability startups with working MVP and at least 2 co-founders.',
    internalNotes: 'Rolling intake; convertible note up to EUR 100k with EUR 250k follow-on potential.'
  },
  {
    id: 'grant-41',
    opportunityCode: 'GRANT-OTF-IFF-2026',
    title: 'Internet Freedom Fund Program',
    fundingOrganization: 'Open Technology Fund (OTF)',
    officialSourceUrl: 'https://www.opentech.fund/funds/internet-freedom-fund/',
    description: 'Ongoing grants ($10,000–$900,000; ideal $50K–$200K) supporting individuals, nonprofits, and for-profits worldwide developing open-source digital security, privacy, and anti-censorship tools.',
    targetSectors: ['Technology & Services', 'NGO / Social Enterprise'],
    eligibleApplicantTypes: ['Individual', 'Startup', 'SME', 'NGO'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 900000,
    currency: 'USD',
    minReadinessScore: 45,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Limited Liability', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'OTF Rolling Concept Note Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Open-source internet freedom, digital rights, cybersecurity, and circumvention technologies.',
    internalNotes: 'Rolling bi-monthly review; open to individuals, nonprofits, and businesses in Ghana and globally.'
  },
  {
    id: 'grant-42',
    opportunityCode: 'GRANT-GCHR-AWARDS-2026',
    title: 'Human Rights Recognition Awards',
    fundingOrganization: 'Geneva Centre for Human Rights Advancement and Global Dialogue',
    officialSourceUrl: 'https://www.gchragd.org',
    description: 'International award (CHF 1,000) recognizing NGOs, community initiatives, and individuals globally making tangible contributions to human rights protection and peaceful dialogue.',
    targetSectors: ['NGO / Social Enterprise', 'Education & Training'],
    eligibleApplicantTypes: ['Individual', 'NGO'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 1100,
    maxFundingAmount: 1100,
    currency: 'USD',
    minReadinessScore: 35,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-21',
    closingDate: '2026-11-23',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Geneva Centre Online Nomination Form',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Grassroots human rights advocacy, peacebuilding, and inclusive global dialogue.',
    internalNotes: 'Award is CHF 1,000 (~USD 1,100); open to all countries including Ghana.'
  },
  {
    id: 'grant-43',
    opportunityCode: 'GRANT-FREEDOMPRIZE-2027',
    title: '9th Edition Freedom Prize 2027',
    fundingOrganization: 'Normandy Region',
    officialSourceUrl: 'https://normandiepourlapaix.fr/en/freedom-prize',
    description: 'Annual youth-led international prize inviting young people aged 15–25 worldwide to nominate and honor courageous individuals or organizations fighting for freedom and human rights.',
    targetSectors: ['NGO / Social Enterprise', 'Education & Training'],
    eligibleApplicantTypes: ['Individual', 'NGO'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 25000,
    currency: 'EUR',
    minReadinessScore: 30,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2027-01-12',
    isAnnualRecurring: true,
    typicalOpenMonth: 10,
    typicalCloseMonth: 1,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Normandy for Peace Online Nomination Form',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Youth civic engagement (ages 15-25) and international defense of fundamental freedoms.',
    internalNotes: 'Annual recurring cycle; current 9th edition closes Jan 12, 2027.'
  },
  {
    id: 'grant-44',
    opportunityCode: 'GRANT-MSFT-AIECON-2026',
    title: 'Microsoft AI Economy Institute Program (Cohort 4)',
    fundingOrganization: 'Microsoft',
    officialSourceUrl: 'https://www.microsoft.com/en-us/research',
    description: 'USD 75,000 research grant (plus up to USD 20,000 travel support for investigators outside North America) for university and research institution PhD investigators studying AI\'s economic and societal impact.',
    targetSectors: ['Technology & Services', 'Education & Training'],
    eligibleApplicantTypes: ['Individual', 'NGO'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 75000,
    maxFundingAmount: 95000,
    currency: 'USD',
    minReadinessScore: 60,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2026-11-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Microsoft AI Economy Institute Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Empirical research on AI adoption, labor markets, productivity, and inclusive economic growth.',
    internalNotes: 'Principal Investigator must hold a PhD and be affiliated with an accredited university or research institution.'
  },
  {
    id: 'grant-45',
    opportunityCode: 'GRANT-CIVICUS-DDI-2026',
    title: 'Digital Democracy Initiative (DDI)',
    fundingOrganization: 'CIVICUS',
    officialSourceUrl: 'https://www.civicus.org',
    description: 'Ongoing rapid-response and resilience grants (up to USD 10,000 single / USD 20,000 joint) specifically for local CSOs in Global South ODA countries like Ghana countering digital threats to civic space.',
    targetSectors: ['NGO / Social Enterprise', 'Technology & Services'],
    eligibleApplicantTypes: ['NGO'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 20000,
    currency: 'USD',
    minReadinessScore: 45,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'CIVICUS DDI Online Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Digital democracy, civic space protection, and digital resilience for Global South local civil society organizations.',
    internalNotes: 'Rolling intake; explicitly targets local CSOs in ODA-eligible Global South countries including Ghana.'
  },
  {
    id: 'grant-46',
    opportunityCode: 'GRANT-HCLTECH-CLIMATE-2027',
    title: 'HCLTech Global Grant for Climate Action',
    fundingOrganization: 'HCLFoundation / HCLTech',
    officialSourceUrl: 'https://www.hclfoundation.org',
    description: 'USD 5.5M multi-year climate action grant program supporting nonprofits across 24 eligible countries implementing biodiversity restoration, coastal resilience, and clean energy solutions.',
    targetSectors: ['Climate & Renewable Energy', 'NGO / Social Enterprise', 'Agribusiness'],
    eligibleApplicantTypes: ['NGO'],
    eligibleBusinessStages: ['Early-stage Growth', 'Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 250000,
    maxFundingAmount: 5500000,
    currency: 'USD',
    minReadinessScore: 70,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-10-15',
    closingDate: '2027-01-24',
    isAnnualRecurring: true,
    typicalOpenMonth: 10,
    typicalCloseMonth: 1,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'HCLTech Climate Grant Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Climate adaptation, ecosystem restoration, decarbonization, and community-led climate resilience.',
    internalNotes: 'Annual recurring cycle; current cycle closes Jan 24, 2027.'
  },
  {
    id: 'grant-51',
    opportunityCode: 'GRANT-HILTON-PRIZE-2027',
    title: 'Conrad N. Hilton Humanitarian Prize 2027',
    fundingOrganization: 'Conrad N. Hilton Foundation',
    officialSourceUrl: 'https://www.hiltonfoundation.org/grants/humanitarian-prize',
    description: 'The world\'s largest humanitarian award (USD 2.5M) recognizing established nonprofits (5+ years, audited financials, >=USD 750K annual expenditure) alleviating human suffering globally.',
    targetSectors: ['NGO / Social Enterprise', 'Healthcare & Sanitation', 'Education & Training', 'Climate & Renewable Energy'],
    eligibleApplicantTypes: ['NGO'],
    eligibleBusinessStages: ['Established Scaling'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 2500000,
    maxFundingAmount: 2500000,
    currency: 'USD',
    minReadinessScore: 85,
    requiresRegistration: true,
    requiredLegalTypes: ['Company Limited by Guarantee (NGO)'],
    requiresBankStatements: true,
    requiresTaxClearance: true,
    openingDate: '2026-11-01',
    closingDate: '2027-04-30',
    isAnnualRecurring: true,
    typicalOpenMonth: 11,
    typicalCloseMonth: 4,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Hilton Humanitarian Prize Nomination Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T18:00:00Z',
    donorFocus: 'Extraordinary contributions toward alleviating human suffering by mature, audited nonprofit organizations.',
    internalNotes: 'Annual recurring cycle; requires 5+ years of operation, audited financials, and >=USD 750k annual expenditure.'
  },
  // === Ghana & Africa MSME, Creative, Fashion, Tourism & Beauty Gap Fillers ===
  {
    id: 'grant-52',
    opportunityCode: 'GRANT-TEF-2027',
    title: 'Tony Elumelu Foundation (TEF) Entrepreneurship Programme',
    fundingOrganization: 'Tony Elumelu Foundation',
    officialSourceUrl: 'https://www.tonyelumelufoundation.org',
    description: 'Pan-African flagship entrepreneurship programme providing USD 5,000 non-refundable seed capital, business training, and mentorship across all MSME sectors.',
    targetSectors: ['General Commerce & Services', 'Agribusiness', 'Fashion & Textiles', 'Beauty & Personal Care', 'Tourism & Hospitality', 'Technology & Services', 'Creative Arts & Media'],
    eligibleApplicantTypes: ['Startup', 'SME', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 5000,
    currency: 'USD',
    minReadinessScore: 35,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2027-01-01',
    closingDate: '2027-03-01',
    isAnnualRecurring: true,
    typicalOpenMonth: 1,
    typicalCloseMonth: 3,
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'TEFConnect Portal',
    hasApplicationFee: false,
    status: 'upcoming',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T20:50:00Z',
    donorFocus: 'African early-stage founders and MSMEs across all 54 African countries including Ghana.',
    internalNotes: 'Annual recurring cycle (Jan 1 – Mar 1); prepares to open Jan 1, 2027.'
  },
  {
    id: 'grant-53',
    opportunityCode: 'GRANT-GEA-BIZBOX-2027',
    title: 'GEA / Mastercard Foundation BizBox MSME & Youth Grant',
    fundingOrganization: 'Ghana Enterprises Agency (GEA)',
    officialSourceUrl: 'https://gea.gov.gh',
    description: 'National Ghana youth and MSME support program providing startup kits, business acceleration grants, and technical training across trades, fashion, beauty, hospitality, and commerce.',
    targetSectors: ['Fashion & Textiles', 'Beauty & Personal Care', 'Tourism & Hospitality', 'General Commerce & Services', 'Agribusiness', 'Manufacturing'],
    eligibleApplicantTypes: ['SME', 'Startup', 'Individual', 'Cooperative'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 5000,
    maxFundingAmount: 50000,
    currency: 'GHS',
    minReadinessScore: 35,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Limited Liability', 'Cooperative'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'GEA Regional BAC / BizBox Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T20:50:00Z',
    donorFocus: 'Ghanaian youth-owned and women-owned MSMEs, vocational trades, and local enterprise job creation.',
    internalNotes: 'Active rolling cohorts through 2027 across all 16 regions of Ghana.'
  },
  {
    id: 'grant-54',
    opportunityCode: 'GRANT-NEIP-ADWUMAWURA-2026',
    title: 'NEIP Adwumawura Youth Entrepreneurship & MSME Grant',
    fundingOrganization: 'National Entrepreneurship and Innovation Programme (NEIP)',
    officialSourceUrl: 'https://neip.gov.gh',
    description: 'Government of Ghana flagship program supporting young Ghanaian entrepreneurs (ages 18–40) with business coaching and startup/growth grants across commerce, fashion, beauty, and hospitality.',
    targetSectors: ['General Commerce & Services', 'Fashion & Textiles', 'Beauty & Personal Care', 'Tourism & Hospitality', 'Agribusiness'],
    eligibleApplicantTypes: ['Startup', 'SME', 'Individual'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 100000,
    currency: 'GHS',
    minReadinessScore: 40,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'NEIP Adwumawura Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T20:50:00Z',
    donorFocus: 'Ghanaian youth-led MSMEs, job creation, and formalization support.',
    internalNotes: 'Continuous cohorts in Ghana for founders aged 18-40.'
  },
  {
    id: 'grant-55',
    opportunityCode: 'GRANT-CREATION-AFRICA-GH',
    title: 'Création Africa Ghana Incubation & Creative Grant',
    fundingOrganization: 'Création Africa Ghana (French Embassy / Expertise France)',
    officialSourceUrl: 'https://creationafricaghana.com',
    description: 'Dedicated Ghana creative economy incubation program offering mentorship and direct grant funding up to EUR 30,000 for fashion, luxury, design, film, animation, and cultural ventures.',
    targetSectors: ['Creative Arts & Media', 'Fashion & Textiles', 'Tourism & Hospitality'],
    eligibleApplicantTypes: ['Startup', 'SME', 'Individual'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 10000,
    maxFundingAmount: 30000,
    currency: 'EUR',
    minReadinessScore: 50,
    requiresRegistration: true,
    requiredLegalTypes: ['Sole Proprietorship', 'Limited Liability'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2027-03-31',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Création Africa Ghana Application Portal',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T20:50:00Z',
    donorFocus: 'Ghanaian cultural and creative industries (fashion, design, audiovisual, publishing).',
    internalNotes: 'Requires commitment to incubation training phase in Ghana.'
  },
  {
    id: 'grant-56',
    opportunityCode: 'GRANT-KUONYESHA-ART-2027',
    title: 'Kuonyesha Art Fund (Pan-African Creative Grants)',
    fundingOrganization: 'Kuonyesha Art Fund',
    officialSourceUrl: 'https://on-the-move.org',
    description: 'Pan-African creative grant offering up to USD 5,000 for socially engaged art, fashion & product design, visual arts, music, film, and publishing projects across Africa.',
    targetSectors: ['Creative Arts & Media', 'Fashion & Textiles', 'NGO / Social Enterprise'],
    eligibleApplicantTypes: ['Individual', 'NGO', 'Startup'],
    eligibleBusinessStages: ['Idea / Pre-revenue', 'Early-stage'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 1500,
    maxFundingAmount: 5000,
    currency: 'USD',
    minReadinessScore: 35,
    requiresRegistration: false,
    requiredLegalTypes: ['Unregistered', 'Sole Proprietorship', 'Company Limited by Guarantee (NGO)'],
    requiresBankStatements: false,
    requiresTaxClearance: false,
    openingDate: '2026-10-01',
    closingDate: '2027-02-28',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Kuonyesha Online Submission',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T20:50:00Z',
    donorFocus: 'Socially engaged African artists, fashion designers, and cultural collectives.',
    internalNotes: 'Open to creatives and collectives across Africa including Ghana.'
  },
  {
    id: 'grant-57',
    opportunityCode: 'GRANT-VILLGRO-AFRICA-2026',
    title: 'Villgro Africa Incubation & Seed Funding Program',
    fundingOrganization: 'Villgro Africa',
    officialSourceUrl: 'https://villgroafrica.org',
    description: 'Rolling Africa-focused incubator and seed financier ($20K–$150K) supporting early-stage impact-driven MSMEs in healthcare, agribusiness, climate, and essential commerce.',
    targetSectors: ['Healthcare & Sanitation', 'Agribusiness', 'Climate & Renewable Energy', 'General Commerce & Services'],
    eligibleApplicantTypes: ['Startup', 'SME'],
    eligibleBusinessStages: ['Early-stage', 'Early-stage Growth'],
    eligibleRegions: ['All 16 Regions of Ghana'],
    minFundingAmount: 20000,
    maxFundingAmount: 150000,
    currency: 'USD',
    minReadinessScore: 55,
    requiresRegistration: true,
    requiredLegalTypes: ['Limited Liability'],
    requiresBankStatements: true,
    requiresTaxClearance: false,
    openingDate: '2026-09-01',
    closingDate: '2027-06-30',
    deadlineTimezone: 'Africa/Accra',
    applicationMethod: 'Villgro Africa Rolling Application',
    hasApplicationFee: false,
    status: 'verified_open',
    verifiedBy: 'staff-01',
    verifiedAt: '2026-11-20T20:50:00Z',
    donorFocus: 'Early-stage African social enterprises and MSMEs scaling essential goods and services.',
    internalNotes: 'Rolling intake; targets Africa-based impact enterprises.'
  }
];

function shiftDateYear(dateStr, targetYear) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${targetYear}-${parts[1]}-${parts[2]}`;
}

function syncRecurringGrantCycles(grants) {
  const today = new Date().toISOString().split('T')[0];
  let changed = false;

  const updated = grants.map(g => {
    if (!g.isAnnualRecurring || !g.openingDate || !g.closingDate) return g;

    let openDate = g.openingDate;
    let closeDate = g.closingDate;
    const spansTwoYears = openDate.slice(5) > closeDate.slice(5);

    // If current cycle has already closed, automatically advance to next year's cycle
    if (today > closeDate) {
      const nextCloseYear = Number(closeDate.slice(0, 4)) + 1;
      const nextOpenYear = spansTwoYears ? nextCloseYear - 1 : nextCloseYear;
      openDate = shiftDateYear(openDate, nextOpenYear);
      closeDate = shiftDateYear(closeDate, nextCloseYear);
      changed = true;
      return {
        ...g,
        openingDate: openDate,
        closingDate: closeDate,
        status: today >= openDate ? 'pending_verification' : 'upcoming'
      };
    }

    // If opening month/date has arrived for an upcoming recurring grant, trigger pending verification
    if (g.status === 'upcoming' && today >= openDate && today <= closeDate) {
      changed = true;
      return {
        ...g,
        status: 'pending_verification'
      };
    }

    return g;
  });

  if (changed) {
    localStorage.setItem(LOCAL_GRANTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

function normalizeGrantKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function deduplicateGrants(grants) {
  const seenTitleOrg = new Set();
  const seenCodes = new Set();
  const unique = [];

  for (const grant of grants) {
    const titleOrgKey = `${normalizeGrantKey(grant.title)}::${normalizeGrantKey(grant.fundingOrganization)}`;
    const codeKey = normalizeGrantKey(grant.opportunityCode);

    if (seenTitleOrg.has(titleOrgKey) || (codeKey && seenCodes.has(codeKey))) {
      continue;
    }

    seenTitleOrg.add(titleOrgKey);
    if (codeKey) seenCodes.add(codeKey);
    unique.push(grant);
  }

  return unique;
}

function mapGrantToRow(g) {
  return {
    id: g.id,
    opportunity_code: g.opportunityCode,
    title: g.title,
    funding_organization: g.fundingOrganization,
    official_source_url: g.officialSourceUrl || '',
    description: g.description || '',
    target_sectors: g.targetSectors || [],
    eligible_applicant_types: g.eligibleApplicantTypes || [],
    eligible_business_stages: g.eligibleBusinessStages || [],
    eligible_regions: g.eligibleRegions || ['All 16 Regions of Ghana'],
    min_funding_amount: Number(g.minFundingAmount) || 0,
    max_funding_amount: Number(g.maxFundingAmount) || 0,
    currency: g.currency || 'USD',
    min_readiness_score: Number(g.minReadinessScore) || 50,
    requires_registration: Boolean(g.requiresRegistration),
    required_legal_types: g.requiredLegalTypes || [],
    requires_bank_statements: Boolean(g.requiresBankStatements),
    requires_tax_clearance: Boolean(g.requiresTaxClearance),
    opening_date: g.openingDate || null,
    closing_date: g.closingDate || null,
    is_annual_recurring: Boolean(g.isAnnualRecurring),
    typical_open_month: g.typicalOpenMonth || null,
    typical_close_month: g.typicalCloseMonth || null,
    deadline_timezone: g.deadlineTimezone || 'Africa/Accra',
    application_method: g.applicationMethod || '',
    has_application_fee: Boolean(g.hasApplicationFee),
    status: g.status || 'pending_verification',
    verified_by: g.verifiedBy || null,
    verified_at: g.verifiedAt || null,
    donor_focus: g.donorFocus || '',
    internal_notes: g.internalNotes || ''
  };
}

function mapRowToGrant(row) {
  return {
    id: row.id,
    opportunityCode: row.opportunity_code,
    title: row.title,
    fundingOrganization: row.funding_organization,
    officialSourceUrl: row.official_source_url || '',
    description: row.description || '',
    targetSectors: row.target_sectors || [],
    eligibleApplicantTypes: row.eligible_applicant_types || [],
    eligibleBusinessStages: row.eligible_business_stages || [],
    eligibleRegions: row.eligible_regions || ['All 16 Regions of Ghana'],
    minFundingAmount: Number(row.min_funding_amount) || 0,
    maxFundingAmount: Number(row.max_funding_amount) || 0,
    currency: row.currency || 'USD',
    minReadinessScore: row.min_readiness_score ?? 50,
    requiresRegistration: Boolean(row.requires_registration),
    requiredLegalTypes: row.required_legal_types || [],
    requiresBankStatements: Boolean(row.requires_bank_statements),
    requiresTaxClearance: Boolean(row.requires_tax_clearance),
    openingDate: row.opening_date || null,
    closingDate: row.closing_date || null,
    isAnnualRecurring: Boolean(row.is_annual_recurring),
    typicalOpenMonth: row.typical_open_month || undefined,
    typicalCloseMonth: row.typical_close_month || undefined,
    deadlineTimezone: row.deadline_timezone || 'Africa/Accra',
    applicationMethod: row.application_method || '',
    hasApplicationFee: Boolean(row.has_application_fee),
    status: row.status || 'pending_verification',
    verifiedBy: row.verified_by || null,
    verifiedAt: row.verified_at || null,
    donorFocus: row.donor_focus || '',
    internalNotes: row.internal_notes || ''
  };
}

export const grantService = {
  getGrants() {
    const saved = localStorage.getItem(LOCAL_GRANTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return syncRecurringGrantCycles(deduplicateGrants(parsed));
        }
      } catch (e) {
        console.error('Failed to parse saved grants:', e);
      }
    }
    const synced = syncRecurringGrantCycles(deduplicateGrants(SEEDED_GRANTS));
    localStorage.setItem(LOCAL_GRANTS_KEY, JSON.stringify(synced));
    return synced;
  },

  saveGrants(list) {
    const deduplicated = deduplicateGrants(list);
    localStorage.setItem(LOCAL_GRANTS_KEY, JSON.stringify(deduplicated));
    return deduplicated;
  },

  getGrantById(grantId) {
    const grants = this.getGrants();
    return grants.find(g => g.id === grantId) || null;
  },

  async syncGrantsFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return this.getGrants();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this.getGrants();

      const { data, error } = await supabase
        .from('grant_opportunities')
        .select('*')
        .order('closing_date', { ascending: true });

      if (error || !Array.isArray(data)) return this.getGrants();

      if (data.length === 0) {
        const seededRows = deduplicateGrants(SEEDED_GRANTS).map(mapGrantToRow);
        await supabase.from('grant_opportunities').upsert(seededRows, { onConflict: 'id' });
        return this.saveGrants(SEEDED_GRANTS);
      }

      const remoteMapped = data.map(mapRowToGrant);
      const remoteIds = new Set(remoteMapped.map(g => g.id));
      const missingSeeded = SEEDED_GRANTS.filter(g => !remoteIds.has(g.id));
      if (missingSeeded.length > 0) {
        await supabase
          .from('grant_opportunities')
          .upsert(missingSeeded.map(mapGrantToRow), { onConflict: 'id' });
      }

      return this.saveGrants(syncRecurringGrantCycles([...remoteMapped, ...missingSeeded]));
    } catch (e) {
      console.warn('Supabase grants sync skipped:', e);
      return this.getGrants();
    }
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
    const verifiedRecord = updated.find(g => g.id === grantId);

    if (isSupabaseConfigured && supabase && verifiedRecord) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('grant_opportunities')
            .upsert(mapGrantToRow(verifiedRecord), { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Supabase grant verification sync skipped:', e);
      }
    }

    await auditService.logEvent({
      entityType: 'grant_opportunity',
      entityId: grantId,
      action: 'verify_grant',
      newState: { status: 'verified_open', verifiedBy: currentStaff.id },
      notes: `Verified grant "${target.title}" against official source ${officialSourceUrl || target.officialSourceUrl}`
    });

    return verifiedRecord;
  },

  async createGrantOpportunity(data) {
    const currentStaff = authService.getCurrentUser();
    const grants = this.getGrants();

    const incomingTitleOrg = `${normalizeGrantKey(data.title)}::${normalizeGrantKey(data.fundingOrganization)}`;
    const incomingCode = normalizeGrantKey(data.opportunityCode);
    const duplicate = grants.find(
      g =>
        `${normalizeGrantKey(g.title)}::${normalizeGrantKey(g.fundingOrganization)}` === incomingTitleOrg ||
        (incomingCode && normalizeGrantKey(g.opportunityCode) === incomingCode)
    );
    if (duplicate) {
      throw new Error(`Duplicate grant opportunity: "${duplicate.title}" (${duplicate.fundingOrganization}) already exists.`);
    }

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
      eligibleRegions: ['All 16 Regions of Ghana'],
      ...data,
      createdAt: new Date().toISOString()
    };

    const updated = [newGrant, ...grants];
    this.saveGrants(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('grant_opportunities')
            .upsert(mapGrantToRow(newGrant), { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Supabase grant create sync skipped:', e);
      }
    }

    await auditService.logEvent({
      entityType: 'grant_opportunity',
      entityId: newGrant.id,
      action: 'create_grant',
      newState: newGrant,
      notes: `Created grant opportunity draft "${newGrant.title}"`
    });

    return newGrant;
  },

  previewBulkImport(rawText) {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return { readyToImport: [], skipped: [] };
    }

    let parsedItems = [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      parsedItems = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      parsedItems = trimmed
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const [
            title = '',
            fundingOrganization = '',
            closingDate = '2027-06-30',
            sector = 'NGO / Social Enterprise',
            currency = 'USD',
            minFundingAmount = '5000',
            maxFundingAmount = '50000',
            officialSourceUrl = 'https://official-funder-source.org',
            description = ''
          ] = line.split('|').map(part => part.trim());

          return {
            title,
            fundingOrganization,
            closingDate,
            targetSectors: sector ? [sector] : ['NGO / Social Enterprise'],
            currency: currency || 'USD',
            minFundingAmount: Number(minFundingAmount) || 5000,
            maxFundingAmount: Number(maxFundingAmount) || 50000,
            officialSourceUrl: officialSourceUrl || 'https://official-funder-source.org',
            description: description || `${title} funding opportunity eligible for Ghana and Africa.`
          };
        });
    }

    const existing = this.getGrants();
    const seenTitleOrg = new Set(
      existing.map(g => `${normalizeGrantKey(g.title)}::${normalizeGrantKey(g.fundingOrganization)}`)
    );
    const seenCodes = new Set(
      existing.map(g => normalizeGrantKey(g.opportunityCode)).filter(Boolean)
    );
    const today = new Date().toISOString().split('T')[0];
    const nonAfricaPattern = /\b(us only|usa only|united states only|eu only|europe only|uk only|canada only|india only|australia only|malaysia only|austria only|germany only)\b/i;

    const readyToImport = [];
    const skipped = [];

    for (const raw of parsedItems) {
      const title = String(raw.title || '').trim();
      const org = String(raw.fundingOrganization || '').trim();
      if (!title || !org) {
        skipped.push({ title: title || '(Untitled)', reason: 'Missing title or funding organization' });
        continue;
      }

      const key = `${normalizeGrantKey(title)}::${normalizeGrantKey(org)}`;
      const codeKey = normalizeGrantKey(raw.opportunityCode);
      if (seenTitleOrg.has(key) || (codeKey && seenCodes.has(codeKey))) {
        skipped.push({ title, reason: `Duplicate (${org})` });
        continue;
      }

      const closingDate = String(raw.closingDate || '').trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(closingDate) && closingDate < today) {
        skipped.push({ title, reason: `Expired (${closingDate})` });
        continue;
      }

      const geoBlob = `${raw.description || ''} ${raw.donorFocus || ''} ${raw.internalNotes || ''} ${(raw.eligibleRegions || []).join(' ')}`;
      if (nonAfricaPattern.test(geoBlob)) {
        skipped.push({ title, reason: 'Excluded: Non-Ghana/Africa geographic restriction' });
        continue;
      }

      seenTitleOrg.add(key);
      if (codeKey) seenCodes.add(codeKey);

      readyToImport.push({
        title,
        fundingOrganization: org,
        officialSourceUrl: raw.officialSourceUrl || 'https://official-funder-source.org',
        description: raw.description || `${title} funding opportunity.`,
        targetSectors: Array.isArray(raw.targetSectors) && raw.targetSectors.length > 0
          ? raw.targetSectors
          : ['NGO / Social Enterprise'],
        eligibleApplicantTypes: Array.isArray(raw.eligibleApplicantTypes) && raw.eligibleApplicantTypes.length > 0
          ? raw.eligibleApplicantTypes
          : ['NGO', 'SME', 'Startup'],
        eligibleBusinessStages: Array.isArray(raw.eligibleBusinessStages) && raw.eligibleBusinessStages.length > 0
          ? raw.eligibleBusinessStages
          : ['Early-stage', 'Early-stage Growth'],
        eligibleRegions: ['All 16 Regions of Ghana'],
        minFundingAmount: Number(raw.minFundingAmount) || 5000,
        maxFundingAmount: Number(raw.maxFundingAmount) || 50000,
        currency: raw.currency || 'USD',
        minReadinessScore: Number(raw.minReadinessScore) || 50,
        requiresRegistration: raw.requiresRegistration ?? true,
        requiredLegalTypes: Array.isArray(raw.requiredLegalTypes) && raw.requiredLegalTypes.length > 0
          ? raw.requiredLegalTypes
          : ['Limited Liability', 'Company Limited by Guarantee (NGO)'],
        requiresBankStatements: Boolean(raw.requiresBankStatements),
        requiresTaxClearance: Boolean(raw.requiresTaxClearance),
        openingDate: raw.openingDate || today,
        closingDate: closingDate || '2027-06-30',
        donorFocus: raw.donorFocus || 'Ghana and Africa eligible funding opportunity.',
        internalNotes: raw.internalNotes || 'Imported via Quick Import vetting pipeline.'
      });
    }

    return { readyToImport, skipped };
  },

  async commitBulkImport(items, markVerified = false) {
    if (!Array.isArray(items) || items.length === 0) return [];

    const currentStaff = authService.getCurrentUser();
    const grants = this.getGrants();
    const now = new Date().toISOString();

    const prepared = items.map((item, idx) => ({
      id: `grant-imp-${Date.now().toString().slice(-5)}-${idx}`,
      opportunityCode: item.opportunityCode || `GRANT-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`,
      status: markVerified ? 'verified_open' : 'pending_verification',
      verifiedBy: markVerified ? currentStaff.id : null,
      verifiedAt: markVerified ? now : null,
      hasApplicationFee: false,
      deadlineTimezone: 'Africa/Accra',
      ...item,
      createdAt: now
    }));

    const updated = this.saveGrants([...prepared, ...grants]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('grant_opportunities')
            .upsert(prepared.map(mapGrantToRow), { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Supabase bulk grant sync skipped:', e);
      }
    }

    await auditService.logEvent({
      entityType: 'grant_opportunity',
      entityId: prepared[0].id,
      action: 'bulk_import_grants',
      newState: { count: prepared.length, markVerified },
      notes: `Bulk imported ${prepared.length} vetted Ghana/Africa grant opportunities`
    });

    return updated;
  }
};

