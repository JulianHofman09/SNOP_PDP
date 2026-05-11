// Funciones para trabajar con fechas de forma simple
// Usamos la librería date-fns que ya viene instalada

import {
  format,
  getISOWeek,
  getYear,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';

// "2024-04-14T19:00:00" → "Lunes 14 de abril"
export const formatFechaLarga = (dateString) => {
  return format(new Date(dateString), "EEEE d 'de' MMMM", { locale: es });
};

// "2024-04-14T19:00:00" → "19:00"
export const formatHora = (dateString) => {
  return format(new Date(dateString), 'HH:mm');
};

// Devuelve el número de semana del año: "2024-W15"
export const getSemanaISO = (date = new Date()) => {
  const week = getISOWeek(date);
  const year = getYear(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

// Devuelve los 7 días de la semana (lunes a domingo) de una fecha dada
export const getDiasDeSemana = (date = new Date()) => {
  const inicio = startOfWeek(date, { weekStartsOn: 1 }); // empieza el lunes
  const fin = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: inicio, end: fin });
};

// Retrocede una semana
export const semanaAnterior = (date) => subWeeks(date, 1);

// Avanza una semana
export const semanaSiguiente = (date) => addWeeks(date, 1);

// Letra del día: "L", "M", "X"...
export const diaCorto = (date) => format(date, 'EEEEE', { locale: es }).toUpperCase();

// Número del día: "14"
export const numeroDia = (date) => format(date, 'd');

// Verifica si dos fechas son el mismo día
export const esMismoDia = (date1, date2) => {
  return (
    format(new Date(date1), 'yyyy-MM-dd') === format(new Date(date2), 'yyyy-MM-dd')
  );
};
