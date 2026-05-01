require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
// Allow requests from your frontend dev server (Vite default port 5173)
app.use(cors({ origin: 'http://localhost:5173' }));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});