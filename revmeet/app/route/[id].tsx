import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRoute, likeRoute } from '@/lib/routes';
import type { DrivingRoute } from '@/types';
import { Colors } from '@/constants/colors';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [route, setRoute] = useState<DrivingRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) getRoute(id).then(setRoute).finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!route) return;
    await likeRoute(route.id);
    setRoute(r => r ? { ...r, likeCount: r.likeCount + 1 } : r);
    Alert.alert('Liked!', 'Added to your liked routes.');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.routeMarker} size="large" /></View>;
  if (!route) return <View style={styles.center}><Text style={{ color: Colors.text }}>Route not found.</Text></View>;

  const start = route.waypoints[0]?.location;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Details</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView>
        {start && (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{ latitude: start.latitude, longitude: start.longitude, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
            scrollEnabled={false}
          >
            <Polyline
              coordinates={route.waypoints.map(w => w.location)}
              strokeColor={Colors.routeMarker}
              strokeWidth={5}
            />
            {route.waypoints.map((wp, i) => (
              <Marker
                key={i}
                coordinate={wp.location}
                pinColor={i === 0 ? Colors.success : i === route.waypoints.length - 1 ? Colors.error : Colors.routeMarker}
              />
            ))}
          </MapView>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{route.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{route.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{route.duration} min</Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>♥ {route.likeCount}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>Shared by {route.creatorName}</Text>
          </View>

          {route.description ? <Text style={styles.description}>{route.description}</Text> : null}

          {route.highlights ? (
            <View style={styles.highlightsBox}>
              <Text style={styles.highlightsTitle}>Highlights</Text>
              <Text style={styles.highlightsText}>{route.highlights}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Waypoints ({route.waypoints.length})</Text>
          {route.waypoints.map((wp, i) => (
            <View key={i} style={styles.waypointRow}>
              <View style={[styles.dot, {
                backgroundColor: i === 0 ? Colors.success : i === route.waypoints.length - 1 ? Colors.error : Colors.routeMarker,
              }]} />
              <Text style={styles.waypointText}>
                {i === 0 ? 'Start' : i === route.waypoints.length - 1 ? 'End' : `Stop ${i}`}
                {wp.title ? ` — ${wp.title}` : ''}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={styles.ctaBtn} onPress={handleLike}>
            <Ionicons name="heart" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Like This Route</Text>
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
  map: { height: 260 },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  infoText: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  description: { color: Colors.text, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  highlightsBox: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.routeMarker,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  highlightsTitle: { color: Colors.routeMarker, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  highlightsText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  waypointRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  waypointText: { color: Colors.textMuted, fontSize: 14 },
  ctaBtn: {
    backgroundColor: Colors.routeMarker,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
