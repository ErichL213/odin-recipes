import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { createRoute } from '@/lib/routes';
import type { RouteWaypoint } from '@/types';
import { Colors } from '@/constants/colors';

export default function CreateRouteScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { location } = useLocation();
  const router = useRouter();

  const handleSave = async () => {
    if (!title || waypoints.length < 2) {
      Alert.alert('Missing fields', 'Add a title and at least 2 waypoints on the map.');
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      await createRoute({
        title: title.trim(),
        description: description.trim(),
        highlights: highlights.trim(),
        waypoints,
        distance: parseFloat(distance) || 0,
        duration: parseInt(duration) || 0,
        createdBy: user.uid,
        creatorName: user.displayName ?? 'Anonymous',
        coverImageURL: undefined,
        tags: [],
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Route</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>
            Tap map to add waypoints ({waypoints.length} added, need ≥ 2)
          </Text>
          <View style={styles.mapWrap}>
            <MapView
              style={styles.mapPicker}
              provider={PROVIDER_GOOGLE}
              initialRegion={{ ...location, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
              onPress={e => setWaypoints(p => [...p, { location: e.nativeEvent.coordinate }])}
            >
              {waypoints.length > 1 && (
                <Polyline
                  coordinates={waypoints.map(w => w.location)}
                  strokeColor={Colors.routeMarker}
                  strokeWidth={4}
                />
              )}
              {waypoints.map((wp, i) => (
                <Marker
                  key={i}
                  coordinate={wp.location}
                  pinColor={i === 0 ? Colors.success : i === waypoints.length - 1 ? Colors.error : Colors.routeMarker}
                />
              ))}
            </MapView>
            {waypoints.length > 0 && (
              <TouchableOpacity
                style={styles.undoBtn}
                onPress={() => setWaypoints(p => p.slice(0, -1))}
              >
                <Ionicons name="arrow-undo" size={16} color={Colors.text} />
                <Text style={styles.undoText}>Undo</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Pacific Coast Highway Loop" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Describe this driving route..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />

          <Text style={styles.label}>Highlights</Text>
          <TextInput style={styles.input} value={highlights} onChangeText={setHighlights} placeholder="Ocean views, tight hairpins, no traffic on weekday mornings" placeholderTextColor={Colors.textMuted} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Distance (km)</Text>
              <TextInput style={styles.input} value={distance} onChangeText={setDistance} placeholder="45" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Duration (min)</Text>
              <TextInput style={styles.input} value={duration} onChangeText={setDuration} placeholder="90" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  saveBtn: { backgroundColor: Colors.routeMarker, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  form: { padding: 16, paddingBottom: 40 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6, marginTop: 16 },
  mapWrap: { position: 'relative' },
  mapPicker: { height: 220, borderRadius: 12, overflow: 'hidden' },
  undoBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface + 'EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  undoText: { color: Colors.text, fontSize: 13 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
});
