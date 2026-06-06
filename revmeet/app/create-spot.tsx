import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { createSpot, uploadSpotPhoto } from '@/lib/spots';
import type { SpotType, GeoPoint } from '@/types';
import { Colors } from '@/constants/colors';

const SPOT_TYPES: { value: SpotType; label: string }[] = [
  { value: 'scenic', label: 'Scenic' },
  { value: 'urban', label: 'Urban' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'parking', label: 'Parking' },
  { value: 'overlook', label: 'Overlook' },
  { value: 'other', label: 'Other' },
];

export default function CreateSpotScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpotType>('scenic');
  const [address, setAddress] = useState('');
  const [tips, setTips] = useState('');
  const [pin, setPin] = useState<GeoPoint | null>(null);
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { location } = useLocation();
  const router = useRouter();

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setLocalPhotos(p => [...p, result.assets[0].uri]);
  };

  const handleSave = async () => {
    if (!title || !pin) {
      Alert.alert('Missing fields', 'Add a title and drop a pin on the map.');
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      const spotId = await createSpot({
        title: title.trim(),
        description: description.trim(),
        type,
        location: pin,
        address: address.trim(),
        createdBy: user.uid,
        creatorName: user.displayName ?? 'Anonymous',
        tips: tips.trim() || undefined,
        tags: [],
      });
      for (const uri of localPhotos) await uploadSpotPhoto(spotId, uri);
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
          <Text style={styles.headerTitle}>New Photo Spot</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>Drop a pin on the map *</Text>
          <MapView
            style={styles.mapPicker}
            provider={PROVIDER_GOOGLE}
            initialRegion={{ ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            onPress={e => setPin(e.nativeEvent.coordinate)}
          >
            {pin && <Marker coordinate={pin} pinColor={Colors.spotMarker} />}
          </MapView>

          <Text style={styles.label}>Spot Type</Text>
          <View style={styles.chipRow}>
            {SPOT_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, type === t.value && styles.chipActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Golden Gate Overlook" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="What makes this a great spot?" placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />

          <Text style={styles.label}>Tips (lighting, parking, timing)</Text>
          <TextInput style={styles.input} value={tips} onChangeText={setTips} placeholder="Best at golden hour, free parking on side street" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123 Vista Rd, City, State" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Photos</Text>
          <View style={styles.photoRow}>
            {localPhotos.map((uri, i) => <Image key={i} source={{ uri }} style={styles.thumb} />)}
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
              <Ionicons name="camera" size={24} color={Colors.textMuted} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
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
  saveBtn: { backgroundColor: Colors.spotMarker, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  form: { padding: 16, paddingBottom: 40 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6, marginTop: 16 },
  mapPicker: { height: 180, borderRadius: 12, overflow: 'hidden' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { borderColor: Colors.spotMarker, backgroundColor: Colors.spotMarker + '22' },
  chipText: { color: Colors.textMuted, fontSize: 13 },
  chipTextActive: { color: Colors.spotMarker },
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
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  thumb: { width: 90, height: 90, borderRadius: 8 },
  addPhotoBtn: {
    width: 90,
    height: 90,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: { color: Colors.textMuted, fontSize: 11 },
});
