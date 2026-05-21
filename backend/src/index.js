const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/pool');

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const choreRoutes = require('./routes/chores');
const { startResetJob, resetWeek } = require('./jobs/weeklyReset');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/chores', choreRoutes);

startResetJob();

app.get('/', (req, res) => {
    res.json({ message: 'ChoreApp API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});