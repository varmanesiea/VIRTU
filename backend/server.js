const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'votedb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});


async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                option VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Base de donnees initialisee avec succes');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de donnees:', error);
    } finally {
        client.release();
    }
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Backend API',
        version: '1.0.0'
    });
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Voting API' });
});

// Enregistrer un vote
app.post('/api/vote', async (req, res) => {
    const { option } = req.body;
    
    if (!option) {
        return res.status(400).json({ error: 'Option manquante' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO votes (option) VALUES ($1) RETURNING *',
            [option]
        );
        console.log(`Vote enregistre: ${option}`);
        res.status(201).json({ 
            success: true, 
            vote: result.rows[0] 
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du vote:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir les résultats
app.get('/api/results', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT option, COUNT(*) as votes 
            FROM votes 
            GROUP BY option 
            ORDER BY votes DESC
        `);
        
        res.json({ 
            success: true, 
            results: result.rows.map(row => ({
                option: row.option,
                votes: parseInt(row.votes)
            })),
            total: result.rows.reduce((sum, row) => sum + parseInt(row.votes), 0)
        });
    } catch (error) {
        console.error('Erreur lors de la recuperation des resultats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Réinitialiser les votes (pour les tests)
app.delete('/api/votes', async (req, res) => {
    try {
        await pool.query('DELETE FROM votes');
        console.log('Tous les votes ont ete supprimes');
        res.json({ success: true, message: 'Votes reinitialises' });
    } catch (error) {
        console.error('Erreur lors de la reinitialisation:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs
app.use((error, req, res, next) => {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
async function startServer() {
    try {
        // Test de connexion à la base de données
        await pool.query('SELECT NOW()');
        console.log('Connexion a la base de donnees reussie');
        
        // Initialisation de la base
        await initDatabase();
        
        // Demarrage du serveur
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Serveur backend demarre sur le port ${PORT}`);
            console.log(`API disponible sur http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Erreur au demarrage:', error);
        process.exit(1);
    }
}

// Gestion de l'arrêt propre
process.on('SIGTERM', async () => {
    console.log('SIGTERM reçu, arrêt du serveur...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT reçu, arrêt du serveur...');
    await pool.end();
    process.exit(0);
});

// Démarrage
startServer();
