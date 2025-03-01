const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, getUserByUsername } = require("../models/userModel");

const register = (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Error hashing password" });

        createUser(username, hashedPassword, (error) => {
            if (error) return res.status(400).json({ error: "Username already exists" });

            res.json({ message: "User registered successfully!" });
        });
    });
};

const login = (req, res) => {
    const { username, password } = req.body;

    getUserByUsername(username, (err, user) => {
        if (!user) return res.status(401).json({ error: "Invalid username or password" });

        bcrypt.compare(password, user.password, (error, match) => {
            if (!match) return res.status(401).json({ error: "Invalid username or password" });

            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ token, credits: user.credits });
        });
    });
};

module.exports = { register, login };
