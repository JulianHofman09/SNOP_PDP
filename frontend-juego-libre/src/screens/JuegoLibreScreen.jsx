// Pantalla 6: Lista de eventos de Juego Libre
// Muestra todos los eventos disponibles con opción de anotarse

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventoCard from '../components/EventoCard';
import { getEventos, inscribirse } from '../services/juegoLibreService';

const CLUB_ID_DEMO = '1';

export default function JuegoLibreScreen({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  // Carga los eventos del servidor
  const cargarEventos = useCallback(async () => {
    try {
      setError(null);
      const data = await getEventos(CLUB_ID_DEMO);
      setEventos(data);
    } catch (err) {
      setError('No se pudieron cargar los eventos.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // Inscribe al socio en un evento
  const handleAnotarme = async (eventoId) => {
    try {
      await inscribirse(eventoId);
      // Actualiza el contador localmente (optimistic update)
      setEventos((prev) =>
        prev.map((e) =>
          e.id === eventoId
            ? { ...e, inscriptos: e.inscriptos + 1, lugares_disponibles: e.lugares_disponibles - 1 }
            : e
        )
      );
      Alert.alert('¡Listo!', 'Te anotaste al evento de juego libre.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo completar la inscripción.');
    }
  };

  // Navega al detalle del evento
  const handleVerDetalle = (eventoId) => {
    navigation.navigate('DetalleJuegoLibre', { eventoId });
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      {/* Header azul */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Juego libre</Text>
        <Text style={styles.subtitulo}>Anotate a los próximos espacios</Text>
      </View>

      {/* Lista de eventos */}
      <FlatList
        data={eventos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => { setRefrescando(true); cargarEventos(); }}
            colors={['#1A56DB']}
          />
        }
        ListHeaderComponent={
          <>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTexto}>{error}</Text>
              </View>
            )}
            <Text style={styles.seccionTitulo}>PRÓXIMOS ESPACIOS</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioTexto}>No hay eventos disponibles por ahora.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EventoCard
            evento={item}
            onAnotarme={handleAnotarme}
            onVerDetalle={handleVerDetalle}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F4F7FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1A56DB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subtitulo: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  lista: { padding: 16, paddingBottom: 80 },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorTexto: { color: '#EF4444', fontSize: 13 },
  vacio: { alignItems: 'center', paddingTop: 40 },
  vacioTexto: { color: '#9CA3AF', fontSize: 14 },
});
