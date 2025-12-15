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

async function initDB() {
    for (let i = 0; i < 5; i++) {
        try {
            await pool.query('CREATE TABLE IF NOT EXISTS votes (id SERIAL PRIMARY KEY, option VARCHAR(50))');
            console.log('DB ok');
            return;
        } catch (e) {
            console.log('Attente DB...');
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    process.exit(1);
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.post('/api/vote', async (req, res) => {
    try {
        await pool.query('INSERT INTO votes (option) VALUES ($1)', [req.body.option]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/results', async (req, res) => {
    try {
        const r = await pool.query('SELECT option, COUNT(*)::int as votes FROM votes GROUP BY option');
        res.json({ results: r.rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

initDB().then(() => {
    app.listen(5000, () => console.log('Backend port 5000'));
});
