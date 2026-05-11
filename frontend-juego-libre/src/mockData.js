// Datos de prueba para Juego Libre
// Cuando el backend esté listo, se reemplaza por llamadas a la API

export const EVENTOS_MOCK = [
  {
    id: 1,
    fecha: 'Viernes 18 abr',
    fecha_inicio: '2025-04-18T20:00:00',
    fecha_fin:    '2025-04-18T21:30:00',
    sede: 'Sede Palermo',
    mesas: 4,
    inscriptos: 6,
    capacidad: 12,
    estado: 'abierto',   // 'abierto' o 'completo'
    anotados: ['NM', 'PG', 'LC', 'CR', 'JH', 'AZ'],
  },
  {
    id: 2,
    fecha: 'Sábado 19 abr',
    fecha_inicio: '2025-04-19T10:00:00',
    fecha_fin:    '2025-04-19T12:00:00',
    sede: 'Sede Armenia',
    mesas: 3,
    inscriptos: 9,
    capacidad: 9,
    estado: 'completo',
    anotados: ['NM', 'PG', 'LC', 'CR', 'KT', 'JH', 'GZ', 'PO', 'JP'],
  },
  {
    id: 3,
    fecha: 'Martes 22 abr',
    fecha_inicio: '2025-04-22T19:00:00',
    fecha_fin:    '2025-04-22T20:30:00',
    sede: 'Sede Palermo',
    mesas: 5,
    inscriptos: 3,
    capacidad: 15,
    estado: 'abierto',
    anotados: ['NM', 'PG', 'LC'],
  },
]
