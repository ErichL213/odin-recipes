import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/hooks/useLocation';
import { getRoutes } from '@/lib/routes';
import type { DrivingRoute } from '@/types';
import { Colors } from '@/constants/colors';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<DrivingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const { location } = useLocation();
  const router = useRouter();

  useEffect(() => {
    getRoutes().then(setRoutes).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ ...location, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
        showsUserLocation
      >
        {routes.map(route => (
          <React.Fragment key={route.id}>
            <Polyline
              coordinates={route.waypoints.map(w => w.location)}
              strokeColor={selected === route.id ? Colors.routeMarker : Colors.routeMarker + '66'}
              strokeWidth={selected === route.id ? 5 : 3}
            />
            {route.waypoints[0] && (
              <Marker
                coordinate={route.waypoints[0].location}
                title={route.title}
                description={`${route.distance}km · ${route.duration}min · ♥ ${route.likeCount}`}
                pinColor={Colors.routeMarker}
                onCalloutPress={() => router.push(`/route/${route.id}`)}
              />
            )}
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.title}>Driving Routes</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowList(v => !v)}>
            <Ionicons name={showList ? 'map' : 'list'} size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors.routeMarker }]} onPress={() => router.push('/create-route')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showList && (
        <View style={styles.panel}>
          {loading
            ? <ActivityIndicator color={Colors.routeMarker} style={{ marginTop: 20 }} />
            : (
              <FlatList
                data={routes}
                keyExtractor={r => r.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.card, selected === item.id && styles.cardActive]}
                    onPress={() => { setSelected(item.id); router.push(`/route/${item.id}`); }}
                  >
                    <Ionicons name="navigate" size={24} color={Colors.routeMarker} style={{ marginRight: 12 }} />
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardMeta}>{item.distance}km · ~{item.duration}min · ♥ {item.likeCount}</Text>
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
    maxHeight: '45%',
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
  cardActive: { backgroundColor: Colors.surfaceLight },
  cardBody: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  cardMeta: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
});
