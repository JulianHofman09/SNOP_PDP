// Este archivo configura cómo la app habla con el backend
// Axios es como un "mensajero" que envía y recibe datos del servidor

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

// Creamos el cliente con la URL base y un tiempo límite de 10 segundos
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Antes de cada request: agrega el token del usuario guardado en el celular
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor responde con error 401 (no autorizado): borra el token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
