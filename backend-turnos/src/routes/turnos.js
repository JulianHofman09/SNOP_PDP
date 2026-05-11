// Rutas de la API para turnos
// Cada ruta hace una sola cosa y tiene comentarios explicando qué hace

const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

// Todas las rutas de este archivo requieren estar autenticado
router.use(authMiddleware);

// ─────────────────────────────────────────────
// GET /socios/:socioId/turnos
// Devuelve todos los turnos de un socio
// Query params opcionales: desde, hasta, estado
// ─────────────────────────────────────────────
router.get('/socios/:socioId/turnos', async (req, res) => {
  const { socioId } = req.params;
  const { desde, hasta, estado } = req.query;

  // Seguridad: el socio solo puede ver sus propios turnos
  if (req.user.userId !== socioId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tenés permiso para ver estos turnos' });
  }

  try {
    // Construimos la consulta a Supabase
    // Hacemos JOIN con otras tablas para traer nombres de entrenador, sede, etc.
    let query = supabase
      .from('socio_turno')
      .select(`
        id,
        estado,
        fecha_inscripcion,
        turnos (
          id,
          fecha_inicio,
          fecha_fin,
          duracion_min,
          estado,
          tipo_turno:tipo_turno_id ( nombre ),
          sede:sede_id ( nombre ),
          mesa:mesa_id ( numero ),
          entrenador:user_id ( nombre ),
          nivel_minimo:nivel_minimo_id ( nombre )
        )
      `)
      .eq('user_id', socioId);

    // Filtros opcionales
    if (estado) {
      query = query.eq('turnos.estado', estado);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Aplanamos la respuesta para que sea más fácil de usar en el frontend
    const turnos = data.map((item) => ({
      id: item.turnos.id,
      fecha_inicio: item.turnos.fecha_inicio,
      fecha_fin: item.turnos.fecha_fin,
      duracion_min: item.turnos.duracion_min,
      estado: item.turnos.estado,
      tipo_nombre: item.turnos.tipo_turno?.nombre,
      sede_nombre: item.turnos.sede?.nombre,
      mesa_numero: item.turnos.mesa?.numero,
      entrenador_nombre: item.turnos.entrenador?.nombre,
      nivel_nombre: item.turnos.nivel_minimo?.nombre,
    }));

    res.json(turnos);
  } catch (err) {
    console.error('Error al obtener turnos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────
// GET /socios/:socioId/turnos/semana
// Devuelve los turnos de una semana agrupados por día
// Query param: semana (formato: 2024-W15)
// ─────────────────────────────────────────────
router.get('/socios/:socioId/turnos/semana', async (req, res) => {
  const { socioId } = req.params;
  const { semana } = req.query;

  if (!semana) {
    return res.status(400).json({ error: 'Falta el parámetro semana (ej: 2024-W15)' });
  }

  if (req.user.userId !== socioId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tenés permiso' });
  }

  try {
    // Calculamos el rango de fechas de la semana ISO
    const { inicioSemana, finSemana } = parsearSemanaISO(semana);

    const { data, error } = await supabase
      .from('socio_turno')
      .select(`
        turnos (
          id,
          fecha_inicio,
          fecha_fin,
          duracion_min,
          estado,
          tipo_turno:tipo_turno_id ( nombre ),
          sede:sede_id ( nombre ),
          mesa:mesa_id ( numero ),
          entrenador:user_id ( nombre ),
          nivel_minimo:nivel_minimo_id ( nombre )
        )
      `)
      .eq('user_id', socioId)
      .gte('turnos.fecha_inicio', inicioSemana)
      .lte('turnos.fecha_inicio', finSemana);

    if (error) throw error;

    // Agrupamos por día: { "2024-04-14": [...turnos], "2024-04-15": [] }
    const agrupados = agruparPorDia(data, inicioSemana, finSemana);

    res.json(agrupados);
  } catch (err) {
    console.error('Error al obtener turnos por semana:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────
// DELETE /turnos/:turnoId
// Cancela un turno (cambia estado a 'cancelado', no lo borra)
// ─────────────────────────────────────────────
router.delete('/turnos/:turnoId', async (req, res) => {
  const { turnoId } = req.params;

  try {
    // 1. Buscamos el turno para verificar que existe y pertenece al socio
    const { data: turno, error: errorBuscar } = await supabase
      .from('turnos')
      .select('id, fecha_inicio, estado, user_id')
      .eq('id', turnoId)
      .single();

    if (errorBuscar || !turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // 2. Verificamos que el turno pertenece al usuario autenticado
    if (turno.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No podés cancelar este turno' });
    }

    // 3. Verificamos que el turno sea futuro
    if (new Date(turno.fecha_inicio) <= new Date()) {
      return res.status(400).json({ error: 'No podés cancelar un turno que ya pasó' });
    }

    // 4. Verificamos la política de cancelación (mínimo 2 horas antes)
    const horasHastaElTurno =
      (new Date(turno.fecha_inicio) - new Date()) / (1000 * 60 * 60);

    if (horasHastaElTurno < 2) {
      return res.status(400).json({
        error: 'Solo podés cancelar con al menos 2 horas de anticipación',
      });
    }

    // 5. Cambiamos el estado a 'cancelado' (no borramos el registro)
    const { error: errorActualizar } = await supabase
      .from('turnos')
      .update({ estado: false }) // false = cancelado según el DER
      .eq('id', turnoId);

    if (errorActualizar) throw errorActualizar;

    res.json({ mensaje: 'Turno cancelado correctamente' });
  } catch (err) {
    console.error('Error al cancelar turno:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────
// Funciones auxiliares
// ─────────────────────────────────────────────

// Convierte "2024-W15" en fechas de inicio y fin de esa semana
function parsearSemanaISO(semanaISO) {
  const [year, week] = semanaISO.split('-W').map(Number);
  // El lunes de la semana ISO
  const inicio = new Date(year, 0, 1 + (week - 1) * 7);
  const dia = inicio.getDay();
  const diff = dia <= 4 ? 1 - dia : 8 - dia;
  inicio.setDate(inicio.getDate() + diff);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  return {
    inicioSemana: inicio.toISOString(),
    finSemana: fin.toISOString(),
  };
}

// Agrupa los turnos por fecha (YYYY-MM-DD)
// Incluye días sin turnos con array vacío
function agruparPorDia(data, inicioSemana, finSemana) {
  const resultado = {};

  // Creamos las 7 claves del lunes al domingo
  const inicio = new Date(inicioSemana);
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + i);
    const clave = fecha.toISOString().split('T')[0];
    resultado[clave] = [];
  }

  // Llenamos con los turnos
  data.forEach((item) => {
    if (!item.turnos) return;
    const clave = item.turnos.fecha_inicio.split('T')[0];
    if (resultado[clave] !== undefined) {
      resultado[clave].push({
        id: item.turnos.id,
        fecha_inicio: item.turnos.fecha_inicio,
        fecha_fin: item.turnos.fecha_fin,
        duracion_min: item.turnos.duracion_min,
        estado: item.turnos.estado ? 'confirmado' : 'cancelado',
        tipo_nombre: item.turnos.tipo_turno?.nombre,
        sede_nombre: item.turnos.sede?.nombre,
        mesa_numero: item.turnos.mesa?.numero,
        entrenador_nombre: item.turnos.entrenador?.nombre,
        nivel_nombre: item.turnos.nivel_minimo?.nombre,
      });
    }
  });

  return resultado;
}

module.exports = router;
