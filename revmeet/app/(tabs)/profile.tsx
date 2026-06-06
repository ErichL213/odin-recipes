import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'Driver'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          <Text style={styles.rowText}>My Events</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="camera-outline" size={20} color={Colors.spotMarker} />
          <Text style={styles.rowText}>My Spots</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
          <Ionicons name="map-outline" size={20} color={Colors.routeMarker} />
          <Text style={styles.rowText}>My Routes</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  header: { alignItems: 'center', padding: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textMuted },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: { flex: 1, color: Colors.text, fontSize: 16 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 24,
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '600' },
});
