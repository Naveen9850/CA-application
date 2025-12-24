// Admin Portal JavaScript
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    currentUser = requireAuth(['admin']);
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        seedDemoData();
        loadDashboard();
    }
});

// Load dashboard data
function loadDashboard() {
    updateStatistics();
    renderStatusChart();
    renderRecentActivity();
    renderTrendChart();
}

// Update statistics cards
function updateStatistics() {
    const stats = getStats();
    const applications = getAllApplications();

    // Count by status
    const pending = applications.filter(app => app.status === STATUS.PENDING || app.status === STATUS.UNDER_REVIEW);
    const approved = applications.filter(app => app.status === STATUS.APPROVED);
    const todayProcessed = getTodayProcessed();

    // Update cards
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('todayProcessed').textContent = todayProcessed;
    document.getElementById('totalApps').textContent = applications.length;
    document.getElementById('approvedCount').textContent = approved.length;

    // Calculate approval rate
    const processedApps = applications.filter(app =>
        app.status === STATUS.APPROVED || app.status === STATUS.REJECTED
    );
    const approvalRate = processedApps.length > 0
        ? Math.round((approved.length / processedApps.length) * 100)
        : 0;
    document.getElementById('approvalRate').textContent = approvalRate + '%';
}

// Render status distribution chart
function renderStatusChart() {
    const applications = getAllApplications();

    const statusCounts = {
        pending: applications.filter(app => app.status === STATUS.PENDING).length,
        under_review: applications.filter(app => app.status === STATUS.UNDER_REVIEW).length,
        approved: applications.filter(app => app.status === STATUS.APPROVED).length,
        rejected: applications.filter(app => app.status === STATUS.REJECTED).length
    };

    const total = applications.length || 1;

    const chartHTML = `
        <div class="chart-bars">
            <div class="chart-row">
                <div class="chart-label">
                    <span class="status-dot" style="background: var(--warning-500);"></span>
                    Pending
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar" style="width: ${(statusCounts.pending / total) * 100}%; background: var(--warning-500);"></div>
                </div>
                <div class="chart-value">${statusCounts.pending}</div>
            </div>
            
            <div class="chart-row">
                <div class="chart-label">
                    <span class="status-dot" style="background: var(--info-500);"></span>
                    Under Review
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar" style="width: ${(statusCounts.under_review / total) * 100}%; background: var(--info-500);"></div>
                </div>
                <div class="chart-value">${statusCounts.under_review}</div>
            </div>
            
            <div class="chart-row">
                <div class="chart-label">
                    <span class="status-dot" style="background: var(--success-500);"></span>
                    Approved
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar" style="width: ${(statusCounts.approved / total) * 100}%; background: var(--success-500);"></div>
                </div>
                <div class="chart-value">${statusCounts.approved}</div>
            </div>
            
            <div class="chart-row">
                <div class="chart-label">
                    <span class="status-dot" style="background: var(--error-500);"></span>
                    Rejected
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar" style="width: ${(statusCounts.rejected / total) * 100}%; background: var(--error-500);"></div>
                </div>
                <div class="chart-value">${statusCounts.rejected}</div>
            </div>
        </div>
    `;

    document.getElementById('statusChart').innerHTML = chartHTML;
}

// Render recent activity
function renderRecentActivity() {
    const applications = getAllApplications();

    // Get recently updated applications
    const recentApps = applications
        .filter(app => app.processedDate)
        .sort((a, b) => new Date(b.processedDate) - new Date(a.processedDate))
        .slice(0, 10);

    if (recentApps.length === 0) {
        document.getElementById('recentActivity').innerHTML = `
            <div class="empty-state">
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    const activityHTML = recentApps.map(app => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${getStatusColor(app.status)}20; color: ${getStatusColor(app.status)};">
                ${app.status === STATUS.APPROVED ? '✓' : '✗'}
            </div>
            <div class="activity-details">
                <div class="activity-title">
                    Application <strong>${app.id}</strong> was ${app.status}
                </div>
                <div class="activity-meta">
                    ${app.processedBy} • ${formatDate(app.processedDate)}
                </div>
            </div>
            ${getStatusBadge(app.status)}
        </div>
    `).join('');

    document.getElementById('recentActivity').innerHTML = activityHTML;
}

// Render trend chart
function renderTrendChart() {
    const stats = getStats();
    const dailyProcessed = stats.dailyProcessed || {};

    // Get last 7 days
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }

    // Get counts for each day
    const counts = days.map(day => dailyProcessed[day] || 0);
    const maxCount = Math.max(...counts, 1);

    const chartHTML = days.map((day, index) => {
        const date = new Date(day);
        const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayNum = date.getDate();
        const count = counts[index];
        const barHeight = (count / maxCount) * 100;

        return `
            <div class="trend-bar-container">
                <div class="trend-bar-wrapper">
                    <div class="trend-bar" style="height: ${barHeight}%; background: var(--primary-gradient);" 
                         title="${count} processed">
                    </div>
                </div>
                <div class="trend-count">${count}</div>
                <div class="trend-label">${dayName}<br>${dayNum}</div>
            </div>
        `;
    }).join('');

    document.getElementById('trendChart').innerHTML = `
        <div class="trend-chart-container">
            ${chartHTML}
        </div>
    `;
}

// Add custom styles for charts
const style = document.createElement('style');
style.textContent = `
    .status-chart {
        padding: var(--spacing-lg) 0;
    }
    
    .chart-bars {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }
    
    .chart-row {
        display: grid;
        grid-template-columns: 150px 1fr 60px;
        gap: var(--spacing-md);
        align-items: center;
    }
    
    .chart-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-weight: 500;
        font-size: 0.875rem;
    }
    
    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    
    .chart-bar-container {
        background: var(--gray-100);
        height: 32px;
        border-radius: var(--radius-md);
        overflow: hidden;
    }
    
    .chart-bar {
        height: 100%;
        border-radius: var(--radius-md);
        transition: width 0.5s ease-out;
        display: flex;
        align-items: center;
        padding-left: var(--spacing-sm);
        color: white;
        font-weight: 600;
        font-size: 0.75rem;
    }
    
    .chart-value {
        text-align: right;
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--text-primary);
    }
    
    .activity-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--gray-50);
        border-radius: var(--radius-lg);
        transition: all var(--transition-fast);
    }
    
    .activity-item:hover {
        background: var(--gray-100);
    }
    
    .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 700;
    }
    
    .activity-details {
        flex: 1;
    }
    
    .activity-title {
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }
    
    .activity-meta {
        font-size: 0.75rem;
        color: var(--text-tertiary);
    }
    
    .trend-chart-container {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        height: 250px;
        padding: var(--spacing-lg);
        background: var(--gray-50);
        border-radius: var(--radius-lg);
    }
    
    .trend-bar-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        max-width: 80px;
    }
    
    .trend-bar-wrapper {
        width: 100%;
        height: 150px;
        display: flex;
        align-items: flex-end;
        margin-bottom: var(--spacing-xs);
    }
    
    .trend-bar {
        width: 100%;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        transition: height 0.5s ease-out;
        min-height: 4px;
    }
    
    .trend-count {
        font-weight: 700;
        font-size: 0.875rem;
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
    }
    
    .trend-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-align: center;
        line-height: 1.2;
    }
    
    .card-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-top: var(--spacing-xs);
    }
    
    @media (max-width: 768px) {
        .chart-row {
            grid-template-columns: 100px 1fr 50px;
            gap: var(--spacing-sm);
        }
        
        .trend-chart-container {
            height: 200px;
            padding: var(--spacing-md);
        }
        
        .trend-bar-wrapper {
            height: 120px;
        }
    }
`;
document.head.appendChild(style);
