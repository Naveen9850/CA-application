// ============================================================================
// COURT-STYLE CASE LOOKUP JAVASCRIPT
// Handles cascading dropdowns, case search, and result display
// ============================================================================

// Initialize case lookup on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeCaseLookup();
});

// Initialize all dropdowns and event listeners
function initializeCaseLookup() {
    console.log('Initializing court-style case lookup...');

    // Populate static dropdowns
    populateCaseTypes();
    populateCaseYears();

    // Add event listeners for dynamic preview
    addCasePreviewListeners();
}

// Populate Case Type dropdown
function populateCaseTypes() {
    const dropdown = document.getElementById('searchCaseType');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Case Type</option>';

    const caseTypes = getCourtCaseTypes();
    caseTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.code;
        option.textContent = type.label;
        option.dataset.category = type.category;
        dropdown.appendChild(option);
    });
}

//Populate Case Year dropdown
function populateCaseYears() {
    const dropdown = document.getElementById('searchCaseYear');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Year</option>';

    const years = getCaseYears();
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        dropdown.appendChild(option);
    });
}

// Load Court Complexes when district is selected
function loadCourtComplexes() {
    const districtDropdown = document.getElementById('searchDistrict');
    const complexDropdown = document.getElementById('searchCourtComplex');
    const establishmentDropdown = document.getElementById('searchCourtEstablishment');

    const selectedDistrict = districtDropdown.value;

    if (!selectedDistrict) {
        complexDropdown.innerHTML = '<option value="">First select a district</option>';
        complexDropdown.disabled = true;
        establishmentDropdown.innerHTML = '<option value="">First select a court complex</option>';
        establishmentDropdown.disabled = true;
        return;
    }

    // Enable and populate complex dropdown
    complexDropdown.disabled = false;
    complexDropdown.innerHTML = '<option value="">Select Court Complex</option>';

    const complexes = getCourtComplexes(selectedDistrict);
    complexes.forEach(complex => {
        const option = document.createElement('option');
        option.value = complex.code;
        option.textContent = complex.name;
        option.dataset.city = complex.city;
        complexDropdown.appendChild(option);
    });

    // Reset establishment dropdown
    establishmentDropdown.innerHTML = '<option value="">First select a court complex</option>';
    establishmentDropdown.disabled = true;

    // Hide case ID preview
    updateCaseIdPreview();
}

// Load Court Establishments when complex is selected (CASCADING)
function loadCourtEstablishments() {
    const complexDropdown = document.getElementById('searchCourtComplex');
    const establishmentDropdown = document.getElementById('searchCourtEstablishment');

    const selectedComplex = complexDropdown.value;

    if (!selectedComplex) {
        establishmentDropdown.innerHTML = '<option value="">First select a court complex</option>';
        establishmentDropdown.disabled = true;
        return;
    }

    // Enable and populate establishment dropdown
    establishmentDropdown.disabled = false;
    establishmentDropdown.innerHTML = '<option value="">Select Court Establishment</option>';

    const establishments = getCourtEstablishments(selectedComplex);
    establishments.forEach(estab => {
        const option = document.createElement('option');
        option.value = estab.code;
        option.textContent = estab.name;
        establishmentDropdown.appendChild(option);
    });

    // Update case ID preview
    updateCaseIdPreview();
}

// Add event listeners for live case ID preview
function addCasePreviewListeners() {
    const fields = ['searchCaseType', 'searchCaseNumber', 'searchCaseYear',
        'searchCourtComplex', 'searchCourtEstablishment'];

    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', updateCaseIdPreview);
            if (fieldId === 'searchCaseNumber') {
                element.addEventListener('input', updateCaseIdPreview);
            }
        }
    });
}

// Update the case ID preview box
function updateCaseIdPreview() {
    const caseType = document.getElementById('searchCaseType')?.value || '';
    const caseNumber = document.getElementById('searchCaseNumber')?.value || '';
    const caseYear = document.getElementById('searchCaseYear')?.value || '';
    const complexCode = document.getElementById('searchCourtComplex')?.value || '';

    const previewBox = document.getElementById('caseIdPreview');
    const caseIdDisplay = document.getElementById('fullCaseIdDisplay');
    const locationDisplay = document.getElementById('caseLocationDisplay');

    if (caseType && caseNumber && caseYear) {
        // Format case number with leading zeros if needed
        const formattedNumber = caseNumber.padStart(4, '0');
        const fullCaseId = `${caseType}/${formattedNumber}/${caseYear}`;

        caseIdDisplay.textContent = fullCaseId;

        // Get complex name for location display
        if (complexCode) {
            const complexDropdown = document.getElementById('searchCourtComplex');
            const selectedOption = complexDropdown.options[complexDropdown.selectedIndex];
            locationDisplay.textContent = selectedOption.textContent || '-';
        } else {
            locationDisplay.textContent = '-';
        }

        previewBox.style.display = 'block';
    } else {
        previewBox.style.display = 'none';
    }
}

// Search for case
function searchCase() {
    // Validate all fields are filled
    const district = document.getElementById('searchDistrict').value;
    const courtComplex = document.getElementById('searchCourtComplex').value;
    const courtEstablishment = document.getElementById('searchCourtEstablishment').value;
    const caseType = document.getElementById('searchCaseType').value;
    const caseNumber = document.getElementById('searchCaseNumber').value;
    const caseYear = document.getElementById('searchCaseYear').value;

    if (!district || !courtComplex || !courtEstablishment || !caseType || !caseNumber || !caseYear) {
        showNotification('Please fill all required fields', 'warning');
        return;
    }

    // Show loading state
    const searchBtn = event.target;
    const originalText = searchBtn.innerHTML;
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span class="spinner" ></span> Searching...';

    // Simulate API call delay
    setTimeout(() => {
        // Format case number
        const formattedNumber = caseNumber.padStart(4, '0');

        // Search for case
        const searchParams = {
            district,
            courtComplex,
            courtEstablishment,
            caseType,
            caseNumber: formattedNumber,
            caseYear
        };

        const foundCase = searchCaseByDetails(searchParams);

        // Restore button
        searchBtn.disabled = false;
        searchBtn.innerHTML = originalText;

        if (foundCase) {
            displayCaseFound(foundCase);
        } else {
            displayCaseNotFound(searchParams);
        }
    }, 1000);
}

// Display case found results
function displayCaseFound(caseData) {
    const resultsDiv = document.getElementById('caseSearchResults');
    const searchFormDiv = document.getElementById('caseSearchForm');

    resultsDiv.innerHTML = `
        <div class="case-found-card">
            <div class="success-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h3>✅ Case Found</h3>
            </div>
            
            <div class="case-details">
                <div class="detail-row">
                    <strong>Case Number:</strong>
                    <span class="highlight">${caseData.full_case_id}</span>
                </div>
                <div class="detail-row">
                    <strong>Court:</strong>
                    <span>${caseData.court_name}</span>
                </div>
                <div class="detail-row">
                    <strong>Complex:</strong>
                    <span>${caseData.complex_name}</span>
                </div>
                
                <hr>
                
                <div class="detail-row">
                    <strong>Case Title:</strong>
                    <span class="case-title">${caseData.case_title}</span>
                </div>
                <div class="detail-row">
                    <strong>Petitioner:</strong>
                    <span>${caseData.petitioner_names}</span>
                </div>
                <div class="detail-row">
                    <strong>Respondent:</strong>
                    <span>${caseData.respondent_names}</span>
                </div>
                
                <hr>
                
                <div class="detail-row">
                    <strong>Filing Date:</strong>
                    <span>${formatDate(caseData.filing_date)}</span>
                </div>
                <div class="detail-row">
                    <strong>Current Stage:</strong>
                    <span class="badge badge-info">${caseData.current_stage}</span>
                </div>
                <div class="detail-row">
                    <strong>Last Order Date:</strong>
                    <span>${formatDate(caseData.last_order_date)}</span>
                </div>
                <div class="detail-row">
                    <strong>Next Hearing:</strong>
                    <span class="badge badge-warning">${formatDate(caseData.next_hearing_date)}</span>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong>
                    <span class="badge badge-success">${caseData.case_status}</span>
                </div>
            </div>
            
            <div class="confirmation-box">
                <input type="checkbox" id="confirmCaseDetails" required>
                <label for="confirmCaseDetails">
                    <strong>I confirm these are the correct case details</strong>
                </label>
            </div>
            
            <div class="action-buttons">
                <button type="button" class="btn-secondary" onclick="goBackToSearch()">
                    ← Search Again
                </button>
                <button type="button" class="btn-primary" onclick="proceedWithCase()">
                    Proceed to Application →
                </button>
            </div>
        </div>
    `;

    // Store case data for later use
    window.selectedCaseData = caseData;

    // Show results, hide search form
    searchFormDiv.style.display = 'none';
    resultsDiv.style.display = 'block';

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display case not found
function displayCaseNotFound(searchParams) {
    const resultsDiv = document.getElementById('caseSearchResults');
    const searchFormDiv = document.getElementById('caseSearchForm');

    const fullCaseId = `${searchParams.caseType}/${searchParams.caseNumber}/${searchParams.caseYear}`;

    resultsDiv.innerHTML = `
        <div class="case-not-found-card">
            <div class="warning-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>⚠️ Case Not Found</h3>
            </div>
            
            <div class="not-found-details">
                <p><strong>Case ID:</strong> ${fullCaseId}</p>
                <p><strong>Court:</strong> ${document.getElementById('searchCourtEstablishment').selectedOptions[0]?.text}</p>
                
                <div class="possible-reasons">
                    <strong>Possible Reasons:</strong>
                    <ul>
                        <li>Case number may be incorrect</li>
                        <li>Case filed very recently (not yet updated in our system)</li>
                        <li>Case might be in a different court complex</li>
                        <li>Typing error in case number</li>
                    </ul>
                </div>
            </div>
            
            <div class="action-options">
                <p><strong>You can:</strong></p>
                
                <button type="button" class="btn-secondary" onclick="goBackToSearch()">
                    ← Go Back & Correct Search Details
                </button>
                
                <button type="button" class="btn-outline" onclick="proceedManualEntry()">
                    Continue with Manual Entry →
                    <small>(Application will be marked for verification)</small>
                </button>
            </div>
            
            <div class="manual-entry-notice">
                <strong>📝 Note:</strong> Applications with manually entered case details will be marked as 
                "REQUIRES VERIFICATION" and may take longer to process. Court staff will verify your 
                case details before processing your copy application.
            </div>
        </div>
    `;

    // Show results, hide search form
    searchFormDiv.style.display = 'none';
    resultsDiv.style.display = 'block';

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Go back to search form
function goBackToSearch() {
    document.getElementById('caseSearchForm').style.display = 'block';
    document.getElementById('caseSearchResults').style.display = 'none';
    window.selectedCaseData = null;
}

// Proceed with found case
function proceedWithCase() {
    const confirmCheckbox = document.getElementById('confirmCaseDetails');

    if (!confirmCheckbox.checked) {
        showNotification('Please confirm the case details are correct', 'warning');
        return;
    }

    if (!window.selectedCaseData) {
        showNotification('Case data not found. Please search again.', 'error');
        return;
    }

    // Auto-fill application form with case data
    autoFillCaseDetails(window.selectedCaseData);

    // Hide case lookup section and show applicant details
    document.querySelector('.case-lookup-section').style.display = 'none';

    // Scroll to applicant details
    document.querySelector('.form-section h3').scrollIntoView({ behavior: 'smooth' });

    showNotification('Case details confirmed. Please continue with applicant information.', 'success');
}

// Proceed with manual entry
function proceedManualEntry() {
    // Set flag for manual verification
    window.manualCaseEntry = true;

    // Get search parameters
    const searchParams = {
        caseType: document.getElementById('searchCaseType').value,
        caseNumber: document.getElementById('searchCaseNumber').value.padStart(4, '0'),
        caseYear: document.getElementById('searchCaseYear').value,
        courtComplex: document.getElementById('searchCourtComplex').value,
        courtEstablishment: document.getElementById('searchCourtEstablishment').value
    };

    // Auto-fill available data
    autoFillManualCaseDetails(searchParams);

    // Hide case lookup section
    document.querySelector('.case-lookup-section').style.display = 'none';

    // Show warning about manual verification
    showNotification('⚠️ Your application will require manual verification by court staff', 'warning', 6000);

    // Scroll to applicant details
    document.querySelector('.form-section h3').scrollIntoView({ behavior: 'smooth' });
}

// Auto-fill form with case data
function autoFillCaseDetails(caseData) {
    // These fields should be added to your existing form or create hidden fields
    // For now, storing in window object
    window.applicationCaseData = {
        caseId: caseData.full_case_id,
        courtName: caseData.court_name,
        complexName: caseData.complex_name,
        caseTitle: caseData.case_title,
        autoFilled: true,
        verificationRequired: false
    };
}

// Auto-fill manual case details
function autoFillManualCaseDetails(searchParams) {
    const fullCaseId = `${searchParams.caseType}/${searchParams.caseNumber}/${searchParams.caseYear}`;

    window.applicationCaseData = {
        caseId: fullCaseId,
        courtComplex: searchParams.courtComplex,
        courtEstablishment: searchParams.courtEstablishment,
        autoFilled: false,
        verificationRequired: true,
        manualEntry: true
    };
}

// Clear case search form
function clearCaseSearch() {
    document.getElementById('searchDistrict').value = '';
    document.getElementById('searchCourtComplex').value = '';
    document.getElementById('searchCourtEstablishment').value = '';
    document.getElementById('searchCaseType').value = '';
    document.getElementById('searchCaseNumber').value = '';
    document.getElementById('searchCaseYear').value = '';

    // Reset dropdowns
    loadCourtComplexes();

    // Hide preview
    document.getElementById('caseIdPreview').style.display = 'none';

    // Hide results
    document.getElementById('caseSearchResults').style.display = 'none';
    document.getElementById('caseSearchForm').style.display = 'block';

    window.selectedCaseData = null;
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Show notification helper
function showNotification(message, type = 'info', duration = 3000) {
    // You can implement your own notification system
    // For now, using alert
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}
