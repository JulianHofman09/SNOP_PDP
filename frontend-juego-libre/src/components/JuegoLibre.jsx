// Pantalla 6: Juego Libre — lista de eventos
// Muestra los próximos espacios disponibles

import { useState } from 'react'
import { EVENTOS_MOCK } from '../mockData'
import DetalleJuegoLibre from './DetalleJuegoLibre'

function JuegoLibre() {
  // Lista de eventos (con datos de prueba)
  const [eventos, setEventos] = useState(EVENTOS_MOCK)

  // ID del evento que se está viendo en detalle (null = mostrar lista)
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null)

  // Formatea "2025-04-18T20:00:00" → "20:00"
  const hora = (fechaISO) =>
    new Date(fechaISO).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })

  // Cuando el usuario hace click en "Anotarme" en la lista
  const handleAnotarme = (eventoId) => {
    // Abre el detalle del evento para confirmar
    setEventoSeleccionado(eventoId)
  }

  // Cuando el usuario confirma la inscripción desde el detalle
  const handleConfirmarInscripcion = (eventoId) => {
    setEventos((prev) =>
      prev.map((e) =>
        e.id === eventoId
          ? { ...e, inscriptos: e.inscriptos + 1, estaInscripto: true }
          : e
      )
    )
    setEventoSeleccionado(null) // vuelve a la lista
  }

  // Si hay un evento seleccionado, mostramos el detalle
  if (eventoSeleccionado !== null) {
    const evento = eventos.find((e) => e.id === eventoSeleccionado)
    return (
      <DetalleJuegoLibre
        evento={evento}
        onConfirmar={handleConfirmarInscripcion}
        onVolver={() => setEventoSeleccionado(null)}
      />
    )
  }

  // ── PANTALLA LISTA ──
  return (
    <div style={estilos.pagina}>

      {/* Header azul */}
      <div style={estilos.header}>
        <h2 style={estilos.titulo}>Juego libre</h2>
        <p style={estilos.subtitulo}>Anotate a los próximos espacios</p>
      </div>

      {/* Contenido */}
      <div style={estilos.contenido}>
        <p style={estilos.seccionTitulo}>PRÓXIMOS ESPACIOS</p>

        {eventos.map((evento) => {
          const lleno = evento.estado === 'completo'
          const porcentaje = (evento.inscriptos / evento.capacidad) * 100
          const colorBarra = lleno ? '#ef4444' : '#1a56db'

          return (
            <div key={evento.id} style={estilos.card}>

              {/* Fila: fecha + badge estado */}
              <div style={estilos.fila}>
                <strong style={estilos.fechaTexto}>{evento.fecha}</strong>
                <span style={{
                  ...estilos.badge,
                  backgroundColor: lleno ? '#fee2e2' : '#dcfce7',
                  color: lleno ? '#dc2626' : '#166534',
                }}>
                  {lleno ? 'Completo' : 'Abierto'}
                </span>
              </div>

              {/* Horario y sede */}
              <p style={estilos.subtexto}>
                🕐 {hora(evento.fecha_inicio)} — {hora(evento.fecha_fin)} hs · {evento.sede}
              </p>

              {/* Mesas y lugares */}
              <p style={estilos.subtexto}>
                {evento.mesas} mesas · {evento.inscriptos}/{evento.capacidad} lugares
              </p>

              {/* Barra de progreso */}
              <div style={estilos.barraFondo}>
                <div style={{
                  ...estilos.barraRelleno,
                  width: `${Math.min(porcentaje, 100)}%`,
                  backgroundColor: colorBarra,
                }} />
              </div>

              {/* Avatares de anotados */}
              <div style={estilos.filaAvatares}>
                {evento.anotados.map((iniciales, i) => (
                  <div key={i} style={estilos.avatar}>
                    <span style={estilos.avatarTexto}>{iniciales}</span>
                  </div>
                ))}
              </div>

              {/* Botón Anotarme o Lleno */}
              {lleno ? (
                <button style={estilos.btnLleno} disabled>Lleno</button>
              ) : (
                <button
                  style={estilos.btnAnotarme}
                  onClick={() => handleAnotarme(evento.id)}
                >
                  Anotarme
                </button>
              )}

            </div>
          )
        })}
      </div>

      {/* Barra de navegación inferior */}
      <NavBar activo="juego-libre" />
    </div>
  )
}

// ── Barra de navegación inferior ──
function NavBar({ activo }) {
  const tabs = [
    { id: 'inicio',       icono: '🏠', label: 'Inicio' },
    { id: 'turnos',       icono: '📅', label: 'Turnos' },
    { id: 'juego-libre',  icono: '🔍', label: 'Juego libre' },
    { id: 'perfil',       icono: '👤', label: 'Perfil' },
  ]
  return (
    <div style={estilos.navbar}>
      {tabs.map((tab) => (
        <div key={tab.id} style={{
          ...estilos.navItem,
          color: tab.id === activo ? '#1a56db' : '#9ca3af',
        }}>
          <span style={{ fontSize: '22px' }}>{tab.icono}</span>
          <span style={{ fontSize: '11px', fontWeight: '600' }}>{tab.label}</span>
        </div>
      ))}
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
    padding: '20px 20px 24px',
  },
  titulo: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
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
  },
  seccionTitulo: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
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
  fechaTexto: {
    fontSize: '15px',
    color: '#111827',
  },
  badge: {
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  subtexto: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  barraFondo: {
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '4px',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  filaAvatares: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1e40af',
  },
  btnAnotarme: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '4px',
  },
  btnLleno: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'not-allowed',
    width: '100%',
    marginTop: '4px',
  },
  navbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
  },
}

export { NavBar }
export default JuegoLibre
