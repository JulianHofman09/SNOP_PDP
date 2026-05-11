// Rutas de la API para Juego Libre

const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ─────────────────────────────────────────────
// GET /juego-libre
// Devuelve todos los eventos activos con lugares disponibles
// Query params: clubId, sedeId, desde
// ─────────────────────────────────────────────
router.get('/juego-libre', async (req, res) => {
  const { clubId, sedeId, desde } = req.query;
  const ahora = new Date().toISOString();

  try {
    // Buscamos turnos de tipo "juego libre" que sean futuros
    let query = supabase
      .from('turnos')
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        duracion_min,
        capacidad_maxima,
        sede:sede_id ( id, nombre, club_id ),
        tipo_turno:tipo_turno_id ( nombre ),
        socio_turno ( id, estado )
      `)
      .eq('estado', true)                    // activo
      .gte('fecha_inicio', ahora)            // fecha futura
      .order('fecha_inicio', { ascending: true });

    // Filtro por sede si se especifica
    if (sedeId) {
      query = query.eq('sede_id', sedeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculamos lugares disponibles para cada evento
    const eventos = data
      .filter((t) => t.tipo_turno?.nombre?.toLowerCase().includes('libre'))
      .map((turno) => {
        const inscriptosActivos = (turno.socio_turno || []).filter(
          (s) => s.estado === true
        ).length;
        const lugaresDisponibles = turno.capacidad_maxima - inscriptosActivos;

        return {
          id: turno.id,
          fecha_inicio: turno.fecha_inicio,
          fecha_fin: turno.fecha_fin,
          duracion_min: turno.duracion_min,
          capacidad_maxima: turno.capacidad_maxima,
          inscriptos: inscriptosActivos,
          lugares_disponibles: lugaresDisponibles,
          sede_nombre: turno.sede?.nombre,
          sede_id: turno.sede?.id,
          // Nombres de inscriptos para los avatares (simplificado)
          inscriptos_nombres: [],
        };
      });

    res.json(eventos);
  } catch (err) {
    console.error('Error al obtener juego libre:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────
// GET /juego-libre/:eventoId
// Devuelve el detalle de un evento con la lista de inscriptos
// ─────────────────────────────────────────────
router.get('/juego-libre/:eventoId', async (req, res) => {
  const { eventoId } = req.params;
  const socioId = req.user.userId;

  try {
    // Traemos el turno con todos los inscriptos y sus nombres
    const { data: turno, error } = await supabase
      .from('turnos')
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        duracion_min,
        capacidad_maxima,
        sede:sede_id ( nombre ),
        socio_turno (
          id,
          estado,
          user_id,
          users:user_id ( nombre )
        )
      `)
      .eq('id', eventoId)
      .single();

    if (error || !turno) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const inscriptosActivos = (turno.socio_turno || []).filter((s) => s.estado === true);
    const lugaresDisponibles = turno.capacidad_maxima - inscriptosActivos.length;

    // Verificamos si el socio ya está inscripto
    const estaInscripto = inscriptosActivos.some((s) => s.user_id === socioId);

    res.json({
      id: turno.id,
      fecha_inicio: turno.fecha_inicio,
      fecha_fin: turno.fecha_fin,
      duracion_min: turno.duracion_min,
      capacidad_maxima: turno.capacidad_maxima,
      inscriptos: inscriptosActivos.length,
      lugares_disponibles: lugaresDisponibles,
      sede_nombre: turno.sede?.nombre,
      esta_inscripto: estaInscripto,
      inscriptos_nombres: inscriptosActivos.map((s) => s.users?.nombre || 'Socio'),
      mesas_disponibles: 4, // simplificado, en producción calcular desde tabla mesas
    });
  } catch (err) {
    console.error('Error al obtener detalle:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────
// POST /juego-libre/:eventoId/inscribir
// Inscribe al socio en el evento
// ─────────────────────────────────────────────
router.post('/juego-libre/:eventoId/inscribir', async (req, res) => {
  const { eventoId } = req.params;
  const socioId = req.user.userId;

  try {
    // 1. Verificamos que el evento existe y tiene lugares
    const { data: turno, error: errorTurno } = await supabase
      .from('turnos')
      .select('id, capacidad_maxima, socio_turno ( id, estado, user_id )')
      .eq('id', eventoId)
      .single();

    if (errorTurno || !turno) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const inscriptosActivos = (turno.socio_turno || []).filter((s) => s.estado === true);

    // 2. Verificamos que no esté ya inscripto
    const yaInscripto = inscriptosActivos.some((s) => s.user_id === socioId);
    if (yaInscripto) {
      return res.status(400).json({ error: 'Ya estás inscripto en este evento' });
    }

    // 3. Verificamos que haya lugares disponibles
    if (inscriptosActivos.length >= turno.capacidad_maxima) {
      return res.status(400).json({ error: 'No hay lugares disponibles' });
    }

    // 4. Creamos la inscripción
    const { error: errorInscripcion } = await supabase
      .from('socio_turno')
      .insert({
        turno_id: eventoId,
        user_id: socioId,
        estado: true, // activa
        fecha_inscripcion: new Date().toISOString(),
      });

    if (errorInscripcion) throw errorInscripcion;

    res.status(201).json({ mensaje: 'Inscripción confirmada' });
  } catch (err) {
    console.error('Error al inscribir:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────
// DELETE /juego-libre/:eventoId/inscripcion
// Cancela la inscripción del socio en el evento
// ─────────────────────────────────────────────
router.delete('/juego-libre/:eventoId/inscripcion', async (req, res) => {
  const { eventoId } = req.params;
  const socioId = req.user.userId;

  try {
    // Buscamos la inscripción activa del socio
    const { data: inscripcion, error: errorBuscar } = await supabase
      .from('socio_turno')
      .select('id')
      .eq('turno_id', eventoId)
      .eq('user_id', socioId)
      .eq('estado', true)
      .single();

    if (errorBuscar || !inscripcion) {
      return res.status(404).json({ error: 'No tenés una inscripción activa en este evento' });
    }

    // Cambiamos estado a false (cancelada) — no borramos el registro
    const { error: errorActualizar } = await supabase
      .from('socio_turno')
      .update({ estado: false })
      .eq('id', inscripcion.id);

    if (errorActualizar) throw errorActualizar;

    res.json({ mensaje: 'Inscripción cancelada correctamente' });
  } catch (err) {
    console.error('Error al cancelar inscripción:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
