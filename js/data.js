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
