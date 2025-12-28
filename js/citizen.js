// Citizen Portal JavaScript - Enhanced Version
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    currentUser = requireAuth(['citizen']);
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        seedDemoData();
        initializeForm();
        loadApplications();
    }
});

// Initialize form fields
function initializeForm() {
    // Load districts
    const districtSelect = document.getElementById('district');
    const districts = getDistricts();
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    // Load copy types checkboxes
    const copyTypesContainer = document.getElementById('copyTypesCheckboxes');
    const copyTypes = getCopyTypes();
    copyTypes.forEach((type, index) => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `copyType_${index}`;
        checkbox.name = 'copyTypes';
        checkbox.value = type;
        checkbox.style.cssText = 'width: 1.125rem; height: 1.125rem; cursor: pointer;';

        const label = document.createElement('label');
        label.htmlFor = `copyType_${index}`;
        label.textContent = type;
        label.style.cssText = 'cursor: pointer; font-size: 0.875rem;';

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        copyTypesContainer.appendChild(checkboxDiv);
    });

    // Set initial field states
    toggleIdentificationFields();
}

// Load courts based on selected district
function loadCourts() {
    const districtSelect = document.getElementById('district');
    const courtSelect = document.getElementById('courtName');
    const selectedDistrict = districtSelect.value;

    // Clear existing courts
    courtSelect.innerHTML = '<option value="">Select court</option>';

    if (selectedDistrict) {
        const courts = getCourtsForDistrict(selectedDistrict);
        courts.forEach(court => {
            const option = document.createElement('option');
            option.value = court;
            option.textContent = court;
            courtSelect.appendChild(option);
        });
    } else {
        courtSelect.innerHTML = '<option value="">First select a district</option>';
    }
}

// Toggle between Case Number and FIR Number
function toggleIdentificationFields() {
    const identificationType = document.querySelector('input[name="identificationType"]:checked').value;
    const caseNumberGroup = document.getElementById('caseNumberGroup');
    const firNumberGroup = document.getElementById('firNumberGroup');
    const caseNumberInput = document.getElementById('caseNumber');
    const firNumberInput = document.getElementById('firNumber');

    if (identificationType === 'case_number') {
        caseNumberGroup.style.display = 'block';
        firNumberGroup.style.display = 'none';
        caseNumberInput.required = true;
        firNumberInput.required = false;
        firNumberInput.value = '';
    } else {
        caseNumberGroup.style.display = 'none';
        firNumberGroup.style.display = 'block';
        caseNumberInput.required = false;
        firNumberInput.required = true;
        caseNumberInput.value = '';
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'submit') {
        document.getElementById('submitTab').classList.add('active');
    } else if (tabName === 'applications') {
        document.getElementById('applicationsTab').classList.add('active');
        loadApplications();
    }
}

// Toggle advocate fields
function toggleAdvocateFields() {
    const hasAdvocate = document.getElementById('hasAdvocate').checked;
    const advocateFields = document.getElementById('advocateFields');
    advocateFields.style.display = hasAdvocate ? 'block' : 'none';

    // Update required status
    const advocateName = document.getElementById('advocateName');
    const advocateBarNumber = document.getElementById('advocateBarNumber');

    if (hasAdvocate) {
        advocateName.required = true;
        advocateBarNumber.required = true;
    } else {
        advocateName.required = false;
        advocateBarNumber.required = false;
        advocateName.value = '';
        advocateBarNumber.value = '';
    }
}

// Submit application
function submitApplication(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Get identification type and values
    const identificationType = formData.get('identificationType');
    const caseNumber = identificationType === 'case_number' ? formData.get('caseNumber') : null;
    const firNumber = identificationType === 'fir_number' ? formData.get('firNumber') : null;

    // Get selected copy types
    const copyTypesCheckboxes = document.querySelectorAll('input[name="copyTypes"]:checked');
    const copyTypes = Array.from(copyTypesCheckboxes).map(cb => cb.value);

    // Validate at least one copy type is selected
    if (copyTypes.length === 0) {
        showNotification('Please select at least one type of copy required.', 'error');
        return;
    }

    const applicationData = {
        applicantName: formData.get('applicantName'),
        applicantUsername: currentUser.username,
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        hasAdvocate: formData.get('hasAdvocate') === 'on',
        advocateName: formData.get('advocateName') || '',
        advocateBarNumber: formData.get('advocateBarNumber') || '',
        identificationType: identificationType,
        caseNumber: caseNumber,
        firNumber: firNumber,
        caseType: formData.get('caseType'),
        district: formData.get('district'),
        courtName: formData.get('courtName'),
        copyTypes: copyTypes,
        purpose: formData.get('purpose'),
        additionalInfo: formData.get('additionalInfo') || ''
    };

    const newApplication = createApplication(applicationData);

    // Show success message
    showNotification('Application submitted successfully! Application ID: ' + newApplication.id, 'success');

    // Reset form
    form.reset();
    document.getElementById('advocateFields').style.display = 'none';
    toggleIdentificationFields();
    loadCourts(); // Reset court dropdown

    // Uncheck all copy types
    document.querySelectorAll('input[name="copyTypes"]').forEach(cb => cb.checked = false);

    // Switch to applications tab after delay
    setTimeout(() => {
        document.querySelector('.tab-btn:nth-child(2)').click();
    }, 1500);
}

// Load applications
function loadApplications() {
    const applications = getApplicationsByUser(currentUser.username);
    const applicationsList = document.getElementById('applicationsList');

    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>No Applications Yet</h3>
                <p>You haven't submitted any copy applications. Click on "Submit Application" to get started.</p>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    applications.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

    // Filter by status
    const statusFilter = document.getElementById('statusFilter').value;
    const filteredApps = statusFilter === 'all'
        ? applications
        : applications.filter(app => app.status === statusFilter);

    if (filteredApps.length === 0) {
        applicationsList.innerHTML = `
            <div class="empty-state">
                <h3>No applications found</h3>
                <p>No applications match the selected filter.</p>
            </div>
        `;
        return;
    }

    applicationsList.innerHTML = filteredApps.map(app => `
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
                    <div class="detail-label">${app.identificationType === 'case_number' ? 'Case Number' : 'FIR Number'}</div>
                    <div class="detail-value">${app.caseNumber || app.firNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Case Type</div>
                    <div class="detail-value">${getCaseTypeLabel(app.caseType)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">District</div>
                    <div class="detail-value">${app.district}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Court</div>
                    <div class="detail-value">${app.courtName}</div>
                </div>
            </div>
            
            <div style="margin-top: 1rem;">
                <div class="detail-label">Copy Types Requested</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                    ${app.copyTypes.map(type => `
                        <span style="background: var(--gray-100); padding: 0.25rem 0.75rem; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 500;">${type}</span>
                    `).join('')}
                </div>
            </div>
            
            ${app.status === 'approved' && app.uploadedDocument ? `
                <div class="application-footer">
                    <div class="detail-item">
                        <div class="detail-label">Approved Document</div>
                        <div class="detail-value">${app.uploadedDocument}</div>
                    </div>
                    <button class="btn-small btn-approve" onclick="downloadDocument('${app.uploadedDocument}')">
                        Download CA
                    </button>
                </div>
            ` : ''}
            
            ${app.status === 'rejected' && app.staffRemarks ? `
                <div class="application-footer">
                    <div class="detail-item">
                        <div class="detail-label">Rejection Reason</div>
                        <div class="detail-value">${app.staffRemarks}</div>
                    </div>
                </div>
            ` : ''}
            
            ${app.assignedTo ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: var(--info-500)10; border-left: 3px solid var(--info-500); border-radius: var(--radius-md);">
                    <div class="detail-label">Assigned To Staff</div>
                    <div class="detail-value" style="font-size: 0.875rem;">${app.assignedTo}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Get case type label
function getCaseTypeLabel(caseType) {
    const labels = {
        'civil': 'Civil Case',
        'criminal': 'Criminal Case',
        'family': 'Family Case',
        'revenue': 'Revenue Case',
        'labor': 'Labor Case',
        'other': 'Other'
    };
    return labels[caseType] || caseType;
}

// Filter applications
function filterApplications() {
    loadApplications();
}

// Download document
function downloadDocument(filename) {
    showNotification('Document download started: ' + filename, 'info');
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
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
