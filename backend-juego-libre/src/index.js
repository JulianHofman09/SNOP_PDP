// Punto de entrada del servidor backend de Juego Libre

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const juegoLibreRouter = require('./routes/juegoLibre');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'backend-juego-libre' });
});

// Rutas de juego libre
app.use('/api', juegoLibreRouter);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend de juego libre corriendo en http://localhost:${PORT}`);
  console.log(`   Probá: http://localhost:${PORT}/health`);
});
