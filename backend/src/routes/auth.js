const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const exist = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exist.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at', [name, email, hashedPassword]);

        const user = result.rows[0];

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Servor error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ user: { id: user.id, name: user.name, email: user.email }, token});

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Servor error' });
    }   
});

router.get('/me', auth, async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, name, email FROM users WHERE id = $1', 
            [req.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const groupResult = await db.query(
            `SELECT g.id, g.name, g.invite_code, gm.role
            FROM groups g
            JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.user_id = $1
            LIMIT 1`,
            [req.userId]
        );

        const group = groupResult.rows.length > 0 ? groupResult.rows[0] : null;

        res.status(200).json({
            user: userResult.rows[0],
            group
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router;