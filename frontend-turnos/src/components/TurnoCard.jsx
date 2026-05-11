// Tarjeta de un turno individual
// Recibe: turno (objeto con los datos) y onCancelar (función)

function TurnoCard({ turno, onCancelar }) {

  // Formatea "2024-04-14T19:00:00" → "19:00"
  const hora = (fechaISO) =>
    new Date(fechaISO).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })

  // Formatea "2024-04-14T19:00:00" → "Lunes 14 de abril"
  const fechaLarga = (fechaISO) =>
    new Date(fechaISO).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

  // Solo mostramos "Cancelar turno" si el turno es futuro y está confirmado
  const esFuturo = new Date(turno.fecha_inicio) > new Date()
  const puedeCancel = esFuturo && turno.estado === 'confirmado'

  // Pide confirmación antes de cancelar
  const handleCancelar = () => {
    const ok = window.confirm('¿Estás seguro que querés cancelar este turno?')
    if (ok) onCancelar(turno.id)
  }

  // Colores del badge de estado
  const colorEstado = {
    confirmado: { fondo: '#dcfce7', texto: '#166534' },
    pendiente:  { fondo: '#fef9c3', texto: '#854d0e' },
    cancelado:  { fondo: '#fee2e2', texto: '#991b1b' },
  }
  const c = colorEstado[turno.estado] || colorEstado.pendiente

  // Colores del badge de nivel
  const colorNivel = {
    Principiante: { fondo: '#d1fae5', texto: '#065f46' },
    Azul:         { fondo: '#dbeafe', texto: '#1e40af' },
    Intermedio:   { fondo: '#fef3c7', texto: '#92400e' },
    Rojo:         { fondo: '#fee2e2', texto: '#991b1b' },
    Avanzado:     { fondo: '#ede9fe', texto: '#5b21b6' },
  }
  const cn = colorNivel[turno.nivel_nombre] || { fondo: '#e5e7eb', texto: '#374151' }

  return (
    <div style={estilos.card}>

      {/* Fila 1: fecha + badge estado */}
      <div style={estilos.fila}>
        <strong style={estilos.fecha}>{fechaLarga(turno.fecha_inicio)}</strong>
        <span style={{ ...estilos.badge, backgroundColor: c.fondo, color: c.texto }}>
          {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
        </span>
      </div>

      {/* Fila 2: horario + badge nivel */}
      <div style={estilos.fila}>
        <span style={estilos.horario}>
          🕐 {hora(turno.fecha_inicio)} — {hora(turno.fecha_fin)} hs
        </span>
        <span style={{ ...estilos.badge, backgroundColor: cn.fondo, color: cn.texto }}>
          {turno.nivel_nombre}
        </span>
      </div>

      {/* Fila 3: tipo y duración */}
      <p style={estilos.subtexto}>
        {turno.tipo_nombre} · {turno.duracion_min} min
      </p>

      {/* Fila 4: profesor, sede, mesa */}
      <p style={estilos.subtexto}>
        🏅 Prof. {turno.entrenador_nombre} · {turno.sede_nombre} · Mesa {turno.mesa_numero}
      </p>

      {/* Botón cancelar (solo si puede) */}
      {puedeCancel && (
        <button style={estilos.btnCancelar} onClick={handleCancelar}>
          Cancelar turno
        </button>
      )}

    </div>
  )
}

const estilos = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fila: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fecha: {
    fontSize: '15px',
    color: '#111827',
    textTransform: 'capitalize',
  },
  horario: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  subtexto: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  badge: {
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  btnCancelar: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: '4px',
  },
}

export default TurnoCard
