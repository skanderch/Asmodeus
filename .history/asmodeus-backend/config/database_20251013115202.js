import express from 'express';
import cors from 'cors';
import { connectToDB } from './db/config.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Asmodeus Backend is running 🧠');
});

app.listen(PORT, async () => {
  await connectToDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
