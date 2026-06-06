import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/hooks/useLocation';
import { getUpcomingEvents } from '@/lib/events';
import type { CarEvent } from '@/types';
import { Colors } from '@/constants/colors';

const TYPE_EMOJI: Record<string, string> = {
  meetup: '🚗', 'car-show': '🏆', cruise: '🛣️', 'track-day': '🏁', other: '📍',
};

function toDate(val: any): Date {
  return val?.toDate ? val.toDate() : new Date(val);
}

export default function EventsScreen() {
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const { location } = useLocation();
  const router = useRouter();

  useEffect(() => {
    getUpcomingEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ ...location, latitudeDelta: 0.15, longitudeDelta: 0.15 }}
        showsUserLocation
        showsMyLocationButton
      >
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={event.location}
            title={event.title}
            pinColor={Colors.eventMarker}
            onCalloutPress={() => router.push(`/event/${event.id}`)}
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.title}>Car Events</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowList(v => !v)}>
            <Ionicons name={showList ? 'map' : 'list'} size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push('/create-event')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showList && (
        <View style={styles.panel}>
          {loading
            ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
            : (
              <FlatList
                data={events}
                keyExtractor={e => e.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.card} onPress={() => router.push(`/event/${item.id}`)}>
                    <Text style={styles.emoji}>{TYPE_EMOJI[item.type] ?? '📍'}</Text>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardMeta}>
                        {toDate(item.date).toLocaleDateString()} · {item.attendeeCount} going
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              />
            )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    backgroundColor: Colors.surface + 'EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { backgroundColor: Colors.surface + 'EE', padding: 10, borderRadius: 10 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emoji: { fontSize: 28, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  cardMeta: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
});
