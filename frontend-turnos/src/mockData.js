// Datos de prueba — reemplazan al backend mientras no está listo
// Cuando el backend esté funcionando, se borra este archivo
// y en MisTurnos.jsx se descomenta la llamada a la API real

// Calculamos fechas relativas a HOY para que siempre sean "futuras"
const hoy = new Date()

// Función que crea una fecha con día de la semana específico de esta semana
// diaSemana: 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes
function fechaEstaSemana(diaSemana, hora, minutos) {
  const fecha = new Date(hoy)
  const diaActual = fecha.getDay() === 0 ? 7 : fecha.getDay() // domingo = 7
  const diff = diaSemana - diaActual
  fecha.setDate(fecha.getDate() + diff)
  fecha.setHours(hora, minutos, 0, 0)
  return fecha.toISOString()
}

export const TURNOS_MOCK = [
  {
    id: 1,
    fecha_inicio: fechaEstaSemana(1, 19, 0),   // Lunes 19:00
    fecha_fin:    fechaEstaSemana(1, 20, 30),   // Lunes 20:30
    duracion_min: 90,
    estado: 'confirmado',
    tipo_nombre: 'Entrenamiento',
    nivel_nombre: 'Azul',
    entrenador_nombre: 'Diego García',
    sede_nombre: 'Sede Palermo',
    mesa_numero: 3,
  },
  {
    id: 2,
    fecha_inicio: fechaEstaSemana(4, 20, 30),  // Jueves 20:30
    fecha_fin:    fechaEstaSemana(4, 22, 0),   // Jueves 22:00
    duracion_min: 90,
    estado: 'confirmado',
    tipo_nombre: 'Entrenamiento',
    nivel_nombre: 'Azul',
    entrenador_nombre: 'Catriel',
    sede_nombre: 'Sede Armenia',
    mesa_numero: 2,
  },
]
