// Muestra el nivel como una etiqueta de color
// Ejemplo de uso: <NivelPill nivel="Azul" />

function NivelPill({ nivel }) {
  // Colores según el nivel
  const colores = {
    Principiante: { fondo: '#d1fae5', texto: '#065f46' },
    Azul:         { fondo: '#dbeafe', texto: '#1e40af' },
    Intermedio:   { fondo: '#fef3c7', texto: '#92400e' },
    Rojo:         { fondo: '#fee2e2', texto: '#991b1b' },
    Avanzado:     { fondo: '#ede9fe', texto: '#5b21b6' },
  }

  const color = colores[nivel] || { fondo: '#e5e7eb', texto: '#374151' }

  const estilo = {
    backgroundColor: color.fondo,
    color: color.texto,
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  }

  return <span style={estilo}>{nivel}</span>
}

export default NivelPill
