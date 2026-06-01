require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = 3001;

app.use(cors());

let cacheObras    = null;
let cacheObra1000 = null;

app.get('/api/obras', async (req, res) => {
  try {
    if (!cacheObras) {
      console.log('Buscando dados de Obras...');
      const response = await axios.get(process.env.SHEETS_CSV_URL);
      cacheObras = response.data;
      console.log('Obras carregadas e cacheadas.');
    }
    res.send(cacheObras);
  } catch (err) {
    console.error('Erro ao buscar Obras:', err.message);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

app.get('/api/obra1000', async (req, res) => {
  try {
    if (!cacheObra1000) {
      console.log('Buscando dados de Obra 1000...');
      const response = await axios.get(process.env.OBRA1000_CSV_URL);
      cacheObra1000 = response.data;
      console.log('Obra 1000 carregada e cacheada.');
    }
    res.send(cacheObra1000);
  } catch (err) {
    console.error('Erro ao buscar Obra 1000:', err.message);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

let cachePatrimonio = null;

app.get('/api/patrimonio', async (req, res) => {
  try {
    if (!cachePatrimonio) {
      console.log('Buscando dados de Patrimônio...');
      const response = await axios.get(process.env.PATRIMONIO_CSV_URL);
      cachePatrimonio = response.data;
      console.log('Patrimônio carregado e cacheado.');
    }
    res.send(cachePatrimonio);
  } catch (err) {
    console.error('Erro ao buscar Patrimônio:', err.message);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
