const db = require("../database");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        credits INTEGER DEFAULT 20,
        role TEXT DEFAULT 'user'
    )`);
});

const createUser = (username, password, callback) => {
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], callback);
};

const getUserByUsername = (username, callback) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], callback);
};

module.exports = { createUser, getUserByUsername };
