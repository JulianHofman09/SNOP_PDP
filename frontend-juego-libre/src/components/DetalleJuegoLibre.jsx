// Pantalla 7: Detalle de un evento de Juego Libre
// Muestra toda la info y permite confirmar o cancelar inscripción

import { NavBar } from './JuegoLibre'

function DetalleJuegoLibre({ evento, onConfirmar, onVolver }) {

  // Formatea "2025-04-18T20:00:00" → "20:00"
  const hora = (fechaISO) =>
    new Date(fechaISO).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })

  // Duración en minutos entre dos fechas
  const duracion = () => {
    const diff = new Date(evento.fecha_fin) - new Date(evento.fecha_inicio)
    return Math.round(diff / 60000) // milisegundos → minutos
  }

  // Formatea la fecha del header: "Viernes 18 de abril"
  const fechaHeader = () =>
    new Date(evento.fecha_inicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

  const porcentaje = (evento.inscriptos / evento.capacidad) * 100

  return (
    <div style={estilos.pagina}>

      {/* ── HEADER AZUL ── */}
      <div style={estilos.header}>
        {/* Botón volver */}
        <button style={estilos.btnVolver} onClick={onVolver}>
          ‹ Juego libre
        </button>
        <h2 style={estilos.titulo}>{fechaHeader()}</h2>
        <p style={estilos.subtitulo}>Juego libre</p>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={estilos.contenido}>

        {/* Card de info del evento */}
        <div style={estilos.card}>

          {/* Horario */}
          <div style={estilos.fila}>
            <span style={estilos.icono}>🕐</span>
            <div>
              <p style={estilos.infoTitulo}>
                {hora(evento.fecha_inicio)} — {hora(evento.fecha_fin)} hs
              </p>
              <p style={estilos.infoSub}>{duracion()} minutos</p>
            </div>
          </div>

          {/* Sede */}
          <div style={estilos.fila}>
            <span style={estilos.icono}>📍</span>
            <div>
              <p style={estilos.infoTitulo}>{evento.sede}</p>
              <p style={estilos.infoSub}>{evento.mesas} mesas disponibles</p>
            </div>
          </div>

          {/* Lugares */}
          <div style={estilos.fila}>
            <span style={estilos.icono}>👥</span>
            <div style={{ flex: 1 }}>
              <p style={estilos.infoTitulo}>
                {evento.inscriptos} / {evento.capacidad} lugares
              </p>
              <p style={estilos.infoSub}>Abierto para todos los niveles</p>
              {/* Barra de progreso */}
              <div style={estilos.barraFondo}>
                <div style={{
                  ...estilos.barraRelleno,
                  width: `${Math.min(porcentaje, 100)}%`,
                }} />
              </div>
            </div>
          </div>

        </div>

        {/* Sección anotados */}
        <p style={estilos.seccionTitulo}>
          ANOTADOS ({evento.inscriptos}/{evento.capacidad})
        </p>
        <div style={estilos.filaAvatares}>
          {evento.anotados.map((iniciales, i) => (
            <div key={i} style={estilos.avatar}>
              <span style={estilos.avatarTexto}>{iniciales}</span>
            </div>
          ))}
        </div>

        {/* Nota del club */}
        <div style={estilos.notaClub}>
          <p style={estilos.notaClubTitulo}>El club provee todo el material</p>
          <p style={estilos.notaClubSub}>Paletas · Pelotas · Mesas — no traés nada</p>
        </div>

        {/* Botones */}
        <button
          style={estilos.btnConfirmar}
          onClick={() => onConfirmar(evento.id)}
        >
          Confirmar inscripción
        </button>

        <button style={estilos.btnCancelar} onClick={onVolver}>
          Cancelar
        </button>

      </div>

      {/* Barra de navegación inferior */}
      <NavBar activo="juego-libre" />
    </div>
  )
}

// ── ESTILOS ──
const estilos = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f0f4ff',
    fontFamily: 'Arial, sans-serif',
    paddingBottom: '70px',
  },
  header: {
    backgroundColor: '#1a56db',
    padding: '12px 20px 24px',
  },
  btnVolver: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0 0 8px',
    display: 'block',
  },
  titulo: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
    textTransform: 'capitalize',
  },
  subtitulo: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
    margin: '4px 0 0',
  },
  contenido: {
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fila: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  icono: {
    fontSize: '20px',
    marginTop: '2px',
  },
  infoTitulo: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  infoSub: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '2px 0 0',
  },
  barraFondo: {
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  barraRelleno: {
    height: '4px',
    backgroundColor: '#1a56db',
    borderRadius: '4px',
  },
  seccionTitulo: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '1px',
    margin: 0,
  },
  filaAvatares: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1e40af',
  },
  notaClub: {
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
    padding: '14px',
    borderLeft: '3px solid #22c55e',
  },
  notaClubTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534',
    margin: 0,
  },
  notaClubSub: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0',
  },
  btnConfirmar: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
  },
  btnCancelar: {
    backgroundColor: '#ffffff',
    color: '#1a56db',
    border: '1.5px solid #1a56db',
    borderRadius: '12px',
    padding: '14px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    width: '100%',
  },
}

export default DetalleJuegoLibre
