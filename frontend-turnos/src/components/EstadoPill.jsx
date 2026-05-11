// Muestra el estado del turno como etiqueta de color
// Ejemplo de uso: <EstadoPill estado="confirmado" />

function EstadoPill({ estado }) {
  const colores = {
    confirmado: { fondo: '#d1fae5', texto: '#065f46' },
    pendiente:  { fondo: '#fef3c7', texto: '#92400e' },
    cancelado:  { fondo: '#fee2e2', texto: '#991b1b' },
    realizada:  { fondo: '#ede9fe', texto: '#5b21b6' },
  }

  const etiquetas = {
    confirmado: 'Confirmado',
    pendiente:  'Pendiente',
    cancelado:  'Cancelado',
    realizada:  'Realizada',
  }

  const color = colores[estado] || { fondo: '#e5e7eb', texto: '#374151' }

  const estilo = {
    backgroundColor: color.fondo,
    color: color.texto,
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  }

  return <span style={estilo}>{etiquetas[estado] || estado}</span>
}

export default EstadoPill
