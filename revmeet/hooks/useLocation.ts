import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import type { GeoPoint } from '@/types';

const DEFAULT_LOCATION: GeoPoint = { latitude: 37.7749, longitude: -122.4194 };

export function useLocation() {
  const [location, setLocation] = useState<GeoPoint>(DEFAULT_LOCATION);
  const [permission, setPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermission(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
      setLoading(false);
    })();
  }, []);

  return { location, permission, loading };
}
