require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reservationsRouter = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/reservations', reservationsRouter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`EzFlyer server running on port ${PORT}`);
});
