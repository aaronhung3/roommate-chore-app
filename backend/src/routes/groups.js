const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

router.post('/', auth, async (req, res) => {
    const { name } = req.body;

    try {
        let inviteCode;
        let codeExists = true;

        while (codeExists) {
            inviteCode = generateInviteCode();
            const existing = await db.query('SELECT id FROM groups WHERE invite_code = $1', [inviteCode]);
            codeExists = existing.rows.length > 0;
        };

        const groupResult = await db.query('INSERT INTO groups (name, invite_code, created_by) VALUES ($1, $2, $3) RETURNING *', [name, inviteCode, req.userId]);

        const group = groupResult.rows[0];

        await db.query('INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)', [group.id, req.userId, 'admin']);

        res.status(201).json({ group });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/join', auth, async (req, res) => {
    const { inviteCode } = req.body;

    try {
        // Find group by invite code
        const groupResult = await db.query('SELECT * FROM groups WHERE invite_code = $1', [inviteCode.toUpperCase()]);

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid invite code' });
        };

        const group = groupResult.rows[0];

        // Check if user already in group
        const existing = await db.query('SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',[group.id, req.userId]);

        if (existing.rows.length > 0) {
            return res.status(404).json({ error: 'You are already in this group' });
        }

        await db.query('INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)', [group.id, req.userId, 'member']);

        res.status(200).json({ group });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const membership = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [id, req.userId]);

        if (membership.rows.length === 0) {
            return res.status(403).json({  error: 'You are not a member of this group'} );
        }

        const groupResult = await db.query('SELECT * FROM groups WHERE id = $1', [id]);

        const memberResult = await db.query(`SELECT u.id, u.name, u.email, gm.role, gm.joined_at FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = $1`, [id]);

        res.status(200).json({ group: groupResult.rows[0], members: memberResult.rows });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;