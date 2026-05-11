// Pantalla principal de "Mis Turnos"
// Muestra el selector semanal arriba y la lista de turnos del día seleccionado abajo

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectorSemanal from '../components/SelectorSemanal';
import TurnoCard from '../components/TurnoCard';
import { getTurnosSemana, cancelarTurno } from '../services/turnosService';
import {
  getSemanaISO,
  semanaAnterior,
  semanaSiguiente,
  esMismoDia,
  formatFechaLarga,
} from '../utils/dateHelpers';

// ID del socio — en una app real esto viene del login guardado
const SOCIO_ID_DEMO = '1';

export default function MisTurnosScreen() {
  // Semana que se está viendo (fecha base del lunes)
  const [semanaBase, setSemanaBase] = useState(new Date());
  // Día seleccionado en el selector
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
  // Todos los turnos de la semana (agrupados por día)
  const [turnosPorDia, setTurnosPorDia] = useState({});
  // Estado de carga
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  // Carga los turnos de la semana actual
  const cargarTurnos = useCallback(async () => {
    try {
      setError(null);
      const semana = getSemanaISO(semanaBase);
      const data = await getTurnosSemana(SOCIO_ID_DEMO, semana);
      setTurnosPorDia(data);
    } catch (err) {
      setError('No se pudieron cargar los turnos. Revisá tu conexión.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [semanaBase]);

  // Se ejecuta cada vez que cambia la semana
  useEffect(() => {
    setCargando(true);
    cargarTurnos();
  }, [cargarTurnos]);

  // Cancela un turno y actualiza la lista localmente
  const handleCancelar = async (turnoId) => {
    try {
      await cancelarTurno(turnoId);
      // Actualiza el estado del turno en la lista sin recargar todo
      const nuevos = { ...turnosPorDia };
      for (const dia in nuevos) {
        nuevos[dia] = nuevos[dia].map((t) =>
          t.id === turnoId ? { ...t, estado: 'cancelado' } : t
        );
      }
      setTurnosPorDia(nuevos);
    } catch {
      alert('No se pudo cancelar el turno. Intentá de nuevo.');
    }
  };

  // Turnos del día seleccionado
  const turnosDelDia = Object.entries(turnosPorDia)
    .filter(([fecha]) => esMismoDia(fecha, diaSeleccionado))
    .flatMap(([, turnos]) => turnos);

  // Pantalla de carga
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      {/* Header azul con título y selector de días */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis turnos</Text>
        <Text style={styles.subtitulo}>Horario fijo semanal</Text>

        {/* Flechas para cambiar de semana */}
        <View style={styles.filaNavSemana}>
          <TouchableOpacity onPress={() => setSemanaBase(semanaAnterior(semanaBase))}>
            <Text style={styles.flecha}>‹</Text>
          </TouchableOpacity>
          <SelectorSemanal
            semanaBase={semanaBase}
            diaSeleccionado={diaSeleccionado}
            onSelectDia={setDiaSeleccionado}
          />
          <TouchableOpacity onPress={() => setSemanaBase(semanaSiguiente(semanaBase))}>
            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de turnos */}
      <FlatList
        data={turnosDelDia}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => { setRefrescando(true); cargarTurnos(); }}
            colors={['#1A56DB']}
          />
        }
        // Mensaje cuando no hay turnos
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioTitulo}>
              {formatFechaLarga(diaSeleccionado)}
            </Text>
            <View style={styles.vacioBadge}>
              <Text style={styles.vacioBadgeTexto}>Vacío</Text>
            </View>
            <Text style={styles.vacioMensaje}>
              Los turnos son fijos. Para cambiar de día hablá con tu entrenador.
            </Text>
          </View>
        }
        // Mensaje de error
        ListHeaderComponent={
          error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTexto}>{error}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TurnoCard turno={item} onCancelar={handleCancelar} />
        )}
      />

      {/* Nota al pie */}
      <View style={styles.nota}>
        <Text style={styles.notaTexto}>
          Los turnos son fijos. Para cambiar de día hablá con tu entrenador.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header azul
  header: {
    backgroundColor: '#1A56DB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  filaNavSemana: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flecha: {
    fontSize: 28,
    color: '#FFFFFF',
    paddingHorizontal: 4,
  },
  // Lista
  lista: {
    padding: 16,
    paddingBottom: 80,
  },
  // Estado vacío
  vacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  vacioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
  },
  vacioBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  vacioBadgeTexto: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  vacioMensaje: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 4,
  },
  // Error
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorTexto: {
    color: '#EF4444',
    fontSize: 13,
  },
  // Nota al pie
  nota: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
  },
  notaTexto: {
    fontSize: 12,
    color: '#3B82F6',
    textAlign: 'center',
  },
});
