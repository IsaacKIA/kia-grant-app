export const PILLARS = [
  {
    id: 'legal',
    name: '1. Legal & Business Registration',
    maxPoints: 10,
    description: 'Formal business registration with Registrar General / ORC, valid tax ID, and dedicated corporate banking.',
    subCriteria: [
      {
        id: 'legal_reg',
        title: 'ORC / RGD Registration Certificate & Form 3',
        weight: 1, // 0-5 scaled to 5 pts
        description: 'Business registration with the Registrar General’s Department / Office of the Registrar of Companies (ORC).',
        guidance: {
          0: 'Unregistered or no documentation available.',
          2: 'Sole proprietorship registered, but documents missing or outdated.',
          4: 'Registered business with active status, minor renewal pending.',
          5: 'Fully verified Limited Liability or Sole Proprietorship with valid current Form 3.'
        },
        fixAction: 'Register business with ORC as a Limited Liability or Enterprise, secure incorporation certificate.'
      },
      {
        id: 'legal_bank',
        title: 'TIN / Ghana Card & Corporate Bank Account',
        weight: 1, // 0-5 scaled to 5 pts
        description: 'Official Tax Identification Number / Ghana Card linkage and an active business bank account (not personal momo/bank).',
        guidance: {
          0: 'No business bank account; uses personal account or informal cash.',
          2: 'Business bank account opened recently (<3 months) with minimal activity.',
          4: 'Operational corporate bank account with regular cashflow records.',
          5: 'Audited corporate banking history with verified TIN and seamless transaction records.'
        },
        fixAction: 'Open dedicated commercial business account in company name; link Ghana Card / TIN.'
      }
    ]
  },
  {
    id: 'business_model',
    name: '2. Business Clarity & Model',
    maxPoints: 10,
    description: 'Clarity of value proposition, target customer segment, revenue streams, and market validation.',
    subCriteria: [
      {
        id: 'model_value',
        title: 'Value Proposition & Problem-Solution Fit',
        weight: 1,
        description: 'Clear definition of the core problem being solved and why customers pay for your solution.',
        guidance: {
          0: 'Vague concept without clear problem definition.',
          2: 'Basic concept outlined, but value proposition lacks differentiation.',
          4: 'Clear, compelling value proposition with well-defined customer personas.',
          5: 'Proven problem-solution fit with strong competitive moat and unique advantage.'
        },
        fixAction: 'Refine value proposition canvas; document customer pain points and quantifiable benefits.'
      },
      {
        id: 'model_traction',
        title: 'Commercial Traction & Revenue Viability',
        weight: 1,
        description: 'Evidence of active sales, paying customers, repeat purchase rates, or validated pilot agreements.',
        guidance: {
          0: 'Idea stage only; zero revenue and no customer testing.',
          2: 'Pre-revenue or erratic sales with fewer than 10 paying customers.',
          4: 'Consistent monthly recurring revenue with growing customer base.',
          5: 'Strong revenue growth (>12 months), verified contracts, and healthy unit economics.'
        },
        fixAction: 'Gather customer receipts, sales ledgers, distributor agreements, or pilot testimonial letters.'
      }
    ]
  },
  {
    id: 'documentation',
    name: '3. Documentation Readiness',
    maxPoints: 15,
    description: 'Quality and completeness of business plans, concept notes, pitch decks, and operational proof.',
    subCriteria: [
      {
        id: 'doc_plan',
        title: 'Comprehensive Business Plan / Concept Note',
        weight: 1,
        description: 'A 15–30 page standard business plan or donor concept note detailing strategy, ops, and market.',
        guidance: {
          0: 'No business plan or concept note exists.',
          2: 'Rough 2-page outline with missing sections and outdated figures.',
          4: 'Well-structured business plan covering marketing, operations, and risks.',
          5: 'Institutional-grade, grant-tailored business plan with executive summary and appendices.'
        },
        fixAction: 'Draft or update comprehensive business plan aligned to current market and donor expectations.'
      },
      {
        id: 'doc_pitch',
        title: 'Professional Investor / Grant Pitch Deck',
        weight: 1,
        description: 'A polished 10–12 slide deck communicating the problem, solution, traction, team, and funding ask.',
        guidance: {
          0: 'No pitch deck created.',
          2: 'Text-heavy slides with poor design and incomplete narrative.',
          4: 'Clear, modern slide deck communicating the key highlights well.',
          5: 'Visually compelling, high-converting deck with clear funding milestones and metrics.'
        },
        fixAction: 'Design a clean 10-slide pitch deck focusing on impact, traction, and specific grant milestone budget.'
      },
      {
        id: 'doc_traction',
        title: 'Operational Evidence (Photos, MoUs, Invoices)',
        weight: 1,
        description: 'Tangible proof of operations: facility photos, client agreements, supply contracts, off-taker MoUs.',
        guidance: {
          0: 'No operational proof available.',
          2: 'A few photos or informal WhatsApp chats with customers.',
          4: 'Organized portfolio of photos, receipts, delivery slips, and customer letters.',
          5: 'Formal signed off-taker agreements, corporate MoUs, and site verification evidence.'
        },
        fixAction: 'Assemble an operational portfolio: high-res photos, signed client orders, and supplier letters.'
      }
    ]
  },
  {
    id: 'financial',
    name: '4. Financial Health & Records',
    maxPoints: 10,
    description: 'Historical book-keeping, income statements, cashflow records, and realistic 3-year forecasts.',
    subCriteria: [
      {
        id: 'fin_records',
        title: 'Historical Financial Records & Bookkeeping',
        weight: 1,
        description: 'Track record of monthly sales, expenses, bank statements, and profit & loss statements.',
        guidance: {
          0: 'No bookkeeping; all finances mixed with personal expenses.',
          2: 'Informal paper notebook with sporadic sales entries.',
          4: 'Digitized spreadsheets or QuickBooks/Wave accounting records for 1+ years.',
          5: 'Audited or chartered accountant-certified financial statements for 2–3 years.'
        },
        fixAction: 'Engage accounting support to reconstruct 12–24 months of P&L and balance sheets from bank statements.'
      },
      {
        id: 'fin_projections',
        title: '3–5 Year Financial Projections & Unit Economics',
        weight: 1,
        description: 'Realistic projection model detailing revenue growth, COGS, operating costs, and breakeven analysis.',
        guidance: {
          0: 'No future projections exist.',
          2: 'Unrealistic figures (e.g. 500% profit with zero cost basis).',
          4: 'Defensible 3-year financial model with transparent assumptions.',
          5: 'Institutional 5-year financial model including scenario analysis (conservative, expected, aggressive).'
        },
        fixAction: 'Build a dynamic 3-year financial model with clear unit economics and grant capital deployment schedule.'
      }
    ]
  },
  {
    id: 'compliance',
    name: '5. Compliance & Governance',
    maxPoints: 10,
    description: 'GRA tax clearance, SSNIT contributions, regulatory certifications (FDA, EPA, GSA), and local permits.',
    subCriteria: [
      {
        id: 'comp_tax',
        title: 'GRA Tax Filing Status & SSNIT Compliance',
        weight: 1,
        description: 'Up-to-date filing of corporate income tax, withholding tax, and employee social security payments.',
        guidance: {
          0: 'Never filed taxes; significant liabilities or unregistered with GRA.',
          2: 'Registered with GRA but filing is in arrears.',
          4: 'Regular filings submitted; tax clearance certificate in process.',
          5: 'Clean current Tax Clearance Certificate (TCC) and verified SSNIT compliance certificate.'
        },
        fixAction: 'File outstanding tax returns with GRA and obtain a valid Tax Clearance Certificate.'
      },
      {
        id: 'comp_permits',
        title: 'Sector Licenses & Environmental Permits (FDA, EPA, GSA)',
        weight: 1,
        description: 'Required certifications for specialized sectors (Food/Drug, Manufacturing, Construction, Agriculture).',
        guidance: {
          0: 'Lacks legally required operating permits.',
          2: 'Application submitted or provisional district assembly permit only.',
          4: 'Primary sector license active with compliance records.',
          5: 'All statutory licenses (FDA, EPA, GSA, Fire Service, District Assembly) up-to-date.'
        },
        fixAction: 'Complete application for essential regulatory permits (FDA facility license, EPA permit, or District Permit).'
      }
    ]
  },
  {
    id: 'team',
    name: '6. Founder & Team Capacity',
    maxPoints: 10,
    description: 'Founder experience, execution capability, full-time commitment, and complementary management team.',
    subCriteria: [
      {
        id: 'team_founder',
        title: 'Founder Commitment & Industry Experience',
        weight: 1,
        description: 'Founder’s domain expertise, track record, leadership capability, and 100% full-time commitment.',
        guidance: {
          0: 'Founder is part-time, lacks industry background, or has high turnover.',
          2: 'Enthusiastic founder with limited direct industry experience.',
          4: 'Full-time founder with 3+ years relevant domain expertise and leadership acumen.',
          5: 'Recognized industry practitioner with demonstrable leadership success and 100% commitment.'
        },
        fixAction: 'Highlight founder’s technical skills, certifications, and industry track record in CV/bio.'
      },
      {
        id: 'team_skills',
        title: 'Complementary Management Team & Advisory Board',
        weight: 1,
        description: 'Presence of key roles (Finance, Technical/Ops, Sales) and reputable external advisors.',
        guidance: {
          0: 'One-person show with no support staff or advisors.',
          2: 'Informal casual laborers with no management structure.',
          4: 'Organized team covering key functions (Finance, Operations, Sales).',
          5: 'Robust leadership team, clear organizational chart, and active advisory board.'
        },
        fixAction: 'Appoint key functional leads (e.g., Accountant, Operations Manager) and formalize an Advisory Board.'
      }
    ]
  },
  {
    id: 'sector_fit',
    name: '7. Sector & Grant Alignment',
    maxPoints: 10,
    description: 'Alignment with active bilateral, multilateral, and domestic development funding priorities.',
    subCriteria: [
      {
        id: 'sector_donor',
        title: 'Alignment with Active Donor Priorities',
        weight: 1,
        description: 'Fits key donor funding priorities: Agribusiness, Climate Resilience, Digital Tech, Youth/Women-led.',
        guidance: {
          0: 'Operates in a non-grant-friendly niche (e.g. pure trading/importation of consumer goods).',
          2: 'Marginal alignment with donor objectives.',
          4: 'Strong alignment with active calls (e.g. food security, clean energy, women entrepreneurship).',
          5: 'Direct sweet-spot for major funding agencies (Mastercard, World Bank, USAID, GIZ, AfDB).'
        },
        fixAction: 'Refine business positioning to emphasize circular economy, local sourcing, or tech-enablement.'
      },
      {
        id: 'sector_scale',
        title: 'Scalability & Market Growth Potential',
        weight: 1,
        description: 'Potential of the business to scale regionally or nationally and solve systematic market bottlenecks.',
        guidance: {
          0: 'Hyper-local business with no scale potential.',
          2: 'Linear growth dependent solely on heavy capital assets.',
          4: 'Proven scalable model with viable regional expansion roadmap.',
          5: 'High-growth model capable of expanding across Ghana and West Africa with strong network effects.'
        },
        fixAction: 'Develop a clear replication and expansion strategy across key Ghanaian regions.'
      }
    ]
  },
  {
    id: 'impact',
    name: '8. Impact & Development Value',
    maxPoints: 10,
    description: 'Measurable social impact, job creation (youth and women), ESG standards, and community upliftment.',
    subCriteria: [
      {
        id: 'impact_jobs',
        title: 'Job Creation & Youth/Women Empowerment',
        weight: 1,
        description: 'Demonstrated capacity to create direct and indirect sustainable jobs for young people and women.',
        guidance: {
          0: 'No job creation potential beyond the founder.',
          2: '1–2 casual workers with low wages.',
          4: 'Employs 5–20 youth/women with structured capacity building.',
          5: 'Proven high-multiplier employment model (50+ direct/indirect beneficiaries, outgrowers, artisans).'
        },
        fixAction: 'Document current payroll headcounts and outline measurable 2-year job creation targets with gender breakdown.'
      },
      {
        id: 'impact_esg',
        title: 'Environmental Sustainability & SDG Alignment',
        weight: 1,
        description: 'Contributions to UN SDGs (No Poverty, Zero Hunger, Gender Equality, Decent Work, Climate Action).',
        guidance: {
          0: 'No positive environmental or social impact; potential negative externalities.',
          2: 'Basic awareness of SDGs, but no formal sustainability practices.',
          4: 'Clear environmental/social benefits (e.g. solar usage, waste reduction, fair wages).',
          5: 'Certified green/social enterprise practices with verifiable ESG impact measurement.'
        },
        fixAction: 'Map company operations against 3 primary UN SDGs and articulate environmental/community benefits.'
      }
    ]
  },
  {
    id: 'grant_history',
    name: '9. Grant History & Track Record',
    maxPoints: 5,
    description: 'Demonstrated experience in winning, managing, and reporting on previous grants or competition funds.',
    subCriteria: [
      {
        id: 'grant_history',
        title: 'Previous Grants, Competitions & Fiduciary Integrity',
        weight: 1, // 0-5 = 5 pts max
        description: 'Track record of successfully managing public/private funds without financial irregularities.',
        guidance: {
          0: 'First-time applicant with zero grant or competition experience.',
          2: 'Applied previously but never shortlisted or awarded.',
          4: 'Won regional pitch competition, incubator stipend, or local seed grant.',
          5: 'Successfully managed and fully acquitted institutional grant ($10k–$100k) with clean audit reports.'
        },
        fixAction: 'Gather completion letters, award notices, and references from past competitions or incubators.'
      }
    ]
  },
  {
    id: 'responsiveness',
    name: '10. Application Readiness & Responsiveness',
    maxPoints: 10,
    description: 'Client dedication, responsiveness, commitment fee payment, and speed of supplying requested data.',
    subCriteria: [
      {
        id: 'app_comm',
        title: 'Communication Speed & Data Provision',
        weight: 1,
        description: 'Speed and diligence of founder in providing requested financials, customer contacts, and paperwork.',
        guidance: {
          0: 'Unresponsive; takes weeks to answer basic requests.',
          2: 'Slow communication; requires multiple reminders.',
          4: 'Prompt responses within 24–48 hours with accurate documents.',
          5: 'Exceptional responsiveness, proactive document collation, and high dedication.'
        },
        fixAction: 'Establish dedicated weekly check-in schedule with founder and assign a point of contact.'
      },
      {
        id: 'app_commitment',
        title: 'Engagement Letter & Commitment Fee (GHS 200)',
        weight: 1,
        description: 'Formalization of consulting agreement with Kia-Start Up Consult and initial financial commitment.',
        guidance: {
          0: 'Refuses or delays signing agreement and paying commitment fee.',
          2: 'Agreement discussed verbally but unsigned; payment pending.',
          4: 'Service agreement signed; commitment fee scheduled.',
          5: 'Fully signed engagement letter with GHS 200 commitment fee paid into Kia account.'
        },
        fixAction: 'Execute client onboarding agreement and secure initial GHS 200 commitment fee.'
      }
    ]
  }
];

export const READINESS_TIERS = [
  {
    min: 80,
    max: 100,
    label: 'Highly Grant-Ready',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    color: '#059669',
    summary: 'Grant-Ready for Competitive International & Donor Funds',
    recommendation: 'Actively prepare and submit applications for competitive grants (UN agencies, Mastercard Foundation, USAID, large World Bank funds). Fast-track Stage 4 narrative development.'
  },
  {
    min: 60,
    max: 79,
    label: 'Moderately Ready',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
    color: '#d97706',
    summary: 'Eligible for Domestic & Medium SME Grants',
    recommendation: 'Apply for medium-scale domestic grants (GEA / YouStart, NEIP, Tony Elumelu Foundation) while concurrently resolving minor documentation and compliance gaps.'
  },
  {
    min: 40,
    max: 59,
    label: 'Low Readiness',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-300',
    color: '#ea580c',
    summary: 'Requires Business Structuring & Documentation',
    recommendation: 'Do NOT apply for competitive grants yet. Enroll in Kia-Start Up Business Structuring service to build financial records, tax filings, and a viable pitch deck first.'
  },
  {
    min: 0,
    max: 39,
    label: 'Not Grant-Ready',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    color: '#e11d48',
    summary: 'Critical Foundational Formalization Needed',
    recommendation: 'Focus on business registration, opening a corporate bank account, and validating core commercial traction before seeking grant capital.'
  }
];

export function calculateReadiness(scores) {
  let total = 0;
  PILLARS.forEach(pillar => {
    pillar.subCriteria.forEach(sub => {
      total += (scores[sub.id] || 0);
    });
  });

  const tier = READINESS_TIERS.find(t => total >= t.min && total <= t.max) || READINESS_TIERS[3];
  
  // Collect high-priority recommendations
  const gaps = [];
  PILLARS.forEach(pillar => {
    pillar.subCriteria.forEach(sub => {
      const val = scores[sub.id] || 0;
      if (val < 4) {
        gaps.push({
          pillar: pillar.name,
          criterion: sub.title,
          currentScore: val,
          fixAction: sub.fixAction,
          severity: val <= 2 ? 'high' : 'medium'
        });
      }
    });
  });

  return {
    totalScore: total,
    tier,
    gaps
  };
}
