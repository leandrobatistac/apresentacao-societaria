require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = 3001;

app.use(cors());

let cache = null;

app.get('/api/obras', async (req, res) => {
  try {
    if (!cache) {
      console.log('Buscando dados do Sheets...');
      const response = await axios.get(process.env.SHEETS_CSV_URL);
      cache = response.data;
      console.log('Dados carregados e cacheados.');
    }
    res.send(cache);
  } catch (err) {
    console.error('Erro ao buscar CSV:', err.message);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});