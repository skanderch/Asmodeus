import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectToDB } from './config/database.js';
import { generateCSRFToken } from './middleware/csrf.js';
import dotenv from 'dotenv';
dotenv.config();
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
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

app.listen(PORT, async () => {
  await connectToDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
