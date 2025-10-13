const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDB } = require('./db/config.js');

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
