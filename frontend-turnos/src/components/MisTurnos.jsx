// Pantalla principal: Mis Turnos
// Muestra el selector semanal y los turnos del día seleccionado

import { useState, useEffect } from 'react'
import TurnoCard from './TurnoCard'
import SelectorSemanal from './SelectorSemanal'
import { TURNOS_MOCK } from '../mockData'

// ─── SWITCH: cuando el backend esté listo, cambiá esto a false ───
const USAR_DATOS_PRUEBA = true
// ────────────────────────────────────────────────────────────────

function MisTurnos() {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date())
  const [semanaBase, setSemanaBase] = useState(new Date())

  // Se ejecuta cada vez que cambia el día seleccionado
  useEffect(() => {
    cargarTurnos()
  }, [diaSeleccionado])

  const cargarTurnos = async () => {
    setLoading(true)
    setError(null)

    try {
      let todosTurnos = []

      if (USAR_DATOS_PRUEBA) {
        // Usamos los datos de prueba del archivo mockData.js
        todosTurnos = TURNOS_MOCK
      } else {
        // Cuando el backend esté listo, se usa esto:
        // const response = await api.get('/socios/1/turnos')
        // todosTurnos = response.data
      }

      // Filtramos solo los turnos del día seleccionado
      const turnosDelDia = todosTurnos.filter((t) => {
        const fechaTurno = new Date(t.fecha_inicio).toDateString()
        const fechaSeleccionada = new Date(diaSeleccionado).toDateString()
        return fechaTurno === fechaSeleccionada
      })

      setTurnos(turnosDelDia)
    } catch (err) {
      console.error('Error:', err)
      setError('No se pudieron cargar los turnos.')
    }

    setLoading(false)
  }

  // Cancela un turno — actualiza el estado localmente
  const handleCancelar = (turnoId) => {
    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId ? { ...t, estado: 'cancelado' } : t
      )
    )
  }

  // Navega a la semana anterior
  const irSemanaAnterior = () => {
    const nueva = new Date(semanaBase)
    nueva.setDate(nueva.getDate() - 7)
    setSemanaBase(nueva)
    setDiaSeleccionado(nueva)
  }

  // Navega a la semana siguiente
  const irSemanaSiguiente = () => {
    const nueva = new Date(semanaBase)
    nueva.setDate(nueva.getDate() + 7)
    setSemanaBase(nueva)
    setDiaSeleccionado(nueva)
  }

  // Formatea la fecha del día seleccionado: "lunes 14 de abril"
  const formatearDia = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <div style={estilos.pagina}>

      {/* ══ HEADER AZUL ══ */}
      <div style={estilos.header}>
        <h2 style={estilos.titulo}>Mis turnos</h2>
        <p style={estilos.subtitulo}>Horario fijo semanal</p>

        {/* Flechas de semana + selector de días */}
        <div style={estilos.filaSelector}>
          <button style={estilos.flecha} onClick={irSemanaAnterior}>‹</button>
          <SelectorSemanal
            semanaBase={semanaBase}
            diaSeleccionado={diaSeleccionado}
            onSelectDia={setDiaSeleccionado}
          />
          <button style={estilos.flecha} onClick={irSemanaSiguiente}>›</button>
        </div>
      </div>

      {/* ══ CONTENIDO ══ */}
      <div style={estilos.contenido}>

        {/* Estado: cargando */}
        {loading && (
          <p style={estilos.msgCargando}>Cargando turnos...</p>
        )}

        {/* Estado: error */}
        {!loading && error && (
          <div style={estilos.boxError}>
            <p>{error}</p>
          </div>
        )}

        {/* Estado: sin turnos ese día → pantalla "Vacío" */}
        {!loading && !error && turnos.length === 0 && (
          <div style={estilos.card}>
            <div style={estilos.filaSpaceBetween}>
              <strong style={estilos.fechaCard}>
                {formatearDia(diaSeleccionado)}
              </strong>
              <span style={estilos.badgeVacio}>Vacío</span>
            </div>
            <p style={estilos.notaAzul}>
              Los turnos son fijos. Para cambiar de día hablá con tu entrenador.
            </p>
          </div>
        )}

        {/* Estado: hay turnos → lista de cards */}
        {!loading && !error && turnos.length > 0 && (
          <>
            {turnos.map((turno) => (
              <TurnoCard
                key={turno.id}
                turno={turno}
                onCancelar={handleCancelar}
              />
            ))}
            <p style={estilos.notaAzul}>
              Los turnos son fijos. Para cambiar de día hablá con tu entrenador.
            </p>
          </>
        )}

      </div>
    </div>
  )
}

// ══ ESTILOS ══
const estilos = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f0f4ff',
    fontFamily: 'Arial, sans-serif',
  },

  // Header azul
  header: {
    backgroundColor: '#1a56db',
    padding: '20px 20px 14px',
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
    margin: '4px 0 12px',
  },
  filaSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  flecha: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },

  // Área de contenido
  contenido: {
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto',
  },

  // Card blanca (usada para vacío y para turnos)
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  filaSpaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fechaCard: {
    fontSize: '15px',
    textTransform: 'capitalize',
    color: '#111827',
  },

  // Badge "Vacío" (rojo claro)
  badgeVacio: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },

  // Nota azul al pie
  notaAzul: {
    color: '#3b82f6',
    fontSize: '13px',
    marginTop: '4px',
  },

  // Mensajes de estado
  msgCargando: {
    color: '#6b7280',
    textAlign: 'center',
    padding: '30px 0',
  },
  boxError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
  },
}

export default MisTurnos
