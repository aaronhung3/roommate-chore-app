const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    const { groupId, name, description, rotationOrder } = req.body;

    try {
        const membership = await db.query('SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, req.userId]);

        if (membership.rows.length === 0) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        if (membership.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create chores' })
        }

        const result = await db.query(`INSERT INTO chore_templates (group_id, name, description, rotation_order, rotation_index) VALUES ($1, $2, $3, $4, 0) RETURNING *`, [groupId, name, description, rotationOrder]);

        const template = result.rows[0];

        // Generate the first week assignment immediately
        const assignment = await createAssignment(template);

        res.status(201).json({ template, assignment });

    } catch(error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /chores/:groupId — get all chores and their status for the current week
router.get('/:groupId', auth, async (req, res) => {
    const { groupId } = req.params;

    try {
        // Make sure the user is a member of this group
        const membership = await db.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, req.userId]
        );

        if (membership.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // Get current week's Monday
        const weekStart = getWeekStart();

        // Get all assignments for this group this week with user details
        const result = await db.query(
        `SELECT 
            ca.id,
            ca.week_start,
            ca.due_date,
            ca.completed_at,
            ct.name,
            ct.description,
            u.name AS assigned_to_name,
            u.id AS assigned_to_id
        FROM chore_assignments ca
        JOIN chore_templates ct ON ct.id = ca.template_id
        JOIN users u ON u.id = ca.assigned_to
        WHERE ca.group_id = $1 AND ca.week_start = $2
        ORDER BY ct.name`,
        [groupId, weekStart]
        );

        res.status(200).json({ chores: result.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /chores/:id/complete — check off a chore
router.patch('/:id/complete', auth, async (req, res) => {
    const { id } = req.params;

    try {
        // Get the assignment
        const assignmentResult = await db.query(
        'SELECT * FROM chore_assignments WHERE id = $1',
        [id]
        );

        if (assignmentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Chore not found' });
        }

        const assignment = assignmentResult.rows[0];

        // Make sure the user is in the group
        const membership = await db.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [assignment.group_id, req.userId]
        );

        if (membership.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // Mark it complete
        const result = await db.query(
        `UPDATE chore_assignments 
        SET completed_at = NOW(), completed_by = $1
        WHERE id = $2 RETURNING *`,
        [req.userId, id]
        );

        res.status(200).json({ assignment: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /chores/:id — delete a chore template
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        // Make sure the user is an admin
        const templateResult = await db.query(
        'SELECT * FROM chore_templates WHERE id = $1',
        [id]
        );

        if (templateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Chore not found' });
        }

        const template = templateResult.rows[0];

        const membership = await db.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
        [template.group_id, req.userId]
        );

        if (membership.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete chores' });
        }

        await db.query('DELETE FROM chore_templates WHERE id = $1', [id]);

        res.status(200).json({ message: 'Chore deleted' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Helper functions ---

// Returns this week's Monday as a YYYY-MM-DD string
const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
};

// Creates a chore assignment for the current week from a template
const createAssignment = async (template) => {
    const weekStart = getWeekStart();

    // Due date is Sunday (6 days after Monday)
    const due = new Date(weekStart);
    due.setDate(due.getDate() + 6);
    const dueDate = due.toISOString().split('T')[0];

    // Pick the assigned user based on rotation_index
    const assignedTo = template.rotation_order[template.rotation_index];

    const result = await db.query(
        `INSERT INTO chore_assignments (template_id, group_id, assigned_to, week_start, due_date)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [template.id, template.group_id, assignedTo, weekStart, dueDate]
    );

    return result.rows[0];
};

module.exports = router;