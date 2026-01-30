// ========================================
// GLOBAL STATE MANAGEMENT
// ========================================
let events = JSON.parse(localStorage.getItem('events')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentCategory = 'all';
let currentView = 'grid';
let theme = localStorage.getItem('theme') || 'light';

// ========================================
// DOM ELEMENTS
// ========================================
const views = {
    auth: document.getElementById('auth-view'),
    admin: document.getElementById('admin-view'),
    club: document.getElementById('club-view'),
    student: document.getElementById('student-view')
};

const navbar = document.getElementById('navbar');
const userDisplay = document.getElementById('userDisplay');
const userAvatar = document.getElementById('userAvatar');

// ========================================
// INITIALIZATION
// ========================================
function init() {
    applyTheme();
    if (currentUser) {
        showDashboard(currentUser.role);
        updateNotificationBadge();
    } else {
        switchView('auth');
    }
    
    // Setup global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }
    
    // Setup registration role change
    const regRole = document.getElementById('regRole');
    if (regRole) {
        regRole.addEventListener('change', handleRegRoleChange);
    }
    
    // Setup password strength checker
    const regPassword = document.getElementById('regPassword');
    if (regPassword) {
        regPassword.addEventListener('input', checkPasswordStrength);
    }
    
    // Initialize demo data if empty
    if (users.length === 0) {
        initDemoData();
    }
}

// ========================================
// DEMO DATA INITIALIZATION
// ========================================
function initDemoData() {
    // Add demo users
    const demoUsers = [
        { username: 'admin', password: 'admin123', fullName: 'Admin User', email: 'admin@university.edu', role: 'admin', joined: new Date().toISOString() },
        { username: 'techclub', password: 'club123', fullName: 'Tech Club', email: 'tech@university.edu', role: 'club', clubName: 'Technology Club', joined: new Date().toISOString() },
        { username: 'student1', password: 'student123', fullName: 'John Doe', email: 'john@university.edu', role: 'student', joined: new Date().toISOString() }
    ];
    
    users = demoUsers;
    saveUsers();
    
    // Add demo events
    const demoEvents = [
        {
            id: Date.now() + 1,
            name: 'AI & Machine Learning Workshop',
            category: 'technical',
            date: '2026-02-15',
            time: '14:00',
            venue: 'Tech Lab A',
            capacity: 100,
            desc: 'Learn the fundamentals of AI and machine learning with hands-on exercises.',
            createdBy: 'techclub',
            participants: ['student1'],
            banner: '',
            tags: ['ai', 'ml', 'workshop'],
            regDeadline: '2026-02-13',
            status: 'upcoming'
        },
        {
            id: Date.now() + 2,
            name: 'Annual Cultural Fest',
            category: 'cultural',
            date: '2026-02-20',
            time: '10:00',
            venue: 'Main Auditorium',
            capacity: 500,
            desc: 'Celebrate diversity with music, dance, and cultural performances.',
            createdBy: 'techclub',
            participants: [],
            banner: '',
            tags: ['cultural', 'festival', 'music'],
            regDeadline: '2026-02-18',
            status: 'upcoming'
        }
    ];
    
    events = demoEvents;
    saveEvents();
    
    showToast('Demo data loaded successfully!', 'info');
}

// ========================================
// AUTHENTICATION
// ========================================
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function handleRegRoleChange() {
    const role = document.getElementById('regRole').value;
    const clubNameGroup = document.getElementById('clubNameGroup');
    
    if (role === 'club') {
        clubNameGroup.style.display = 'block';
        document.getElementById('regClubName').required = true;
    } else {
        clubNameGroup.style.display = 'none';
        document.getElementById('regClubName').required = false;
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('regPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    strengthDiv.innerHTML = '';
    if (password.length > 0) {
        const bar = document.createElement('div');
        bar.className = 'password-strength-bar';
        
        if (strength <= 1) {
            bar.classList.add('strength-weak');
        } else if (strength <= 3) {
            bar.classList.add('strength-medium');
        } else {
            bar.classList.add('strength-strong');
        }
        
        strengthDiv.appendChild(bar);
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const clubName = document.getElementById('regClubName').value.trim();
    
    // Validate
    if (!fullName || !username || !email || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Check if username exists
    if (users.find(u => u.username === username)) {
        showToast('Username already exists', 'error');
        return;
    }
    
    // Check if email exists
    if (users.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        fullName,
        email,
        role,
        clubName: role === 'club' ? clubName : '',
        joined: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    
    showToast('Registration successful! Please login.', 'success');
    showLoginForm();
    e.target.reset();
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    if (!username || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }
    
    // Find user
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        currentUser = { 
            username: user.username, 
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            clubName: user.clubName || ''
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        addNotification('Welcome back, ' + currentUser.fullName + '!', 'info');
        showDashboard(role);
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid credentials or role', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    navbar.classList.add('hidden');
    switchView('auth');
    showToast('Logged out successfully', 'info');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ========================================
// NAVIGATION & VIEWS
// ========================================
function showDashboard(role) {
    navbar.classList.remove('hidden');
    userDisplay.textContent = currentUser.fullName;
    userAvatar.textContent = currentUser.fullName.charAt(0).toUpperCase();
    
    if (role === 'admin') {
        switchView('admin');
        renderAdminDashboard();
    } else if (role === 'club') {
        switchView('club');
        renderClubDashboard();
    } else {
        switchView('student');
        renderStudentDashboard();
    }
}

function switchView(viewName) {
    Object.values(views).forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active-view');
    });
    
    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
        views[viewName].classList.add('active-view');
    }
}

// ========================================
// DATA PERSISTENCE
// ========================================
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// ========================================
// CLUB LOGIC
// ========================================
function toggleModal(show) {
    const modal = document.getElementById('eventModal');
    if (show) {
        modal.classList.remove('hidden');
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newEventDate').min = today;
        document.getElementById('newEventRegDeadline').min = today;
    } else {
        modal.classList.add('hidden');
    }
}

function handleCreateEvent(e) {
    e.preventDefault();
    
    const name = document.getElementById('newEventName').value.trim();
    const category = document.getElementById('newEventCategory').value;
    const date = document.getElementById('newEventDate').value;
    const time = document.getElementById('newEventTime').value;
    const venue = document.getElementById('newEventVenue').value.trim();
    const capacity = parseInt(document.getElementById('newEventCapacity').value);
    const desc = document.getElementById('newEventDesc').value.trim();
    const banner = document.getElementById('newEventBanner').value.trim();
    const regDeadline = document.getElementById('newEventRegDeadline').value;
    const tags = document.getElementById('newEventTags').value.trim().split(',').map(t => t.trim()).filter(t => t);
    
    const newEvent = {
        id: Date.now(),
        name,
        category,
        date,
        time,
        venue,
        capacity,
        desc,
        banner,
        tags,
        regDeadline,
        createdBy: currentUser.username,
        participants: [],
        status: 'upcoming',
        rating: 0,
        reviews: []
    };
    
    events.push(newEvent);
    saveEvents();
    toggleModal(false);
    e.target.reset();
    renderClubDashboard();
    
    // Notify all students
    addNotification(`New event: ${name}`, 'event', currentUser.username);
    showToast('Event created successfully!', 'success');
}

function renderClubDashboard() {
    const grid = document.getElementById('clubEventsGrid');
    const myEvents = events.filter(e => e.createdBy === currentUser.username);
    
    // Update stats
    document.getElementById('clubTotalEvents').textContent = myEvents.length;
    const totalRegs = myEvents.reduce((sum, e) => sum + e.participants.length, 0);
    document.getElementById('clubTotalRegistrations').textContent = totalRegs;
    const upcomingEvents = myEvents.filter(e => new Date(e.date) >= new Date()).length;
    document.getElementById('clubUpcomingEvents').textContent = upcomingEvents;
    
    // Filter
    const filter = document.getElementById('clubEventFilter').value;
    let filteredEvents = myEvents;
    
    if (filter === 'upcoming') {
        filteredEvents = myEvents.filter(e => new Date(e.date) >= new Date());
    } else if (filter === 'past') {
        filteredEvents = myEvents.filter(e => new Date(e.date) < new Date());
    }
    
    grid.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No events found. Create your first event!</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const card = createEventCard(event, 'club');
        grid.appendChild(card);
    });
}

function deleteEvent(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        
        if (currentUser.role === 'club') renderClubDashboard();
        if (currentUser.role === 'admin') renderAdminDashboard();
        
        showToast('Event deleted successfully', 'success');
    }
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    // Populate modal with event data
    document.getElementById('newEventName').value = event.name;
    document.getElementById('newEventCategory').value = event.category;
    document.getElementById('newEventDate').value = event.date;
    document.getElementById('newEventTime').value = event.time;
    document.getElementById('newEventVenue').value = event.venue;
    document.getElementById('newEventCapacity').value = event.capacity;
    document.getElementById('newEventDesc').value = event.desc;
    document.getElementById('newEventBanner').value = event.banner || '';
    document.getElementById('newEventRegDeadline').value = event.regDeadline || '';
    document.getElementById('newEventTags').value = event.tags.join(', ');
    
    // Change form submit handler
    const form = document.querySelector('#eventModal form');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateEvent(id);
    };
    
    toggleModal(true);
}

function updateEvent(id) {
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return;
    
    events[index] = {
        ...events[index],
        name: document.getElementById('newEventName').value.trim(),
        category: document.getElementById('newEventCategory').value,
        date: document.getElementById('newEventDate').value,
        time: document.getElementById('newEventTime').value,
        venue: document.getElementById('newEventVenue').value.trim(),
        capacity: parseInt(document.getElementById('newEventCapacity').value),
        desc: document.getElementById('newEventDesc').value.trim(),
        banner: document.getElementById('newEventBanner').value.trim(),
        regDeadline: document.getElementById('newEventRegDeadline').value,
        tags: document.getElementById('newEventTags').value.trim().split(',').map(t => t.trim()).filter(t => t)
    };
    
    saveEvents();
    toggleModal(false);
    
    // Reset form handler
    const form = document.querySelector('#eventModal form');
    form.onsubmit = handleCreateEvent;
    form.reset();
    
    renderClubDashboard();
    showToast('Event updated successfully!', 'success');
}

// ========================================
// STUDENT LOGIC
// ========================================
function renderStudentDashboard() {
    const grid = document.getElementById('studentEventsGrid');
    
    // Update stats
    const registeredEvents = events.filter(e => e.participants.includes(currentUser.username));
    document.getElementById('studentRegisteredCount').textContent = registeredEvents.length;
    const upcomingRegs = registeredEvents.filter(e => new Date(e.date) >= new Date()).length;
    document.getElementById('studentUpcomingCount').textContent = upcomingRegs;
    const attended = registeredEvents.filter(e => new Date(e.date) < new Date()).length;
    document.getElementById('studentAttendedCount').textContent = attended;
    document.getElementById('studentFavoritesCount').textContent = favorites.length;
    
    // Filter by category
    let filteredEvents = currentCategory === 'all' 
        ? events 
        : events.filter(e => e.category === currentCategory);
    
    // Sort
    const sortBy = document.getElementById('studentSortBy').value;
    if (sortBy === 'date') {
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popular') {
        filteredEvents.sort((a, b) => b.participants.length - a.participants.length);
    } else if (sortBy === 'newest') {
        filteredEvents.sort((a, b) => b.id - a.id);
    }
    
    grid.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No events found.</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const card = createEventCard(event, 'student');
        grid.appendChild(card);
    });
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.category-btn').classList.add('active');
    
    renderStudentDashboard();
}

function registerForEvent(id) {
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return;
    
    const event = events[eventIndex];
    
    // Check capacity
    if (event.participants.length >= event.capacity) {
        showToast('Event is full!', 'error');
        return;
    }
    
    // Check registration deadline
    if (event.regDeadline && new Date(event.regDeadline) < new Date()) {
        showToast('Registration deadline has passed', 'error');
        return;
    }
    
    if (!event.participants.includes(currentUser.username)) {
        event.participants.push(currentUser.username);
        saveEvents();
        addNotification(`Successfully registered for ${event.name}`, 'success');
        showToast('Registration successful!', 'success');
        renderStudentDashboard();
    }
}

function unregisterFromEvent(id) {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return;
    
    events[eventIndex].participants = events[eventIndex].participants.filter(
        p => p !== currentUser.username
    );
    
    saveEvents();
    showToast('Registration cancelled', 'info');
    renderStudentDashboard();
}

function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'info');
    } else {
        favorites.push(id);
        showToast('Added to favorites', 'success');
    }
    saveFavorites();
    renderStudentDashboard();
}

// ========================================
// ADMIN LOGIC
// ========================================
function renderAdminDashboard() {
    // Update stats
    document.getElementById('totalEventsCount').textContent = events.length;
    const totalParticipants = events.reduce((sum, e) => sum + e.participants.length, 0);
    document.getElementById('totalParticipantsCount').textContent = totalParticipants;
    document.getElementById('totalUsersCount').textContent = users.length;
    const clubCount = users.filter(u => u.role === 'club').length;
    document.getElementById('totalClubsCount').textContent = clubCount;
    
    // Populate club filter
    const clubFilter = document.getElementById('adminFilterClub');
    clubFilter.innerHTML = '<option value="all">All Clubs</option>';
    const clubs = users.filter(u => u.role === 'club');
    clubs.forEach(club => {
        const option = document.createElement('option');
        option.value = club.username;
        option.textContent = club.clubName || club.username;
        clubFilter.appendChild(option);
    });
    
    // Filter events
    let filteredEvents = [...events];
    const statusFilter = document.getElementById('adminFilterStatus').value;
    const clubFilterValue = clubFilter.value;
    
    if (statusFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (statusFilter === 'upcoming') {
            filteredEvents = filteredEvents.filter(e => new Date(e.date) >= today);
        } else if (statusFilter === 'past') {
            filteredEvents = filteredEvents.filter(e => new Date(e.date) < today);
        } else if (statusFilter === 'today') {
            filteredEvents = filteredEvents.filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === today.getTime();
            });
        }
    }
    
    if (clubFilterValue !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.createdBy === clubFilterValue);
    }
    
    // Render events table
    const tbody = document.getElementById('adminEventList');
    tbody.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No events found</td></tr>';
    } else {
        filteredEvents.forEach(event => {
            const tr = document.createElement('tr');
            const creator = users.find(u => u.username === event.createdBy);
            const status = getEventStatus(event);
            const fillPercentage = (event.participants.length / event.capacity * 100).toFixed(0);
            
            tr.innerHTML = `
                <td>
                    <strong>${event.name}</strong><br>
                    <small style="color: var(--text-secondary);">${event.category}</small>
                </td>
                <td>${formatDate(event.date)}<br><small>${event.time}</small></td>
                <td>${event.venue}</td>
                <td>${creator ? creator.clubName || creator.username : event.createdBy}</td>
                <td>${event.capacity}</td>
                <td>
                    ${event.participants.length}
                    <small style="color: var(--text-secondary);">(${fillPercentage}%)</small>
                </td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn-icon" onclick="viewEventDetails(${event.id})" title="View Details">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteEvent(${event.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Render user management table
    renderUserManagement();
    
    // Render charts
    renderCharts();
}

function renderUserManagement() {
    const tbody = document.getElementById('adminUserList');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const userEvents = events.filter(e => 
            user.role === 'club' ? e.createdBy === user.username : e.participants.includes(user.username)
        ).length;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${user.fullName}</strong><br>
                <small style="color: var(--text-secondary);">@${user.username}</small>
            </td>
            <td>${user.email}</td>
            <td><span class="status-badge ${user.role}">${user.role}</span></td>
            <td>${formatDate(user.joined.split('T')[0])}</td>
            <td>${userEvents}</td>
            <td>
                <button class="btn-icon" onclick="viewUserProfile('${user.username}')" title="View Profile">
                    <i class="fa-solid fa-eye"></i>
                </button>
                ${user.username !== currentUser.username ? `
                    <button class="btn-danger" onclick="deleteUser('${user.username}')" title="Delete User">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(username) {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;
    
    users = users.filter(u => u.username !== username);
    saveUsers();
    
    // Remove user from event participants
    events.forEach(event => {
        event.participants = event.participants.filter(p => p !== username);
    });
    saveEvents();
    
    renderAdminDashboard();
    showToast('User deleted successfully', 'success');
}

function viewUserProfile(username) {
    const user = users.find(u => u.username === username);
    if (!user) return;
    
    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileContent');
    
    const userEvents = user.role === 'club' 
        ? events.filter(e => e.createdBy === username)
        : events.filter(e => e.participants.includes(username));
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 1rem;">${user.fullName.charAt(0)}</div>
            <h2>${user.fullName}</h2>
            <p style="color: var(--text-secondary);">@${user.username}</p>
            <span class="status-badge ${user.role}">${user.role}</span>
        </div>
        <div style="display: grid; gap: 1rem;">
            <div><strong>Email:</strong> ${user.email}</div>
            <div><strong>Joined:</strong> ${formatDate(user.joined.split('T')[0])}</div>
            ${user.clubName ? `<div><strong>Club:</strong> ${user.clubName}</div>` : ''}
            <div><strong>${user.role === 'club' ? 'Events Created' : 'Events Registered'}:</strong> ${userEvents.length}</div>
        </div>
        <div style="margin-top: 2rem;">
            <h3>Recent Activity</h3>
            ${userEvents.slice(0, 5).map(e => `
                <div style="padding: 0.75rem; background: var(--bg-primary); border-radius: var(--radius-md); margin-top: 0.5rem;">
                    <strong>${e.name}</strong><br>
                    <small style="color: var(--text-secondary);">${formatDate(e.date)} at ${e.time}</small>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function renderCharts() {
    // Events Chart
    const eventsCtx = document.getElementById('eventsChart');
    if (eventsCtx && typeof Chart !== 'undefined') {
        const categoryData = {};
        events.forEach(e => {
            categoryData[e.category] = (categoryData[e.category] || 0) + 1;
        });
        
        new Chart(eventsCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    label: 'Events by Category',
                    data: Object.values(categoryData),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Registration Chart
    const regCtx = document.getElementById('registrationChart');
    if (regCtx && typeof Chart !== 'undefined') {
        const topEvents = events
            .sort((a, b) => b.participants.length - a.participants.length)
            .slice(0, 5);
        
        new Chart(regCtx, {
            type: 'pie',
            data: {
                labels: topEvents.map(e => e.name),
                datasets: [{
                    data: topEvents.map(e => e.participants.length),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function refreshAdminData() {
    showToast('Refreshing data...', 'info');
    setTimeout(() => {
        renderAdminDashboard();
        showToast('Data refreshed!', 'success');
    }, 500);
}

function exportData() {
    const data = {
        events,
        users: users.map(u => ({ ...u, password: undefined })),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-events-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

// ========================================
// EVENT CARD CREATION
// ========================================
function createEventCard(event, viewType) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const isRegistered = event.participants.includes(currentUser.username);
    const isFavorite = favorites.includes(event.id);
    const fillPercentage = (event.participants.length / event.capacity * 100).toFixed(0);
    const status = getEventStatus(event);
    
    let actions = '';
    
    if (viewType === 'club') {
        actions = `
            <button class="btn-secondary" onclick="editEvent(${event.id})">
                <i class="fa-solid fa-edit"></i> Edit
            </button>
            <button class="btn-danger" onclick="deleteEvent(${event.id})">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        `;
    } else if (viewType === 'student') {
        const isDisabled = event.participants.length >= event.capacity || 
                          (event.regDeadline && new Date(event.regDeadline) < new Date());
        actions = isRegistered 
            ? `<button class="btn-secondary" onclick="unregisterFromEvent(${event.id})">
                <i class="fa-solid fa-times"></i> Cancel Registration
               </button>`
            : `<button class="btn-primary" onclick="registerForEvent(${event.id})" ${isDisabled ? 'disabled' : ''}>
                <i class="fa-solid fa-ticket"></i> ${isDisabled ? 'Registration Closed' : 'Register Now'}
               </button>`;
    }
    
    card.innerHTML = `
        ${event.banner ? `<img src="${event.banner}" alt="${event.name}" class="event-banner">` : ''}
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3>${event.name}</h3>
            ${viewType === 'student' ? `
                <button class="btn-icon" onclick="toggleFavorite(${event.id})" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart" style="color: ${isFavorite ? 'var(--danger)' : 'inherit'};"></i>
                </button>
            ` : ''}
        </div>
        <div class="event-tags">
            <span class="tag">${event.category}</span>
            ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="event-meta">
            <div><i class="fa-regular fa-calendar"></i> ${formatDate(event.date)} at ${event.time}</div>
            <div><i class="fa-solid fa-location-dot"></i> ${event.venue}</div>
            <div><i class="fa-solid fa-user"></i> By ${event.createdBy}</div>
        </div>
        <p>${event.desc}</p>
        <div class="event-footer">
            <div class="capacity-bar">
                <div class="capacity-progress">
                    <div class="capacity-fill" style="width: ${fillPercentage}%;"></div>
                </div>
                <div class="capacity-text">${event.participants.length}/${event.capacity} registered</div>
            </div>
            <span class="status-badge ${status.class}">${status.text}</span>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            ${actions}
            <button class="btn-secondary" onclick="viewEventDetails(${event.id})">
                <i class="fa-solid fa-info-circle"></i> Details
            </button>
        </div>
    `;
    
    return card;
}

// ========================================
// EVENT DETAILS MODAL
// ========================================
function viewEventDetails(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    const modal = document.getElementById('eventDetailsModal');
    const content = document.getElementById('eventDetailsContent');
    const creator = users.find(u => u.username === event.createdBy);
    const status = getEventStatus(event);
    
    content.innerHTML = `
        ${event.banner ? `<img src="${event.banner}" alt="${event.name}" style="width: 100%; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">` : ''}
        <h2>${event.name}</h2>
        <div class="event-tags" style="margin: 1rem 0;">
            <span class="tag">${event.category}</span>
            ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            <span class="status-badge ${status.class}">${status.text}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
            <div>
                <strong><i class="fa-regular fa-calendar"></i> Date & Time</strong><br>
                <span style="color: var(--text-secondary);">${formatDate(event.date)} at ${event.time}</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-location-dot"></i> Venue</strong><br>
                <span style="color: var(--text-secondary);">${event.venue}</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-users"></i> Capacity</strong><br>
                <span style="color: var(--text-secondary);">${event.capacity} attendees</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-user-check"></i> Registered</strong><br>
                <span style="color: var(--text-secondary);">${event.participants.length} / ${event.capacity}</span>
            </div>
            ${event.regDeadline ? `
            <div>
                <strong><i class="fa-solid fa-calendar-xmark"></i> Registration Deadline</strong><br>
                <span style="color: var(--text-secondary);">${formatDate(event.regDeadline)}</span>
            </div>
            ` : ''}
            <div>
                <strong><i class="fa-solid fa-building"></i> Organized By</strong><br>
                <span style="color: var(--text-secondary);">${creator ? creator.clubName || creator.fullName : event.createdBy}</span>
            </div>
        </div>
        <div style="margin: 1.5rem 0;">
            <strong>Description</strong>
            <p style="margin-top: 0.5rem; color: var(--text-secondary); line-height: 1.6;">${event.desc}</p>
        </div>
        ${event.participants.length > 0 ? `
        <div style="margin-top: 1.5rem;">
            <strong>Registered Participants (${event.participants.length})</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                ${event.participants.slice(0, 10).map(p => {
                    const user = users.find(u => u.username === p);
                    return `<span class="tag">${user ? user.fullName : p}</span>`;
                }).join('')}
                ${event.participants.length > 10 ? `<span class="tag">+${event.participants.length - 10} more</span>` : ''}
            </div>
        </div>
        ` : ''}
    `;
    
    modal.classList.remove('hidden');
}

function closeEventDetails() {
    document.getElementById('eventDetailsModal').classList.add('hidden');
}

// ========================================
// MY REGISTRATIONS
// ========================================
function viewMyRegistrations() {
    const modal = document.getElementById('myRegistrationsModal');
    const content = document.getElementById('myRegistrationsContent');
    
    const myRegistrations = events.filter(e => e.participants.includes(currentUser.username));
    
    if (myRegistrations.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">You haven\'t registered for any events yet.</p>';
    } else {
        content.innerHTML = `
            <div style="display: grid; gap: 1rem;">
                ${myRegistrations.map(event => {
                    const status = getEventStatus(event);
                    return `
                        <div style="padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-lg); border-left: 4px solid var(--primary);">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4>${event.name}</h4>
                                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0;">
                                        <i class="fa-regular fa-calendar"></i> ${formatDate(event.date)} at ${event.time}<br>
                                        <i class="fa-solid fa-location-dot"></i> ${event.venue}
                                    </p>
                                </div>
                                <span class="status-badge ${status.class}">${status.text}</span>
                            </div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                                <button class="btn-secondary" onclick="viewEventDetails(${event.id}); closeMyRegistrations();">
                                    <i class="fa-solid fa-eye"></i> View Details
                                </button>
                                ${new Date(event.date) >= new Date() ? `
                                    <button class="btn-danger" onclick="unregisterFromEvent(${event.id}); closeMyRegistrations(); viewMyRegistrations();">
                                        <i class="fa-solid fa-times"></i> Cancel
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

function closeMyRegistrations() {
    document.getElementById('myRegistrationsModal').classList.add('hidden');
}

// ========================================
// PROFILE
// ========================================
function openProfile() {
    viewUserProfile(currentUser.username);
}

function closeProfile() {
    document.getElementById('profileModal').classList.add('hidden');
}

// ========================================
// NOTIFICATIONS
// ========================================
function addNotification(message, type, from = 'System') {
    const notification = {
        id: Date.now(),
        message,
        type,
        from,
        time: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    if (notifications.length > 50) notifications = notifications.slice(0, 50);
    saveNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notifBadge');
    const unreadCount = notifications.filter(n => !n.read).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
}

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        renderNotifications();
        // Mark all as read
        setTimeout(() => {
            notifications.forEach(n => n.read = true);
            saveNotifications();
            updateNotificationBadge();
        }, 1000);
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    
    if (notifications.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No notifications</p>';
        return;
    }
    
    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}">
            <div><strong>${n.message}</strong></div>
            <div class="time">${getTimeAgo(n.time)}</div>
        </div>
    `).join('');
}

function clearAllNotifications() {
    if (confirm('Clear all notifications?')) {
        notifications = [];
        saveNotifications();
        updateNotificationBadge();
        toggleNotifications();
    }
}

// ========================================
// THEME TOGGLE
// ========================================
function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme();
}

function applyTheme() {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// ========================================
// GLOBAL SEARCH
// ========================================
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        if (currentUser.role === 'admin') renderAdminDashboard();
        else if (currentUser.role === 'club') renderClubDashboard();
        else renderStudentDashboard();
        return;
    }
    
    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.desc.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    // Update the appropriate view with filtered results
    if (currentUser.role === 'student') {
        const grid = document.getElementById('studentEventsGrid');
        grid.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No events found matching your search.</p>';
        } else {
            filteredEvents.forEach(event => {
                const card = createEventCard(event, 'student');
                grid.appendChild(card);
            });
        }
    } else if (currentUser.role === 'club') {
        const myEvents = filteredEvents.filter(e => e.createdBy === currentUser.username);
        const grid = document.getElementById('clubEventsGrid');
        grid.innerHTML = '';
        
        if (myEvents.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No events found matching your search.</p>';
        } else {
            myEvents.forEach(event => {
                const card = createEventCard(event, 'club');
                grid.appendChild(card);
            });
        }
    }
}

// ========================================
// VIEW TOGGLES
// ========================================
function switchEventView(view) {
    currentView = view;
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.toggle-btn').classList.add('active');
    
    const grid = document.getElementById('clubEventsGrid');
    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    }
}

function switchStudentView(view) {
    currentView = view;
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.toggle-btn').classList.add('active');
    
    const grid = document.getElementById('studentEventsGrid');
    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    }
}

// ========================================
// USER MENU
// ========================================
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('hidden');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-dropdown')) {
        document.getElementById('userMenu')?.classList.add('hidden');
    }
    if (!e.target.closest('.nav-icon-btn') && !e.target.closest('.notification-panel')) {
        document.getElementById('notificationPanel')?.classList.add('hidden');
    }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================
function getEventStatus(event) {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (event.participants.length >= event.capacity) {
        return { class: 'full', text: 'Full' };
    }
    
    if (eventDate < today) {
        return { class: 'past', text: 'Completed' };
    }
    
    if (eventDate.toDateString() === today.toDateString()) {
        return { class: 'ongoing', text: 'Today' };
    }
    
    return { class: 'upcoming', text: 'Upcoming' };
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function openSettings() {
    showToast('Settings feature coming soon!', 'info');
}

function openAdminSettings() {
    showToast('Admin settings feature coming soon!', 'info');
}

function openUserManagement() {
    showToast('User management feature coming soon!', 'info');
}

// ========================================
// INITIALIZE APP
// ========================================
document.addEventListener('DOMContentLoaded', init);
