import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const result = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
      if (result.rows.length > 0) {
        res.status(200).json({ user: result.rows[0] });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
