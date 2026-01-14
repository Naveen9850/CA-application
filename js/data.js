// Data Management System for Copy Applications
const DATA_KEY = 'ca_applications';
const STATS_KEY = 'ca_stats';

// Application Status Types
const STATUS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

// Case Types
const CASE_TYPES = {
    CIVIL: 'civil',
    CRIMINAL: 'criminal',
    FAMILY: 'family',
    REVENUE: 'revenue',
    LABOR: 'labor',
    OTHER: 'other'
};

// Identification Types
const ID_TYPES = {
    CASE_NUMBER: 'case_number',
    FIR_NUMBER: 'fir_number'
};

// Districts and their Courts
const DISTRICTS_COURTS = {
    "Delhi": [
        "Supreme Court of India",
        "High Court of Delhi",
        "Patiala House District Court",
        "Tis Hazari District Court",
        "Saket District Court",
        "Dwarka District Court",
        "Rohini District Court",
        "Karkardooma District Court"
    ],
    "Mumbai": [
        "Bombay High Court",
        "City Civil Court Mumbai",
        "Dindoshi District Court",
        "Thane District Court",
        "Andheri Court",
        "Bandra Court"
    ],
    "Bangalore": [
        "High Court of Karnataka",
        "City Civil Court Bangalore",
        "Bangalore District Court",
        "Commercial Court Bangalore"
    ],
    "Chennai": [
        "Madras High Court",
        "City Civil Court Chennai",
        "Chennai District Court"
    ],
    "Kolkata": [
        "Calcutta High Court",
        "Alipore District Court",
        "Barasat District Court"
    ],
    "Hyderabad": [
        "High Court of Telangana",
        "City Civil Court Hyderabad",
        "Nampally Court"
    ],
    "Pune": [
        "Pune District Court",
        "Pune City Civil Court",
        "Shivajinagar Court"
    ],
    "Ahmedabad": [
        "Gujarat High Court",
        "Ahmedabad District Court",
        "City Civil Court Ahmedabad"
    ]
};

// ============================================================================
// COURT-STYLE DATA STRUCTURES (Guntur & Vijayawada District Courts)
// Based on official eCourts architecture
// ============================================================================

// Court Complexes (Physical locations within districts)
const COURT_COMPLEXES = {
    "Guntur": [
        { code: 'GNT', name: 'Court Complex, Guntur', city: 'Guntur' },
        { code: 'NSP', name: 'Court Complex, Narasaraopet', city: 'Narasaraopet' },
        { code: 'TNL', name: 'Court Complex, Tenali', city: 'Tenali' },
        { code: 'VNK', name: 'Court Complex, Vinukonda', city: 'Vinukonda' },
        { code: 'MGL', name: 'Court Complex, Mangalagiri', city: 'Mangalagiri' }
    ],
    "Vijayawada": [
        { code: 'VJA', name: 'Court Complex, Vijayawada', city: 'Vijayawada' }
    ]
};

// Court Establishments (Specific courts within each complex)
const COURT_ESTABLISHMENTS_BY_COMPLEX = {
    // Guntur Complex Courts
    'GNT': [
        { code: 'PDJ_GNT', name: 'Principal District & Sessions Judge, Guntur' },
        { code: 'ADJ1_GNT', name: 'I Additional District Judge, Guntur' },
        { code: 'ADJ2_GNT', name: 'II Additional District Judge, Guntur' },
        { code: 'ADJ3_GNT', name: 'III Additional District Judge, Guntur' },
        { code: 'CJM_GNT', name: 'Chief Judicial Magistrate, Guntur' },
        { code: 'ACJM_GNT', name: 'I Additional Chief Judicial Magistrate, Guntur' },
        { code: 'JMFC1_GNT', name: 'JMFC I, Guntur' },
        { code: 'JMFC2_GNT', name: 'JMFC II, Guntur' },
        { code: 'MACT_GNT', name: 'Motor Accidents Claims Tribunal, Guntur' }
    ],
    // Narasaraopet Complex Courts
    'NSP': [
        { code: 'ADJ1_NSP', name: 'I Additional District Judge, Narasaraopet' },
        { code: 'CJM_NSP', name: 'Chief Judicial Magistrate, Narasaraopet' },
        { code: 'JMFC_NSP', name: 'JMFC, Narasaraopet' }
    ],
    // Tenali Complex Courts
    'TNL': [
        { code: 'ADJ1_TNL', name: 'I Additional District Judge, Tenali' },
        { code: 'CJM_TNL', name: 'Chief Judicial Magistrate, Tenali' }
    ],
    // Vinukonda Complex Courts
    'VNK': [
        { code: 'CJM_VNK', name: 'Chief Judicial Magistrate, Vinukonda' }
    ],
    // Mangalagiri Complex Courts
    'MGL': [
        { code: 'CJM_MGL', name: 'Chief Judicial Magistrate, Mangalagiri' }
    ],
    // Vijayawada Complex Courts
    'VJA': [
        { code: 'PDJ_VJA', name: 'Principal District & Sessions Judge, Vijayawada' },
        { code: 'ADJ1_VJA', name: 'I Additional District Judge, Vijayawada' },
        { code: 'ADJ2_VJA', name: 'II Additional District Judge, Vijayawada' },
        { code: 'CJM_VJA', name: 'Chief Judicial Magistrate, Vijayawada' }
    ]
};

// Court Case Types (Standard codes used in Andhra Pradesh courts)
const COURT_CASE_TYPES = [
    { code: 'CC', label: 'CC - Civil Case', category: 'civil' },
    { code: 'OS', label: 'OS - Original Suit', category: 'civil' },
    { code: 'CS', label: 'CS - Civil Suit', category: 'civil' },
    { code: 'CRP', label: 'CRP - Civil Revision Petition', category: 'civil' },
    { code: 'FA', label: 'FA - First Appeal', category: 'civil' },
    { code: 'SA', label: 'SA - Second Appeal', category: 'civil' },
    { code: 'RFA', label: 'RFA - Regular First Appeal', category: 'civil' },
    { code: 'RSA', label: 'RSA - Regular Second Appeal', category: 'civil' },
    { code: 'Exn.P', label: 'Exn.P - Execution Petition', category: 'civil' },
    { code: 'MC', label: 'MC - Miscellaneous Case', category: 'civil' },
    { code: 'IA', label: 'IA - Interlocutory Application', category: 'civil' },
    { code: 'Arb.P', label: 'Arb.P - Arbitration Petition', category: 'civil' },
    { code: 'MAT', label: 'MAT - Matrimonial Appeal', category: 'family' },
    { code: 'CRLP', label: 'CRLP - Criminal (Local) Petition', category: 'criminal' },
    { code: 'CRLMP', label: 'CRLMP - Criminal Miscellaneous Petition', category: 'criminal' },
    { code: 'CRLA', label: 'CRLA - Criminal Appeal', category: 'criminal' },
    { code: 'CRL.A', label: 'CRL.A - Criminal Appeal', category: 'criminal' },
    { code: 'Crl.OP', label: 'Crl.OP - Criminal Original Petition', category: 'criminal' },
    { code: 'SC', label: 'SC - Sessions Case', category: 'criminal' },
    { code: 'STC', label: 'STC - Sessions Trial Case', category: 'criminal' },
    { code: 'EP', label: 'EP - Election Petition', category: 'other' },
    { code: 'MP', label: 'MP - Miscellaneous Petition', category: 'other' }
];

// Case Year Range Generator
function generateCaseYearRange() {
    const currentYear = new Date().getFullYear();
    const startYear = 2000; // Court digitization typically started around 2000
    const years = [];
    for (let year = currentYear; year >= startYear; year--) {
        years.push(year.toString());
    }
    return years;
}

// Copy Types Available
const COPY_TYPES = [
    "Case Documents",
    "Court Order",
    "Judgment",
    "Petition",
    "Written Statement",
    "Evidence Records",
    "Charge Sheet",
    "FIR Copy",
    "Investigation Report",
    "Bail Order",
    "Summons",
    "Warrant",
    "Pleadings",
    "Other"
];

// Staff Members (Demo data)
const STAFF_MEMBERS = [
    { username: 'staff', name: 'Priya Verma', specialization: 'all' },
    { username: 'staff_civil', name: 'Rajesh Kumar', specialization: 'civil' },
    { username: 'staff_criminal', name: 'Anjali Desai', specialization: 'criminal' },
    { username: 'staff_family', name: 'Vikram Patel', specialization: 'family' }
];

// Get districts list
function getDistricts() {
    return Object.keys(DISTRICTS_COURTS).sort();
}

// Get courts for a district
function getCourtsForDistrict(district) {
    return DISTRICTS_COURTS[district] || [];
}

// Get all copy types
function getCopyTypes() {
    return COPY_TYPES;
}

// Get staff list
function getStaffList() {
    return STAFF_MEMBERS;
}

// ============================================================================
// COURT-STYLE HELPER FUNCTIONS
// ============================================================================

// Get court complexes for a specific district
function getCourtComplexes(district) {
    return COURT_COMPLEXES[district] || [];
}

// Get court establishments for a specific complex
function getCourtEstablishments(complexCode) {
    return COURT_ESTABLISHMENTS_BY_COMPLEX[complexCode] || [];
}

// Get all court case types
function getCourtCaseTypes() {
    return COURT_CASE_TYPES;
}

// Get court case types filtered by category
function getCourtCaseTypesByCategory(category) {
    return COURT_CASE_TYPES.filter(type => type.category === category);
}

// Get case years (dynamic range)
function getCaseYears() {
    return generateCaseYearRange();
}

// Search for case by identifiers
function searchCaseByDetails(searchParams) {
    const { district, courtComplex, courtEstablishment, caseType, caseNumber, caseYear } = searchParams;

    // Build full case ID
    const fullCaseId = `${caseType}/${caseNumber}/${caseYear}`;

    // Search in demo cases database
    const demoCases = getDemoCases();
    const foundCase = demoCases.find(c =>
        c.full_case_id === fullCaseId &&
        c.complex_code === courtComplex &&
        c.court_code === courtEstablishment
    );

    return foundCase || null;
}

// Get demo cases for testing (will be populated with sample data)
function getDemoCases() {
    const DEMO_CASES_KEY = 'demo_cases';
    let cases = JSON.parse(localStorage.getItem(DEMO_CASES_KEY) || '[]');

    // Initialize with sample data if empty
    if (cases.length === 0) {
        cases = initializeDemoCases();
        localStorage.setItem(DEMO_CASES_KEY, JSON.stringify(cases));
    }

    return cases;
}

// Initialize demo cases for testing
function initializeDemoCases() {
    return [
        {
            id: 'CASE_001',
            district: 'Guntur',
            complex_code: 'GNT',
            complex_name: 'Court Complex, Guntur',
            court_code: 'PDJ_GNT',
            court_name: 'Principal District & Sessions Judge, Guntur',
            case_type_code: 'CC',
            case_type_label: 'Civil Case',
            case_number: '0045',
            case_year: '2024',
            full_case_id: 'CC/0045/2024',
            case_title: 'Smt. Lakshmi Devi vs. M/s. ABC Builders Ltd.',
            petitioner_names: 'Smt. Lakshmi Devi, D/o Late Ramesh Kumar',
            respondent_names: 'M/s. ABC Builders Ltd., Rep. by Managing Director',
            filing_date: '2024-03-15',
            current_stage: 'Evidence Recording',
            last_order_date: '2026-01-10',
            next_hearing_date: '2026-01-20',
            case_status: 'Active',
            petitioner_advocate: 'Adv. Ramesh Kumar',
            respondent_advocate: 'Adv. Sunita Rao'
        },
        {
            id: 'CASE_002',
            district: 'Guntur',
            complex_code: 'NSP',
            complex_name: 'Court Complex, Narasaraopet',
            court_code: 'CJM_NSP',
            court_name: 'Chief Judicial Magistrate, Narasaraopet',
            case_type_code: 'CC',
            case_type_label: 'Civil Case',
            case_number: '0045',
            case_year: '2024',
            full_case_id: 'CC/0045/2024',
            case_title: 'Sri Venkata Reddy vs. State Bank of India',
            petitioner_names: 'Sri Venkata Reddy, S/o Subba Rao',
            respondent_names: 'State Bank of India, Rep. by Branch Manager',
            filing_date: '2024-04-10',
            current_stage: 'Arguments',
            last_order_date: '2026-01-08',
            next_hearing_date: '2026-01-22',
            case_status: 'Active',
            petitioner_advocate: 'Adv. Prakash Reddy',
            respondent_advocate: 'Adv. Meera Devi'
        },
        {
            id: 'CASE_003',
            district: 'Guntur',
            complex_code: 'GNT',
            complex_name: 'Court Complex, Guntur',
            court_code: 'CJM_GNT',
            court_name: 'Chief Judicial Magistrate, Guntur',
            case_type_code: 'CRLMP',
            case_type_label: 'Criminal Miscellaneous Petition',
            case_number: '1234',
            case_year: '2023',
            full_case_id: 'CRLMP/1234/2023',
            case_title: 'State vs. Rajesh Kumar',
            petitioner_names: 'State of Andhra Pradesh',
            respondent_names: 'Rajesh Kumar @ Raju',
            filing_date: '2023-11-20',
            current_stage: 'Final Arguments',
            last_order_date: '2025-12-15',
            next_hearing_date: '2026-02-05',
            case_status: 'Active',
            petitioner_advocate: 'Public Prosecutor',
            respondent_advocate: 'Adv. Suresh Babu'
        },
        {
            id: 'CASE_004',
            district: 'Vijayawada',
            complex_code: 'VJA',
            complex_name: 'Court Complex, Vijayawada',
            court_code: 'PDJ_VJA',
            court_name: 'Principal District & Sessions Judge, Vijayawada',
            case_type_code: 'OS',
            case_type_label: 'Original Suit',
            case_number: '0089',
            case_year: '2025',
            full_case_id: 'OS/0089/2025',
            case_title: 'Krishna Enterprises vs. Godavari Traders',
            petitioner_names: 'M/s. Krishna Enterprises',
            respondent_names: 'M/s. Godavari Traders',
            filing_date: '2025-02-28',
            current_stage: 'Written Statement Stage',
            last_order_date: '2025-12-20',
            next_hearing_date: '2026-01-25',
            case_status: 'Active',
            petitioner_advocate: 'Adv. Krishna Murthy',
            respondent_advocate: 'Adv. Padmavati'
        }
    ];
}

// Get applications by case type
function getApplicationsByCaseType(caseType) {
    const applications = getAllApplications();
    return applications.filter(app => app.caseType === caseType);
}

// Get applications assigned to staff
function getApplicationsAssignedToStaff(staffUsername) {
    const applications = getAllApplications();
    return applications.filter(app => app.assignedTo === staffUsername);
}

// Get unassigned applications
function getUnassignedApplications() {
    const applications = getAllApplications();
    return applications.filter(app => !app.assignedTo);
}

// Assign application to staff
function assignApplicationToStaff(appId, staffUsername) {
    return updateApplication(appId, {
        assignedTo: staffUsername,
        assignedDate: new Date().toISOString()
    });
}

// Migrate old data to new schema
function migrateOldData() {
    const applications = JSON.parse(localStorage.getItem(DATA_KEY) || '[]');
    let needsMigration = false;

    const migratedApps = applications.map(app => {
        let updated = { ...app };

        // Add identificationType if missing
        if (!app.identificationType) {
            updated.identificationType = app.firNumber ? ID_TYPES.FIR_NUMBER : ID_TYPES.CASE_NUMBER;
            needsMigration = true;
        }

        // Convert single copyType to copyTypes array
        if (app.copyType && !app.copyTypes) {
            updated.copyTypes = [app.copyType];
            delete updated.copyType;
            needsMigration = true;
        }

        // Ensure copyTypes is an array
        if (!app.copyTypes || !Array.isArray(app.copyTypes)) {
            updated.copyTypes = app.copyType ? [app.copyType] : ['Case Documents'];
            needsMigration = true;
        }

        // Add district if missing (use default)
        if (!app.district) {
            updated.district = 'Delhi';
            needsMigration = true;
        }

        // Add caseType if missing
        if (!app.caseType) {
            updated.caseType = CASE_TYPES.CIVIL;
            needsMigration = true;
        }

        // Add FIR number field if missing
        if (!app.firNumber) {
            updated.firNumber = null;
        }

        // Ensure caseNumber is null if using FIR
        if (updated.identificationType === ID_TYPES.FIR_NUMBER && !updated.firNumber && updated.caseNumber) {
            updated.firNumber = updated.caseNumber;
            updated.caseNumber = null;
            needsMigration = true;
        }

        // Add assignment fields if missing
        if (!app.assignedTo) {
            updated.assignedTo = null;
            updated.assignedDate = null;
        }

        return updated;
    });

    if (needsMigration) {
        localStorage.setItem(DATA_KEY, JSON.stringify(migratedApps));
        console.log('Data migrated to new schema');
    }
}

// Clear all data (for debugging/reset)
function clearAllData() {
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(STATS_KEY);
    console.log('All data cleared');
}

// Initialize data structure
function initializeData() {
    if (!localStorage.getItem(DATA_KEY)) {
        localStorage.setItem(DATA_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STATS_KEY)) {
        localStorage.setItem(STATS_KEY, JSON.stringify({
            dailyProcessed: {},
            totalApplications: 0,
            totalApproved: 0,
            totalRejected: 0
        }));
    }

    // Run migration on existing data
    migrateOldData();
}

// Get all applications
function getAllApplications() {
    initializeData();
    return JSON.parse(localStorage.getItem(DATA_KEY)) || [];
}

// Get applications by user
function getApplicationsByUser(username) {
    const applications = getAllApplications();
    return applications.filter(app => app.applicantUsername === username);
}

// Get applications by status
function getApplicationsByStatus(status) {
    const applications = getAllApplications();
    return applications.filter(app => app.status === status);
}

// Get pending applications
function getPendingApplications() {
    return getApplicationsByStatus(STATUS.PENDING).concat(
        getApplicationsByStatus(STATUS.UNDER_REVIEW)
    );
}

// Create new application
function createApplication(applicationData) {
    initializeData();
    const applications = getAllApplications();

    const newApplication = {
        id: generateId(),
        ...applicationData,
        status: STATUS.PENDING,
        submittedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        staffRemarks: null,
        uploadedDocument: null,
        processedBy: null,
        processedDate: null
    };

    applications.push(newApplication);
    localStorage.setItem(DATA_KEY, JSON.stringify(applications));

    updateStats({ totalApplications: 1 });

    return newApplication;
}

// Update application
function updateApplication(id, updates) {
    const applications = getAllApplications();
    const index = applications.findIndex(app => app.id === id);

    if (index !== -1) {
        applications[index] = {
            ...applications[index],
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(DATA_KEY, JSON.stringify(applications));

        // Update stats if status changed
        if (updates.status === STATUS.APPROVED) {
            updateDailyProcessed();
            updateStats({ totalApproved: 1 });
        } else if (updates.status === STATUS.REJECTED) {
            updateDailyProcessed();
            updateStats({ totalRejected: 1 });
        }

        return applications[index];
    }

    return null;
}

// Delete application (admin only)
function deleteApplication(id) {
    const applications = getAllApplications();
    const filtered = applications.filter(app => app.id !== id);
    localStorage.setItem(DATA_KEY, JSON.stringify(filtered));
}

// Generate unique ID
function generateId() {
    return 'CA' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Get statistics
function getStats() {
    initializeData();
    return JSON.parse(localStorage.getItem(STATS_KEY));
}

// Update statistics
function updateStats(increments) {
    const stats = getStats();

    if (increments.totalApplications) {
        stats.totalApplications += increments.totalApplications;
    }
    if (increments.totalApproved) {
        stats.totalApproved += increments.totalApproved;
    }
    if (increments.totalRejected) {
        stats.totalRejected += increments.totalRejected;
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Update daily processed count
function updateDailyProcessed() {
    const stats = getStats();
    const today = new Date().toISOString().split('T')[0];

    if (!stats.dailyProcessed[today]) {
        stats.dailyProcessed[today] = 0;
    }
    stats.dailyProcessed[today]++;

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Get today's processed count
function getTodayProcessed() {
    const stats = getStats();
    const today = new Date().toISOString().split('T')[0];
    return stats.dailyProcessed[today] || 0;
}

// Format date for display
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date only
function formatDateOnly(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        pending: '<span class="status-badge status-pending">Pending</span>',
        under_review: '<span class="status-badge status-review">Under Review</span>',
        approved: '<span class="status-badge status-approved">Approved</span>',
        rejected: '<span class="status-badge status-rejected">Rejected</span>'
    };
    return badges[status] || '';
}

// Get status color
function getStatusColor(status) {
    const colors = {
        pending: '#f59e0b',
        under_review: '#3b82f6',
        approved: '#10b981',
        rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
}

// Seed demo data (for demonstration purposes)
function seedDemoData() {
    const applications = getAllApplications();
    if (applications.length === 0) {
        const demoApps = [
            {
                applicantName: 'Rajesh Patel',
                applicantUsername: 'citizen',
                email: 'rajesh.patel@example.com',
                phone: '9876543210',
                address: '123, MG Road, Mumbai, Maharashtra - 400001',
                hasAdvocate: true,
                advocateName: 'Adv. Sunita Mehta',
                advocateBarNumber: 'MH/12345/2010',
                caseNumber: 'CR/2024/001',
                courtName: 'High Court of Mumbai',
                copyType: 'Case Documents',
                purpose: 'Appeal preparation',
                additionalInfo: 'Require certified copies of all case proceedings'
            },
            {
                applicantName: 'Amit Singh',
                applicantUsername: 'citizen',
                email: 'amit.singh@example.com',
                phone: '9123456789',
                address: '456, Sector 15, Delhi - 110001',
                hasAdvocate: false,
                advocateName: '',
                advocateBarNumber: '',
                caseNumber: 'CIV/2024/045',
                courtName: 'District Court, Delhi',
                copyType: 'Court Order',
                purpose: 'Personal records',
                additionalInfo: 'Need copy of final judgment'
            }
        ];

        demoApps.forEach(app => {
            createApplication(app);
        });
    }
}
