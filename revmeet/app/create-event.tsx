import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { createEvent } from '@/lib/events';
import type { EventType, GeoPoint } from '@/types';
import { Colors } from '@/constants/colors';

const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'meetup', label: 'Meetup', emoji: '🚗' },
  { value: 'car-show', label: 'Car Show', emoji: '🏆' },
  { value: 'cruise', label: 'Cruise', emoji: '🛣️' },
  { value: 'track-day', label: 'Track Day', emoji: '🏁' },
  { value: 'other', label: 'Other', emoji: '📍' },
];

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('meetup');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [pin, setPin] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { location } = useLocation();
  const router = useRouter();

  const handleSave = async () => {
    if (!title || !description || !date || !pin) {
      Alert.alert('Missing fields', 'Fill in all required fields and drop a pin on the map.');
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        type,
        location: pin,
        address: address.trim(),
        date: new Date(date),
        createdBy: user.uid,
        creatorName: user.displayName ?? 'Anonymous',
        imageURL: undefined,
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
          <Text style={styles.headerTitle}>New Event</Text>
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
            {pin && <Marker coordinate={pin} pinColor={Colors.eventMarker} />}
          </MapView>

          <Text style={styles.label}>Event Type</Text>
          <View style={styles.chipRow}>
            {EVENT_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, type === t.value && styles.chipActive]}
                onPress={() => setType(t.value)}
              >
                <Text>{t.emoji} </Text>
                <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Sunset Cruise Night" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Description *</Text>
          <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Tell people about this event..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={4} />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123 Main St, City, State" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Date & Time * (YYYY-MM-DDTHH:MM)</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2025-08-15T18:00" placeholderTextColor={Colors.textMuted} />
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
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  form: { padding: 16, paddingBottom: 40 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6, marginTop: 16 },
  mapPicker: { height: 180, borderRadius: 12, overflow: 'hidden' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  chipText: { color: Colors.textMuted, fontSize: 13 },
  chipTextActive: { color: Colors.primary },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
});
