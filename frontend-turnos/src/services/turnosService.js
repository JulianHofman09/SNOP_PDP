// Funciones para pedir datos de turnos al backend
// Usamos async/await como en clase

import api from './api'

// Trae los turnos de una semana agrupados por día
// socioId: ID del socio
// semana: formato '2024-W15'
export async function getTurnosSemana(socioId, semana) {
  const response = await api.get(`/socios/${socioId}/turnos/semana`, {
    params: { semana }
  })
  return response.data
}

// Trae todos los turnos de un socio
export async function getTurnosSocio(socioId) {
  const response = await api.get(`/socios/${socioId}/turnos`)
  return response.data
}

// Cancela un turno por su ID
export async function cancelarTurno(turnoId) {
  const response = await api.delete(`/turnos/${turnoId}`)
  return response.data
}
