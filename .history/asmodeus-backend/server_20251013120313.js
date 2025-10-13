const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API Asmodeus fonctionne!',
        timestamp: new Date().toISOString()
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('==================================');
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}/api/health`);
    console.log('==================================');
});