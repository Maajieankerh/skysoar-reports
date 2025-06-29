import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
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

            const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key';
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
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}