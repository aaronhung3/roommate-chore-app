const cron = require('node-cron');
const db = require('../db');

const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
};

const getNextWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff + 7));
    return monday.toISOString().split('T')[0];
};

const resetWeek = async () => {
    console.log('Running weekly chore reset...');

    try {
        const templatesResult = await db.query('SELECT * FROM chore_templates');
        const templates = templatesResult.rows;

        for (const template of templates) {
            const nextIndex = (template.rotation_index + 1)% template.rotation_order.length;

            await db.query('UPDATE chore_templates SET rotation_index = $1 WHERE id = $2',
        [nextIndex, template.id]);

        const weekStart = getNextWeekStart();
        const due = new Date(weekStart);
        due.setDate(due.getDate() + 6);
        const dueDate = due.toISOString().split('T')[0];

        const assignedTo = template.rotation_order[nextIndex];

        await db.query(`INSERT INTO chore_assignments (template_id, group_id, assigned_to, week_start, due_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [template.id, template.group_id, assignedTo, weekStart, dueDate]);

        console.log(`Reset chore "${template.name}" → assigned to user ${assignedTo}`);
        }

        console.log('Weekly reset complete.');

    } catch (error) {
        console.error('Weekly reset failed:', err);
    }
};

const startResetJob = () => {
    cron.schedule('59 23 * * 0', () => {
        resetWeek();
    });

    console.log('Weekly reset job scheduled.')
};

module.exports = { startResetJob, resetWeek }