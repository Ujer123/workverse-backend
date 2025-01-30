const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const setupSocket = require('./utils/socketHandler');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

app.use(cors({ origin: "https://workverse-backend.onrender.com", credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
  .catch((err) => console.log(err));
