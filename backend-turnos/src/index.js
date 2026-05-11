const express = require('express')
const cors = require('cors')
require('dotenv').config()

const turnosRouter = require('./routes/turnos')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Ruta de salud — para verificar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'backend-turnos' })
})

app.use('/api', turnosRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`✅ Backend de turnos corriendo en http://localhost:${PORT}`)
  console.log(`   Probá: http://localhost:${PORT}/health`)
})
