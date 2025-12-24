// Staff Portal JavaScript
let currentUser = null;
let currentReviewingApp = null;
let uploadedFile = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    currentUser = requireAuth(['staff']);
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        seedDemoData();
        updateStats();
        loadApplications();
    }

    // File upload handler
    document.getElementById('caDocument').addEventListener('change', handleFileUpload);
});

// Update statistics
function updateStats() {
    const pending = getApplicationsByStatus(STATUS.PENDING);
    const underReview = getApplicationsByStatus(STATUS.UNDER_REVIEW);
    const todayProcessed = getTodayProcessed();

    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('reviewCount').textContent = underReview.length;
    document.getElementById('todayProcessed').textContent = todayProcessed;
}

// Load applications
function loadApplications() {
    const statusFilter = document.getElementById('statusFilter').value;
    let applications;

    if (statusFilter === 'all') {
        applications = getAllApplications();
    } else {
        applications = getApplicationsByStatus(statusFilter);
    }

    const applicationsList = document.getElementById('applicationsList');

    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>No Applications Found</h3>
                <p>There are no applications matching the selected filter.</p>
            </div>
        `;
        return;
    }

    // Sort by date (oldest first for pending)
    applications.sort((a, b) => new Date(a.submittedDate) - new Date(b.submittedDate));

    applicationsList.innerHTML = applications.map(app => `
        <div class="application-card">
            <div class="application-header">
                <div>
                    <div class="application-id">${app.id}</div>
                    <div class="application-date">Submitted: ${formatDate(app.submittedDate)}</div>
                </div>
                ${getStatusBadge(app.status)}
            </div>
            
            <div class="application-details">
                <div class="detail-item">
                    <div class="detail-label">Applicant</div>
                    <div class="detail-value">${app.applicantName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Contact</div>
                    <div class="detail-value">${app.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Case Number</div>
                    <div class="detail-value">${app.caseNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Court</div>
                    <div class="detail-value">${app.courtName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Copy Type</div>
                    <div class="detail-value">${app.copyType}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Purpose</div>
                    <div class="detail-value">${app.purpose}</div>
                </div>
            </div>
            
            ${app.hasAdvocate ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: var(--gray-50); border-radius: var(--radius-md);">
                    <strong>Advocate:</strong> ${app.advocateName} (Bar: ${app.advocateBarNumber})
                </div>
            ` : ''}
            
            ${app.additionalInfo ? `
                <div style="margin-top: 1rem;">
                    <div class="detail-label">Additional Information</div>
                    <div class="detail-value">${app.additionalInfo}</div>
                </div>
            ` : ''}
            
            <div class="application-footer">
                <div>
                    ${app.processedBy ? `<div class="detail-label">Processed by: ${app.processedBy}</div>` : ''}
                    ${app.staffRemarks ? `<div class="detail-value">${app.staffRemarks}</div>` : ''}
                </div>
                <div class="action-buttons">
                    ${(app.status === 'pending' || app.status === 'under_review') ? `
                        <button class="btn-small btn-review" onclick="openReviewModal('${app.id}')">
                            Review Application
                        </button>
                    ` : `
                        <button class="btn-small" style="background: var(--gray-400);" onclick="openReviewModal('${app.id}')">
                            View Details
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// Open review modal
function openReviewModal(appId) {
    const app = getAllApplications().find(a => a.id === appId);
    if (!app) return;

    currentReviewingApp = app;
    uploadedFile = null;

    const modal = document.getElementById('reviewModal');
    const reviewDetails = document.getElementById('reviewDetails');

    reviewDetails.innerHTML = `
        <div class="form-section">
            <h3>Application Details</h3>
            <div style="display: grid; gap: 1rem;">
                <div class="detail-item">
                    <div class="detail-label">Application ID</div>
                    <div class="detail-value">${app.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Applicant Name</div>
                    <div class="detail-value">${app.applicantName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${app.email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${app.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${app.address}</div>
                </div>
                ${app.hasAdvocate ? `
                    <div class="detail-item">
                        <div class="detail-label">Advocate</div>
                        <div class="detail-value">${app.advocateName} (Bar: ${app.advocateBarNumber})</div>
                    </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">Case Number</div>
                    <div class="detail-value">${app.caseNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Court Name</div>
                    <div class="detail-value">${app.courtName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Copy Type</div>
                    <div class="detail-value">${app.copyType}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Purpose</div>
                    <div class="detail-value">${app.purpose}</div>
                </div>
                ${app.additionalInfo ? `
                    <div class="detail-item">
                        <div class="detail-label">Additional Information</div>
                        <div class="detail-value">${app.additionalInfo}</div>
                    </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">Submitted Date</div>
                    <div class="detail-value">${formatDate(app.submittedDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Current Status</div>
                    <div class="detail-value">${getStatusBadge(app.status)}</div>
                </div>
            </div>
        </div>
    `;

    // Pre-fill remarks if exists
    document.getElementById('staffRemarks').value = app.staffRemarks || '';
    document.getElementById('uploadedFileName').textContent = '';

    // Disable actions if already processed
    const approveBtn = modal.querySelector('.btn-approve');
    const rejectBtn = modal.querySelector('.btn-reject');
    const remarksField = document.getElementById('staffRemarks');
    const uploadArea = modal.querySelector('.upload-area');

    if (app.status === 'approved' || app.status === 'rejected') {
        approveBtn.disabled = true;
        approveBtn.style.opacity = '0.5';
        rejectBtn.disabled = true;
        rejectBtn.style.opacity = '0.5';
        remarksField.disabled = true;
        uploadArea.style.pointerEvents = 'none';
        uploadArea.style.opacity = '0.5';
    } else {
        approveBtn.disabled = false;
        approveBtn.style.opacity = '1';
        rejectBtn.disabled = false;
        rejectBtn.style.opacity = '1';
        remarksField.disabled = false;
        uploadArea.style.pointerEvents = 'auto';
        uploadArea.style.opacity = '1';
    }

    modal.style.display = 'block';
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentReviewingApp = null;
    uploadedFile = null;
    document.getElementById('staffRemarks').value = '';
    document.getElementById('uploadedFileName').textContent = '';
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file.name;
        document.getElementById('uploadedFileName').textContent = `✓ Selected: ${file.name}`;
    }
}

// Approve application
function approveApplication() {
    if (!currentReviewingApp) return;

    if (!uploadedFile) {
        showNotification('Please upload the CA document before approving.', 'error');
        return;
    }

    const remarks = document.getElementById('staffRemarks').value;

    updateApplication(currentReviewingApp.id, {
        status: STATUS.APPROVED,
        staffRemarks: remarks || 'Application approved',
        uploadedDocument: uploadedFile,
        processedBy: currentUser.name,
        processedDate: new Date().toISOString()
    });

    showNotification('Application approved successfully!', 'success');
    closeReviewModal();
    updateStats();
    loadApplications();
}

// Reject application
function rejectApplication() {
    if (!currentReviewingApp) return;

    const remarks = document.getElementById('staffRemarks').value;

    if (!remarks) {
        showNotification('Please provide a reason for rejection.', 'error');
        return;
    }

    updateApplication(currentReviewingApp.id, {
        status: STATUS.REJECTED,
        staffRemarks: remarks,
        processedBy: currentUser.name,
        processedDate: new Date().toISOString()
    });

    showNotification('Application rejected.', 'info');
    closeReviewModal();
    updateStats();
    loadApplications();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('reviewModal');
    if (event.target === modal) {
        closeReviewModal();
    }
}
