// Authentication State Management
const AUTH_KEY = 'ca_auth_user';
const DEMO_USERS = {
    citizen: { username: 'citizen', password: 'demo123', role: 'citizen', name: 'Rahul Sharma' },
    staff: { username: 'staff', password: 'demo123', role: 'staff', name: 'Priya Verma' },
    admin: { username: 'admin', password: 'demo123', role: 'admin', name: 'Amit Kumar' }
};

let currentPortalType = null;

// Show login modal
function showLogin(portalType) {
    currentPortalType = portalType;
    const modal = document.getElementById('loginModal');
    const modalTitle = document.getElementById('modalTitle');
    const demoCredentials = document.getElementById('demoCredentials');
    
    const titles = {
        citizen: 'Citizen / Advocate Login',
        staff: 'Staff Login',
        admin: 'Administrator Login'
    };
    
    const credentials = {
        citizen: 'Username: citizen | Password: demo123',
        staff: 'Username: staff | Password: demo123',
        admin: 'Username: admin | Password: demo123'
    };
    
    modalTitle.textContent = titles[portalType];
    demoCredentials.innerHTML = `<p><strong>Demo Credentials:</strong></p><p>${credentials[portalType]}</p>`;
    modal.style.display = 'block';
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    currentPortalType = null;
    document.getElementById('loginForm').reset();
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check credentials
    const user = Object.values(DEMO_USERS).find(u => 
        u.username === username && u.password === password && u.role === currentPortalType
    );
    
    if (user) {
        // Store user session
        localStorage.setItem(AUTH_KEY, JSON.stringify({
            username: user.username,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        }));
        
        // Redirect to appropriate portal
        const portals = {
            citizen: 'citizen-portal.html',
            staff: 'staff-portal.html',
            admin: 'admin-portal.html'
        };
        
        window.location.href = portals[user.role];
    } else {
        alert('Invalid credentials. Please use the demo credentials provided.');
    }
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem(AUTH_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Logout
function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

// Check authentication
function requireAuth(allowedRoles = []) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        alert('You do not have permission to access this page.');
        window.location.href = 'index.html';
        return null;
    }
    
    return user;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}
