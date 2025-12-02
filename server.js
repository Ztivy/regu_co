require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const tripsRouter = require('./routes/trips');

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI || !DB_NAME) {
  console.error('Por favor configura MONGODB_URI y DB_NAME en .env');
  process.exit(1);
}

async function start() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Conectado a MongoDB');

    const db = client.db(DB_NAME);
    app.use('/api/trips', tripsRouter(db));

    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      console.log('Cerrando conexión a MongoDB...');
      await client.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
  }
}

start();