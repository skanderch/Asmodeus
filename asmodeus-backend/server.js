import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectToDB, closeDB } from './config/database.js';
import { generateCSRFToken } from './middleware/csrf.js';
import dotenv from 'dotenv';
dotenv.config();
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import offerRoutes from './routes/offerRoutes.js';

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Asmodeus Backend is running 🧠');
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// Generate CSRF token for all requests
app.use(generateCSRFToken);

app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/offers', offerRoutes);

const server = app.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
});
