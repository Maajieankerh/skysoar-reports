require('dotenv').config();
     const express = require('express');
     const { sql } = require('@vercel/postgres');
     const cors = require('cors');

     const app = express();
     app.use(cors());
     app.use(express.json());

     app.post('/forget-password', async (req, res) => {
         const { email } = req.body;
         if (!email) {
             return res.status(400).json({ message: 'Email is required' });
         }
         try {
             const { rows: users } = await sql`SELECT * FROM users WHERE email = ${email}`;
             if (users.length > 0) {
                 // Placeholder: Generate token and send email (requires Nodemailer setup)
                 const token = Math.random().toString(36).substr(2);
                 // Example: res.json({ message: `Reset token: ${token} sent to ${email}` });
                 res.json({ message: 'Password reset link sent (if email exists).' });
             } else {
                 res.status(404).json({ message: 'Email not found' });
             }
         } catch (error) {
             console.error('Forget password error:', error);
             res.status(500).json({ message: 'Error processing reset request' });
         }
     });

     module.exports = app;