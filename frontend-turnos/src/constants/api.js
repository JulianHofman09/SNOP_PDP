// URL base de tu backend
// Cuando lo tengas en producción, cambiá esta URL
export const API_BASE_URL = 'http://localhost:3001/api';

// Rutas de la API para turnos
// Se usan como funciones porque necesitan el ID del socio o turno
export const ENDPOINTS = {
  TURNOS_SOCIO: (socioId) => `/socios/${socioId}/turnos`,
  TURNOS_SEMANA: (socioId) => `/socios/${socioId}/turnos/semana`,
  CANCELAR_TURNO: (turnoId) => `/turnos/${turnoId}`,
};
