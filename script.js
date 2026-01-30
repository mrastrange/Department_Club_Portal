function login() {
    let role = document.getElementById("role").value;
    localStorage.setItem("role", role);

    if (role === "admin") location.href = "admin.html";
    if (role === "club") location.href = "club.html";
    if (role === "student") location.href = "student.html";
}

// ---------- EVENT STORAGE ----------
function getEvents() {
    return JSON.parse(localStorage.getItem("events")) || [];
}

function saveEvents(events) {
    localStorage.setItem("events", JSON.stringify(events));
}

// ---------- CLUB ----------
function createEvent() {
    let name = document.getElementById("eventName").value;
    let date = document.getElementById("eventDate").value;
    let venue = document.getElementById("eventVenue").value;

    if (!name || !date || !venue) {
        alert("Fill all fields");
        return;
    }

    let events = getEvents();
    events.push({ name, date, venue, participants: 0 });
    saveEvents(events);

    alert("Event Created");
    loadClubEvents();
}

function loadClubEvents() {
    let list = document.getElementById("clubEvents");
    if (!list) return;

    list.innerHTML = "";
    getEvents().forEach(e => {
        list.innerHTML += `<li>${e.name} | ${e.date} | ${e.venue}</li>`;
    });
}

// ---------- STUDENT ----------
function loadStudentEvents() {
    let list = document.getElementById("studentEvents");
    list.innerHTML = "";

    getEvents().forEach((e, index) => {
        list.innerHTML += `
        <li>
            <b>${e.name}</b><br>
            ${e.date} | ${e.venue}<br>
            <button onclick="register(${index})">Register</button>
        </li>`;
    });
}

function register(index) {
    let events = getEvents();
    events[index].participants++;
    saveEvents(events);
    alert("Registered Successfully");
}

// ---------- ADMIN ----------
function loadAdminEvents() {
    let list = document.getElementById("adminEvents");
    list.innerHTML = "";

    getEvents().forEach(e => {
        list.innerHTML += `
        <li>
            <b>${e.name}</b><br>
            ${e.date} | ${e.venue}<br>
            Participants: ${e.participants}
        </li>`;
    });
}
