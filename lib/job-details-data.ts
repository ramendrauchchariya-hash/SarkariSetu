import type { JobDetails } from './types';

export const jobDetailsData: Record<string, JobDetails> = {
  'combined-graduate-level-examination-2026': {
    id: 'jp-001',
    slug: 'combined-graduate-level-examination-2026',
    title: 'Combined Graduate Level Examination 2026',
    organization: 'Staff Selection Commission',
    department: 'ssc',
    qualification: 'graduate',
    discipline: 'Any Discipline',
    state: 'all-india',
    location: 'All India',
    jobType: 'permanent',
    vacancies: 12450,
    salaryMin: 44900,
    salaryMax: 142400,
    applicationStart: '2026-08-10',
    applicationEnd: '2026-10-15',
    examDate: '2026-11-20',
    status: 'open',
    postedDate: '2026-09-05',
    description:
      'Combined Graduate Level Examination for various Group B and C posts across central government departments. This is one of the largest recruitment drives conducted by SSC, covering posts like Assistant Section Officer, Inspector, Junior Statistical Officer, Auditor, Accountant and more.',
    ageMin: 18,
    ageMax: 32,
    ageCutoffDate: '2026-08-01',
    ageRelaxation:
      'OBC: 3 years, SC/ST: 5 years, PwBD: 10 years, Ex-Servicemen: 3 years (after deduction of military service). Refer to official notification for complete relaxation details.',
    nationality: 'Must be a citizen of India, or a subject of Nepal/Bhutan, or a Tibetan refugee settled in India before 1962.',
    experience: 'Freshers eligible for most posts. Some posts may require relevant experience — check official notification.',
    otherRequirements: 'Certain posts require specific physical standards and computer proficiency.',
    payLevel: 'Level 4 to Level 8 (7th CPC)',
    allowances: 'Dearness Allowance, House Rent Allowance, Transport Allowance and other central government allowances as applicable.',
    correctionEndDate: '2026-10-18',
    cityIntimationDate: '2026-11-05',
    admitCardDate: '2026-11-10',
    resultDate: null,
    notificationReleasedDate: '2026-09-05',
    lastUpdated: '2026-09-05',
    lastVerified: '2026-09-06',
    verificationStatus: 'verified',
    vacancyBreakdown: [
      { post: 'Assistant Section Officer', category: 'UR', state: 'All India', count: 850 },
      { post: 'Assistant Section Officer', category: 'OBC', state: 'All India', count: 520 },
      { post: 'Assistant Section Officer', category: 'SC', state: 'All India', count: 310 },
      { post: 'Assistant Section Officer', category: 'ST', state: 'All India', count: 170 },
      { post: 'Inspector (Income Tax)', category: 'UR', state: 'All India', count: 420 },
      { post: 'Inspector (Income Tax)', category: 'OBC', state: 'All India', count: 280 },
      { post: 'Inspector (Income Tax)', category: 'SC', state: 'All India', count: 160 },
      { post: 'Inspector (Income Tax)', category: 'ST', state: 'All India', count: 90 },
      { post: 'Auditor', category: 'UR', state: 'All India', count: 1100 },
      { post: 'Auditor', category: 'OBC', state: 'All India', count: 720 },
      { post: 'Auditor', category: 'SC', state: 'All India', count: 430 },
      { post: 'Auditor', category: 'ST', state: 'All India', count: 210 },
      { post: 'Junior Statistical Officer', category: 'UR', state: 'All India', count: 950 },
      { post: 'Junior Statistical Officer', category: 'OBC', state: 'All India', count: 600 },
      { post: 'Junior Statistical Officer', category: 'SC', state: 'All India', count: 340 },
      { post: 'Junior Statistical Officer', category: 'ST', state: 'All India', count: 180 },
      { post: 'Accountant', category: 'UR', state: 'All India', count: 1400 },
      { post: 'Accountant', category: 'OBC', state: 'All India', count: 880 },
      { post: 'Accountant', category: 'SC', state: 'All India', count: 520 },
      { post: 'Accountant', category: 'ST', state: 'All India', count: 260 },
    ],
    applicationFees: [
      { category: 'General / OBC', fee: '\u20b9 100' },
      { category: 'SC / ST', fee: 'No fee' },
      { category: 'Women (all categories)', fee: 'No fee' },
      { category: 'PwBD', fee: 'No fee' },
      { category: 'Ex-Servicemen', fee: 'No fee' },
    ],
    feePaymentMethod: 'Online payment via SBI Challan, UPI, Net Banking, or Credit/Debit Card.',
    selectionProcess: [
      'Computer Based Examination (Tier-I)',
      'Computer Based Examination (Tier-II)',
      'Document Verification',
      'Medical Examination (for specific posts)',
    ],
    examPattern: {
      subjects: [
        { subject: 'General Intelligence & Reasoning', questions: 25, marks: 50 },
        { subject: 'General Awareness', questions: 25, marks: 50 },
        { subject: 'Quantitative Aptitude', questions: 25, marks: 50 },
        { subject: 'English Comprehension', questions: 25, marks: 50 },
      ],
      totalQuestions: 100,
      totalMarks: 200,
      duration: '60 minutes',
      negativeMarking: '0.50 marks deducted for each wrong answer',
      mode: 'Computer Based Test (Online)',
    },
    documentsRequired: [
      'Recent passport-size photograph',
      'Scanned signature',
      '10th / Matriculation certificate (for date of birth proof)',
      'Graduation degree / provisional certificate',
      'Category certificate (SC/ST/OBC) if applicable',
      'PwBD certificate if applicable',
      'Ex-Servicemen discharge certificate if applicable',
      'Valid photo ID proof (Aadhaar / PAN / Voter ID / Passport / Driving License)',
    ],
    howToApply: [
      'Read the official notification carefully to confirm your eligibility.',
      'Visit the official SSC application website (ssc.nic.in).',
      'Complete One-Time Registration (OTR) if not already registered.',
      'Log in and select the Combined Graduate Level Examination 2026.',
      'Fill in the application form with personal, educational and preference details.',
      'Upload the required photograph, signature and documents in specified formats.',
      'Pay the application fee online through the available payment methods.',
      'Review all entered information carefully before final submission.',
      'Submit the application and save/print the confirmation page for your records.',
    ],
    officialLinks: [
      { label: 'Official Notification', url: '[official notification URL]', type: 'notification' },
      { label: 'Official Application Portal', url: '[official application URL]', type: 'application' },
      { label: 'SSC Official Website', url: '[official website URL]', type: 'website' },
    ],
    faqs: [
      {
        question: 'Who can apply for SSC CGL 2026?',
        answer:
          'Any graduate from a recognized university who meets the age criteria (18\u201332 years as on 01 August 2026, with applicable relaxation) can apply. Specific posts may have additional requirements.',
      },
      {
        question: 'What is the last date to apply?',
        answer: 'The last date to submit the online application is 15 October 2026 (tentative).',
      },
      {
        question: 'What is the age limit?',
        answer:
          'The general age limit is 18 to 32 years as on 01 August 2026. Age relaxation applies for OBC (3 years), SC/ST (5 years), PwBD (10 years) and other categories as per government norms.',
      },
      {
        question: 'What is the application fee?',
        answer:
          'The application fee is \u20b9 100 for General and OBC candidates. SC, ST, Women, PwBD and Ex-Servicemen candidates are exempt from the fee.',
      },
      {
        question: 'What is the selection process?',
        answer:
          'Selection is through a two-tier Computer Based Examination (Tier-I and Tier-II), followed by Document Verification and Medical Examination for specific posts.',
      },
      {
        question: 'Where can I download the official notification?',
        answer:
          'The official notification can be downloaded from the SSC official website or through the Official Notification link provided in the Official Links section on this page.',
      },
      {
        question: 'Where can I apply online?',
        answer:
          'Applications must be submitted online through the official SSC application portal. Use the Official Application Portal link in the Official Links section.',
      },
    ],
  },

  'assistant-loco-pilot-railway': {
    id: 'jp-002',
    slug: 'assistant-loco-pilot-railway',
    title: 'Assistant Loco Pilot',
    organization: 'Indian Railways',
    department: 'railway',
    qualification: 'iti',
    discipline: 'ITI in relevant trade',
    state: 'all-india',
    location: 'All India',
    jobType: 'permanent',
    vacancies: 9900,
    salaryMin: 19900,
    salaryMax: 63200,
    applicationStart: '2026-08-01',
    applicationEnd: '2026-09-20',
    examDate: '2026-10-15',
    status: 'open',
    postedDate: '2026-09-01',
    description:
      'Recruitment for Assistant Loco Pilot positions across various railway zones. This is a major recruitment drive by Indian Railways for candidates with ITI qualification or 10th pass with required trade certification.',
    ageMin: 18,
    ageMax: 30,
    ageCutoffDate: '2026-07-01',
    ageRelaxation:
      'OBC: 3 years, SC/ST: 5 years, PwBD: 10 years, Ex-Servicemen: 3 years. Refer to official notification for complete details.',
    nationality: 'Must be a citizen of India or a subject of Nepal/Bhutan.',
    experience: 'No prior experience required. Freshers with relevant ITI trade are eligible.',
    otherRequirements: 'Must meet prescribed medical standards (A-1 medical category) including good vision.',
    payLevel: 'Level 2 (7th CPC)',
    allowances: 'Running allowance, Dearness Allowance, House Rent Allowance, Transport Allowance and other railway-specific allowances.',
    correctionEndDate: '2026-09-25',
    cityIntimationDate: '2026-10-01',
    admitCardDate: '2026-10-08',
    resultDate: null,
    notificationReleasedDate: '2026-08-15',
    lastUpdated: '2026-09-01',
    lastVerified: '2026-09-06',
    verificationStatus: 'verified',
    vacancyBreakdown: [
      { post: 'Assistant Loco Pilot', category: 'UR', state: 'All India', count: 4200 },
      { post: 'Assistant Loco Pilot', category: 'OBC', state: 'All India', count: 2500 },
      { post: 'Assistant Loco Pilot', category: 'SC', state: 'All India', count: 1800 },
      { post: 'Assistant Loco Pilot', category: 'ST', state: 'All India', count: 1000 },
      { post: 'Assistant Loco Pilot', category: 'EWS', state: 'All India', count: 400 },
    ],
    applicationFees: [
      { category: 'General / OBC / EWS', fee: '\u20b9 500' },
      { category: 'SC / ST / Women / PwBD / Ex-Servicemen', fee: '\u20b9 250 (refundable after exam)' },
    ],
    feePaymentMethod: 'Online payment via UPI, Net Banking, Credit/Debit Card, or SBI Challan.',
    selectionProcess: [
      'Computer Based Test (CBT-1)',
      'Computer Based Test (CBT-2)',
      'Computer Based Aptitude Test (CBAT)',
      'Document Verification',
      'Medical Examination',
    ],
    examPattern: {
      subjects: [
        { subject: 'Mathematics', questions: 20, marks: 20 },
        { subject: 'General Intelligence & Reasoning', questions: 25, marks: 25 },
        { subject: 'General Science', questions: 20, marks: 20 },
        { subject: 'General Awareness & Current Affairs', questions: 35, marks: 35 },
      ],
      totalQuestions: 100,
      totalMarks: 100,
      duration: '90 minutes',
      negativeMarking: '1/3 mark deducted for each wrong answer',
      mode: 'Computer Based Test (Online)',
    },
    documentsRequired: [
      'Recent passport-size photograph',
      'Scanned signature',
      '10th pass certificate / marksheet',
      'ITI certificate in relevant trade',
      'Caste certificate (SC/ST/OBC) if applicable',
      'EWS income/asset certificate if applicable',
      'PwBD certificate if applicable',
      'Valid photo ID proof',
    ],
    howToApply: [
      'Read the official notification carefully to confirm your eligibility.',
      'Visit the official RRB application website for your chosen railway zone.',
      'Create a new registration with your basic details and email/mobile number.',
      'Log in with your registration number and password.',
      'Fill in the application form with personal, educational and trade details.',
      'Upload the required photograph, signature and certificates.',
      'Pay the application fee through the available online payment methods.',
      'Review and submit the application form.',
      'Save/print the application confirmation for future reference.',
    ],
    officialLinks: [
      { label: 'Official Notification', url: '[official notification URL]', type: 'notification' },
      { label: 'Official Application Portal', url: '[official application URL]', type: 'application' },
      { label: 'Indian Railways Website', url: '[official website URL]', type: 'website' },
    ],
    faqs: [
      {
        question: 'Who can apply for Assistant Loco Pilot?',
        answer:
          'Candidates who have passed 10th/Matriculation and hold an ITI certificate in a relevant trade (or have a diploma in engineering) can apply. Age must be between 18\u201330 years with applicable relaxation.',
      },
      {
        question: 'What is the last date to apply?',
        answer: 'The last date to submit the online application is 20 September 2026.',
      },
      {
        question: 'What is the age limit?',
        answer:
          'The age limit is 18 to 30 years as on 01 July 2026. OBC candidates get 3 years, SC/ST get 5 years, and PwBD get 10 years relaxation.',
      },
      {
        question: 'What is the application fee?',
        answer:
          'General/OBC/EWS: \u20b9 500. SC/ST/Women/PwBD/Ex-Servicemen: \u20b9 250 (refundable after appearing for the exam).',
      },
      {
        question: 'What is the selection process?',
        answer:
          'Selection involves CBT-1, CBT-2, Computer Based Aptitude Test (CBAT), Document Verification and Medical Examination.',
      },
      {
        question: 'Where can I download the official notification?',
        answer:
          'The official notification is available on the RRB website. Use the Official Notification link in the Official Links section.',
      },
      {
        question: 'Where can I apply online?',
        answer:
          'Applications must be submitted through the official RRB application portal. Use the Official Application Portal link in the Official Links section.',
      },
    ],
  },

  'junior-engineer-civil-pwd': {
    id: 'jp-006',
    slug: 'junior-engineer-civil-pwd',
    title: 'Junior Engineer (Civil)',
    organization: 'Public Works Department',
    department: 'state-government',
    qualification: 'diploma',
    discipline: 'Civil Engineering',
    state: 'madhya-pradesh',
    location: 'Madhya Pradesh',
    jobType: 'permanent',
    vacancies: 420,
    salaryMin: 35400,
    salaryMax: 112400,
    applicationStart: '2026-08-10',
    applicationEnd: '2026-09-25',
    examDate: '2026-10-18',
    status: 'open',
    postedDate: '2026-09-02',
    description:
      'Junior Engineer (Civil) recruitment for the Public Works Department of Madhya Pradesh. Diploma or Degree in Civil Engineering required. This is a state-level recruitment for engineering professionals.',
    ageMin: 18,
    ageMax: 40,
    ageCutoffDate: '2026-08-01',
    ageRelaxation:
      'OBC: 5 years, SC/ST: 5 years, PwBD: 15 years. MP state domicile candidates may get additional relaxation. Refer to official notification.',
    nationality: 'Must be a citizen of India.',
    experience: 'No prior experience required for most posts.',
    otherRequirements: 'Must be registered with the relevant state engineering council where applicable.',
    payLevel: 'Level 8 (7th CPC equivalent)',
    allowances: 'Dearness Allowance, House Rent Allowance, Transport Allowance and other state government allowances.',
    correctionEndDate: '2026-09-28',
    cityIntimationDate: '2026-10-05',
    admitCardDate: '2026-10-10',
    resultDate: null,
    notificationReleasedDate: '2026-08-28',
    lastUpdated: '2026-09-02',
    lastVerified: '2026-09-06',
    verificationStatus: 'verified',
    vacancyBreakdown: [
      { post: 'Junior Engineer (Civil)', category: 'UR', state: 'Madhya Pradesh', count: 170 },
      { post: 'Junior Engineer (Civil)', category: 'OBC', state: 'Madhya Pradesh', count: 80 },
      { post: 'Junior Engineer (Civil)', category: 'SC', state: 'Madhya Pradesh', count: 90 },
      { post: 'Junior Engineer (Civil)', category: 'ST', state: 'Madhya Pradesh', count: 55 },
      { post: 'Junior Engineer (Civil)', category: 'EWS', state: 'Madhya Pradesh', count: 25 },
    ],
    applicationFees: [
      { category: 'General / OBC', fee: '\u20b9 300' },
      { category: 'SC / ST / PwBD', fee: '\u20b9 150' },
    ],
    feePaymentMethod: 'Online payment via MP Online portal, UPI, Net Banking, or Kiosk.',
    selectionProcess: [
      'Online Written Examination',
      'Document Verification',
    ],
    examPattern: {
      subjects: [
        { subject: 'Civil Engineering (Technical)', questions: 100, marks: 100 },
        { subject: 'General Knowledge & Reasoning', questions: 50, marks: 50 },
      ],
      totalQuestions: 150,
      totalMarks: 150,
      duration: '120 minutes',
      negativeMarking: 'No negative marking',
      mode: 'Computer Based Test (Online)',
    },
    documentsRequired: [
      'Recent passport-size photograph',
      'Scanned signature',
      '10th and 12th certificates',
      'Diploma/Degree in Civil Engineering certificate',
      'Domicile certificate (for MP state reservation benefits)',
      'Caste certificate if applicable',
      'PwBD certificate if applicable',
      'Valid photo ID proof',
    ],
    howToApply: [
      'Read the official notification carefully to confirm your eligibility.',
      'Visit the official PWD / State PSC application website.',
      'Complete the registration process with your basic details.',
      'Fill in the application form with educational and personal details.',
      'Upload required photograph, signature and certificates.',
      'Pay the application fee online through the MP Online portal.',
      'Review and submit the application.',
      'Save/print the submitted application confirmation for your records.',
    ],
    officialLinks: [
      { label: 'Official Notification', url: '[official notification URL]', type: 'notification' },
      { label: 'Official Application Portal', url: '[official application URL]', type: 'application' },
      { label: 'PWD Official Website', url: '[official website URL]', type: 'website' },
    ],
    faqs: [
      {
        question: 'Who can apply for Junior Engineer (Civil)?',
        answer:
          'Candidates with a Diploma or Degree in Civil Engineering from a recognized institution, aged 18\u201340 years (with relaxation as applicable), can apply.',
      },
      {
        question: 'What is the last date to apply?',
        answer: 'The last date to submit the online application is 25 September 2026.',
      },
      {
        question: 'What is the age limit?',
        answer:
          'The age limit is 18 to 40 years as on 01 August 2026. OBC and SC/ST candidates get 5 years relaxation. PwBD candidates get 15 years relaxation.',
      },
      {
        question: 'What is the application fee?',
        answer: 'General/OBC: \u20b9 300. SC/ST/PwBD: \u20b9 150.',
      },
      {
        question: 'What is the selection process?',
        answer: 'Selection is through an Online Written Examination followed by Document Verification.',
      },
      {
        question: 'Where can I download the official notification?',
        answer:
          'The official notification is available on the PWD website. Use the Official Notification link in the Official Links section.',
      },
      {
        question: 'Where can I apply online?',
        answer:
          'Applications must be submitted through the official state application portal. Use the Official Application Portal link in the Official Links section.',
      },
    ],
  },
};

/**
 * Retrieves job details by slug.
 * Returns undefined if not found — this mirrors how a Supabase single-row query would work.
 */
export function getJobDetailsBySlug(slug: string): JobDetails | undefined {
  return jobDetailsData[slug];
}
