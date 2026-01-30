function login() {
    var role = document.getElementById("role").value;

    if (role === "admin") {
        window.location.href = "admin.html";
    } else if (role === "club") {
        window.location.href = "club.html";
    } else {
        window.location.href = "student.html";
    }
}
