const pool = require('./pool');

const query = (text, params) => pool.query(text, params);

const getWeekStart = async () => {
    const result = await query(
        `SELECT date_trunc('week', current_date)::date AS week_start`
    );
    return result.rows[0].week_start;
};

module.exports = { query, getWeekStart };