require('dotenv').config();
const express = require('express');
const { sql } = require('@vercel/postgres');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify user authorization
const authenticate = async (req, res, next) => {
    const userId = req.headers.authorization?.split('Bearer ')[1];
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const { rows: users } = await sql`SELECT * FROM users WHERE id = ${userId}`;
        if (users.length === 0) return res.status(401).json({ message: 'Unauthorized' });
        req.user = users[0];
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// API endpoints (same as previous response, abbreviated here for brevity)
// ... (include all endpoints: /login, /students, /teachers, /classes, /subjects, /results, /reports/generate)

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows: users } = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
        if (users.length > 0) {
            res.json({ user: users[0] });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
});

app.get('/classes', authenticate, async (req, res) => {
    try {
        const { rows: classes } = await sql`SELECT * FROM classes`;
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classes' });
    }
});

// Export for Vercel Serverless Functions
module.exports = app;