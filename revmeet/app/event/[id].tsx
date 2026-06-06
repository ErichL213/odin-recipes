import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEvent, attendEvent } from '@/lib/events';
import type { CarEvent } from '@/types';
import { Colors } from '@/constants/colors';

function toDate(val: any): Date {
  return val?.toDate ? val.toDate() : new Date(val);
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<CarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) getEvent(id).then(setEvent).finally(() => setLoading(false));
  }, [id]);

  const handleAttend = async () => {
    if (!event) return;
    setAttending(true);
    await attendEvent(event.id);
    setEvent(e => e ? { ...e, attendeeCount: e.attendeeCount + 1 } : e);
    setAttending(false);
    Alert.alert("You're in!", "You've been marked as attending.");
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!event) return <View style={styles.center}><Text style={{ color: Colors.text }}>Event not found.</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{ ...event.location, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          scrollEnabled={false}
        >
          <Marker coordinate={event.location} pinColor={Colors.eventMarker} />
        </MapView>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{event.type.replace('-', ' ')}</Text>
            </View>
            <Text style={styles.meta}>{event.attendeeCount} attending</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{toDate(event.date).toLocaleString()}</Text>
          </View>
          {event.address ? (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={Colors.textMuted} />
              <Text style={styles.infoText}>{event.address}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>Posted by {event.creatorName}</Text>
          </View>

          <Text style={styles.description}>{event.description}</Text>

          <TouchableOpacity style={styles.ctaBtn} onPress={handleAttend} disabled={attending}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>{attending ? 'Marking...' : "I'm Going!"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  map: { height: 200 },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  badge: { backgroundColor: Colors.primary + '33', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: Colors.primary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  meta: { color: Colors.textMuted, fontSize: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  description: { color: Colors.text, fontSize: 16, lineHeight: 24, marginVertical: 16 },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
