// Instancia de Axios — igual al ejemplo de clase
// Todos los pedidos al backend pasan por acá

import axios from 'axios'

// Creamos una instancia con la URL base del backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
})

// Antes de cada pedido, agrega el token del usuario si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
