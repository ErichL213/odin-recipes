import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/hooks/useLocation';
import { getSpots } from '@/lib/spots';
import type { PhotoSpot } from '@/types';
import { Colors } from '@/constants/colors';

function avgRating(spot: PhotoSpot) {
  return spot.ratingCount > 0 ? (spot.rating / spot.ratingCount).toFixed(1) : '—';
}

export default function SpotsScreen() {
  const [spots, setSpots] = useState<PhotoSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const { location } = useLocation();
  const router = useRouter();

  useEffect(() => {
    getSpots().then(setSpots).finally(() => setLoading(false));
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
        {spots.map(spot => (
          <Marker
            key={spot.id}
            coordinate={spot.location}
            title={spot.title}
            description={`★ ${avgRating(spot)} · ${spot.photos.length} photos`}
            pinColor={Colors.spotMarker}
            onCalloutPress={() => router.push(`/spot/${spot.id}`)}
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.title}>Photo Spots</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowList(v => !v)}>
            <Ionicons name={showList ? 'map' : 'list'} size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors.spotMarker }]} onPress={() => router.push('/create-spot')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showList && (
        <View style={styles.panel}>
          {loading
            ? <ActivityIndicator color={Colors.spotMarker} style={{ marginTop: 20 }} />
            : (
              <FlatList
                horizontal
                data={spots}
                keyExtractor={s => s.id}
                contentContainerStyle={{ padding: 12, gap: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.card} onPress={() => router.push(`/spot/${item.id}`)}>
                    {item.photos[0]
                      ? <Image source={{ uri: item.photos[0] }} style={styles.cardImage} />
                      : (
                        <View style={[styles.cardImage, styles.placeholder]}>
                          <Ionicons name="camera" size={28} color={Colors.textMuted} />
                        </View>
                      )}
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardMeta}>★ {avgRating(item)} · {item.photos.length} photos</Text>
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
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
  },
  card: { width: 140, backgroundColor: Colors.surfaceLight, borderRadius: 12, overflow: 'hidden' },
  cardImage: { width: '100%', height: 100 },
  placeholder: { backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: Colors.text, fontSize: 13, fontWeight: '600', padding: 8, paddingBottom: 2 },
  cardMeta: { color: Colors.textMuted, fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
});
