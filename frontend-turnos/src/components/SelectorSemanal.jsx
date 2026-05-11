// Selector de días de la semana
// Muestra L M X J V S D y resalta el día seleccionado

function SelectorSemanal({ semanaBase, diaSeleccionado, onSelectDia }) {
  // Genera los 7 días de la semana a partir del lunes
  const getDias = () => {
    const dias = []
    const lunes = new Date(semanaBase)
    // Ajusta al lunes de esa semana
    const diaSemana = lunes.getDay()
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana
    lunes.setDate(lunes.getDate() + diff)

    for (let i = 0; i < 7; i++) {
      const dia = new Date(lunes)
      dia.setDate(lunes.getDate() + i)
      dias.push(dia)
    }
    return dias
  }

  const dias = getDias()
  const hoy = new Date()

  // Letras de los días
  const letras = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  // Verifica si dos fechas son el mismo día
  const esMismoDia = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  return (
    <div style={estilos.contenedor}>
      {dias.map((dia, index) => {
        const seleccionado = esMismoDia(dia, new Date(diaSeleccionado))
        const esHoy = esMismoDia(dia, hoy)

        return (
          <button
            key={index}
            onClick={() => onSelectDia(dia)}
            style={{
              ...estilos.btn,
              backgroundColor: seleccionado ? '#ffffff' : 'rgba(255,255,255,0.2)',
              color: seleccionado ? '#1a56db' : '#ffffff',
              border: esHoy && !seleccionado ? '1px solid rgba(255,255,255,0.6)' : 'none',
            }}
          >
            <span style={estilos.letra}>{letras[index]}</span>
            <span style={estilos.numero}>{dia.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}

const estilos = {
  contenedor: {
    display: 'flex',
    gap: '8px',
    padding: '8px 0',
    overflowX: 'auto',
  },
  btn: {
    width: '40px',
    height: '52px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  letra: {
    fontSize: '11px',
    fontWeight: '600',
  },
  numero: {
    fontSize: '15px',
    fontWeight: '700',
  },
}

export default SelectorSemanal
