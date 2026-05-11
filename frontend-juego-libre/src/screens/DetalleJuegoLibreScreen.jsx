// Pantalla 7: Detalle de un evento de Juego Libre
// Muestra toda la info del evento y permite inscribirse o cancelar

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDetalleEvento, inscribirse, cancelarInscripcion } from '../services/juegoLibreService';

// Avatar con iniciales
function Avatar({ nombre, grande = false }) {
  const iniciales = nombre.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <View style={[styles.avatar, grande && styles.avatarGrande]}>
      <Text style={[styles.avatarTexto, grande && styles.avatarTextoGrande]}>{iniciales}</Text>
    </View>
  );
}

export default function DetalleJuegoLibreScreen({ route, navigation }) {
  const { eventoId } = route.params;

  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Carga el detalle del evento
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getDetalleEvento(eventoId);
        setEvento(data);
      } catch {
        Alert.alert('Error', 'No se pudo cargar el evento.');
        navigation.goBack();
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [eventoId]);

  // Confirma la inscripción
  const handleInscribirse = async () => {
    setProcesando(true);
    try {
      await inscribirse(eventoId);
      setEvento((prev) => ({
        ...prev,
        esta_inscripto: true,
        inscriptos: prev.inscriptos + 1,
        lugares_disponibles: prev.lugares_disponibles - 1,
      }));
      Alert.alert('¡Listo!', 'Tu inscripción fue confirmada.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo inscribir.');
    } finally {
      setProcesando(false);
    }
  };

  // Cancela la inscripción
  const handleCancelar = () => {
    Alert.alert(
      'Cancelar inscripción',
      '¿Estás seguro que querés cancelar tu inscripción?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setProcesando(true);
            try {
              await cancelarInscripcion(eventoId);
              setEvento((prev) => ({
                ...prev,
                esta_inscripto: false,
                inscriptos: prev.inscriptos - 1,
                lugares_disponibles: prev.lugares_disponibles + 1,
              }));
            } catch {
              Alert.alert('Error', 'No se pudo cancelar la inscripción.');
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  if (!evento) return null;

  const fechaLarga = format(new Date(evento.fecha_inicio), "EEEE d 'de' MMMM", { locale: es });
  const horaInicio = format(new Date(evento.fecha_inicio), 'HH:mm');
  const horaFin = format(new Date(evento.fecha_fin), 'HH:mm');
  const estaLleno = evento.lugares_disponibles === 0;
  const porcentaje = Math.min((evento.inscriptos / evento.capacidad_maxima) * 100, 100);

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      {/* Header azul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>‹ Juego libre</Text>
        </TouchableOpacity>
        <Text style={styles.titulo} style={[styles.titulo, { textTransform: 'capitalize' }]}>
          {fechaLarga}
        </Text>
        <Text style={styles.subtitulo}>Juego libre</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        {/* Info del evento */}
        <View style={styles.card}>
          {/* Horario */}
          <View style={styles.fila}>
            <Text style={styles.icono}>🕐</Text>
            <View>
              <Text style={styles.infoTitulo}>{horaInicio} — {horaFin} hs</Text>
              <Text style={styles.infoSub}>{evento.duracion_min} minutos</Text>
            </View>
          </View>

          {/* Sede */}
          <View style={styles.fila}>
            <Text style={styles.icono}>📍</Text>
            <View>
              <Text style={styles.infoTitulo}>{evento.sede_nombre}</Text>
              <Text style={styles.infoSub}>{evento.mesas_disponibles} mesas disponibles</Text>
            </View>
          </View>

          {/* Lugares */}
          <View style={styles.fila}>
            <Text style={styles.icono}>👥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitulo}>
                {evento.inscriptos} / {evento.capacidad_maxima} lugares
              </Text>
              <Text style={styles.infoSub}>Abierto para todos los niveles</Text>
              {/* Barra de progreso */}
              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraRelleno,
                    {
                      width: `${porcentaje}%`,
                      backgroundColor: estaLleno ? '#EF4444' : '#1A56DB',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Lista de anotados */}
        <Text style={styles.seccionTitulo}>
          ANOTADOS ({evento.inscriptos}/{evento.capacidad_maxima})
        </Text>
        <View style={styles.filaAvatares}>
          {(evento.inscriptos_nombres || []).map((nombre, i) => (
            <Avatar key={i} nombre={nombre} />
          ))}
        </View>

        {/* Nota del club */}
        <View style={styles.notaClub}>
          <Text style={styles.notaClubTitulo}>El club provee todo el material</Text>
          <Text style={styles.notaClubSub}>Paletas · Pelotas · Mesas — no traés nada</Text>
        </View>

        {/* Botones de acción */}
        {estaLleno && !evento.esta_inscripto ? (
          <View style={styles.btnDeshabilitado}>
            <Text style={styles.btnDeshabilitadoTexto}>Completo</Text>
          </View>
        ) : evento.esta_inscripto ? (
          <>
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={handleCancelar}
              disabled={procesando}
            >
              <Text style={styles.btnCancelarTexto}>
                {procesando ? 'Procesando...' : 'Cancelar inscripción'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.btnConfirmar}
            onPress={handleInscribirse}
            disabled={procesando}
          >
            <Text style={styles.btnConfirmarTexto}>
              {procesando ? 'Procesando...' : 'Confirmar inscripción'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botón cancelar siempre visible si está inscripto */}
        {evento.esta_inscripto && (
          <TouchableOpacity
            style={styles.btnSecundario}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnSecundarioTexto}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F4F7FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1A56DB',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  btnVolver: { marginBottom: 8 },
  btnVolverTexto: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  titulo: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  subtitulo: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  contenido: { padding: 16, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fila: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icono: { fontSize: 18, marginTop: 2 },
  infoTitulo: { fontSize: 15, fontWeight: '600', color: '#111827' },
  infoSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  barraFondo: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  barraRelleno: { height: 4, borderRadius: 2 },
  seccionTitulo: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  filaAvatares: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 12, fontWeight: '700', color: '#1A56DB' },
  avatarGrande: { width: 44, height: 44, borderRadius: 22 },
  avatarTextoGrande: { fontSize: 14 },
  notaClub: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  notaClubTitulo: { fontSize: 14, fontWeight: '600', color: '#065F46' },
  notaClubSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  btnConfirmar: {
    backgroundColor: '#1A56DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnConfirmarTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  btnCancelar: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnCancelarTexto: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
  btnSecundario: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecundarioTexto: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  btnDeshabilitado: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDeshabilitadoTexto: { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
});
