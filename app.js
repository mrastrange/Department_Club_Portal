// Global State
let events = JSON.parse(localStorage.getItem('events')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// DOM Elements
const views = {
    login: document.getElementById('login-view'),
    admin: document.getElementById('admin-view'),
    club: document.getElementById('club-view'),
    student: document.getElementById('student-view')
};
const navbar = document.getElementById('navbar');
const userDisplay = document.getElementById('userDisplay');

// --- INITIALIZATION ---
function init() {
    if (currentUser) {
        showDashboard(currentUser.role);
    } else {
        switchView('login');
    }
}

// --- AUTHENTICATION ---
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const role = document.getElementById('role').value;

    if (username.trim() === "") {
        alert("Please enter a username");
        return;
    }

    // Mock Login (In real app, verify password here)
    currentUser = { username, role };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard(role);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    navbar.classList.add('hidden');
    switchView('login');
}

// --- NAVIGATION & VIEWS ---
function showDashboard(role) {
    navbar.classList.remove('hidden');
    userDisplay.textContent = `${currentUser.username} (${role})`;

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
    // Hide all views
    Object.values(views).forEach(el => el.classList.add('hidden'));
    // Show target view
    views[viewName].classList.remove('hidden');
    views[viewName].classList.add('active-view');
}

// --- DATA HANDLING ---
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// --- CLUB LOGIC ---
function toggleModal(show) {
    const modal = document.getElementById('eventModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

function handleCreateEvent(e) {
    e.preventDefault();
    const name = document.getElementById('newEventName').value;
    const date = document.getElementById('newEventDate').value;
    const venue = document.getElementById('newEventVenue').value;
    const desc = document.getElementById('newEventDesc').value;

    const newEvent = {
        id: Date.now(), // Unique ID
        name, date, venue, desc,
        createdBy: currentUser.username,
        participants: [] // Stores student usernames
    };

    events.push(newEvent);
    saveEvents();
    toggleModal(false);
    e.target.reset(); // Clear form
    renderClubDashboard();
    alert("Event Created Successfully!");
}

function renderClubDashboard() {
    const grid = document.getElementById('clubEventsGrid');
    grid.innerHTML = '';

    // Filter events created by this club user
    const myEvents = events.filter(e => e.createdBy === currentUser.username);

    if (myEvents.length === 0) {
        grid.innerHTML = '<p>No events created yet.</p>';
        return;
    }

    myEvents.forEach(e => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${e.name}</h3>
            <div class="event-meta">
                <i class="fa-regular fa-calendar"></i> ${e.date} <br>
                <i class="fa-solid fa-location-dot"></i> ${e.venue}
            </div>
            <p>${e.desc}</p>
            <p><strong>Registered:</strong> ${e.participants.length}</p>
            <button class="btn-danger" onclick="deleteEvent(${e.id})">Delete</button>
        `;
        grid.appendChild(card);
    });
}

function deleteEvent(id) {
    if(confirm("Are you sure you want to delete this event?")) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        // Refresh the current view
        if(currentUser.role === 'club') renderClubDashboard();
        if(currentUser.role === 'admin') renderAdminDashboard();
    }
}

// --- STUDENT LOGIC ---
function renderStudentDashboard() {
    const grid = document.getElementById('studentEventsGrid');
    grid.innerHTML = '';

    if (events.length === 0) {
        grid.innerHTML = '<p>No upcoming events found.</p>';
        return;
    }

    events.forEach(e => {
        const isRegistered = e.participants.includes(currentUser.username);
        const btnText = isRegistered ? "Registered" : "Register Now";
        const btnClass = isRegistered ? "btn-secondary" : "btn-primary";
        const disabledAttr = isRegistered ? "disabled" : "";

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${e.name}</h3>
            <div class="event-meta">
                <i class="fa-regular fa-calendar"></i> ${e.date} | 
                <i class="fa-solid fa-location-dot"></i> ${e.venue}
            </div>
            <p>${e.desc}</p>
            <p><small>By: ${e.createdBy}</small></p>
            <button class="${btnClass}" onclick="registerForEvent(${e.id})" ${disabledAttr}>
                ${btnText}
            </button>
        `;
        grid.appendChild(card);
    });
}

function registerForEvent(id) {
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex > -1) {
        if (!events[eventIndex].participants.includes(currentUser.username)) {
            events[eventIndex].participants.push(currentUser.username);
            saveEvents();
            alert("Registration Successful!");
            renderStudentDashboard();
        }
    }
}

// --- ADMIN LOGIC ---
function renderAdminDashboard() {
    const tbody = document.getElementById('adminEventList');
    const totalEvents = document.getElementById('totalEventsCount');
    const totalParticipants = document.getElementById('totalParticipantsCount');

    tbody.innerHTML = '';
    totalEvents.textContent = events.length;
    
    // Calculate total participants across all events
    const totalP = events.reduce((sum, e) => sum + e.participants.length, 0);
    totalParticipants.textContent = totalP;

    events.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${e.name}</strong><br><small>by ${e.createdBy}</small></td>
            <td>${e.date}</td>
            <td>${e.venue}</td>
            <td>${e.participants.length}</td>
            <td><button class="btn-danger" onclick="deleteEvent(${e.id})"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Run Init
init();
