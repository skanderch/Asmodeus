import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDB } from './db/config.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectToDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
