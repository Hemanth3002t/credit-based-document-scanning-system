const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key"; // Change this for production

app.use(express.json());
app.use(cors());

// Connect to SQLite Database
const db = new sqlite3.Database("./database.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log("Connected to SQLite database.");
});

// Create Users Table (if not exists)
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    credits INTEGER DEFAULT 20
)`);

// Register User
app.post("/auth/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
        if (err) return res.status(400).json({ error: "Username already exists." });
        res.json({ message: "Registration successful!" });
    });
});

// Login User
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, username: user.username, role: user.role, credits: user.credits });
    });
});

// Get User Profile
app.get("/user/profile", authenticateToken, (req, res) => {
    db.get("SELECT username, role, credits FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(user);
    });
});

// Middleware to Authenticate JWT Token
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
