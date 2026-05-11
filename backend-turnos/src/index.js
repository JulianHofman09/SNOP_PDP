// Punto de entrada del servidor backend de turnos
// Arranca Express y registra todas las rutas

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const turnosRouter = require('./routes/turnos');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors());           // permite requests desde el frontend
app.use(express.json());   // permite leer JSON en el body

// Ruta de salud — para verificar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'backend-turnos' });
});

// Rutas de turnos — todas empiezan con /api
app.use('/api', turnosRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Arranca el servidor
app.listen(PORT, () => {
  console.log(`✅ Backend de turnos corriendo en http://localhost:${PORT}`);
  console.log(`   Probá: http://localhost:${PORT}/health`);
});
