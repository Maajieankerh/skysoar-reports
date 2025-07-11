import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    if (req.method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
            const result = await sql`SELECT * FROM users WHERE email = ${email}`;
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

            let redirectPath = '/';
            switch (user.role) {
                case 'admin':
                    redirectPath = '/admin-dashboard.html';
                    break;
                case 'teacher':
                    redirectPath = '/teacher-dashboard.html';
                    break;
                case 'form-teacher':
                    redirectPath = '/form-teacher-dashboard.html';
                    break;
                default:
                    return res.status(403).json({ message: 'Unauthorized role' });
            }

            res.status(200).json({
                user: {
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    class_assigned: user.class_assigned
                },
                token,
                redirectPath
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else if (req.method === 'GET') {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = (await sql`SELECT * FROM users WHERE id = ${decoded.id}`).rows[0];
            if (!user) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

            const endpoint = req.url.replace('/api/', '');
            switch (endpoint) {
                case 'dashboard':
                    res.status(200).json({ message: 'Dashboard data', data: { status: 'active', user: { role: user.role } } });
                    break;
                case 'students':
                    const students = await sql`SELECT * FROM students`;
                    res.status(200).json(students.rows);
                    break;
                case 'teachers':
                    const teachers = await sql`SELECT * FROM teachers`;
                    res.status(200).json(teachers.rows);
                    break;
                case 'results':
                    const results = await sql`SELECT * FROM results`;
                    res.status(200).json(results.rows);
                    break;
                case 'classes':
                    const classes = await sql`SELECT * FROM classes`;
                    res.status(200).json(classes.rows);
                    break;
                case 'subjects':
                    const subjects = await sql`SELECT * FROM subjects`;
                    res.status(200).json(subjects.rows);
                    break;
                case 'reports':
                    const reports = await sql`SELECT * FROM reports`;
                    res.status(200).json(reports.rows);
                    break;
                default:
                    res.status(404).json({ message: 'Endpoint not found' });
            }
        } catch (error) {
            console.error('API error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else if (req.method === 'POST' && req.url === '/api/reports/generate') {
        try {
            // Placeholder: Implement report generation logic
            // Example: Insert or update reports table
            await sql`INSERT INTO reports (student_id, class, term, average, position, status) VALUES (1, 'JSS1', 1, 75.5, 1, 'Generated') ON CONFLICT DO NOTHING`;
            res.status(200).json({ message: 'Reports generated successfully' });
        } catch (error) {
            console.error('Report generation error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}