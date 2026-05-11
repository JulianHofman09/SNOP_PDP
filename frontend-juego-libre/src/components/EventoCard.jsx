// Tarjeta de un evento de Juego Libre
// Muestra: fecha, horario, sede, lugares disponibles y botón de inscripción

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Avatares con iniciales de los inscriptos
function AvatarInscripto({ nombre }) {
  const iniciales = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarTexto}>{iniciales}</Text>
    </View>
  );
}

export default function EventoCard({ evento, onAnotarme, onVerDetalle }) {
  const estaLleno = evento.lugares_disponibles === 0;
  const porcentajeOcupado = evento.inscriptos / evento.capacidad_maxima;

  // Color de la barra de progreso según ocupación
  const colorBarra = estaLleno ? '#EF4444' : '#1A56DB';

  // Formatea la fecha: "Viernes 18 abr"
  const fechaFormateada = format(new Date(evento.fecha_inicio), "EEEE d MMM", { locale: es });
  const horaInicio = format(new Date(evento.fecha_inicio), 'HH:mm');
  const horaFin = format(new Date(evento.fecha_fin), 'HH:mm');

  return (
    <TouchableOpacity style={styles.card} onPress={() => onVerDetalle(evento.id)}>
      {/* Fila superior: fecha y estado */}
      <View style={styles.filaSuperior}>
        <Text style={styles.fecha} numberOfLines={1} style={[styles.fecha, { textTransform: 'capitalize' }]}>
          {fechaFormateada}
        </Text>
        <View style={[styles.badge, estaLleno ? styles.badgeLleno : styles.badgeAbierto]}>
          <Text style={[styles.badgeTexto, estaLleno ? styles.badgeTextoLleno : styles.badgeTextoAbierto]}>
            {estaLleno ? 'Completo' : 'Abierto'}
          </Text>
        </View>
      </View>

      {/* Horario y sede */}
      <View style={styles.fila}>
        <Text style={styles.icono}>🕐</Text>
        <Text style={styles.detalle}>
          {horaInicio} — {horaFin} hs · {evento.sede_nombre}
        </Text>
      </View>

      {/* Mesas y lugares */}
      <Text style={styles.subdetalle}>
        {evento.mesas_disponibles} mesas · {evento.inscriptos}/{evento.capacidad_maxima} lugares
      </Text>

      {/* Barra de progreso */}
      <View style={styles.barraFondo}>
        <View
          style={[
            styles.barraRelleno,
            {
              width: `${Math.min(porcentajeOcupado * 100, 100)}%`,
              backgroundColor: colorBarra,
            },
          ]}
        />
      </View>

      {/* Avatares de inscriptos */}
      <View style={styles.filaAvatares}>
        {(evento.inscriptos_nombres || []).slice(0, 6).map((nombre, i) => (
          <AvatarInscripto key={i} nombre={nombre} />
        ))}
      </View>

      {/* Botón */}
      {estaLleno ? (
        <View style={styles.btnLleno}>
          <Text style={styles.btnLlenoTexto}>Lleno</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.btnAnotarme}
          onPress={() => onAnotarme(evento.id)}
        >
          <Text style={styles.btnAnotarmeTexto}>Anotarme</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fecha: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeAbierto: { backgroundColor: '#D1FAE5' },
  badgeLleno: { backgroundColor: '#FEE2E2' },
  badgeTexto: { fontSize: 12, fontWeight: '600' },
  badgeTextoAbierto: { color: '#10B981' },
  badgeTextoLleno: { color: '#EF4444' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icono: { fontSize: 14 },
  detalle: { fontSize: 13, color: '#6B7280' },
  subdetalle: { fontSize: 12, color: '#9CA3AF' },
  // Barra de progreso
  barraFondo: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: 4,
    borderRadius: 2,
  },
  // Avatares
  filaAvatares: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 10, fontWeight: '700', color: '#1A56DB' },
  // Botones
  btnAnotarme: {
    backgroundColor: '#1A56DB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnAnotarmeTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  btnLleno: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnLlenoTexto: { color: '#9CA3AF', fontWeight: '600', fontSize: 15 },
});
