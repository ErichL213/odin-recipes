import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, FlatList, Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSpot, uploadSpotPhoto, rateSpot } from '@/lib/spots';
import type { PhotoSpot } from '@/types';
import { Colors } from '@/constants/colors';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [spot, setSpot] = useState<PhotoSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) getSpot(id).then(setSpot).finally(() => setLoading(false));
  }, [id]);

  const handleAddPhoto = async () => {
    if (!id) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const url = await uploadSpotPhoto(id, result.assets[0].uri);
        setSpot(s => s ? { ...s, photos: [...s.photos, url] } : s);
      } catch (e: any) {
        Alert.alert('Upload failed', e.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRate = async (rating: number) => {
    if (!id || !spot) return;
    await rateSpot(id, rating);
    setSpot(s => s ? { ...s, rating: s.rating + rating, ratingCount: s.ratingCount + 1 } : s);
    Alert.alert('Thanks!', 'Your rating was submitted.');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.spotMarker} size="large" /></View>;
  if (!spot) return <View style={styles.center}><Text style={{ color: Colors.text }}>Spot not found.</Text></View>;

  const avg = spot.ratingCount > 0 ? (spot.rating / spot.ratingCount).toFixed(1) : '—';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Spot</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView>
        {spot.photos.length > 0
          ? (
            <FlatList
              horizontal
              data={spot.photos}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photo} />}
              showsHorizontalScrollIndicator={false}
              style={styles.photoList}
            />
          )
          : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={48} color={Colors.textMuted} />
              <Text style={{ color: Colors.textMuted, marginTop: 8 }}>No photos yet — be the first!</Text>
            </View>
          )}

        <View style={styles.body}>
          <Text style={styles.title}>{spot.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{spot.type}</Text>
            </View>
            <Text style={styles.meta}>★ {avg} ({spot.ratingCount} ratings)</Text>
          </View>

          {spot.address ? (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={Colors.textMuted} />
              <Text style={styles.infoText}>{spot.address}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>Added by {spot.creatorName}</Text>
          </View>

          {spot.description ? <Text style={styles.description}>{spot.description}</Text> : null}

          {spot.tips ? (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Tips</Text>
              <Text style={styles.tipsText}>{spot.tips}</Text>
            </View>
          ) : null}

          <MapView
            style={styles.miniMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={{ ...spot.location, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
            scrollEnabled={false}
          >
            <Marker coordinate={spot.location} pinColor={Colors.spotMarker} />
          </MapView>

          <Text style={styles.sectionTitle}>Rate this spot</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} style={styles.ratingBtn} onPress={() => handleRate(n)}>
                <Text style={styles.ratingEmoji}>⭐️</Text>
                <Text style={styles.ratingLabel}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.ctaBtn} onPress={handleAddPhoto} disabled={uploading}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>{uploading ? 'Uploading...' : 'Add a Photo'}</Text>
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
  photoList: { height: 240 },
  photo: { width: 320, height: 240, marginRight: 2 },
  photoPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  badge: { backgroundColor: Colors.spotMarker + '33', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: Colors.spotMarker, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  meta: { color: Colors.textMuted, fontSize: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  description: { color: Colors.text, fontSize: 16, lineHeight: 24, marginVertical: 16 },
  tipsBox: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.spotMarker,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipsTitle: { color: Colors.spotMarker, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  tipsText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  miniMap: { height: 160, borderRadius: 12, overflow: 'hidden', marginVertical: 16 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingEmoji: { fontSize: 20 },
  ratingLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  ctaBtn: {
    backgroundColor: Colors.spotMarker,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
