const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'votedb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

// Init DB
pool.query(`CREATE TABLE IF NOT EXISTS votes (id SERIAL, option VARCHAR(50))`);

app.get('/api/health', (req, res) => res.json({status: 'OK'}));

app.post('/api/vote', async (req, res) => {
    await pool.query('INSERT INTO votes (option) VALUES ($1)', [req.body.option]);
    res.json({success: true});
});

app.get('/api/results', async (req, res) => {
    const result = await pool.query('SELECT option, COUNT(*) as votes FROM votes GROUP BY option');
    res.json({results: result.rows});
});

app.listen(5000, () => console.log('Backend on port 5000'));
