const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

// GET /api/socios/:socioId/turnos
// Devuelve todos los turnos de un socio
router.get('/socios/:socioId/turnos', async (req, res) => {
  const { socioId } = req.params

  if (req.user.userId !== socioId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tenés permiso' })
  }

  try {
    const { data, error } = await supabase
      .from('socio_turno')
      .select(`
        turnos (
          id, fecha_inicio, fecha_fin, duracion_min, estado,
          tipo_turno:tipo_turno_id ( nombre ),
          sede:sede_id ( nombre ),
          mesa:mesa_id ( numero ),
          entrenador:user_id ( nombre ),
          nivel_minimo:nivel_minimo_id ( nombre )
        )
      `)
      .eq('user_id', socioId)
      .eq('estado', true)

    if (error) throw error

    const turnos = data
      .filter(item => item.turnos)
      .map(item => ({
        id:                  item.turnos.id,
        fecha_inicio:        item.turnos.fecha_inicio,
        fecha_fin:           item.turnos.fecha_fin,
        duracion_min:        item.turnos.duracion_min,
        estado:              item.turnos.estado ? 'confirmado' : 'cancelado',
        tipo_nombre:         item.turnos.tipo_turno?.nombre,
        sede_nombre:         item.turnos.sede?.nombre,
        mesa_numero:         item.turnos.mesa?.numero,
        entrenador_nombre:   item.turnos.entrenador?.nombre,
        nivel_nombre:        item.turnos.nivel_minimo?.nombre,
      }))

    res.json(turnos)
  } catch (err) {
    console.error('Error al obtener turnos:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/socios/:socioId/turnos/semana?semana=2024-W15
// Devuelve turnos de una semana agrupados por día
router.get('/socios/:socioId/turnos/semana', async (req, res) => {
  const { socioId } = req.params
  const { semana } = req.query

  if (!semana) {
    return res.status(400).json({ error: 'Falta el parámetro semana (ej: 2024-W15)' })
  }

  try {
    const { inicioSemana, finSemana } = parsearSemanaISO(semana)

    const { data, error } = await supabase
      .from('socio_turno')
      .select(`
        turnos (
          id, fecha_inicio, fecha_fin, duracion_min, estado,
          tipo_turno:tipo_turno_id ( nombre ),
          sede:sede_id ( nombre ),
          mesa:mesa_id ( numero ),
          entrenador:user_id ( nombre ),
          nivel_minimo:nivel_minimo_id ( nombre )
        )
      `)
      .eq('user_id', socioId)
      .eq('estado', true)

    if (error) throw error

    const agrupados = agruparPorDia(data, inicioSemana, finSemana)
    res.json(agrupados)
  } catch (err) {
    console.error('Error al obtener turnos por semana:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// DELETE /api/turnos/:turnoId
// Cancela un turno (cambia estado a false, no borra)
router.delete('/turnos/:turnoId', async (req, res) => {
  const { turnoId } = req.params

  try {
    const { data: turno, error: errorBuscar } = await supabase
      .from('turnos')
      .select('id, fecha_inicio, estado, user_id')
      .eq('id', turnoId)
      .single()

    if (errorBuscar || !turno) {
      return res.status(404).json({ error: 'Turno no encontrado' })
    }

    // Verificar que sea futuro
    if (new Date(turno.fecha_inicio) <= new Date()) {
      return res.status(400).json({ error: 'No podés cancelar un turno que ya pasó' })
    }

    // Verificar política de cancelación (mínimo 2 horas antes)
    const horas = (new Date(turno.fecha_inicio) - new Date()) / (1000 * 60 * 60)
    if (horas < 2) {
      return res.status(400).json({ error: 'Necesitás al menos 2 horas de anticipación para cancelar' })
    }

    const { error: errorActualizar } = await supabase
      .from('turnos')
      .update({ estado: false })
      .eq('id', turnoId)

    if (errorActualizar) throw errorActualizar

    res.json({ mensaje: 'Turno cancelado correctamente' })
  } catch (err) {
    console.error('Error al cancelar turno:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ── Funciones auxiliares ──────────────────────────────

function parsearSemanaISO(semanaISO) {
  const [year, week] = semanaISO.split('-W').map(Number)
  const inicio = new Date(year, 0, 1 + (week - 1) * 7)
  const dia = inicio.getDay()
  const diff = dia <= 4 ? 1 - dia : 8 - dia
  inicio.setDate(inicio.getDate() + diff)
  inicio.setHours(0, 0, 0, 0)
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + 6)
  fin.setHours(23, 59, 59, 999)
  return { inicioSemana: inicio.toISOString(), finSemana: fin.toISOString() }
}

function agruparPorDia(data, inicioSemana, finSemana) {
  const resultado = {}
  const inicio = new Date(inicioSemana)
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + i)
    resultado[fecha.toISOString().split('T')[0]] = []
  }
  data.forEach(item => {
    if (!item.turnos) return
    const clave = item.turnos.fecha_inicio.split('T')[0]
    if (resultado[clave] !== undefined) {
      resultado[clave].push({
        id:                item.turnos.id,
        fecha_inicio:      item.turnos.fecha_inicio,
        fecha_fin:         item.turnos.fecha_fin,
        duracion_min:      item.turnos.duracion_min,
        estado:            item.turnos.estado ? 'confirmado' : 'cancelado',
        tipo_nombre:       item.turnos.tipo_turno?.nombre,
        sede_nombre:       item.turnos.sede?.nombre,
        mesa_numero:       item.turnos.mesa?.numero,
        entrenador_nombre: item.turnos.entrenador?.nombre,
        nivel_nombre:      item.turnos.nivel_minimo?.nombre,
      })
    }
  })
  return resultado
}

module.exports = router
