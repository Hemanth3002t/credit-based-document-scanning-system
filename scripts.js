const API_BASE_URL = "http://localhost:5000";

async function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("credits", data.credits);
        window.location.href = "dashboard.html";
    } else {
        alert(data.error);
    }
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message || data.error);
}

async function loadUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    document.getElementById("usernameDisplay").textContent = data.username;
    document.getElementById("userCredits").textContent = data.credits;
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("loginForm")) {
        document.getElementById("loginForm").addEventListener("submit", login);
        document.getElementById("registerForm").addEventListener("submit", register);
    }
    if (document.getElementById("usernameDisplay")) {
        loadUserProfile();
    }
});
