// Funciones para hablar con el backend de Juego Libre

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3002/api';

// Crea el cliente con el token automáticamente
const getClient = async () => {
  const token = await AsyncStorage.getItem('jwt_token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

// Trae todos los eventos de juego libre disponibles
export const getEventos = async (clubId) => {
  const client = await getClient();
  const response = await client.get('/juego-libre', { params: { clubId } });
  return response.data;
};

// Trae el detalle de un evento específico
export const getDetalleEvento = async (eventoId) => {
  const client = await getClient();
  const response = await client.get(`/juego-libre/${eventoId}`);
  return response.data;
};

// Inscribe al socio en un evento
export const inscribirse = async (eventoId) => {
  const client = await getClient();
  const response = await client.post(`/juego-libre/${eventoId}/inscribir`);
  return response.data;
};

// Cancela la inscripción del socio en un evento
export const cancelarInscripcion = async (eventoId) => {
  const client = await getClient();
  const response = await client.delete(`/juego-libre/${eventoId}/inscripcion`);
  return response.data;
};
